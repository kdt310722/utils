export type NumberString = `${number}` | 'Infinity' | '-Infinity' | '+Infinity' | 'NaN'

export type Numberish = NumberString | number | bigint

export interface FormatOptions extends Intl.NumberFormatOptions {
    locales?: string | string[]
    groupFractionLeadingZeros?: boolean
    exactFractionWhenZero?: boolean
    maximumFractionLeadingZeros?: number
}
