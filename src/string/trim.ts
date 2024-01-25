import { escapeRegExp } from './regexp'

export function ltrim(str: string, characters = ' \n\r\t\v') {
    let start = 0
    const end = str.length

    while (start < end && characters.includes(str[start])) {
        ++start
    }

    return start > 0 ? str.slice(start, end) : str
}

export function rtrim(str: string, characters = ' \n\r\t\v') {
    let end = str.length

    while (end > 0 && characters.includes(str[end - 1])) {
        --end
    }

    return end < str.length ? str.slice(0, Math.max(0, end)) : str
}

export function trim(str: string, characters = ' \n\r\t\v') {
    return ltrim(rtrim(str, characters), characters)
}

export function trimRepeated(input: string, target: string) {
    return input.replaceAll(new RegExp(`(?:${escapeRegExp(target)}){2,}`, 'g'), target)
}
