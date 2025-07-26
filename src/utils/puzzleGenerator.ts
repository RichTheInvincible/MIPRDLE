export const generatePuzzle = (): string => {
    const words = ["apple", "grape", "peach", "berry", "melon"];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
};