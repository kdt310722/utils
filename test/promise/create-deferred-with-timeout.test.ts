import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createDeferredWithTimeout } from '../../src/promise/deferred-with-timeout'

describe('createDeferredWithTimeout', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('basic functionality', () => {
        test('should create a deferred promise with timeout successfully', () => {
            const deferred = createDeferredWithTimeout(1000, 'Timeout error')

            expect(deferred).toBeDefined()
            expect(typeof deferred.resolve).toBe('function')
            expect(typeof deferred.reject).toBe('function')
            expect(deferred.isSettled).toBe(false)
            expect(deferred.isPending).toBe(true)
            expect(deferred.isResolved).toBe(false)
            expect(deferred.isRejected).toBe(false)
        })

        test('should timeout with string error message', async () => {
            const timeoutMessage = 'Operation timeout'
            const deferred = createDeferredWithTimeout(1000, timeoutMessage)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow(timeoutMessage)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isRejected).toBe(true)
        })

        test('should timeout with Error object', async () => {
            const timeoutError = new Error('Custom timeout error')
            const deferred = createDeferredWithTimeout(1000, timeoutError)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow(timeoutError)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isRejected).toBe(true)
        })

        test('should timeout with error factory function returning string', async () => {
            const errorFactory = vi.fn(() => 'Dynamic timeout error')
            const deferred = createDeferredWithTimeout(1000, errorFactory)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow('Dynamic timeout error')
            expect(errorFactory).toHaveBeenCalledTimes(1)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isRejected).toBe(true)
        })

        test('should timeout with error factory function returning Error object', async () => {
            const customError = new Error('Factory error')
            const errorFactory = vi.fn(() => customError)
            const deferred = createDeferredWithTimeout(1000, errorFactory)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow(customError)
            expect(errorFactory).toHaveBeenCalledTimes(1)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isRejected).toBe(true)
        })

        test('should resolve before timeout and clear timer', async () => {
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const testValue = 'resolved value'

            deferred.resolve(testValue)

            const result = await deferred
            expect(result).toBe(testValue)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isResolved).toBe(true)
            expect(clearTimeoutSpy).toHaveBeenCalled()

            vi.advanceTimersByTime(1000)
            expect(deferred.isResolved).toBe(true)
        })

        test('should reject before timeout and clear timer', async () => {
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const testError = new Error('Custom rejection')

            deferred.reject(testError)

            await expect(deferred).rejects.toThrow(testError)
            expect(deferred.isSettled).toBe(true)
            expect(deferred.isRejected).toBe(true)
            expect(clearTimeoutSpy).toHaveBeenCalled()

            vi.advanceTimersByTime(1000)
            expect(deferred.isRejected).toBe(true)
        })
    })

    describe('edge cases', () => {
        test('should not set timer for zero timeout value', () => {
            const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
            const deferred = createDeferredWithTimeout(0, 'Timeout error')

            expect(setTimeoutSpy).not.toHaveBeenCalled()
            expect(deferred.isPending).toBe(true)
        })

        test('should not set timer for negative timeout value', () => {
            const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
            const deferred = createDeferredWithTimeout(-100, 'Timeout error')

            expect(setTimeoutSpy).not.toHaveBeenCalled()
            expect(deferred.isPending).toBe(true)
        })

        test('should ignore multiple resolve calls', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')

            deferred.resolve('first')
            deferred.resolve('second')

            const result = await deferred
            expect(result).toBe('first')
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)
        })

        test('should ignore multiple reject calls', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const firstError = new Error('first error')
            const secondError = new Error('second error')

            deferred.reject(firstError)
            deferred.reject(secondError)

            await expect(deferred).rejects.toThrow('first error')
            expect(deferred.isRejected).toBe(true)
            expect(deferred.isResolved).toBe(false)
        })

        test('should ignore resolve after reject', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const testError = new Error('test error')

            deferred.reject(testError)
            deferred.resolve('should be ignored')

            await expect(deferred).rejects.toThrow('test error')
            expect(deferred.isRejected).toBe(true)
            expect(deferred.isResolved).toBe(false)
        })

        test('should ignore reject after resolve', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')

            deferred.resolve('test value')
            deferred.reject(new Error('should be ignored'))

            const result = await deferred
            expect(result).toBe('test value')
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)
        })

        test('should not timeout if already resolved', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')

            deferred.resolve('resolved')
            vi.advanceTimersByTime(1000)

            const result = await deferred
            expect(result).toBe('resolved')
            expect(deferred.isResolved).toBe(true)
        })

        test('should not timeout if already rejected', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const customError = new Error('custom error')

            deferred.reject(customError)
            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow(customError)
            expect(deferred.isRejected).toBe(true)
        })

        test('should handle undefined value', async () => {
            const deferred = createDeferredWithTimeout<undefined>(1000, 'Timeout error')

            deferred.resolve()

            const result = await deferred
            expect(result).toBeUndefined()
        })

        test('should handle null value', async () => {
            const deferred = createDeferredWithTimeout<null>(1000, 'Timeout error')

            deferred.resolve(null)

            const result = await deferred
            expect(result).toBeNull()
        })

        test('should handle primitive values', async () => {
            const numberDeferred = createDeferredWithTimeout<number>(1000, 'Timeout')
            const booleanDeferred = createDeferredWithTimeout<boolean>(1000, 'Timeout')
            const stringDeferred = createDeferredWithTimeout<string>(1000, 'Timeout')

            numberDeferred.resolve(42)
            booleanDeferred.resolve(true)
            stringDeferred.resolve('')

            expect(await numberDeferred).toBe(42)
            expect(await booleanDeferred).toBe(true)
            expect(await stringDeferred).toBe('')
        })

        test('should handle object and array values', async () => {
            const objectDeferred = createDeferredWithTimeout<{ key: string }>(1000, 'Timeout')
            const arrayDeferred = createDeferredWithTimeout<number[]>(1000, 'Timeout')

            const testObject = { key: 'value' }
            const testArray = [1, 2, 3]

            objectDeferred.resolve(testObject)
            arrayDeferred.resolve(testArray)

            const objectResult = await objectDeferred
            const arrayResult = await arrayDeferred

            expect(objectResult).toBe(testObject)
            expect(objectResult.key).toBe('value')
            expect(arrayResult).toBe(testArray)
            expect(arrayResult).toEqual([1, 2, 3])
        })

        test('should handle Promise value', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const promiseValue = Promise.resolve('promise result')

            deferred.resolve(promiseValue)

            const result = await deferred
            expect(result).toBe('promise result')
        })
    })

    describe('callback functionality', () => {
        test('should call onResolve callback when resolved', async () => {
            const onResolve = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onResolve })
            const testValue = 'test value'

            deferred.resolve(testValue)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalledTimes(1)
            expect(onResolve).toHaveBeenCalledWith(testValue)
        })

        test('should call onReject callback when rejected manually', async () => {
            const onReject = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onReject })
            const testError = new Error('test error')

            deferred.reject(testError)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledTimes(1)
            expect(onReject).toHaveBeenCalledWith(testError)

            await expect(deferred).rejects.toThrow('test error')
        })

        test('should call onReject callback when timeout occurs', async () => {
            const onReject = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error', { onReject })

            vi.advanceTimersByTime(1000)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledTimes(1)
            expect(onReject).toHaveBeenCalledWith(expect.any(Error))

            await expect(deferred).rejects.toThrow('Timeout error')
        })

        test('should call onSettle callback on resolve', async () => {
            const onSettle = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onSettle })

            deferred.resolve('test')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalledTimes(1)
        })

        test('should call onSettle callback on reject', async () => {
            const onSettle = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onSettle })

            deferred.reject(new Error('test'))

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalledTimes(1)

            await expect(deferred).rejects.toThrow('test')
        })

        test('should call onSettle callback on timeout', async () => {
            const onSettle = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error', { onSettle })

            vi.advanceTimersByTime(1000)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalledTimes(1)

            await expect(deferred).rejects.toThrow('Timeout error')
        })

        test('should call onError when onResolve throws', async () => {
            const onError = vi.fn()
            const onResolve = vi.fn(() => {
                throw new Error('callback error')
            })

            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onResolve, onError })

            deferred.resolve('test')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(expect.any(Error))
        })

        test('should call onError when onReject throws', async () => {
            const onError = vi.fn()
            const onReject = vi.fn(() => {
                throw new Error('callback error')
            })

            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onReject, onError })

            deferred.reject(new Error('original error'))

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(expect.any(Error))

            await expect(deferred).rejects.toThrow('original error')
        })

        test('should call onError when onSettle throws', async () => {
            const onError = vi.fn()
            const onSettle = vi.fn(() => {
                throw new Error('callback error')
            })

            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onSettle, onError })

            deferred.resolve('test')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(expect.any(Error))
        })

        test('should call all callbacks in correct order', async () => {
            const callOrder: string[] = []
            const onResolve = vi.fn(() => callOrder.push('onResolve'))
            const onSettle = vi.fn(() => callOrder.push('onSettle'))
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onResolve, onSettle })

            deferred.resolve('test')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(callOrder).toEqual(['onResolve', 'onSettle'])
        })

        test('should not call callbacks on multiple resolve attempts', async () => {
            const onResolve = vi.fn()
            const onSettle = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onResolve, onSettle })

            deferred.resolve('first')
            deferred.resolve('second')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalledTimes(1)
            expect(onSettle).toHaveBeenCalledTimes(1)
            expect(onResolve).toHaveBeenCalledWith('first')
        })

        test('should not call callbacks on multiple reject attempts', async () => {
            const onReject = vi.fn()
            const onSettle = vi.fn()
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout', { onReject, onSettle })

            deferred.reject(new Error('first'))
            deferred.reject(new Error('second'))

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledTimes(1)
            expect(onSettle).toHaveBeenCalledTimes(1)

            await expect(deferred).rejects.toThrow('first')
        })
    })

    describe('async behavior', () => {
        test('should handle async resolution correctly', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')

            setTimeout(() => deferred.resolve('async result'), 500)

            vi.advanceTimersByTime(500)

            const result = await deferred
            expect(result).toBe('async result')
            expect(deferred.isResolved).toBe(true)
        })

        test('should handle async rejection correctly', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')
            const asyncError = new Error('async error')

            setTimeout(() => deferred.reject(asyncError), 500)

            vi.advanceTimersByTime(500)

            await expect(deferred).rejects.toThrow(asyncError)
            expect(deferred.isRejected).toBe(true)
        })

        test('should timeout if resolution takes too long', async () => {
            const deferred = createDeferredWithTimeout<string>(1000, 'Timeout error')

            setTimeout(() => deferred.resolve('too late'), 1500)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow('Timeout error')
            expect(deferred.isRejected).toBe(true)

            vi.advanceTimersByTime(500)
            expect(deferred.isRejected).toBe(true)
        })

        test('should handle concurrent promises correctly', async () => {
            const results: Array<string | Error> = []

            const deferred1 = createDeferredWithTimeout<string>(500, 'Timeout 1')
            const deferred2 = createDeferredWithTimeout<string>(1000, 'Timeout 2')
            const deferred3 = createDeferredWithTimeout<string>(1500, 'Timeout 3')

            deferred1.resolve('Result 1')

            setTimeout(() => deferred2.resolve('Result 2'), 800)

            try {
                results.push(await deferred1)
            } catch (error) {
                results.push(error as Error)
            }

            vi.advanceTimersByTime(800)

            try {
                results.push(await deferred2)
            } catch (error) {
                results.push(error as Error)
            }

            vi.advanceTimersByTime(700)

            try {
                results.push(await deferred3)
            } catch (error) {
                results.push(error as Error)
            }

            expect(results[0]).toBe('Result 1')
            expect(results[1]).toBe('Result 2')
            expect(results[2]).toBeInstanceOf(Error)
            expect((results[2] as Error).message).toBe('Timeout 3')
        })
    })

    describe('TypeScript type safety', () => {
        test('should infer correct types for generic parameters', async () => {
            const stringDeferred = createDeferredWithTimeout<string>(1000, 'Timeout')
            const numberDeferred = createDeferredWithTimeout<number>(1000, 'Timeout')
            const objectDeferred = createDeferredWithTimeout<{ id: number; name: string }>(1000, 'Timeout')

            stringDeferred.resolve('test')
            numberDeferred.resolve(42)
            objectDeferred.resolve({ id: 1, name: 'test' })

            const stringResult: string = await stringDeferred
            const numberResult: number = await numberDeferred
            const objectResult: { id: number; name: string } = await objectDeferred

            expect(typeof stringResult).toBe('string')
            expect(typeof numberResult).toBe('number')
            expect(typeof objectResult).toBe('object')
            expect(objectResult.id).toBe(1)
            expect(objectResult.name).toBe('test')
        })

        test('should work with union types', async () => {
            const unionDeferred = createDeferredWithTimeout<string | number>(1000, 'Timeout')

            unionDeferred.resolve('string value')

            const result: string | number = await unionDeferred
            expect(typeof result).toBe('string')
            expect(result).toBe('string value')
        })

        test('should work with optional types', async () => {
            const optionalDeferred = createDeferredWithTimeout<string | undefined>(1000, 'Timeout')

            optionalDeferred.resolve(undefined)

            const result: string | undefined = await optionalDeferred
            expect(result).toBeUndefined()
        })
    })

    describe('error handling scenarios', () => {
        test('should handle error factory function that throws', async () => {
            const errorFactory = vi.fn(() => {
                throw new Error('Factory function error')
            })

            const deferred = createDeferredWithTimeout(1000, errorFactory)

            expect(() => {
                vi.advanceTimersByTime(1000)
            }).toThrow('Factory function error')

            expect(errorFactory).toHaveBeenCalledTimes(1)
        })

        test('should handle complex error objects', async () => {
            class CustomError extends Error {
                code: string

                constructor(message: string, code: string) {
                    super(message)
                    this.code = code
                    this.name = 'CustomError'
                }
            }

            const customError = new CustomError('Custom timeout', 'TIMEOUT_001')
            const deferred = createDeferredWithTimeout(1000, customError)

            vi.advanceTimersByTime(1000)

            try {
                await deferred
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError)
                expect((error as CustomError).code).toBe('TIMEOUT_001')
                expect((error as CustomError).message).toBe('Custom timeout')
            }
        })

        test('should handle error factory returning non-string, non-Error values', async () => {
            const errorFactory = () => ({ message: 'Object error', code: 500 }) as any
            const deferred = createDeferredWithTimeout(1000, errorFactory)

            vi.advanceTimersByTime(1000)

            await expect(deferred).rejects.toThrow('[object Object]')
        })
    })

    describe('memory leak prevention', () => {
        test('should clear timeout on resolve to prevent memory leaks', () => {
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
            const deferred = createDeferredWithTimeout<string>(5000, 'Timeout')

            deferred.resolve('resolved')

            expect(clearTimeoutSpy).toHaveBeenCalled()
        })

        test('should clear timeout on reject to prevent memory leaks', async () => {
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
            const deferred = createDeferredWithTimeout<string>(5000, 'Timeout')

            deferred.reject(new Error('rejected'))

            expect(clearTimeoutSpy).toHaveBeenCalled()

            // Handle the rejected promise to prevent unhandled rejection
            await expect(deferred).rejects.toThrow('rejected')
        })

        test('should not leak timers when creating multiple instances', () => {
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
            const deferreds = Array.from({ length: 10 }, (_, i) =>
                createDeferredWithTimeout<number>(1000, `Timeout ${i}`)
            )

            deferreds.forEach((deferred, i) => deferred.resolve(i))

            expect(clearTimeoutSpy).toHaveBeenCalledTimes(10)
        })
    })

    describe('concurrent usage', () => {
        test('should handle multiple deferred instances independently', async () => {
            const deferred1 = createDeferredWithTimeout<string>(500, 'Timeout 1')
            const deferred2 = createDeferredWithTimeout<number>(1000, 'Timeout 2')
            const deferred3 = createDeferredWithTimeout<boolean>(1500, 'Timeout 3')

            deferred1.resolve('first')
            deferred2.resolve(42)

            const result1 = await deferred1
            const result2 = await deferred2

            vi.advanceTimersByTime(1500)

            expect(result1).toBe('first')
            expect(result2).toBe(42)
            await expect(deferred3).rejects.toThrow('Timeout 3')

            expect(deferred1.isResolved).toBe(true)
            expect(deferred2.isResolved).toBe(true)
            expect(deferred3.isRejected).toBe(true)
        })

        test('should handle mixed resolutions and timeouts', async () => {
            const results: Array<{ type: 'resolved' | 'timeout'; value: any }> = []

            const createAndProcess = async (timeout: number, resolveAfter?: number) => {
                const deferred = createDeferredWithTimeout<string>(timeout, `Timeout ${timeout}ms`)

                if (resolveAfter !== undefined) {
                    setTimeout(() => deferred.resolve(`Resolved after ${resolveAfter}ms`), resolveAfter)
                }

                try {
                    const value = await deferred
                    results.push({ type: 'resolved', value })
                } catch (error) {
                    results.push({ type: 'timeout', value: (error as Error).message })
                }
            }

            // Create promises with specific timing
            const promise1 = createAndProcess(1000, 500) // Should resolve at 500ms
            const promise2 = createAndProcess(800) // Should timeout at 800ms
            const promise3 = createAndProcess(1200, 600) // Should resolve at 600ms
            const promise4 = createAndProcess(400) // Should timeout at 400ms

            // Advance to 400ms - promise4 should timeout
            vi.advanceTimersByTime(400)

            // Advance to 500ms - promise1 should resolve
            vi.advanceTimersByTime(100)

            // Advance to 600ms - promise3 should resolve
            vi.advanceTimersByTime(100)

            // Advance to 800ms - promise2 should timeout
            vi.advanceTimersByTime(200)

            // Advance to 1200ms - ensure all are completed
            vi.advanceTimersByTime(400)

            await Promise.all([promise1, promise2, promise3, promise4])

            expect(results).toHaveLength(4)

            // Find results by type and value to handle async ordering
            const resolvedResults = results.filter(r => r.type === 'resolved')
            const timeoutResults = results.filter(r => r.type === 'timeout')

            expect(resolvedResults).toHaveLength(2)
            expect(timeoutResults).toHaveLength(2)

            expect(resolvedResults.some(r => r.value === 'Resolved after 500ms')).toBe(true)
            expect(resolvedResults.some(r => r.value === 'Resolved after 600ms')).toBe(true)
            expect(timeoutResults.some(r => r.value === 'Timeout 800ms')).toBe(true)
            expect(timeoutResults.some(r => r.value === 'Timeout 400ms')).toBe(true)
        })
    })
})
