export function withFallback<T extends { id: string }>(
    list: T[],
    fallback?: T
) {
    if (!fallback) return list;
    return list.some((i) => i.id === fallback.id)
        ? list
        : [fallback, ...list];
}