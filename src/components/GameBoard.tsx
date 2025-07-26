import React, { useState, useEffect } from 'react';
import { Puzzle } from '../types';
import { generatePuzzle } from '../utils/puzzleGenerator';
import './GameBoard.css';

const GameBoard: React.FC = () => {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);

    useEffect(() => {
        const newPuzzle = generatePuzzle();
        setPuzzle(newPuzzle);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentGuess(event.target.value.toUpperCase());
    };

    const handleSubmitGuess = () => {
        if (currentGuess.length === puzzle?.word.length) {
            setGuesses([...guesses, currentGuess]);
            setCurrentGuess('');
            if (currentGuess === puzzle?.word) {
                setIsGameOver(true);
            }
        }
    };

    return (
        <div className="game-board">
            <h2>Wordle Game</h2>
            <div className="grid">
                {Array.from({ length: puzzle?.word.length || 0 }).map((_, index) => (
                    <div key={index} className="grid-cell">
                        {guesses.length > index ? guesses[index] : ''}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={currentGuess}
                onChange={handleInputChange}
                disabled={isGameOver}
            />
            <button onClick={handleSubmitGuess} disabled={isGameOver}>
                Submit Guess
            </button>
            {isGameOver && <div className="game-over">Congratulations! You've guessed the word!</div>}
        </div>
    );
};

export default GameBoard;