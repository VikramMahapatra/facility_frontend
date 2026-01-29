/**
 * Convert any ISO datetime string to a format suitable for <input type="datetime-local">
 * @param {string} isoString - e.g. "2025-10-01T14:00:00Z" or "2025-10-01T14:00"
 * @returns {string} "YYYY-MM-DDTHH:MM"
 */
export function utcToLocal(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);

    // Get local components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


/**
 * Convert local datetime-local value to UTC ISO string
 * @param {string} localDateTime - "YYYY-MM-DDTHH:MM"
 * @returns {string} ISO UTC string e.g. "2025-10-01T08:30:00Z"
 */
export function localToUTC(localDateTime) {
    if (!localDateTime) return null;

    const date = new Date(localDateTime);
    return date.toISOString(); // automatically in UTC with 'Z'
}

export function formatDate(
    date?: string | Date | null,
    fallback: string = "-"
) {
    if (!date) return fallback;

    const d = typeof date === "string" ? new Date(date) : date;

    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
