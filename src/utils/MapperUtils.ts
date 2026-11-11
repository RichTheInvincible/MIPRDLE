export const countryNameToCode: Record<string, string> = {
    Australia: 'au',
    Canada: 'ca',
    Chile: 'cl',
    France: 'fr',
    Germany: 'de',
    Japan: 'jp',
    Mexico: 'mx',
    Netherlands: 'nl',
    'New Zealand': 'nz',
    Nicaragua: 'ni',
    Norway: 'no',
    Palestine: 'ps',
    'Puerto Rico': 'pr',
    Spain: 'es',
    Sweden: 'se',
    Switzerland: 'ch',
    'United Kingdom': 'gb',
    'United States': 'us',
    Venezuela: 've',
    Country: '', // fallback
};

export function getCircleFlagUrl(countryName: string): string {
    const code = countryNameToCode[countryName];
    if (!code) return 'https://cdn.jsdelivr.net/npm/circle-flags/flags/un.svg';
    return `https://cdn.jsdelivr.net/npm/circle-flags/flags/${code}.svg`;
}

export const characterNameToImage: Record<string, string> = {
    Bowser: 'neutral Bowser.png',
    'Captain Falcon': 'neutral Captain Falcon.png',
    'Donkey Kong': 'neutral Donkey Kong.png',
    'Dr. Mario': 'neutral Doctor Mario.png',
    Falco: 'neutral Falco.png',
    Fox: 'neutral Fox.png',
    Ganondorf: 'neutral Ganondorf.png',
    "Ice Climbers": 'neutral Ice Climbers.png',
    Jigglypuff: 'neutral Jigglypuff.png',
    Kirby: 'neutral Kirby.png',
    Link: 'neutral Link.png',
    Luigi: 'neutral Luigi.png',
    Mario: 'neutral Mario.png',
    Marth: 'neutral Marth.png',
    Mewtwo: 'neutral Mewtwo.png',
    'Mr. Game & Watch': 'neutral Mr. Game & Watch.png',
    Ness: 'neutral Ness.png',
    Peach: 'neutral Peach.png',
    Pichu: 'neutral Pichu.png',
    Pikachu: 'neutral Pikachu.png',
    Roy: 'neutral Roy.png',
    Samus: 'neutral Samus.png',
    Sheik: 'neutral Sheik.png',
    Yoshi: 'neutral Yoshi.png',
    'Young Link': 'neutral Young Link.png',
    Zelda: 'neutral Zelda.png',
};

export function getCharacterImageUrls(characterCell: string): string[] {
    if (!characterCell) return [];
    const names = Object.keys(characterNameToImage).sort((a, b) => b.length - a.length); // longest first
    const result: string[] = [];
    let remaining = characterCell.trim();
    while (remaining.length > 0) {
        let matched = false;
        for (const name of names) {
            if (remaining.startsWith(name)) {
                result.push(`/images/stockicons/${characterNameToImage[name]}`);
                remaining = remaining.slice(name.length).trimStart();
                matched = true;
                break;
            }
        }
        if (!matched) {
            // Try to match the first word as a character
            const nextSpace = remaining.indexOf(' ');
            const firstWord = nextSpace === -1 ? remaining : remaining.slice(0, nextSpace);
            if (characterNameToImage[firstWord]) {
                result.push(`/images/stockicons/${characterNameToImage[firstWord]}`);
            } else {
                result.push('/images/stockicons/neutral Unknown.png');
            }
            remaining = nextSpace === -1 ? '' : remaining.slice(nextSpace + 1).trimStart();
        }
    }
    return result;
}