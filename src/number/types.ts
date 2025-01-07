export type Numberish = `${number}` | 'Infinity' | '-Infinity' | '+Infinity' | number | bigint

export interface FormatOptions extends Intl.NumberFormatOptions {
    locales?: string | string[]
    groupFractionLeadingZeros?: boolean
    exactFractionWhenZero?: boolean
    maximumFractionLeadingZeros?: number
}
