/**
 * Deterministic discount percentage seeded by discountId + designId.
 * Same design always gets the same % for the same discount season.
 * Uses a djb2-style hash so there is no Math.random() dependency.
 */
export function getSeededDiscountPct(
    discountId: string,
    designId: string,
    min: number,
    max: number
): number {
    if (min >= max) return min
    const seed = discountId + designId
    let hash = 5381
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 33) ^ seed.charCodeAt(i)
        hash = hash | 0 // keep 32-bit
    }
    const range = max - min + 1
    return min + (Math.abs(hash) % range)
}
