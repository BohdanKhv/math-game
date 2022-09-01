import { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import './MathGame.css';

const symbols = ['+', '-', '*', '/'];
const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const MathGame = () => {
    const [time, setTime] = useState(60);
    const [focused, setFocused] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [difficulty, setDifficulty] = useState(1);
    const [score, setScore] = useState(0);
    const [startGame, setStartGame] = useState(false);
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    const inputRef = useRef(null);

    const generateRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const generateRandomSymbol = (difficulty) => {
        if(difficulty === 1) {
            return symbols[Math.floor(Math.random() * 2)];
        } else if(difficulty === 2) {
            return symbols[Math.floor(Math.random() * 3)];
        } else {
            return symbols[Math.floor(Math.random() * 4)];
        }
    }

    const generateProblem = () => {
        const symbol = generateRandomSymbol(difficulty);
        if(symbol === '+' || symbol === '-') {
            const num1 = generateRandomNumber(0, difficulty === 1 ? 20 : difficulty === 2 ? 500 : 2000);
            const num2 = generateRandomNumber(0, difficulty === 1 ? 20 : difficulty === 2 ? 500 : 2000);
            setProblem(`${num1} ${symbol} ${num2}`);
        } else {
            const num1 = generateRandomNumber(1, difficulty === 2 ? 10 : 100 );
            const num2 = generateRandomNumber(1, difficulty === 2 ? 10 : 100 );
            setProblem(`${num1} ${symbol} ${num2}`);
        }
    }

    const startGameHandler = () => {
        if(!startGame) {
            setStartGame(true);
            generateProblem();
            inputRef.current.focus();
        }
    }

    const handleSubmit = () => {
        if(time > 0) {
            const result = eval(problem.replaceAll(' ', ''));
            console.log(parseInt(result), parseInt(answer));
            if(parseInt(result) === parseInt(answer)) {
                setScore(score + 1);
            } else {
                setMistakes(mistakes + 1);
            }
            generateProblem();
            setAnswer('');
            inputRef.current.focus();
        }
    }

    const handleSkip = () => {
        setMistakes(mistakes + 1);
        generateProblem();
        setAnswer('');
        inputRef.current.focus();
    }

    const handleReset = () => {
        setStartGame(false);
        setMistakes(0);
        setScore(0);
        setDifficulty(1);
        setTime(60);
        setConfetti(false);
        setProblem('');
        setAnswer('');
    }

    const handleInputChange = (e) => {
        if(time > 0) {
            if((e.target.value.slice(-1) === '-' && e.target.value.length === 1) || e.target.value.length === 0) {
                setAnswer(e.target.value);
            } else if (e.target.value.slice(-1) === '.' && !answer.includes('.')) {
                setAnswer(e.target.value);
            } else if(allowedChars.includes(e.target.value.slice(-1)) || e.target.value.length < answer.length) {
                setAnswer(e.target.value);
            }
        }
    }

    useEffect(() => {
        let interval = null;
        if(startGame) {
            interval = time > 0 && setInterval(() => {
                setTime((time)=>time-1);
            }, 1000);
            if(time === 0) setConfetti(true);
        }

        return () => {
            if(interval) clearInterval(interval)
        }
    }, [time, startGame]);

    return (
        <>
        {confetti && (
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={1000}
                recycle={false}
            />
        )}
        
        <input
            ref={inputRef}
            type="text"
            pattern="\d*"
            onKeyDown={(e) => {
                if(e.key === 'Enter') {
                    handleSubmit();
                }
            }}
            className="hidden"
            value={answer}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            onChange={handleInputChange}
        />
        <div className="game-container">
            <div className={`game${false ? ' winner' : time === 0 ? ' time-out' : time <= 10 ? ' time-running-out' : focused ? ' focused' : ''}`}>
                <div className="game-data">
                    <div>
                        Mistakes: <strong>{mistakes}</strong>
                    </div>
                    <div>
                        Score: <strong>{score}</strong>
                    </div>
                    <div>
                        Time: <strong className={`${time === 0 ? 'text-danger' : ''}`}>{time}s</strong>
                    </div>
                </div>
                {startGame && (
                <div className="game-tip">
                    <strong>Enter</strong> to submit.
                </div>
                )}
                <div className="game-content">
                    {!startGame ? (
                        <>
                        <h4>
                            Select difficulty:
                        </h4>
                        <div className="difficulty">
                            <div className={`difficulty-title${difficulty === 1 ? ' selected-1' : ''}`}
                                onClick={() => setDifficulty(1)}
                            >
                                Easy
                            </div>
                            <div className={`difficulty-title${difficulty === 2 ? ' selected-2' : ''}`}
                                onClick={() => setDifficulty(2)}
                            >
                                Medium
                            </div>
                            <div className={`difficulty-title${difficulty === 3 ? ' selected-3' : ''}`}
                                onClick={() => setDifficulty(3)}
                            >
                                Hard
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="game-answer"
                            onClick={() => inputRef.current.focus()}
                        >
                            <div className="game-problem">
                                {problem} = {answer}<span className="blinker">_</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="game-info">
                    {!startGame ? (
                        <div className="btn btn-primary"
                            onClick={startGameHandler}
                        >
                            Start
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
                            </svg>
                        </div>
                    ) : (
                        time > 0 ? (
                            <>
                            <div className="btn btn-secondary"
                                onClick={handleReset}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                                </svg>
                                Reset
                            </div>
                            <div className="btn"
                                onClick={handleSkip}
                            >
                                Skip
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.713 3.31 4 3.655 4 4.308v7.384c0 .653.713.998 1.233.696L11.5 8.752V12a.5.5 0 0 0 1 0V4zM5 4.633 10.804 8 5 11.367V4.633z"/>
                                </svg>
                            </div>
                            <div className="btn btn-primary"
                                onClick={handleSubmit}
                            >
                                Submit
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                </svg>
                            </div>
                            </>
                        ) : (
                            <>
                            <div className="btn btn-primary"
                                onClick={handleReset}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                                </svg>
                                Reset
                            </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
        </>
    )
}

export default MathGame