import { useState, useCallback } from 'react';
import { loadMIPRDLECSV, MIPRDLERow } from '../utils/CSVLoader';
import { selectRandomMIPRDLEAnswer } from '../utils/AnswerSelector';
import { useEffect } from 'react';
import { STARTING_SCORE } from '../constants/scoring';

interface UseRandomMIPRDLEGameOptions {
  hardMode?: boolean;
  initialStreak?: number;
  initialScore?: number;
  dailyRound?: RoundHistory;
}

interface RoundHistory {
  answer: MIPRDLERow;
  guesses: MIPRDLERow[];
  scoreBreakdown: any[];
  roundScore: number;
  won: boolean;
}

export function useRandomMIPRDLEGame({ 
  hardMode = false,
  initialStreak = 0,
  initialScore = 0,
  dailyRound,
}: UseRandomMIPRDLEGameOptions = {}) {
  const [data, setData] = useState<MIPRDLERow[] | null>(null);
  const [answer, setAnswer] = useState<MIPRDLERow | null>(null);
  const [guesses, setGuesses] = useState<MIPRDLERow[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<any[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(initialScore);
  const [streak, setStreak] = useState(initialStreak);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>(dailyRound ? [dailyRound] : []);

  // Load data and pick first random answer
  const initGame = useCallback(() => {
    setLoading(true);
    loadMIPRDLECSV('/data.csv').then(rows => {
      setData(rows);
      const randomAnswer = selectRandomMIPRDLEAnswer(rows);
      console.log('Current Answer (MIPRDLE Random):', randomAnswer);
      setAnswer(randomAnswer);
      setLoading(false);
    });
  }, []);

  // Simplified submit guess that just adds to state
  const submitGuess = useCallback((guessRow: MIPRDLERow) => {
    // This function is just for the callback pattern
    // Actual logic is handled in MIPRDLEGameBoard which will call onGuessSubmitted
  }, []);

  // Handler for when MIPRDLE board submits a guess with calculated scoring
  const handleGuessSubmitted = useCallback((guessRow: MIPRDLERow, pointsLost: number, formula: string, won: boolean, bonus?: number) => {
    setGuesses(prev => [...prev, guessRow]);
    const breakdownItem: any = { guess: guessRow, pointsLost, formula };
    if (bonus !== undefined) {
      breakdownItem.bonus = bonus;
    }
    setScoreBreakdown(prev => [...prev, breakdownItem]);
    
    if (won) {
      setGameWon(true);
    } else {
      // Check if game lost
      const newScoreBreakdown = [...scoreBreakdown, { guess: guessRow, pointsLost, formula }];
      const totalPointsLost = newScoreBreakdown.reduce((sum: number, item: any) => sum + item.pointsLost, 0);
      const finalScore = Math.max(STARTING_SCORE - totalPointsLost, 0);
      if (finalScore <= 0) {
        setGameLost(true);
      }
    }
  }, [scoreBreakdown]);

  // Reset for new round
  const reset = useCallback(() => {
    setGuesses([]);
    setScoreBreakdown([]);
    setGameWon(false);
    setGameLost(false);
    setError(null);
  }, []);

  // Start a new round with a new random answer
  const nextRound = useCallback(() => {
    if (!data) return;
    const randomAnswer = selectRandomMIPRDLEAnswer(data);

    setAnswer(randomAnswer);
    reset();
  }, [data, reset]);

  // When user clicks continue after winning, add score and start next round
  const continueAfterWin = useCallback(() => {
    if (!answer) return;
    const roundPointsLost = scoreBreakdown.reduce((sum: number, item: any) => sum + item.pointsLost, 0);
    const roundBonus = scoreBreakdown.reduce((sum: number, item: any) => sum + (item.bonus || 0), 0);
    const roundScore = Math.max(STARTING_SCORE - roundPointsLost + roundBonus, 0);
    
    // Save this round to history
    setRoundHistory(prev => [...prev, {
      answer,
      guesses,
      scoreBreakdown,
      roundScore,
      won: true,
    }]);
    
    setTotalScore(prev => prev + roundScore);
    setStreak(prev => prev + 1);
    nextRound();
  }, [answer, scoreBreakdown, guesses, nextRound]);

  // When user clicks continue after losing, set game over
  const continueAfterLoss = useCallback(() => {
    if (!answer) return;
    const roundPointsLost = scoreBreakdown.reduce((sum: number, item: any) => sum + item.pointsLost, 0);
    const roundBonus = scoreBreakdown.reduce((sum: number, item: any) => sum + (item.bonus || 0), 0);
    const roundScore = Math.max(STARTING_SCORE - roundPointsLost + roundBonus, 0);
    
    // Save this final round to history
    setRoundHistory(prev => [...prev, {
      answer,
      guesses,
      scoreBreakdown,
      roundScore,
      won: false,
    }]);
    
    setGameOver(true);
  }, [answer, scoreBreakdown, guesses]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  return {
    answer,
    guesses,
    scoreBreakdown,
    gameWon,
    gameLost,
    error,
    submitGuess,
    reset,
    totalScore,
    streak,
    gameOver,
    loading,
    nextRound,
    continueAfterWin,
    continueAfterLoss,
    roundHistory,
    handleGuessSubmitted,
  };
}
