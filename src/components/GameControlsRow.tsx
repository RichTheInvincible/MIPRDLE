import React from 'react';
import HowToPlayButton from './Buttons/HowToPlayButton';
import '../styles/GameControlsRow.css';

interface GameControlsRowProps {
  onHowToPlay: () => void;
  showScore?: boolean;
  streak?: number;
  totalScore?: number;
  playerMessage?: string;
  topMessage?: string;
}

const GameControlsRow: React.FC<GameControlsRowProps> = ({ 
  onHowToPlay, 
  showScore = false,
  streak = 0,
  totalScore = 0,
  playerMessage = '',
  topMessage = ''
}) => {
  return (
    <div className="game-controls-row">
      <div className="score-container">
        <div className="random-game-score">
          {showScore 
            ? `Streak: ${streak} | Total Score: ${totalScore % 1 === 0 ? totalScore : totalScore.toFixed(2)}` 
            : <span dangerouslySetInnerHTML={{ __html: topMessage }} />}
        </div>
        <div className="message-note" dangerouslySetInnerHTML={{ __html: playerMessage || '' }} />
      </div>
      <HowToPlayButton onClick={onHowToPlay} />
    </div>
  );
};

export default GameControlsRow;
