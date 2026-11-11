// Pure localStorage operations for daily puzzle tracking

export interface DailyPuzzleState {
  date: string;
  guesses: any[];
  scoreBreakdown: any[];
  gameWon: boolean;
  gameLost: boolean;
  answerTag: string;
}

export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-US', { 
    timeZone: 'America/New_York' 
  });
}

export function getDailyPuzzleState(mode: string): DailyPuzzleState | null {
  const key = `dailyPuzzle_${mode}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    const state = JSON.parse(stored);
    // Only return if it's from today
    if (state.date === getTodayDateString()) {
      return state;
    }
    // Clean up old data
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

export function saveDailyPuzzleState(mode: string, state: DailyPuzzleState): void {
  const key = `dailyPuzzle_${mode}`;
  localStorage.setItem(key, JSON.stringify(state));
}

export function clearDailyPuzzleState(mode: string): void {
  const key = `dailyPuzzle_${mode}`;
  localStorage.removeItem(key);
}

export function isDailyPuzzleComplete(mode: string): boolean {
  const state = getDailyPuzzleState(mode);
  return state ? (state.gameWon || state.gameLost) : false;
}
