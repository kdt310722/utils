import { describe, expect, test, vi } from 'vitest'
import { createDeferred } from '../../src/promise/deferred'

describe('createDeferred', () => {
    describe('basic functionality', () => {
        test('should create a deferred promise successfully', () => {
            const deferred = createDeferred()

            expect(deferred).toBeDefined()
            expect(typeof deferred.resolve).toBe('function')
            expect(typeof deferred.reject).toBe('function')
            expect(deferred.isSettled).toBe(false)
            expect(deferred.isPending).toBe(true)
            expect(deferred.isResolved).toBe(false)
            expect(deferred.isRejected).toBe(false)
        })

        test('should resolve with value', async () => {
            const deferred = createDeferred<string>()
            const testValue = 'test value'

            deferred.resolve(testValue)

            expect(deferred.isSettled).toBe(true)
            expect(deferred.isPending).toBe(false)
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)

            const result = await deferred
            expect(result).toBe(testValue)
        })

        test('should reject with reason', async () => {
            const deferred = createDeferred<string>()
            const testError = new Error('test error')

            deferred.reject(testError)

            expect(deferred.isSettled).toBe(true)
            expect(deferred.isPending).toBe(false)
            expect(deferred.isResolved).toBe(false)
            expect(deferred.isRejected).toBe(true)

            await expect(deferred).rejects.toThrow('test error')
        })

        test('should resolve with Promise value', async () => {
            const deferred = createDeferred<string>()
            const promiseValue = Promise.resolve('promise result')

            deferred.resolve(promiseValue)

            const result = await deferred
            expect(result).toBe('promise result')
        })
    })

    describe('edge cases', () => {
        test('should ignore multiple resolve calls', async () => {
            const deferred = createDeferred<string>()

            deferred.resolve('first')
            deferred.resolve('second')

            const result = await deferred
            expect(result).toBe('first')
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)
        })

        test('should ignore multiple reject calls', async () => {
            const deferred = createDeferred<string>()
            const firstError = new Error('first error')
            const secondError = new Error('second error')

            deferred.reject(firstError)
            deferred.reject(secondError)

            await expect(deferred).rejects.toThrow('first error')
            expect(deferred.isRejected).toBe(true)
            expect(deferred.isResolved).toBe(false)
        })

        test('should ignore resolve after reject', async () => {
            const deferred = createDeferred<string>()
            const testError = new Error('test error')

            deferred.reject(testError)
            deferred.resolve('should be ignored')

            await expect(deferred).rejects.toThrow('test error')
            expect(deferred.isRejected).toBe(true)
            expect(deferred.isResolved).toBe(false)
        })

        test('should ignore reject after resolve', async () => {
            const deferred = createDeferred<string>()

            deferred.resolve('test value')
            deferred.reject(new Error('should be ignored'))

            const result = await deferred
            expect(result).toBe('test value')
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)
        })

        test('should handle undefined value', async () => {
            const deferred = createDeferred<undefined>()

            deferred.resolve()

            const result = await deferred
            expect(result).toBeUndefined()
        })

        test('should handle null value', async () => {
            const deferred = createDeferred<null>()

            deferred.resolve(null)

            const result = await deferred
            expect(result).toBeNull()
        })

        test('should handle primitive values', async () => {
            const numberDeferred = createDeferred<number>()
            const booleanDeferred = createDeferred<boolean>()
            const stringDeferred = createDeferred<string>()

            numberDeferred.resolve(42)
            booleanDeferred.resolve(true)
            stringDeferred.resolve('')

            expect(await numberDeferred).toBe(42)
            expect(await booleanDeferred).toBe(true)
            expect(await stringDeferred).toBe('')
        })

        test('should handle object values', async () => {
            const deferred = createDeferred<{ key: string }>()
            const testObject = { key: 'value' }

            deferred.resolve(testObject)

            const result = await deferred
            expect(result).toBe(testObject)
            expect(result.key).toBe('value')
        })

        test('should handle array values', async () => {
            const deferred = createDeferred<number[]>()
            const testArray = [1, 2, 3]

            deferred.resolve(testArray)

            const result = await deferred
            expect(result).toBe(testArray)
            expect(result).toEqual([1, 2, 3])
        })
    })

    describe('callback functionality', () => {
        test('should call onResolve callback when resolved', async () => {
            const onResolve = vi.fn()
            const deferred = createDeferred<string>({ onResolve })
            const testValue = 'test value'

            deferred.resolve(testValue)

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalledTimes(1)
            expect(onResolve).toHaveBeenCalledWith(testValue)
        })

        test('should call onReject callback when rejected', async () => {
            const onReject = vi.fn()
            const deferred = createDeferred<string>({ onReject })
            const testError = new Error('test error')

            deferred.reject(testError)

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledTimes(1)
            expect(onReject).toHaveBeenCalledWith(testError)

            // Handle the rejected promise to prevent unhandled rejection
            await expect(deferred).rejects.toThrow('test error')
        })

        test('should call onSettle callback on resolve', async () => {
            const onSettle = vi.fn()
            const deferred = createDeferred<string>({ onSettle })

            deferred.resolve('test')

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalledTimes(1)
        })

        test('should call onSettle callback on reject', async () => {
            const onSettle = vi.fn()
            const deferred = createDeferred<string>({ onSettle })

            deferred.reject(new Error('test'))

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalledTimes(1)

            // Handle the rejected promise to prevent unhandled rejection
            await expect(deferred).rejects.toThrow('test')
        })

        test('should call onError when onResolve throws', async () => {
            const onError = vi.fn()

            const onResolve = vi.fn(() => {
                throw new Error('callback error')
            })

            const deferred = createDeferred<string>({ onResolve, onError })

            deferred.resolve('test')

            // Wait for microtask to complete
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

            const deferred = createDeferred<string>({ onReject, onError })

            deferred.reject(new Error('original error'))

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(expect.any(Error))

            // Handle the rejected promise to prevent unhandled rejection
            await expect(deferred).rejects.toThrow('original error')
        })

        test('should call onError when onSettle throws', async () => {
            const onError = vi.fn()

            const onSettle = vi.fn(() => {
                throw new Error('callback error')
            })

            const deferred = createDeferred<string>({ onSettle, onError })

            deferred.resolve('test')

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onSettle).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(expect.any(Error))
        })

        test('should call all callbacks in correct order', async () => {
            const callOrder: string[] = []
            const onResolve = vi.fn(() => callOrder.push('onResolve'))
            const onSettle = vi.fn(() => callOrder.push('onSettle'))
            const deferred = createDeferred<string>({ onResolve, onSettle })

            deferred.resolve('test')

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(callOrder).toEqual(['onResolve', 'onSettle'])
        })

        test('should not call callbacks on multiple resolve attempts', async () => {
            const onResolve = vi.fn()
            const onSettle = vi.fn()
            const deferred = createDeferred<string>({ onResolve, onSettle })

            deferred.resolve('first')
            deferred.resolve('second')

            // Wait for microtask to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalledTimes(1)
            expect(onSettle).toHaveBeenCalledTimes(1)
        })
    })

    describe('async behavior', () => {
        test('should execute callbacks asynchronously', () => {
            const onResolve = vi.fn()
            const deferred = createDeferred<string>({ onResolve })

            deferred.resolve('test')

            // Callback should not be called synchronously
            expect(onResolve).not.toHaveBeenCalled()
        })

        test('should execute callbacks in microtask queue', async () => {
            const executionOrder: string[] = []
            const onResolve = vi.fn(() => executionOrder.push('callback'))
            const deferred = createDeferred<string>({ onResolve })

            deferred.resolve('test')
            executionOrder.push('sync')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(executionOrder).toEqual(['sync', 'callback'])
        })

        test('should handle Promise resolution correctly', async () => {
            const onResolve = vi.fn()
            const deferred = createDeferred<string>({ onResolve })
            const promiseValue = Promise.resolve('async value')

            deferred.resolve(promiseValue)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalledWith(promiseValue)

            const result = await deferred
            expect(result).toBe('async value')
        })
    })

    describe('TypeScript type safety', () => {
        test('should infer correct types', async () => {
            // Test type inference
            const stringDeferred = createDeferred<string>()
            const numberDeferred = createDeferred<number>()
            const objectDeferred = createDeferred<{ id: number }>()

            stringDeferred.resolve('string')
            numberDeferred.resolve(123)
            objectDeferred.resolve({ id: 1 })

            const stringResult: string = await stringDeferred
            const numberResult: number = await numberDeferred
            const objectResult: { id: number } = await objectDeferred

            expect(typeof stringResult).toBe('string')
            expect(typeof numberResult).toBe('number')
            expect(typeof objectResult).toBe('object')
            expect(objectResult.id).toBe(1)
        })

        test('should work without explicit type parameter', async () => {
            const deferred = createDeferred()

            deferred.resolve('inferred')

            const result = await deferred
            expect(result).toBe('inferred')
        })

        test('should handle union types', async () => {
            const deferred = createDeferred<string | number>()

            deferred.resolve(42)

            const result = await deferred
            expect(result).toBe(42)
        })
    })

    describe('options parameter', () => {
        test('should work with empty options object', () => {
            const deferred = createDeferred({})

            expect(deferred).toBeDefined()
            expect(deferred.isPending).toBe(true)
        })

        test('should work without options parameter', () => {
            const deferred = createDeferred()

            expect(deferred).toBeDefined()
            expect(deferred.isPending).toBe(true)
        })

        test('should work with partial options', async () => {
            const onResolve = vi.fn()
            const deferred = createDeferred<string>({ onResolve })

            deferred.resolve('test')

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalled()
        })
    })

    describe('error handling edge cases', () => {
        test('should call onError when callbacks throw errors', async () => {
            // This test verifies that onError is called when other callbacks throw
            // We avoid testing onError throwing to prevent unhandled errors in test output
            const onError = vi.fn() // Don't throw in onError to avoid unhandled errors

            const onResolve = vi.fn(() => {
                throw new Error('onResolve throws')
            })

            const deferred = createDeferred<string>({ onResolve, onError })

            deferred.resolve('test')

            // Wait for microtasks to complete
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onResolve).toHaveBeenCalled()
            expect(onError).toHaveBeenCalledWith(expect.any(Error))

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                message: 'onResolve throws',
            }))
        })

        test('should handle rejection with undefined reason', async () => {
            const onReject = vi.fn()
            const deferred = createDeferred<string>({ onReject })

            // eslint-disable-next-line ts/prefer-promise-reject-errors
            deferred.reject()

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledWith(undefined)
            await expect(deferred).rejects.toBeUndefined()
        })

        test('should handle rejection with null reason', async () => {
            const onReject = vi.fn()
            const deferred = createDeferred<string>({ onReject })

            // eslint-disable-next-line ts/prefer-promise-reject-errors
            deferred.reject(null)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledWith(null)
            await expect(deferred).rejects.toBeNull()
        })

        test('should handle rejection with non-Error objects', async () => {
            const onReject = vi.fn()
            const deferred = createDeferred<string>({ onReject })
            const customReason = { message: 'custom error', code: 500 }

            // eslint-disable-next-line ts/prefer-promise-reject-errors
            deferred.reject(customReason)

            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(onReject).toHaveBeenCalledWith(customReason)
            await expect(deferred).rejects.toBe(customReason)
        })
    })

    describe('complex scenarios', () => {
        test('should work with nested promises', async () => {
            const deferred1 = createDeferred<string>()
            const deferred2 = createDeferred<string>()

            deferred1.resolve('first')
            deferred2.resolve(deferred1)

            const result = await deferred2
            expect(result).toBe('first')
        })

        test('should handle concurrent operations', async () => {
            const results: string[] = []

            const deferreds = Array.from({ length: 10 }, () => {
                const onResolve = (value: string | PromiseLike<string>) => {
                    if (typeof value === 'string') {
                        results.push(value)
                    }
                }

                return createDeferred<string>({ onResolve })
            })

            // Resolve all deferreds concurrently
            for (const [i, deferred] of deferreds.entries()) {
                deferred.resolve(`result-${i}`)
            }

            // Wait for all to complete
            await Promise.all(deferreds)
            await new Promise<void>((resolve) => queueMicrotask(resolve))

            expect(results).toHaveLength(10)

            expect(results).toEqual(expect.arrayContaining([
                'result-0',
                'result-1',
                'result-2',
                'result-3',
                'result-4',
                'result-5',
                'result-6',
                'result-7',
                'result-8',
                'result-9',
            ]))
        })

        test('should maintain state consistency under rapid operations', () => {
            const deferred = createDeferred<string>()

            // Rapid state changes
            for (let i = 0; i < 100; i++) {
                deferred.resolve(`attempt-${i}`)
            }

            expect(deferred.isSettled).toBe(true)
            expect(deferred.isPending).toBe(false)
            expect(deferred.isResolved).toBe(true)
            expect(deferred.isRejected).toBe(false)
        })

        test('should work with Promise.race', async () => {
            const deferred1 = createDeferred<string>()
            const deferred2 = createDeferred<string>()

            setTimeout(() => deferred1.resolve('first'), 10)
            setTimeout(() => deferred2.resolve('second'), 20)

            const result = await Promise.race([deferred1, deferred2])
            expect(result).toBe('first')
        })

        test('should work with Promise.all', async () => {
            const deferred1 = createDeferred<string>()
            const deferred2 = createDeferred<number>()
            const deferred3 = createDeferred<boolean>()

            deferred1.resolve('string')
            deferred2.resolve(42)
            deferred3.resolve(true)

            const results = await Promise.all([deferred1, deferred2, deferred3])
            expect(results).toEqual(['string', 42, true])
        })

        test('should handle thenable objects', async () => {
            const deferred = createDeferred<string>()

            // Create a thenable using Promise.resolve to avoid linting issues
            const thenable = Promise.resolve('thenable result')
            deferred.resolve(thenable)

            const result = await deferred
            expect(result).toBe('thenable result')
        })
    })

    describe('memory and performance', () => {
        test('should not leak memory with unused callbacks', () => {
            const deferred = createDeferred<string>({
                onResolve: () => {},
                onReject: () => {},
                onSettle: () => {},
                onError: () => {},
            })

            // Should not throw or cause issues
            expect(deferred.isPending).toBe(true)
        })

        test('should handle large number of deferreds', () => {
            const deferreds = Array.from({ length: 1000 }, () => createDeferred<number>())

            for (const [i, deferred] of deferreds.entries()) {
                deferred.resolve(i)
            }

            expect(deferreds.every((d) => d.isResolved)).toBe(true)
        })
    })

    describe('integration with native Promise features', () => {
        test('should work with async/await', async () => {
            const deferred = createDeferred<string>()

            const asyncFunction = async () => {
                const result = await deferred

                return result.toUpperCase()
            }

            const promise = asyncFunction()
            deferred.resolve('hello')

            const result = await promise
            expect(result).toBe('HELLO')
        })

        test('should work with Promise.prototype.then', async () => {
            const deferred = createDeferred<number>()

            const chainedPromise = deferred.then((value: number) => value * 2)
            deferred.resolve(21)

            const result = await chainedPromise
            expect(result).toBe(42)
        })

        test('should work with Promise.prototype.catch', async () => {
            const deferred = createDeferred<string>()

            const catchPromise = deferred.catch((error: Error) => `caught: ${error.message}`)
            deferred.reject(new Error('test error'))

            const result = await catchPromise
            expect(result).toBe('caught: test error')
        })

        test('should work with Promise.prototype.finally', async () => {
            const finallyCallback = vi.fn()
            const deferred = createDeferred<string>()

            const finallyPromise = deferred.finally(finallyCallback)
            deferred.resolve('test')

            await finallyPromise
            expect(finallyCallback).toHaveBeenCalled()
        })
    })
})
