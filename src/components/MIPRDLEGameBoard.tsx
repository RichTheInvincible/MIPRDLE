import React, { useState, useEffect } from 'react';
import { loadMIPRDLECSV, MIPRDLERow } from '../utils/CSVLoader';
import TagDropdown from './TagDropdown';
import '../styles/GameBoard.css';
import { selectMIPRDLEAnswer } from '../utils/AnswerSelector';
import ResultsModal from './ResultsModal';
import { useDailyPuzzleTracking } from '../hooks/useDailyPuzzleTracking';
import HowToPlayModal from './HowToPlayModal';
import { MIPRDLE_DAILY_CONTENT } from '../data/howToPlayContent';
import TitleGroup from './TitleGroup';
import GameControlsRow from './GameControlsRow';
import { MIPRDLE_DAILY_MESSAGE, MIPRDLE_DAILY_TITLE } from '../data/playerMessage';
import SubmitButton from './Buttons/SubmitButton';

const COLUMN_HEADERS = [
    'Pos.',
    'Rank',
    'Tag',
    'First List',
    'Most Recent List',
    'Appearances'
];

interface MIPRDLEGameBoardProps {
    hardMode?: boolean;
    externalAnswer?: MIPRDLERow | null;
    externalGuesses?: MIPRDLERow[];
    externalScoreBreakdown?: any[];
    externalGameWon?: boolean;
    externalGameLost?: boolean;
    externalError?: string | null;
    externalSeasonData?: MIPRDLERow[];
    onContinueToRandom?: (won: boolean, score: number, answer: MIPRDLERow, guesses: MIPRDLERow[], scoreBreakdown: any[]) => void;
    onGuessSubmitted?: (guessRow: MIPRDLERow, pointsLost: number, formula: string, won: boolean, bonus?: number) => void;
    hideHeader?: boolean;
    hideControls?: boolean;
}

