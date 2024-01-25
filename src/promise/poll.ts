import type { Fn } from '../function'
import { sleep } from './sleep'

export const poll = (fn: Fn, delay = 0, immediately = true) => {
    let active = true

    const stop = () => (active = false)

    const watch = async () => {
        if (!active) {
            return
        }

        await fn()

        if (active) {
            await sleep(delay)
        }

        await watch()
    }

    setTimeout(watch, immediately ? 0 : delay)

    return stop
}
