import React, { useState, useEffect, useCallback } from 'react';
import { loadCSV, PlayerRow } from '../utils/CSVLoader';
import TagDropdown from './TagDropdown';
import '../styles/GameBoard.css';
import { selectAnswer } from '../utils/AnswerSelector';
import ResultsModal from './ResultsModal';
import { getCircleFlagUrl, getCharacterImageUrls } from '../utils/MapperUtils';
import { useGuesses } from '../hooks/useGuesses';
import { useDailyPuzzleTracking } from '../hooks/useDailyPuzzleTracking';
import HowToPlayModal from './HowToPlayModal';
import { SSBMRANK_DAILY_CONTENT } from '../data/howToPlayContent';
import TitleGroup from './TitleGroup';
import GameControlsRow from './GameControlsRow';
import { SSBMRANK_DAILY_MESSAGE, SSBMRANK_DAILY_TITLE } from '../data/playerMessage';
import SubmitButton from './Buttons/SubmitButton';

const COLUMN_HEADERS = [
    'Pos.',
    'Rank',
    'Country',
    'Tag',
    'Character',
    'First',
    'Latest',
    '# of Lists'
];

interface GameBoardProps {
    hardMode?: boolean;
    externalAnswer?: PlayerRow | null;
    externalGuesses?: PlayerRow[];
    externalScoreBreakdown?: any[];
    externalGameWon?: boolean;
    externalGameLost?: boolean;
    externalError?: string | null;
    externalSubmitGuess?: (guessRow: PlayerRow) => void;
    externalSeasonData?: PlayerRow[];
    onContinueToRandom?: (won: boolean, score: number, answer: PlayerRow, guesses: PlayerRow[], scoreBreakdown: any[]) => void;
    hideHeader?: boolean;
    hideControls?: boolean;
}

