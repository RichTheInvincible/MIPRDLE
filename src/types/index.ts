export interface GameState {
    currentWord: string;
    attempts: string[];
    isGameOver: boolean;
    isWinner: boolean;
}

export interface Puzzle {
    word: string;
    hints: string[];
    Season: string;  // Add this line
}