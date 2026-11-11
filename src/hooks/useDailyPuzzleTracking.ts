import { useState, useEffect, useCallback } from 'react';
import { 
  getDailyPuzzleState, 
  saveDailyPuzzleState, 
  isDailyPuzzleComplete,
  getTodayDateString,
  DailyPuzzleState 
} from '../utils/DailyPuzzleStorage';

interface UseDailyPuzzleTrackingResult {
  isComplete: boolean;
  savedState: DailyPuzzleState | null;
  saveProgress: (guesses: any[], scoreBreakdown: any[], gameWon: boolean, gameLost: boolean, answerTag: string) => void;
}

export function useDailyPuzzleTracking(mode: string): UseDailyPuzzleTrackingResult {
  const [savedState, setSavedState] = useState<DailyPuzzleState | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const state = getDailyPuzzleState(mode);
    setSavedState(state);
    setIsComplete(isDailyPuzzleComplete(mode));
  }, [mode]);

  // Save progress to localStorage
  const saveProgress = useCallback((
    guesses: any[], 
    scoreBreakdown: any[], 
    gameWon: boolean, 
    gameLost: boolean,
    answerTag: string
  ) => {
    const state: DailyPuzzleState = {
      date: getTodayDateString(),
      guesses,
      scoreBreakdown,
      gameWon,
      gameLost,
      answerTag
    };
    
    saveDailyPuzzleState(mode, state);
    setSavedState(state);
    setIsComplete(gameWon || gameLost);
  }, [mode]);

  return {
    isComplete,
    savedState,
    saveProgress
  };
}
