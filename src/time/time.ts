export const isDate = (value: unknown): value is Date => value instanceof Date

export const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000)

export const timestamp = () => toTimestamp(new Date())
