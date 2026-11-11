export interface PlayerRow {
    Rank: string;
    Country: string;
    Tag: string;
    Character: string;
    Score: string;
    Season: string;
    FirstAppearance: string;
    MostRecent: string;
    Appearances: string;
    IMG?: string;
    URL?: string;
}

export interface MIPRDLERow {
    Number: string;
    Season: string;
    Rank: string;
    Tag: string;
    MostRecentList: string;
    FirstList: string;
    Appearances: string;
    Images?: string;
}

export async function loadCSV(url: string): Promise<PlayerRow[]> {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].replace('\r', '').split(',');

return lines.slice(1).map(line => {
    const values = line.replace('\r', '').split(',');
    const row: Partial<PlayerRow> = {};
    headers.forEach((header, i) => {
        (row as Record<string, string>)[header.trim().replace(' ', '')] = values[i]?.trim() || '';
    });
    return row as PlayerRow;
});
}

export async function loadMIPRDLECSV(url: string): Promise<MIPRDLERow[]> {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].replace('\r', '').split(',');

    return lines.slice(1).map(line => {
        const values = line.replace('\r', '').split(',');
        const row: Partial<MIPRDLERow> = {};
        headers.forEach((header, i) => {
            (row as Record<string, string>)[header.trim().replace(/\s+/g, '')] = values[i]?.trim() || '';
        });
        return row as MIPRDLERow;
    });
}