export default function MIPRDLEGameBoard({ 
    hardMode = false,
    externalAnswer,
    externalGuesses,
    externalScoreBreakdown,
    externalGameWon,
    externalGameLost,
    externalError,
    externalSeasonData,
    onContinueToRandom,
    onGuessSubmitted,
    hideHeader = false,
    hideControls = false
}: MIPRDLEGameBoardProps): JSX.Element {
    const [answer, setAnswer] = useState<MIPRDLERow | null>(null);
    const [currentGuess, setCurrentGuess] = useState('');
    const [rows, setRows] = useState<MIPRDLERow[]>([]);
    const [resetDropdown, setResetDropdown] = useState(0);
    const [seasonData, setSeasonData] = useState<MIPRDLERow[]>([]);
    const [guesses, setGuesses] = useState<MIPRDLERow[]>([]);
    const [gameWon, setGameWon] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scoreBreakdown, setScoreBreakdown] = useState<any[]>([]);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
    
    // Daily puzzle tracking (only when not externally controlled)
    const isControlledMode = externalAnswer !== undefined;
    const { isComplete, savedState, saveProgress } = useDailyPuzzleTracking('miprdle-daily');
    
    // Helper function to convert rank to numeric value for sorting/scoring
    function getRankNumericValue(rank: string, data: MIPRDLERow[], season: string): number {
        if (rank === 'N/A') return Infinity;
        
        const numericRank = Number(rank);
        if (!isNaN(numericRank)) return numericRank;
        
        // Handle HM and IM
        const seasonPlayers = data.filter(p => p.Season === season);
        const numericRanks = seasonPlayers
            .map(p => Number(p.Rank))
            .filter(r => !isNaN(r));
        const maxRank = Math.max(...numericRanks, 0);
        
        if (rank === 'HM') return maxRank + 1;
        if (rank === 'IM') return maxRank + 2;
        
        return Infinity;
    }

    const submitGuess = (guessRow: MIPRDLERow) => {
        const currentAnswer = externalAnswer !== undefined ? externalAnswer : answer;
        const currentGuesses = externalGuesses !== undefined ? externalGuesses : guesses;
        const currentSeasonData = externalSeasonData !== undefined ? externalSeasonData : seasonData;
        const currentGameWon = externalGameWon !== undefined ? externalGameWon : gameWon;
        const currentGameLost = externalGameLost !== undefined ? externalGameLost : gameLost;
        const currentScoreBreakdown = externalScoreBreakdown !== undefined ? externalScoreBreakdown : scoreBreakdown;
        
        if (!currentAnswer) return;
        if (currentGuesses.some(g => g.Tag === guessRow.Tag)) {
            if (externalError === undefined) setError('Duplicate guess');
            return;
        }
        if (currentGameWon || currentGameLost) return;

        // Win condition
        const won = guessRow.Tag === currentAnswer.Tag;
        if (externalGameWon === undefined && won) {
            setGameWon(true);
        }

        // Calculate bonus for winning guess
        let bonus: number | undefined = undefined;
        if (won) {
            const guessNum = currentGuesses.length + 1;
            if (guessNum === 1) bonus = 2000;
            else if (guessNum === 2) bonus = 1500;
            else if (guessNum === 3) bonus = 1000;
            else if (guessNum === 4) bonus = 500;
        }

        // Calculate points lost
        let pointsLost: number;
        let formula: string;
        
        if (guessRow.Rank === 'N/A') {
            // Missed the list: penalty increases with each guess
            const guessNum = currentGuesses.length + 1;
            if (guessNum === 1) {
                pointsLost = 2000;
                formula = 'Not on this ranking: -2000 points';
            } else if (guessNum === 2) {
                pointsLost = 3000;
                formula = 'Not on this ranking: -3000 points';
            } else if (guessNum === 3) {
                pointsLost = 4000;
                formula = 'Not on this ranking: -4000 points';
            } else {
                pointsLost = 5000;
                formula = 'Not on this ranking: -5000 points';
            }
        } else {
            const guessRankValue = getRankNumericValue(guessRow.Rank, currentSeasonData, currentAnswer.Season);
            const answerRankValue = getRankNumericValue(currentAnswer.Rank, currentSeasonData, currentAnswer.Season);
            
            // Special case: both HM or both IM = 0 points lost
            if ((guessRow.Rank === 'HM' && currentAnswer.Rank === 'HM') || 
                (guessRow.Rank === 'IM' && currentAnswer.Rank === 'IM')) {
                pointsLost = 0;
                formula = `Both ${guessRow.Rank}: 0 points lost`;
            } else {
                const guessNum = currentGuesses.length + 1;
                const seasonLength = currentSeasonData.filter(p => p.Season === currentAnswer.Season && p.Rank !== 'N/A').length;
                const rankDifference = Math.abs(guessRankValue - answerRankValue);
                const percentageOff = rankDifference / seasonLength;
                const basePointsLost = percentageOff * 10000;
                
                let divisor = 4;
                if (guessNum === 2) divisor = 3;
                else if (guessNum === 3) divisor = 2;
                else if (guessNum >= 4) divisor = 1;
                
                pointsLost = basePointsLost / divisor;
                formula = `|${guessRankValue} - ${answerRankValue}| / ${seasonLength} × 10000 / ${divisor} = ${pointsLost.toFixed(2)}`;
            }
        }

        if (externalScoreBreakdown === undefined) {
            const breakdownItem: any = { guess: guessRow, pointsLost, formula };
            if (bonus !== undefined) {
                breakdownItem.bonus = bonus;
            }
            setScoreBreakdown(prev => [...prev, breakdownItem]);
            setGuesses(prev => [...prev, guessRow]);
        } else {
            // When using external state, notify the parent via callback
            if (onGuessSubmitted) {
                onGuessSubmitted(guessRow, pointsLost, formula, won, bonus);
            }
        }

        // Lose condition (only for internal state mode)
        if (externalGameLost === undefined) {
            const newScoreBreakdown = [...currentScoreBreakdown, { guess: guessRow, pointsLost, formula }];
            const totalPointsLost = newScoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
            const finalScore = Math.max(10000 - totalPointsLost, 0);
            if (finalScore <= 0 && !won) {
                setGameLost(true);
            }
        }
        
        if (externalError === undefined) {
            setError(null);
        }
    };
    
    // Use external state if provided (random mode), otherwise use internal state (daily mode)
    const finalAnswer = externalAnswer !== undefined ? externalAnswer : answer;
    const finalGuesses = externalGuesses !== undefined ? externalGuesses : guesses;
    const finalScoreBreakdown = externalScoreBreakdown !== undefined ? externalScoreBreakdown : scoreBreakdown;
    const finalGameWon = externalGameWon !== undefined ? externalGameWon : gameWon;
    const finalGameLost = externalGameLost !== undefined ? externalGameLost : gameLost;
    const finalError = externalError !== undefined ? externalError : error;
    const finalSeasonData = externalSeasonData !== undefined ? externalSeasonData : seasonData;

    useEffect(() => {
        // Only load data if we're not in external control mode
        if (externalAnswer === undefined && externalSeasonData === undefined) {
            loadMIPRDLECSV('/data.csv').then(data => {
                const todayAnswer = selectMIPRDLEAnswer(data);
                setAnswer(todayAnswer);
                setSeasonData(data);
                // Don't set rows here - let the second useEffect handle it
                
                // Restore saved guesses if they exist and match today's answer
                if (todayAnswer && savedState && savedState.answerTag === todayAnswer.Tag) {
                    // Directly restore state
                    setGuesses(savedState.guesses);
                    setScoreBreakdown(savedState.scoreBreakdown);
                    setGameWon(savedState.gameWon);
                    setGameLost(savedState.gameLost);
                }
            });
        }
    }, [externalAnswer, externalSeasonData, savedState?.answerTag]);

    // Update rows when guesses change
    useEffect(() => {
        if (!finalAnswer) return;
        // Sort guesses by rank and insert answer in proper position
        const allGuesses = finalGuesses.filter(row => row.Tag !== finalAnswer.Tag);
        
        // Combine answer with guesses and sort by rank
        const allRows = [...allGuesses, finalAnswer];
        allRows.sort((a, b) => {
            const rankA = getRankNumericValue(a.Rank, finalSeasonData, finalAnswer.Season);
            const rankB = getRankNumericValue(b.Rank, finalSeasonData, finalAnswer.Season);
            return rankA - rankB;
        });
        
        setRows(allRows);
        
        // Auto-save progress for daily puzzle (only if not externally controlled)
        if (!isControlledMode && finalGuesses.length > 0) {
            saveProgress(finalGuesses, finalScoreBreakdown, finalGameWon, finalGameLost, finalAnswer.Tag);
        }
    }, [finalGuesses, finalAnswer, finalSeasonData, finalScoreBreakdown, finalGameWon, finalGameLost, isControlledMode, saveProgress]);

    const handleSubmitGuess = () => {
        if (!finalAnswer) {
            return;
        }
        
        loadMIPRDLECSV('/data.csv').then(data => {
            // Find the guess row (prefer answer's season, else any)
            const guessRowInSeason = data.find(row => row.Tag === currentGuess && row.Season === finalAnswer.Season);
            const guessRowAny = data.find(row => row.Tag === currentGuess);
            let guessRow: MIPRDLERow;
            
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
            
            submitGuess(guessRow);
            setCurrentGuess('');
            setResetDropdown(prev => prev + 1);
        });
    };

    // Calculate hint values for the answer's season
    const calculateHints = () => {
        if (!finalAnswer || !finalSeasonData) return { prLength: 0, imCount: 0, hmCount: 0 };
        
        const seasonPlayers = finalSeasonData.filter(p => p.Season === finalAnswer.Season);
        
        // PR Length: highest numeric rank (excluding HM/IM)
        const numericRanks = seasonPlayers
            .map(p => Number(p.Rank))
            .filter(r => !isNaN(r));
        const prLength = numericRanks.length > 0 ? Math.max(...numericRanks) : 0;
        
        // Count IMs and HMs
        const imCount = seasonPlayers.filter(p => p.Rank === 'IM').length;
        const hmCount = seasonPlayers.filter(p => p.Rank === 'HM').length;
        
        return { prLength, imCount, hmCount };
    };

    const hints = calculateHints();

    // Trigger animation when hints are revealed
    useEffect(() => {
        const guessCount = finalGuesses.length;
        const newRevealed = new Set(revealedHints);
        let changed = false;
        
        if (guessCount >= 1 && !revealedHints.has(1)) {
            newRevealed.add(1);
            changed = true;
        }
        if (guessCount >= 2 && !revealedHints.has(2)) {
            newRevealed.add(2);
            changed = true;
        }
        if (guessCount >= 3 && !revealedHints.has(3)) {
            newRevealed.add(3);
            changed = true;
        }
        
        if (changed) {
            setRevealedHints(newRevealed);
        }
    }, [finalGuesses.length, revealedHints]);

    return (
        <div className="game-board">
            {!hideHeader && (
                <TitleGroup 
                    title="MIPRdle Daily" 
                    subtitle={answer?.Season || ''}
                    showTiltCard={true}
                    tiltCardImage="/images/stages/michigan-front.png"
                />
            )}
            <div className="search-container">
                <div className="search-inputs">
                    <TagDropdown
                        onSelect={tag => setCurrentGuess(tag)}
                        reset={resetDropdown}
                        csvPath="/data.csv"
                    />
                    <SubmitButton 
                        onClick={handleSubmitGuess} 
                        disabled={!currentGuess || finalGameWon}
                    />
                </div>
                <table className="hint-table">
                    <thead>
                        <tr>
                            <th>PR Length</th>
                            <th>IMs</th>
                            <th>HMs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={`${finalGuesses.length >= 1 ? 'revealed' : ''} ${revealedHints.has(1) && finalGuesses.length === 1 ? 'guess-row-flip' : ''}`}>
                                {finalGuesses.length >= 1 ? hints.prLength : '?'}
                            </td>
                            <td className={`${finalGuesses.length >= 2 ? 'revealed' : ''} ${revealedHints.has(2) && finalGuesses.length === 2 ? 'guess-row-flip' : ''}`}>
                                {finalGuesses.length >= 2 ? hints.imCount : '?'}
                            </td>
                            <td className={`${finalGuesses.length >= 3 ? 'revealed' : ''} ${revealedHints.has(3) && finalGuesses.length === 3 ? 'guess-row-flip' : ''}`}>
                                {finalGuesses.length >= 3 ? hints.hmCount : '?'}
                            </td>
                        </tr>
                    </tbody>
                </table>
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
                        const isAnswerRow = finalAnswer && row.Tag === finalAnswer.Tag;
                        const revealAnswer = finalGameWon || finalGameLost;
                        if (isAnswerRow) {
                            const guessCount = finalGuesses.length;
                          
                            return (
                                <tr className="answer-row" key={row.Tag + row.Season}>
                                    <td><span className="answer-icon"></span></td>
                                    <td>{revealAnswer ? row.Rank : '?'}</td>
                                    <td>{revealAnswer ? row.Tag : '?'}</td>
                                    <td className={!revealAnswer && guessCount === 1 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 1 ? row.FirstList : '?'}
                                    </td>
                                    <td className={!revealAnswer && guessCount === 2 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 2 ? row.MostRecentList : '?'}
                                    </td>
                                    <td className={!revealAnswer && guessCount === 3 ? 'hint-reveal-flip' : ''}>
                                        {revealAnswer || guessCount >= 3 ? row.Appearances : '?'}
                                    </td>
                                </tr>
                            );
                        }
                        // Guess rows show all their data
                        if (!finalAnswer) return null;
                        const guessRankValue = getRankNumericValue(row.Rank, finalSeasonData, finalAnswer.Season);
                        const answerRankValue = getRankNumericValue(finalAnswer.Rank, finalSeasonData, finalAnswer.Season);
                        let arrow = '=';
                        if (guessRankValue < answerRankValue) arrow = '↓';
                        else if (guessRankValue > answerRankValue) arrow = '↑';
                        return (
                            <tr key={row.Tag + (row.Season || '')} className="guess-row-flip">
                                <td>{arrow}</td>
                                <td>{row.Rank || '?'}</td>
                                <td>{row.Tag || '?'}</td>
                                <td>{row.FirstList || '?'}</td>
                                <td>{row.MostRecentList || '?'}</td>
                                <td>{row.Appearances || '?'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {!hideControls && (
                <GameControlsRow 
                    onHowToPlay={() => setShowHowToPlay(true)}
                    playerMessage={MIPRDLE_DAILY_MESSAGE}
                    topMessage={MIPRDLE_DAILY_TITLE}
                />
            )}
            {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} content={MIPRDLE_DAILY_CONTENT} />}
            {/* Show results modal if game is complete OR if returning to completed daily puzzle */}
            {((finalGameWon || finalGameLost) && finalAnswer && !onContinueToRandom) || (!isControlledMode && isComplete && savedState) ? (
                <ResultsModal
                    won={finalGameWon || (savedState?.gameWon || false)}
                    answer={(finalAnswer || { Tag: savedState?.answerTag }) as any}
                    guesses={(finalGuesses.length > 0 ? finalGuesses : (savedState?.guesses || [])) as any}
                    scoreBreakdown={finalScoreBreakdown.length > 0 ? finalScoreBreakdown : (savedState?.scoreBreakdown || [])}
                    isRandomMode={false}
                    hardMode={hardMode}
                />
            ) : null}
            {finalError && <div className="error-message">{finalError}</div>}
        </div>
    );
}