export default function GameBoard({ 
    hardMode = false,
    externalAnswer,
    externalGuesses,
    externalScoreBreakdown,
    externalGameWon,
    externalGameLost,
    externalError,
    externalSubmitGuess,
    externalSeasonData,
    onContinueToRandom,
    hideHeader = false,
    hideControls = false
}: GameBoardProps): JSX.Element {
    const [answer, setAnswer] = useState<PlayerRow | null>(null);
    const [currentGuess, setCurrentGuess] = useState('');
    const [rows, setRows] = useState<PlayerRow[]>([]);
    const [resetDropdown, setResetDropdown] = useState(0);
    const [seasonData, setSeasonData] = useState<PlayerRow[]>([]);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showInitialAnimation, setShowInitialAnimation] = useState(true);
    
    // Daily puzzle tracking (only for non-controlled mode)
    const { isComplete, savedState, saveProgress } = useDailyPuzzleTracking('ssbmrank-daily');
    
    // Use external state if provided, otherwise use internal state
    const isControlled = externalAnswer !== undefined;
    const actualAnswer = isControlled ? externalAnswer : answer;
    const actualSeasonData = isControlled && externalSeasonData ? externalSeasonData : seasonData;
    
    const {
      guesses,
      scoreBreakdown,
      gameWon,
      gameLost,
      error,
      submitGuess,
      reset,
      restoreState,
    } = useGuesses({ answer: actualAnswer, hardMode, seasonData: actualSeasonData });
    
    const actualGuesses = isControlled && externalGuesses ? externalGuesses : guesses;
    const actualScoreBreakdown = isControlled && externalScoreBreakdown ? externalScoreBreakdown : scoreBreakdown;
    const actualGameWon = isControlled && externalGameWon !== undefined ? externalGameWon : gameWon;
    const actualGameLost = isControlled && externalGameLost !== undefined ? externalGameLost : gameLost;
    const actualError = isControlled && externalError !== undefined ? externalError : error;
    const actualSubmitGuess = isControlled && externalSubmitGuess ? externalSubmitGuess : submitGuess;

    // Turn off initial animation after it plays
    useEffect(() => {
        if (showInitialAnimation && actualAnswer) {
            const timer = setTimeout(() => setShowInitialAnimation(false), 800);
            return () => clearTimeout(timer);
        }
    }, [showInitialAnimation, actualAnswer]);

    useEffect(() => {

        if (!isControlled) {
            loadCSV('/Data - Data.csv').then(data => {
                const todayAnswer = selectAnswer(data);
                // Batch state updates to prevent multiple re-renders
                setAnswer(todayAnswer);
                setSeasonData(data);
                // Don't set rows here - let the second useEffect handle it
                
                // Restore saved guesses if they exist and match today's answer
                if (todayAnswer && savedState && savedState.answerTag === todayAnswer.Tag) {
                    // Directly restore state instead of replaying guesses
                    if (restoreState) {
                        restoreState(
                            savedState.guesses,
                            savedState.scoreBreakdown,
                            savedState.gameWon,
                            savedState.gameLost
                        );
                    }
                }
            });
        }
    }, [isControlled, savedState?.answerTag]); // Add savedState dependency

    // Update rows when guesses change
    useEffect(() => {
        if (!actualAnswer) return;
        // Sort guesses by rank (numerically) and insert answer in proper position
        const allGuesses = actualGuesses.filter(row => row.Tag !== actualAnswer.Tag);
        
        // Combine answer with guesses and sort by rank
        const allRows = [...allGuesses, actualAnswer];
        allRows.sort((a, b) => {
            const rankA = a.Rank === 'N/A' ? Infinity : Number(a.Rank) || Infinity;
            const rankB = b.Rank === 'N/A' ? Infinity : Number(b.Rank) || Infinity;
            return rankA - rankB;
        });
        
        setRows(allRows);
        
        // Auto-save progress for daily puzzle (only if not controlled)
        if (!isControlled && actualGuesses.length > 0) {
            saveProgress(actualGuesses, actualScoreBreakdown, actualGameWon, actualGameLost, actualAnswer.Tag);
        }
    }, [actualGuesses, actualAnswer, actualScoreBreakdown, actualGameWon, actualGameLost, isControlled, saveProgress]);
    const handleSubmitGuess = () => {
        if (!actualAnswer) {
            return;
        }
        loadCSV('/Data - Data.csv').then(data => {
            // Find the guess row (prefer answer's season, else any)
            const guessRowInSeason = data.find(row => row.Tag === currentGuess && row.Season === actualAnswer.Season);
            const guessRowAny = data.find(row => row.Tag === currentGuess);
            let guessRow: PlayerRow;
            if (guessRowInSeason) {
                guessRow = guessRowInSeason;
            } else if (guessRowAny) {
                // Not in season: set Rank to 'N/A'
                guessRow = { ...guessRowAny, Rank: 'N/A' };
            } else {
                setCurrentGuess('');
                setResetDropdown(prev => prev + 1);
                return;
            }
            actualSubmitGuess(guessRow);
            setCurrentGuess('');
            setResetDropdown(prev => prev + 1);
        });
    };



    return (
        <div className="game-board">
            {!hideHeader && (
                <TitleGroup 
                    title="SSBMRank Daily" 
                    subtitle={actualAnswer?.Season || ''}
                    showTiltCard={true}
                    tiltCardImage="/images/stages/worldmap.png"
                />
            )}
            <div className="search-container">
                <TagDropdown
                    onSelect={tag => setCurrentGuess(tag)}
                    reset={resetDropdown}
                />
                <SubmitButton 
                    onClick={handleSubmitGuess} 
                    disabled={!currentGuess || actualGameWon}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        {COLUMN_HEADERS.map(header => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const isAnswerRow = actualAnswer && row.Tag === actualAnswer.Tag;
                        const revealAnswer = actualGameWon || actualGameLost; // Reveal if won or lost
                        if (isAnswerRow) {
                            const guessCount = actualGuesses.length;
                          
                            return (
                                <tr className="answer-row" key={row.Tag + row.Season}>
                                    <td><span className="answer-icon"></span></td>
                                    <td>{revealAnswer ? row.Rank : '?'}</td>
                                    <td className={!revealAnswer && guessCount === 2 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 2
                                            ? (
                                                <img
                                                    src={getCircleFlagUrl(row.Country)}
                                                    alt={row.Country}
                                                    style={{ width: 24, height: 24, borderRadius: '50%', verticalAlign: 'middle' }}
                                                />
                                            )
                                            : '?'}
                                    </td>
                                    <td>{revealAnswer ? row.Tag : '?'}</td>
                                    <td className={!revealAnswer && guessCount === 3 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 3
                                            ? getCharacterImageUrls(row.Character).map((imgSrc, idx) => (
                                                <img
                                                    key={imgSrc + idx}
                                                    src={imgSrc}
                                                    alt={row.Character}
                                                    style={{ width: 24, height: 24, marginRight: 2, verticalAlign: 'middle' }}
                                                />
                                            ))
                                            : '?'}
                                    </td>
                                    <td className={!revealAnswer && showInitialAnimation && guessCount === 0 ? 'hint-reveal-flip' : ''}>
                                        {row.FirstAppearance}
                                    </td>
                                    <td className={!revealAnswer && guessCount === 1 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 1 ? row.MostRecent : '?'}
                                    </td>
                                    <td className={!revealAnswer && guessCount === 1 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 1 ? row.Appearances : '?'}
                                    </td>
                                </tr>
                            );
                        }
                        // Guess rows show all their data
                        const guessRank = Number(row.Rank);
                        const answerRank = actualAnswer ? Number(actualAnswer.Rank) : 0;
                        const arrow = guessRank < answerRank ? '↓' : '↑';
                        return (
                            <tr key={row.Tag + (row.Season || '')} className="guess-row-flip">
                                <td>{arrow}</td>
                                <td>{row.Rank || '?'}</td>
                                <td>
                                    <img
                                        src={getCircleFlagUrl(row.Country)}
                                        alt={row.Country}
                                        style={{ width: 24, height: 24, borderRadius: '50%', verticalAlign: 'middle' }}
                                    />
                                </td>
                                <td>{row.Tag || '?'}</td>
                                <td>
                                    {getCharacterImageUrls(row.Character).map((imgSrc, idx) => (
                                        <img
                                            key={imgSrc + idx}
                                            src={imgSrc}
                                            alt={row.Character}
                                            style={{ width: 24, height: 24, marginRight: 2, verticalAlign: 'middle' }}
                                        />
                                    ))}
                                </td>
                                <td>{row.FirstAppearance || '?'}</td>
                                <td>{row.MostRecent || '?'}</td>
                                <td>{row.Appearances || '?'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {!hideControls && (
                <GameControlsRow 
                    onHowToPlay={() => setShowHowToPlay(true)}
                    playerMessage={SSBMRANK_DAILY_MESSAGE}
                    topMessage={SSBMRANK_DAILY_TITLE}
                />
            )}
            {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} content={SSBMRANK_DAILY_CONTENT} />}
            {((actualGameWon || actualGameLost) && actualAnswer && !onContinueToRandom) || (!isControlled && isComplete && savedState) ? (
                <ResultsModal
                    won={actualGameWon || (savedState?.gameWon || false)}
                    answer={actualAnswer || { Tag: savedState?.answerTag } as PlayerRow}
                    guesses={actualGuesses.length > 0 ? actualGuesses : (savedState?.guesses || [])}
                    scoreBreakdown={actualScoreBreakdown.length > 0 ? actualScoreBreakdown : (savedState?.scoreBreakdown || [])}
                    isRandomMode={false}
                    hardMode={hardMode}
                />
            ) : null}
            {actualError && <div className="error-message">{actualError}</div>}
        </div>
    );
}  
