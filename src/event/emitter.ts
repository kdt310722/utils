import type { Args } from '../function'
import type { EventListener, Events } from './types'

export class Emitter<TEvents extends Events, Strict extends boolean = false, TEventsList = Strict extends true ? TEvents : TEvents & Events> {
    protected events: Partial<Record<keyof TEventsList, Array<TEventsList[keyof TEventsList]>>> = {}

    public on<N extends keyof TEventsList>(name: N, listener: TEventsList[N]) {
        return this.addListener(name, listener)
    }

    public addListener<N extends keyof TEventsList>(name: N, listener: TEventsList[N]) {
        this.events[name] ??= []
        this.events[name]?.push(listener)

        return this
    }

    public off<N extends keyof TEventsList>(name: N, listener: TEventsList[N]) {
        return this.removeListener(name, listener)
    }

    public removeListener<N extends keyof TEventsList>(name: N, listener: TEventsList[N]) {
        this.events[name] = (this.events[name] ?? []).filter((item) => {
            return item !== listener
        })

        return this
    }

    public removeAllListeners<N extends keyof TEventsList>(name?: N) {
        if (name) {
            delete this.events[name]
        } else {
            this.events = {}
        }

        return this
    }

    public listeners<N extends keyof TEventsList>(name: N) {
        return (this.events[name] ?? []) as Array<TEventsList[N]>
    }

    public emit<N extends keyof TEventsList>(name: N, ...args: TEventsList[N] extends EventListener ? Args<TEventsList[N]> : any[]) {
        const listeners = this.listeners(name)

        if (listeners.length === 0) {
            return false
        }

        for (const listener of listeners) {
            (listener as EventListener)(...args)
        }

        return true
    }

    public listenerCount<N extends keyof TEventsList>(name: N, listener?: TEventsList[N]) {
        if (!listener) {
            return this.listeners(name).length
        }

        return this.listeners(name).filter((item) => item === listener).length
    }
}
