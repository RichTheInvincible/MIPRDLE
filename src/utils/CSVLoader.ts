export interface PlayerRow {
    Rank: string;
    Country: string;
    Tag: string;
    Character: string;
    Score: string;
    Season: string;
    FirstAppearance: string;
    Appearances: string;
    IMG?: string;
}

export async function loadCSV(url: string): Promise<PlayerRow[]> {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].replace('\r', '').split(',');

    return lines.slice(1).map(line => {
        const values = line.replace('\r', '').split(',');
        const row: any = {};
        headers.forEach((header, i) => {
            row[header.trim().replace(' ', '')] = values[i]?.trim() || '';
        });
        return row as PlayerRow;
    });
}