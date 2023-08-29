export const hexlify = (value: number | string) => {
    return `0x${Number(value).toString(16)}`
}