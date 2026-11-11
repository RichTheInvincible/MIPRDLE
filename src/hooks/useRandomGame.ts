import { useState, useCallback } from 'react';
import { loadCSV, PlayerRow } from '../utils/CSVLoader';
import { selectRandomAnswer } from '../utils/AnswerSelector';
import { useGuesses } from './useGuesses';
import { useEffect } from 'react';
import { STARTING_SCORE } from '../constants/scoring';

interface UseRandomGameOptions {
  hardMode?: boolean;
  initialStreak?: number;
  initialScore?: number;
  dailyRound?: RoundHistory;
}

interface RoundHistory {
  answer: PlayerRow;
  guesses: PlayerRow[];
  scoreBreakdown: any[];
  roundScore: number;
  won: boolean;
}

export function useRandomGame({ 
  hardMode = false,
  initialStreak = 0,
  initialScore = 0,
  dailyRound,
}: UseRandomGameOptions = {}) {
  const [data, setData] = useState<PlayerRow[] | null>(null);
  const [answer, setAnswer] = useState<PlayerRow | null>(null);
  const [totalScore, setTotalScore] = useState(initialScore);
  const [streak, setStreak] = useState(initialStreak);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>(dailyRound ? [dailyRound] : []);

  // Use the useGuesses hook for the current answer
  const guessesHook = useGuesses({ answer, hardMode, seasonData: data || [] });

  // Load data and pick first random answer
  const initGame = useCallback(() => {
    setLoading(true);
    loadCSV('/Data - Data.csv').then(rows => {
      setData(rows);
      const randomAnswer = selectRandomAnswer(rows);
      console.log('Current Answer (Random):', randomAnswer);
      setAnswer(randomAnswer);
      setLoading(false);
    });
  }, []);

  // Start a new round with a new random answer
  const nextRound = useCallback(() => {
    if (!data) return;
    const randomAnswer = selectRandomAnswer(data);

    setAnswer(randomAnswer);
    guessesHook.reset();
  }, [data, guessesHook]);

  // When user clicks continue after winning, add score and start next round
  const continueAfterWin = useCallback(() => {
    if (!answer) return;
    const roundPointsLost = guessesHook.scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
    const roundBonus = guessesHook.scoreBreakdown.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const roundScore = Math.max(STARTING_SCORE - roundPointsLost + roundBonus, 0);
    
    // Save this round to history
    setRoundHistory(prev => [...prev, {
      answer,
      guesses: guessesHook.guesses,
      scoreBreakdown: guessesHook.scoreBreakdown,
      roundScore,
      won: true,
    }]);
    
    setTotalScore(prev => prev + roundScore);
    setStreak(prev => prev + 1);
    nextRound();
  }, [answer, guessesHook.scoreBreakdown, guessesHook.guesses, nextRound]);

  // When user clicks continue after losing, set game over
  const continueAfterLoss = useCallback(() => {
    if (!answer) return;
    const roundPointsLost = guessesHook.scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
    const roundBonus = guessesHook.scoreBreakdown.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const roundScore = Math.max(STARTING_SCORE - roundPointsLost + roundBonus, 0);
    
    // Save this final round to history
    setRoundHistory(prev => [...prev, {
      answer,
      guesses: guessesHook.guesses,
      scoreBreakdown: guessesHook.scoreBreakdown,
      roundScore,
      won: false,
    }]);
    
    setGameOver(true);
  }, [answer, guessesHook.scoreBreakdown, guessesHook.guesses]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  return {
    answer,
    guesses: guessesHook.guesses,
    scoreBreakdown: guessesHook.scoreBreakdown,
    gameWon: guessesHook.gameWon,
    gameLost: guessesHook.gameLost,
    error: guessesHook.error,
    submitGuess: guessesHook.submitGuess,
    reset: guessesHook.reset,
    totalScore,
    streak,
    gameOver,
    loading,
    nextRound,
    continueAfterWin,
    continueAfterLoss,
    roundHistory,
  };
}
