import React from 'react';
import { useRandomGame } from '../hooks/useRandomGame';
import GameBoard from './GameBoard';
import ResultsModal from './ResultsModal';
import { loadCSV } from '../utils/CSVLoader';
import { useEffect, useState } from 'react';
import HowToPlayModal from './HowToPlayModal';
import { SSBMRANK_RANDOM_MESSAGE } from '../data/playerMessage';
import { SSBMRANK_RANDOM_CONTENT } from '../data/howToPlayContent';
import TitleGroup from './TitleGroup';
import GameControlsRow from './GameControlsRow';

export default function RandomGameBoard({ 
  hardMode = false,
  initialStreak,
  initialScore,
  dailyRound,
}: { 
  hardMode?: boolean;
  initialStreak?: number;
  initialScore?: number;
  dailyRound?: {
    answer: any;
    guesses: any[];
    scoreBreakdown: any[];
    roundScore: number;
    won: boolean;
  };
}) {
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  const {
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
  } = useRandomGame({ hardMode, initialStreak, initialScore, dailyRound });

  useEffect(() => {
    loadCSV('/Data - Data.csv').then(data => {
      setSeasonData(data);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (gameOver) return (
    <div className="random-game-over">
      <h2>Game Over!</h2>
      <p>Streak: <strong>{streak}</strong> puzzle{streak !== 1 ? 's' : ''}</p>
      <p>Total Score: <strong>{(totalScore / 100).toFixed(2)}%</strong> ({totalScore.toFixed(0)} points)</p>
      
      <h3>Round History:</h3>
      <div className="round-history">
        {roundHistory.map((round, roundIndex) => {
          const isDaily = dailyRound && roundIndex === 0;
          return (
            <div key={roundIndex} className="round-summary">
              <h4>
                {isDaily ? 'Daily Puzzle' : `Round ${dailyRound ? roundIndex : roundIndex + 1}`}: {round.answer.Tag} ({round.won ? 'Won' : 'Lost'})
              </h4>
              <p>Score: {(round.roundScore / 100).toFixed(2)}% ({round.roundScore.toFixed(0)} points)</p>
              <ul>
                {round.scoreBreakdown.map((item: any, idx: number) => (
                  <li key={idx}>
                    <span>{item.guess.Tag}: -{item.pointsLost.toFixed(2)} points ({(item.pointsLost / 100).toFixed(2)}%)</span>
                    <br />
                    <span style={{ fontSize: 'smaller', color: '#888' }}>{item.formula}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      
      <button onClick={() => window.location.reload()}>Restart</button>
    </div>
  );

  return (
    <div className="random-game-board">
      <TitleGroup 
        title="SSBMRank Random" 
        subtitle={answer?.Season || ''}
        showTiltCard={true}
        tiltCardImage="/images/stages/worldmap.png"
      />
      <GameBoard
        hardMode={hardMode}
        externalAnswer={answer}
        externalGuesses={guesses}
        externalScoreBreakdown={scoreBreakdown}
        externalGameWon={gameWon}
        externalGameLost={gameLost}
        externalError={error}
        externalSubmitGuess={submitGuess}
        externalSeasonData={seasonData}
        hideHeader={true}
        hideControls={true}
      />
      <GameControlsRow 
        onHowToPlay={() => setShowHowToPlay(true)}
        showScore={true}
        streak={streak}
        totalScore={totalScore}
        playerMessage={SSBMRANK_RANDOM_MESSAGE}
      />
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} content={SSBMRANK_RANDOM_CONTENT} />}
      {(gameWon || gameLost) && answer && (
        <ResultsModal
          won={gameWon}
          answer={answer}
          guesses={guesses}
          scoreBreakdown={scoreBreakdown}
          isRandomMode={true}
          hardMode={hardMode}
          roundHistory={roundHistory}
          onNext={gameWon ? continueAfterWin : undefined}
        />
      )}
    </div>
  );
}
