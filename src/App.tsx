import React, { useState } from 'react';
import './styles/main.css';
import GameBoard from './components/GameBoard';
import RandomGameBoard from './components/RandomGameBoard';
import MIPRDLEGameBoard from './components/MIPRDLEGameBoard';
import MIPRDLERandomGameBoard from './components/MIPRDLERandomGameBoard';
import SplashPage from './components/SplashPage';

const App: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [hardMode, setHardMode] = useState(false);
    const [randomMode, setRandomMode] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dailyToRandomTransition, setDailyToRandomTransition] = useState<{
        initialStreak: number;
        initialScore: number;
        dailyRound?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            answer: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            guesses: any[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            scoreBreakdown: any[];
            roundScore: number;
            won: boolean;
        };
    } | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [miprdleDailyToRandomTransition, setMiprdleDailyToRandomTransition] = useState<{
        initialStreak: number;
        initialScore: number;
        dailyRound?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            answer: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            guesses: any[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            scoreBreakdown: any[];
            roundScore: number;
            won: boolean;
        };
    } | null>(null);

    return (
        <div className="App">
          {!selectedMode ? (
            <SplashPage
              onSelectMode={(mode, hard, random) => {
                setSelectedMode(
                  random
                    ? mode === 'daily'
                      ? 'random'
                      : mode === 'miprdle'
                        ? 'miprdle-random'
                        : mode
                    : mode
                );
                setHardMode(hard);
                setRandomMode(random);
              }}
              onHowToPlay={() => {/* TODO: Implement how to play modal */}}
            />
          ) : selectedMode === 'random' || dailyToRandomTransition ? (
            <RandomGameBoard 
              hardMode={hardMode}
              initialStreak={dailyToRandomTransition?.initialStreak}
              initialScore={dailyToRandomTransition?.initialScore}
              dailyRound={dailyToRandomTransition?.dailyRound}
            />
          ) : selectedMode === 'miprdle-random' || miprdleDailyToRandomTransition ? (
            <MIPRDLERandomGameBoard 
              hardMode={hardMode}
              initialStreak={miprdleDailyToRandomTransition?.initialStreak}
              initialScore={miprdleDailyToRandomTransition?.initialScore}
              dailyRound={miprdleDailyToRandomTransition?.dailyRound}
            />
          ) : selectedMode === 'miprdle' ? (
            <MIPRDLEGameBoard 
              hardMode={hardMode}
            />
          ) : (
            <GameBoard 
              hardMode={hardMode}
            />
          )}
        </div>
    );
};

export default App;