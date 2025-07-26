import type { PlayerRow } from './CSVLoader';

// Change this to any secret string you like
const SECRET_SALT = 'ssbmrankdle_secret_salt';

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function selectAnswer(rows: PlayerRow[], date: Date = new Date()): PlayerRow | null {
    if (!rows.length) return null;
    // Use YYYY-MM-DD format for consistency
    const dateStr = date.toISOString().slice(0, 10);
    const hash = hashString(dateStr + SECRET_SALT);
    const index = hash % rows.length;
    return rows[index];
}