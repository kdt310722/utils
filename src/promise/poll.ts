import type { Fn } from '../function'
import { isObject } from '../object'
import { sleep } from './sleep'

export interface PollOptions {
    fn: Fn
    delay?: number
    immediately?: boolean
}

export const isPollOptions = (value: any): value is PollOptions => isObject(value) && 'fn' in value

export const poll = (fn: Fn | PollOptions, delay = 0, immediately = true) => {
    const { fn: _fn, delay: _delay, immediately: _immediately } = isPollOptions(fn) ? { delay, immediately, ...fn } : { fn, delay, immediately }

    let active = true

    const stop = () => (active = false)

    const watch = async () => {
        if (!active) {
            return
        }

        await _fn()

        if (active) {
            await sleep(_delay)
        }

        await watch()
    }

    setTimeout(watch, _immediately ? 0 : _delay)

    return stop
}
