import React from 'react';
import '../styles/SplashPage.css';
import HowToPlayModal from './HowToPlayModal';
import { SPLASH_CONTENT } from '../data/howToPlayContent';
import HardModeToggle from './Buttons/HardMode';
import ModeToggle from './Buttons/ModeToggle';
import { useState, useRef } from 'react';
import { useCustomCursor } from '../hooks/useCustomCursor';
import TitleGroup from './TitleGroup';
import GameControlsRow from './GameControlsRow';
import { SPLASH_MESSAGE, SPLASH_TITLE } from '../data/playerMessage';

const gameModes = [
  { label: <></>, value: 'daily', title: <><span>SSBMRank</span><br /><span>Daily</span></> },
  { label: <></>, value: 'miprdle', title: <><span>Michigan</span><br /><span>Daily</span></> },
 /* { label: <><b><span id="R">R</span><span id="A">A</span><span id="N">N</span><span id="D">D</span><span id="O">O</span><span id="M">M</span>
  <br /><div className="splash-btn-child"><span id="R">S</span><span id="A">S</span><span id="N">B</span><span id="D">M</span></div>
  </b></>, value: 'random', title: <><span>SSBMRank</span><br /><span>Random</span></> },
  { label: <><b><span id="R">R</span><span id="A">A</span><span id="N">N</span><span id="D">D</span><span id="O">O</span><span id="M">M</span>
  <br /><div className="splash-btn-child"><span id="R">M</span><span id="A">I</span><span id="N">P</span><span id="D">R</span></div>
  </b></>, value: 'miprdle-random', title: <><span>Michigan</span><br /><span>Random</span></> }*/
];

type SplashPageProps = {
  onSelectMode?: (mode: string, hardMode: boolean, randomMode: boolean) => void;
  onHowToPlay?: () => void;
};

type GameModeButtonProps = {
  label: React.ReactNode;
  value: string;
  title: React.ReactNode;
  onClick: (value: string) => void;
  onHover: (title: React.ReactNode | null, value: string | null) => void;
};

const GameModeButton: React.FC<GameModeButtonProps> = ({ label, value, title, onClick, onHover }) => (
  <button 
    className={`splash-btn splash-btn-${value}`} 
    onClick={() => onClick(value)}
    onMouseEnter={() => onHover(title, value)}
    onMouseLeave={() => onHover(null, null)}
  >
    {label}
  </button>
);


const SplashPage: React.FC<SplashPageProps> = ({ onSelectMode, onHowToPlay }) => {
  const [hardMode, setHardMode] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState<React.ReactNode | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  useCustomCursor(gridRef);

  const handleHover = (title: React.ReactNode | null, value: string | null) => {
    // If random toggle is on, map hover over daily/miprdle to the random variant
    if (value && randomMode) {
      let mappedMode = value;
      let mappedTitle = title;
      if (value === 'daily') {
        mappedMode = 'random';
        mappedTitle = <><span>SSBMRank</span><br /><span>Random</span></>;
      }
      if (value === 'miprdle') {
        mappedMode = 'miprdle-random';
        mappedTitle = <><span>Michigan</span><br /><span>Random</span></>;
      }
      setHoveredTitle(mappedTitle);
      setHoveredMode(mappedMode);
      return;
    }

    setHoveredTitle(title);
    setHoveredMode(value);
  };

  const showMichiganImage = hoveredMode === 'miprdle' || hoveredMode === 'miprdle-random';
  const showWorldMapImage = hoveredMode === 'daily' || hoveredMode === 'random';
  
  const tiltCardImage = showMichiganImage 
    ? '/images/stages/michigan-front.png' 
    : showWorldMapImage 
    ? '/images/stages/worldmap.png' 
    : undefined;
  
  return (
    <>
      <div className="splash-container">
        <TitleGroup
          title={hoveredTitle || 'PRdle'}
          showTiltCard={!!(showMichiganImage || showWorldMapImage)}
          tiltCardImage={tiltCardImage}
          className="splash-title"
        />
        <div className="splash-flex-row">
          <table className="splash-hardmode-table">
            <tbody>
              <tr>
                <td className="hardmode-label-cell"><span className="hardmode-label">UCF</span></td>
                <td className="hardmode-toggle-cell"><HardModeToggle enabled={hardMode} onToggle={setHardMode} /></td>
              </tr>
              <tr>
                <td className="hardmode-label-cell"><span className="hardmode-label">RANDOM</span></td>
                <td className="hardmode-toggle-cell"><ModeToggle enabled={randomMode} onToggle={setRandomMode} /></td>
              </tr>
            </tbody>
          </table>
          <div className="splash-grid" ref={gridRef}>
            {gameModes.map((mode) => (
              <GameModeButton
                key={mode.value}
                label={mode.label}
                value={mode.value}
                title={mode.title}
                onClick={(val) => onSelectMode && onSelectMode(val, hardMode, randomMode)}
                onHover={handleHover}
              />
            ))}
          </div>
        </div>
        <GameControlsRow onHowToPlay={() => setShowHowToPlay(true)} playerMessage={SPLASH_MESSAGE} topMessage={SPLASH_TITLE} />
      </div>
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} content={SPLASH_CONTENT} />}
    </>
  );
};

export default SplashPage;
