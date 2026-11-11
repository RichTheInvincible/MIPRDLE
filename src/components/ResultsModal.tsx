import React, { useEffect, useState } from 'react';
import type { PlayerRow } from '../utils/CSVLoader';
import '../styles/ResultsModal.css';
import SmashballIcon from '../images/assets/SmashBall.png';
import { STARTING_SCORE } from '../constants/scoring';

interface ScoreBreakdownItem {
    guess: PlayerRow;
    pointsLost: number;
    formula: string;
    bonus?: number;
}

interface RoundHistory {
    answer: PlayerRow;
    guesses: PlayerRow[];
    scoreBreakdown: ScoreBreakdownItem[];
    roundScore: number;
    won: boolean;
}

interface ResultsModalProps {
    won: boolean;
    answer: PlayerRow;
    guesses: PlayerRow[];
    scoreBreakdown: ScoreBreakdownItem[];
    isRandomMode?: boolean;
    hardMode?: boolean;
    roundHistory?: RoundHistory[]; // All previous rounds in the streak
    onNext?: () => void; // for next random puzzle (only shown if won)
    onReturnToSplash?: () => void; // return to splash screen
}



const ResultsModal: React.FC<ResultsModalProps> = ({ 
    won, 
    answer,
    guesses,
    scoreBreakdown, 
    isRandomMode,
    hardMode = false,
    roundHistory = [],
    onNext, 
    onReturnToSplash 
}) => {
    const [imagePopupOpen, setImagePopupOpen] = useState(false);
    const [popupImageSrc, setPopupImageSrc] = useState('');
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);
    
    const totalPointsLost = scoreBreakdown.reduce((sum, item) => sum + item.pointsLost, 0);
    const totalBonus = scoreBreakdown.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const finalScore = Math.max(STARTING_SCORE - totalPointsLost + totalBonus, 0);
    const finalPercentage = (finalScore / 100).toFixed(2);

    const handleReturnToSplash = () => {
        window.location.href = '/';
    };

    // Calculate total score across all rounds
    const totalStreakScore = isRandomMode && roundHistory.length > 0
        ? roundHistory.reduce((sum, round) => sum + round.roundScore, 0) + finalScore
        : finalScore;
    const totalStreakPercentage = (totalStreakScore / 100).toFixed(2);

    const handleSeasonClick = (imageOrUrl: string, isUrl = false) => {
        if (imageOrUrl) {
            if (isUrl) {
                window.open(imageOrUrl, '_blank');
            } else {
                const imageSrc = `/images/mipr/${imageOrUrl}`;
                setPopupImageSrc(imageSrc);
                setImagePopupOpen(true);
            }
        }
    };

    const closeImagePopup = () => {
        setImagePopupOpen(false);
        setPopupImageSrc('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
        });
    };

    const handleShareDaily = () => {
        const guessCount = scoreBreakdown.length;
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        // Determine puzzle type by checking if answer has MIPRDLE-specific fields
        const isMIPRDLE = (answer as any).Images !== undefined || (answer as any).FirstList !== undefined;
        const puzzleType = isMIPRDLE ? 'Michigan PRdle' : 'SSBMRank PRdle';
        const ucfStatus = hardMode ? 'UCF: OFF' : 'UCF: ON';
        const text = `${puzzleType} - ${today}\n${ucfStatus}\nGuesses: ${guessCount} - Score: ${finalScore.toFixed(0)}\nmiprdle.michiganmelee.com`;
        copyToClipboard(text);
    };

    const handleShareFull = () => {
        const isMIPRDLE = (answer as any).Images !== undefined || (answer as any).FirstList !== undefined;
        const puzzleType = isMIPRDLE ? 'Michigan Random' : 'SSBMRank Random';
        const ucfStatus = hardMode ? 'UCF: OFF' : 'UCF: ON';
        let text = `${puzzleType}\n${ucfStatus}\nSTREAK: ${won ? roundHistory.length + 1 : roundHistory.length} \n`;
        
        // Add previous rounds
        roundHistory.forEach((round, idx) => {
            text += `Round ${idx + 1}: ${round.answer.Season} - ${round.answer.Tag}\n`;
            round.scoreBreakdown.forEach(item => {
                const isCorrectGuess = item.guess.Tag === round.answer.Tag;
                const points = isCorrectGuess ? `+${STARTING_SCORE}` : item.pointsLost === 0 ? '-0' : `-${Math.round(item.pointsLost)}`;
                text += `  ${item.guess.Tag}: ${points}\n`;
            });
            const roundBonus = round.scoreBreakdown.reduce((sum, item) => sum + (item.bonus || 0), 0);
            if (roundBonus > 0) {
                const bonusName = round.guesses.length === 1 ? 'Jackpot (The StarSoldier)' : 
                                  round.guesses.length === 2 ? "Run, Don't Walk" : 
                                  round.guesses.length === 3 ? 'Close Call' : 
                                  'Cliff Hanger';
                text += `  ${bonusName}: +${roundBonus}\n`;
            }
            text += `Score: ${Math.round(round.roundScore)}\n`;
        });
        
        // Add current round
        text += `Round ${roundHistory.length + 1}: ${answer.Season} - ${answer.Tag}\n`;
        scoreBreakdown.forEach(item => {
            const isCorrectGuess = item.guess.Tag === answer.Tag;
            const points = isCorrectGuess ? `+${STARTING_SCORE}` : item.pointsLost === 0 ? '-0' : `-${Math.round(item.pointsLost)}`;
            text += `  ${item.guess.Tag}: ${points}\n`;
        });
        if (totalBonus > 0) {
            const bonusName = guesses.length === 1 ? 'Jackpot (The StarSoldier)' : 
                              guesses.length === 2 ? "Run, Don't Walk" : 
                              guesses.length === 3 ? 'Close Call' : 
                              'Cliff Hanger';
            text += `  ${bonusName}: +${totalBonus}\n`;
        }
        text += `Score: ${finalScore.toFixed(0)}\n`;
        text += `TOTAL SCORE: ${totalStreakScore.toFixed(0)}`;
        text += `\nmiprdle.michiganmelee.com`;
        copyToClipboard(text);
    };

    const handleShareCondensed = () => {
        const streakCount = won ? roundHistory.length + 1 : roundHistory.length;
        const isMIPRDLE = (answer as any).Images !== undefined || (answer as any).FirstList !== undefined;
        const puzzleType = isMIPRDLE ? 'Michigan Random' : 'SSBMRank Random';
        const ucfStatus = hardMode ? 'UCF: OFF' : 'UCF: ON';
        const text = `${puzzleType}\n${ucfStatus}\nStreak: ${streakCount}\nTotal Score: ${totalStreakScore.toFixed(0)}\nmiprdle.michiganmelee.com`;
        copyToClipboard(text);
    };

    return (
        <div className="results-overlay">
            <div className="results-content" onClick={(e) => e.stopPropagation()}>
                <div className={`results-header ${won ? 'results-win' : 'results-lose'}`}>
                    <h2>{won ? 'STAGE CLEAR' : 'Failure'}</h2>
                </div>
                <div className="results-main-container">
                    <div className="results-banner-container">
                        <div className="results-banner" >
                            <h2>SPECIAL BONUS</h2>
                        </div>
                    </div>
                    
                    <div className="results-body">
                    <section>
                        <h3>
                            <span 
                                className={(answer as any).Images || answer.URL ? 'season-link' : ''}
                                onClick={() => {
                                    if ((answer as any).Images) {
                                        handleSeasonClick((answer as any).Images, false);
                                    } else if (answer.URL) {
                                        handleSeasonClick(answer.URL, true);
                                    }
                                }}
                            >
                                {answer.Season}
                            </span>: {answer.Tag}
                        </h3>
                        <ul>
                            {scoreBreakdown.map((item, idx) => {
                                const isCorrectGuess = item.guess.Tag === answer.Tag;
                                const isZeroPointsLost = item.pointsLost === 0 && !isCorrectGuess;
                                return (
                                    <li key={idx} className="breakdown-item">
                                        <span className="guess-tag">{item.guess.Tag}</span>
                                        <span className="points-lost" style={{ color: isCorrectGuess ? '#ffffff' : 'inherit' }}>
                                            {isCorrectGuess ? STARTING_SCORE : isZeroPointsLost ? '−0' : `-${Math.round(item.pointsLost)}`}
                                        </span>
                                        <span className="formula-hover">{item.formula}</span>
                                    </li>
                                );
                            })}
                            {totalBonus > 0 && (
                                <li className="breakdown-item">
                                    <span className="guess-tag">
                                        {guesses.length === 1 ? 'Jackpot (The StarSoldier)' : 
                                         guesses.length === 2 ? "Run, Don't Walk" : 
                                         guesses.length === 3 ? 'Close Call' : 
                                         'Cliff Hanger'}
                                    </span>
                                    <span className="points-lost" style={{ color: '#ffffff' }}>
                                        {totalBonus}
                                    </span>
                                    <span className="formula-hover">Guessed in {guesses.length} Guess(es)</span>
                                </li>
                            )}
                        </ul>
                    </section>

                    {isRandomMode && roundHistory.length > 0 && (
                        <section>
                            <h3>Previous Rounds:</h3>
                            {roundHistory.map((round, roundIdx) => (
                                <div key={roundIdx} style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #ccc' }}>
                                    <h4>
                                        <span 
                                            className={(round.answer as any).Images || round.answer.URL ? 'season-link' : ''}
                                            onClick={() => {
                                                if ((round.answer as any).Images) {
                                                    handleSeasonClick((round.answer as any).Images, false);
                                                } else if (round.answer.URL) {
                                                    handleSeasonClick(round.answer.URL, true);
                                                }
                                            }}
                                        >
                                            {round.answer.Season}
                                        </span>: {round.answer.Tag}
                                    </h4>
                                    <ul>
                                        {round.scoreBreakdown.map((item, idx) => {
                                            const isCorrectGuess = item.guess.Tag === round.answer.Tag;
                                            const isZeroPointsLost = item.pointsLost === 0 && !isCorrectGuess;
                                            return (
                                                <li key={idx} className="breakdown-item">
                                                    <span className="guess-tag">{item.guess.Tag}</span>
                                                    <span className="points-lost" style={{ color: isCorrectGuess ? '#ffffff' : 'inherit' }}>
                                                        {isCorrectGuess ? STARTING_SCORE : isZeroPointsLost ? '−0' : `-${Math.round(item.pointsLost)}`}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
                <div className="results-score-container">
                     <div className="results-buttons">
                        {isRandomMode ? (
                            <>
                                {!won && roundHistory.length > 0 && (
                                    <>
                                        <button onClick={handleShareFull}><span>Share (Full Path)</span></button>
                                        <button onClick={handleShareCondensed}><span>Share</span></button>
                                    </>
                                )}
                                {won && onNext && (
                                    <button onClick={onNext}><span>Continue</span></button>
                                )}
                                {!won && (
                                    <button onClick={onReturnToSplash || handleReturnToSplash}><span>Stage Select</span></button>
                                )}
                            </>
                        ) : (
                            <>
                                {won && (
                                    <button onClick={handleShareDaily}><span>Share</span></button>
                                )}
                                <button onClick={onReturnToSplash || handleReturnToSplash}><span>Stage Select</span></button>
                            </>
                        )}
                    </div>
                    {showCopiedMessage && (
                        <div className="copied-message">Copied to clipboard!</div>
                    )}
                    <div className="results-score">
                        <h3>{finalScore.toFixed(0)}</h3>
                    </div>
                </div>
                </div>
                <div className="results-footer">
                    <div className="smashball-icon">
                        {isRandomMode ? (
                            <><img src={SmashballIcon} alt="Smash Ball" /><span>X {won ? roundHistory.length + 1 : roundHistory.length}</span></>
                        ) : null}
                    </div>
                    <div className="score-box">
                        <div className="score-box2">
                            <div className="score-box3">
                                <span className="score-label">SCORE</span>
                                <span className="score-value">
                                     {isRandomMode ? totalStreakScore.toFixed(0) : finalScore.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {imagePopupOpen && (
                <div className="image-popup-overlay" onClick={closeImagePopup}>
                    <div className="image-popup-content">
                        <img src={popupImageSrc} alt="Season ranking" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsModal;