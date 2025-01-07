import { rtrim } from '../string'
import type { FormatOptions, NumberString, Numberish } from './types'

export function convertExponentialToString(num: Numberish) {
    const str = num.toString()

    if (!str.includes('e')) {
        return str as NumberString
    }

    if (!str.includes('e-')) {
        return BigInt(num).toString() as NumberString
    }

    const [base, exp] = str.split('e-').map(Number)
    const precision = base.toString().replace('.', '').length + exp

    return rtrim(Number.parseFloat(str).toFixed(precision), '0') as NumberString
}

export function format(number: Numberish, options: FormatOptions = {}) {
    let leadingZerosCount = 0
    let { maximumFractionDigits = 4, groupFractionLeadingZeros = false } = options

    number = convertExponentialToString(number)

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
        const formatted = formatter.formatToParts(number).map((part) => {
            if (part.type === 'fraction') {
                part.value = `0{${leadingZerosCount}}${part.value.slice(Math.max(0, leadingZerosCount))}`
            }

            return part.value
        })

        return formatted.join('')
    }

    return formatter.format(number)
}

export function humanizeNumber(value: Numberish, options: FormatOptions = {}) {
    return format(value, { locales: ['en-US'], notation: 'compact', compactDisplay: 'short', minimumFractionDigits: 2, maximumFractionDigits: 2, ...options })
}

export function formatUsdCurrency(input: Numberish, options: FormatOptions = {}) {
    return format(input, { style: 'currency', locales: ['en-US'], currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2, ...options })
}
