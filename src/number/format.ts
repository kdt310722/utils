import type { FormatOptions, Numberish } from './types'

export function format(number: Numberish, options: FormatOptions = {}) {
    let leadingZerosCount = 0
    let { maximumFractionDigits = 4, groupFractionLeadingZeros = false } = options

    const { exactFractionWhenZero = true, maximumFractionLeadingZeros = maximumFractionDigits } = options
    const [integerPart, fractionPart = '0'] = String(number).split('.')

    if (BigInt(integerPart) === 0n && (groupFractionLeadingZeros || exactFractionWhenZero)) {
        maximumFractionDigits += leadingZerosCount = /^0+/.exec(fractionPart)?.[0].length ?? 0

        if (!groupFractionLeadingZeros) {
            leadingZerosCount = 0
        }
    }

    const formatter = new Intl.NumberFormat(options.locales, { ...options, maximumFractionDigits })

    if (leadingZerosCount > maximumFractionLeadingZeros) {
        const formatted = formatter.formatToParts(number as number).map((part) => {
            if (part.type === 'fraction') {
                part.value = `0{${leadingZerosCount}}${part.value.slice(Math.max(0, leadingZerosCount))}`
            }

            return part.value
        })

        return formatted.join('')
    }

    return formatter.format(number as number)
}

export function humanizeNumber(value: Numberish, options: FormatOptions = {}) {
    return format(value, { locales: ['en-US'], notation: 'compact', compactDisplay: 'short', minimumFractionDigits: 2, maximumFractionDigits: 2, ...options })
}
