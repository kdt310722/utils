export function padZeroStart(num: number, length: number) {
    return num.toString().padStart(length, '0')
}

export function formatDate(date: Date, showMilliseconds = false) {
    const year = date.getFullYear()
    const month = padZeroStart(date.getMonth() + 1, 2)
    const day = padZeroStart(date.getDate(), 2)
    const hours = padZeroStart(date.getHours(), 2)
    const minutes = padZeroStart(date.getMinutes(), 2)
    const seconds = padZeroStart(date.getSeconds(), 2)
    const milliseconds = padZeroStart(date.getMilliseconds(), 3)

    return `${hours}:${minutes}:${seconds}${showMilliseconds ? `.${milliseconds}` : ''} ${day}/${month}/${year}`
}
