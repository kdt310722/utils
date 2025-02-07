export function formatNanoseconds(nanoseconds: bigint) {
    const units = <const>[
        { label: 'h', value: 60n * 60n * 1_000_000_000n },
        { label: 'm', value: 60n * 1_000_000_000n },
        { label: 's', value: 1_000_000_000n },
        { label: 'ms', value: 1_000_000n },
        { label: 'us', value: 1000n },
        { label: 'ns', value: 1n },
    ]

    let remaining = BigInt(nanoseconds)
    const result: string[] = []

    for (const unit of units) {
        const amount = remaining / unit.value

        if (amount > 0) {
            result.push(`${amount}${unit.label}`)
            remaining %= unit.value
        }
    }

    return result.join(' ')
}
