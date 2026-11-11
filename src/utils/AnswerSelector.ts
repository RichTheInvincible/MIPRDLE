import type { PlayerRow, MIPRDLERow } from './CSVLoader';
import { EXCLUDED_PLAYERS } from '../data/excludedPlayers';

// I know what you are trying to do here and it's not worth the effort
const SECRET_SALT = 'ban_double_fox_in_doubles';

// Filter out excluded players
function filterExcludedPlayers<T extends PlayerRow | MIPRDLERow>(rows: T[]): T[] {
    return rows.filter(row => !EXCLUDED_PLAYERS.includes(row.Tag));
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}


export function selectAnswer(rows: PlayerRow[], date: Date = new Date()): PlayerRow | null {
    const filteredRows = filterExcludedPlayers(rows);
    if (!filteredRows.length) return null;
    // Always use the current date in America/New_York timezone for daily answer
    const easternDateStr = new Date(
        date.toLocaleString('en-US', { timeZone: 'America/New_York' })
    ).toISOString().slice(0, 10);
    const hash = hashString(easternDateStr + SECRET_SALT);
    const index = hash % filteredRows.length;
    return filteredRows[index];
}

export function selectMIPRDLEAnswer(rows: MIPRDLERow[], date: Date = new Date()): MIPRDLERow | null {
    const filteredRows = filterExcludedPlayers(rows);
    if (!filteredRows.length) return null;
    // Use the same deterministic selection for MIPRDLE
    const easternDateStr = new Date(
        date.toLocaleString('en-US', { timeZone: 'America/New_York' })
    ).toISOString().slice(0, 10);
    const hash = hashString(easternDateStr + SECRET_SALT);
    const index = hash % filteredRows.length;
    return filteredRows[index];
}

// Returns a random answer from the list
export function selectRandomAnswer(rows: PlayerRow[]): PlayerRow | null {
    const filteredRows = filterExcludedPlayers(rows);
    if (!filteredRows.length) return null;
    const index = Math.floor(Math.random() * filteredRows.length);
    return filteredRows[index];
}

export function selectRandomMIPRDLEAnswer(rows: MIPRDLERow[]): MIPRDLERow | null {
    const filteredRows = filterExcludedPlayers(rows);
    if (!filteredRows.length) return null;
    const index = Math.floor(Math.random() * filteredRows.length);
    return filteredRows[index];
}