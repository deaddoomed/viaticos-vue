export function parseDateLocal(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year!, month! - 1, day);
}

export function formatDateLocal(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}