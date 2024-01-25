export type EventName = string | symbol

export type EventListener = (...args: any[]) => void

export type Events = Record<EventName, EventListener>
