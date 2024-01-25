export type Numberish = string | number | bigint

export interface FormatOptions extends Intl.NumberFormatOptions {
    locales?: string | string[]
    groupFractionLeadingZeros?: boolean
    exactFractionWhenZero?: boolean
    maximumFractionLeadingZeros?: number
}
