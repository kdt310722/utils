export const sleep = async (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function waitUntilNextSecond() {
    return new Promise<void>((resolve) => setTimeout(resolve, 1000 - (Date.now() % 1000)))
}
