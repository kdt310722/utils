import { describe, expect, test, vi } from 'vitest'
import { abortable } from '../../src/promise/abortable'
import { sleep } from '../../src/promise/sleep'

describe('abortable', () => {
    describe('successful promise resolution', () => {
        test('should resolve when promise resolves before abort', async () => {
            const controller = new AbortController()
            const promise = Promise.resolve('success')

            const result = await abortable(promise, controller.signal)

            expect(result).toBe('success')
        })

        test('should resolve when promise resolves after signal setup but before abort', async () => {
            const controller = new AbortController()
            const promise = sleep(10).then(() => 'delayed success')

            const abortablePromise = abortable(promise, controller.signal)

            const result = await abortablePromise
            expect(result).toBe('delayed success')
        })
    })

    describe('promise rejection', () => {
        test('should reject with original error when promise rejects before abort', async () => {
            const controller = new AbortController()
            const originalError = new Error('original error')
            const promise = Promise.reject(originalError)

            await expect(abortable(promise, controller.signal)).rejects.toThrow('original error')
        })

        test('should reject with original error when promise rejects after signal setup but before abort', async () => {
            const controller = new AbortController()
            const originalError = new Error('delayed error')
            const promise = sleep(10).then(() => { throw originalError })

            await expect(abortable(promise, controller.signal)).rejects.toThrow('delayed error')
        })
    })

    describe('abort signal already aborted', () => {
        test('should immediately reject with default AbortError when signal already aborted', async () => {
            const controller = new AbortController()
            controller.abort()

            const promise = Promise.resolve('success')

            await expect(abortable(promise, controller.signal)).rejects.toThrow('This operation was aborted')

            try {
                await abortable(promise, controller.signal)
            } catch (error) {
                expect(error).toBeInstanceOf(DOMException)
                expect((error as DOMException).name).toBe('AbortError')
            }
        })

        test('should immediately reject with custom abort reason when signal already aborted with reason', async () => {
            const controller = new AbortController()
            const customReason = new Error('custom abort reason')
            controller.abort(customReason)

            const promise = Promise.resolve('success')

            await expect(abortable(promise, controller.signal)).rejects.toThrow('custom abort reason')
        })
    })

    describe('abort during promise execution', () => {
        test('should reject with AbortError when aborted during promise execution', async () => {
            const controller = new AbortController()
            const promise = sleep(100).then(() => 'should not resolve')

            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => controller.abort(), 10)

            await expect(abortablePromise).rejects.toThrow('This operation was aborted')

            try {
                await abortablePromise
            } catch (error) {
                expect(error).toBeInstanceOf(DOMException)
                expect((error as DOMException).name).toBe('AbortError')
            }
        })

        test('should reject with custom abort reason when aborted with reason during execution', async () => {
            const controller = new AbortController()
            const promise = sleep(100).then(() => 'should not resolve')
            const customReason = new Error('custom abort during execution')

            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => controller.abort(customReason), 10)

            await expect(abortablePromise).rejects.toThrow('custom abort during execution')
        })
    })

    describe('race conditions', () => {
        test('should resolve when promise resolves just before abort', async () => {
            const controller = new AbortController()
            let resolvePromise: (value: string) => void
            const promise = new Promise<string>((resolve) => {
                resolvePromise = resolve
            })

            const abortablePromise = abortable(promise, controller.signal)

            resolvePromise!('resolved first')
            await sleep(1)
            controller.abort()

            const result = await abortablePromise
            expect(result).toBe('resolved first')
        })

        test('should reject with AbortError when abort happens during promise execution', async () => {
            const controller = new AbortController()
            const promise = new Promise<string>((resolve) => {
                setTimeout(() => resolve('too late'), 100)
            })

            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => controller.abort(), 10)

            await expect(abortablePromise).rejects.toThrow('This operation was aborted')
        })

        test('should reject with original error when promise rejects before abort', async () => {
            const controller = new AbortController()
            const originalError = new Error('rejected first')
            const promise = new Promise<string>((_, reject) => {
                setTimeout(() => reject(originalError), 10)
            })

            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => controller.abort(), 50)

            await expect(abortablePromise).rejects.toThrow('rejected first')
        })
    })

    describe('memory cleanup', () => {
        test('should remove event listener when promise resolves', async () => {
            const controller = new AbortController()
            const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener')

            const promise = Promise.resolve('success')

            await abortable(promise, controller.signal)

            expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function))
        })

        test('should remove event listener when promise rejects', async () => {
            const controller = new AbortController()
            const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener')

            const promise = Promise.reject(new Error('error'))

            try {
                await abortable(promise, controller.signal)
            } catch {
                // Expected to throw
            }

            expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function))
        })

        test('should remove event listener when aborted', async () => {
            const controller = new AbortController()
            const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener')

            const promise = sleep(100).then(() => 'should not resolve')
            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => controller.abort(), 10)

            try {
                await abortablePromise
            } catch {
                // Expected to throw
            }

            expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function))
        })

        test('should not add event listener when signal already aborted', () => {
            const controller = new AbortController()
            controller.abort()

            const addEventListenerSpy = vi.spyOn(controller.signal, 'addEventListener')

            const promise = Promise.resolve('success')
            abortable(promise, controller.signal).catch(() => {})

            expect(addEventListenerSpy).not.toHaveBeenCalled()
        })
    })

    describe('edge cases', () => {
        test('should handle promise that never resolves', async () => {
            const controller = new AbortController()
            const neverResolvingPromise = new Promise<string>(() => {})

            const abortablePromise = abortable(neverResolvingPromise, controller.signal)

            setTimeout(() => controller.abort(), 10)

            await expect(abortablePromise).rejects.toThrow('This operation was aborted')
        })

        test('should handle multiple abort calls', async () => {
            const controller = new AbortController()
            const promise = sleep(100).then(() => 'should not resolve')

            const abortablePromise = abortable(promise, controller.signal)

            setTimeout(() => {
                controller.abort()
                controller.abort() // Second abort should be ignored
            }, 10)

            await expect(abortablePromise).rejects.toThrow('This operation was aborted')
        })

        test('should handle signal with null reason', async () => {
            const controller = new AbortController()
            controller.abort(null)

            const promise = Promise.resolve('success')

            await expect(abortable(promise, controller.signal)).rejects.toThrow('This operation was aborted')
        })

        test('should handle signal with undefined reason', async () => {
            const controller = new AbortController()
            controller.abort(undefined)

            const promise = Promise.resolve('success')

            await expect(abortable(promise, controller.signal)).rejects.toThrow('This operation was aborted')
        })
    })

    describe('type safety', () => {
        test('should preserve promise type', async () => {
            const controller = new AbortController()
            const numberPromise = Promise.resolve(42)

            const result = await abortable(numberPromise, controller.signal)

            expect(typeof result).toBe('number')
            expect(result).toBe(42)
        })

        test('should preserve complex object types', async () => {
            const controller = new AbortController()
            const objectPromise = Promise.resolve({ name: 'test', value: 123 })

            const result = await abortable(objectPromise, controller.signal)

            expect(result).toEqual({ name: 'test', value: 123 })
        })
    })
})
