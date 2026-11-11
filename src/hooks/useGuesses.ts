import { useState, useEffect, useRef } from 'react';
import type { PlayerRow } from '../utils/CSVLoader';
import { STARTING_SCORE, SPEED_BONUS, OUT_OF_SEASON_PENALTY } from '../constants/scoring';

interface ScoreBreakdownItem {
  guess: PlayerRow;
  pointsLost: number;
  formula: string;
  bonus?: number;
}

interface UseGuessesOptions {
  answer: PlayerRow | null;
  hardMode: boolean;
  seasonData?: PlayerRow[]; // All players in the season for calculating season length
}

export function useGuesses({ answer, hardMode, seasonData }: UseGuessesOptions): {
  guesses: PlayerRow[];
  scoreBreakdown: ScoreBreakdownItem[];
  gameWon: boolean;
  gameLost: boolean;
  error: string | null;
  submitGuess: (guessRow: PlayerRow) => void;
  reset: () => void;
  restoreState: (guesses: PlayerRow[], scoreBreakdown: ScoreBreakdownItem[], gameWon: boolean, gameLost: boolean) => void;
} {
  const [guesses, setGuesses] = useState<PlayerRow[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdownItem[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevAnswerRef = useRef<PlayerRow | null>(null);

  // Reset when answer changes (for random mode)
  useEffect(() => {
    if (prevAnswerRef.current && answer && prevAnswerRef.current.Tag !== answer.Tag) {
      reset();
    }
    prevAnswerRef.current = answer;
  }, [answer]);

  function reset() {
    setGuesses([]);
    setScoreBreakdown([]);
    setGameWon(false);
    setGameLost(false);
    setError(null);
  }

  function restoreState(
    restoredGuesses: PlayerRow[], 
    restoredScoreBreakdown: ScoreBreakdownItem[], 
    restoredGameWon: boolean, 
    restoredGameLost: boolean
  ) {
    setGuesses(restoredGuesses);
    setScoreBreakdown(restoredScoreBreakdown);
    setGameWon(restoredGameWon);
    setGameLost(restoredGameLost);
    setError(null);
  }

  function submitGuess(guessRow: PlayerRow) {
    if (!answer) return;
    if (guesses.some(g => g.Tag === guessRow.Tag)) {
      setError('Duplicate guess');
      return;
    }
    if (gameWon || gameLost) return;

    // Hard mode logic
    if (hardMode) {
      // If guess is not in the season, lose immediately
      if (guessRow.Rank === 'N/A') {
        // Add a penalty to bring score to 0
        const currentPointsLost = scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
        const remainingPoints = STARTING_SCORE - currentPointsLost;
        setScoreBreakdown(prev => [...prev, { 
          guess: guessRow, 
          pointsLost: remainingPoints, 
          formula: 'Hard Mode violation: Out of season guess' 
        }]);
        setGuesses(prev => [...prev, guessRow]);
        setGameLost(true);
        setError('In Hard Mode, guessing a player not in the season is an instant loss.');
        return;
      }
      // Must be closer to answer's rank and not pass it
      if (guesses.length > 0 && answer.Rank !== 'N/A') {
        const prevGuess = guesses[guesses.length - 1];
        const prevRank = Number(prevGuess.Rank);
        const currRank = Number(guessRow.Rank);
        const answerRank = Number(answer.Rank);
        const prevDiff = Math.abs(prevRank - answerRank);
        const currDiff = Math.abs(currRank - answerRank);
        // Check if passed the answer (crossed over)
        const passed = (prevRank < answerRank && currRank > answerRank) ||
                       (prevRank > answerRank && currRank < answerRank);
        if (passed) {
          // Add a penalty to bring score to 0
          const currentPointsLost = scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
          const remainingPoints = STARTING_SCORE - currentPointsLost;
          setScoreBreakdown(prev => [...prev, { 
            guess: guessRow, 
            pointsLost: remainingPoints, 
            formula: 'UCF Violation: No Overshooting!' 
          }]);
          setGuesses(prev => [...prev, guessRow]);
          setGameLost(true);
          setError('You passed the answer! When UCF is OFF, you must get closer without passing the answer.');
          return;
        }
        // Check if not getting closer
        if (currDiff >= prevDiff) {
          // Add a penalty to bring score to 0
          const currentPointsLost = scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
          const remainingPoints = STARTING_SCORE - currentPointsLost;
          setScoreBreakdown(prev => [...prev, { 
            guess: guessRow, 
            pointsLost: remainingPoints, 
            formula: 'UCF Violation: No Backdashing!' 
          }]);
          setGuesses(prev => [...prev, guessRow]);
          setGameLost(true);
          setError('Guess must be closer to the answer when UCF: OFF.');
          return;
        }
      }
    }

    // Win condition
    if (guessRow.Tag === answer.Tag) {
      setGameWon(true);
      // Calculate win bonus based on guess number
      const guessNum = guesses.length + 1;
      let bonus = 0;
      if (guessNum === 1) bonus = SPEED_BONUS.GUESS_1;
      else if (guessNum === 2) bonus = SPEED_BONUS.GUESS_2;
      else if (guessNum === 3) bonus = SPEED_BONUS.GUESS_3;
      else if (guessNum === 4) bonus = SPEED_BONUS.GUESS_4;
      
      // Add winning guess with bonus
      setScoreBreakdown(prev => [...prev, { 
        guess: guessRow, 
        pointsLost: 0, 
        formula: `Correct Answer: ${STARTING_SCORE} points`, 
        bonus 
      }]);
      setGuesses(prev => [...prev, guessRow]);
      setError(null);
      return;
    }

    // Calculate points lost
    let pointsLost: number;
    let formula: string;
    if (guessRow.Rank === 'N/A') {
      // Out of season guess: penalty increases with each guess
      const guessNum = guesses.length + 1;
      if (guessNum === 1) {
        pointsLost = OUT_OF_SEASON_PENALTY.GUESS_1;
        formula = `Not on this ranking: -${OUT_OF_SEASON_PENALTY.GUESS_1} points`;
      } else if (guessNum === 2) {
        pointsLost = OUT_OF_SEASON_PENALTY.GUESS_2;
        formula = `Not on this ranking: -${OUT_OF_SEASON_PENALTY.GUESS_2} points`;
      } else if (guessNum === 3) {
        pointsLost = OUT_OF_SEASON_PENALTY.GUESS_3;
        formula = `Not on this ranking: -${OUT_OF_SEASON_PENALTY.GUESS_3} points`;
      } else {
        pointsLost = OUT_OF_SEASON_PENALTY.GUESS_4_PLUS;
        formula = `Not on this ranking: -${OUT_OF_SEASON_PENALTY.GUESS_4_PLUS} points`;
      }
    } else {
      const guessRank = Number(guessRow.Rank) || 0;
      const answerRank = Number(answer.Rank) || 0;
      const guessNum = guesses.length + 1;
      
      // Calculate season length (number of ranked players in this season)
      const seasonLength = seasonData 
        ? seasonData.filter(p => p.Season === answer.Season && p.Rank !== 'N/A').length
        : 100; // Default fallback
      
      // Calculate percentage away: |guessRank - answerRank| / seasonLength
      const rankDifference = Math.abs(guessRank - answerRank);
      const percentageOff = rankDifference / seasonLength;
      
      // Base point deduction (before divisor)
      const basePointsLost = percentageOff * 10000;
      
      // Apply divisor based on guess number
      let divisor = 4;
      if (guessNum === 2) divisor = 3;
      else if (guessNum === 3) divisor = 2;
      else if (guessNum >= 4) divisor = 1;
      
      pointsLost = basePointsLost / divisor;
      formula = `|${guessRank} - ${answerRank}| / ${seasonLength} × 10000 / ${divisor} = ${pointsLost.toFixed(2)}`;
    }

    setScoreBreakdown(prev => [...prev, { guess: guessRow, pointsLost, formula }]);
    setGuesses(prev => [...prev, guessRow]);

    // Lose condition
    const totalPointsLost = [...scoreBreakdown, { guess: guessRow, pointsLost, formula }]
      .reduce((sum, item) => sum + item.pointsLost, 0);
    const finalScore = Math.max(10000 - totalPointsLost, 0);
    if (finalScore <= 0 && !gameWon) {
      setGameLost(true);
    }
    setError(null);
  }

  return {
    guesses,
    scoreBreakdown,
    gameWon,
    gameLost,
    error,
    submitGuess,
    reset,
    restoreState,
  };
}
