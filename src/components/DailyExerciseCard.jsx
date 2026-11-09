import { useState, useMemo, useEffect } from 'react';
import { Flame, CheckCircle2, HelpCircle, Sparkles, ArrowRight, Share2, RotateCcw, Award } from 'lucide-react';
import { getDailyExercise } from '../data/dailyExercises';
import { useStreak } from '../context/StreakContext';
import './DailyExerciseCard.css';

export default function DailyExerciseCard({ standalone = false }) {
  const { streak, isCompletedToday, currentExerciseIndex, currentDayNumber, completeTodayExercise } = useStreak();
  const exercise = useMemo(() => getDailyExercise(currentExerciseIndex), [currentExerciseIndex]);

  // Reset input state when exercise index changes
  useEffect(() => {
    setUserGuess('');
    setSelectedLetterIndices([]);
    setShowHint(false);
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);
    setFeedback(null);
  }, [currentExerciseIndex]);

  // Unscramble state
  const [userGuess, setUserGuess] = useState('');
  const [selectedLetterIndices, setSelectedLetterIndices] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Quiz / Verse Fill state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Unscramble tile click
  const handleTileClick = (letter, index) => {
    if (selectedLetterIndices.includes(index) || isCompletedToday) return;
    setUserGuess(prev => prev + letter);
    setSelectedLetterIndices(prev => [...prev, index]);
    setFeedback(null);
  };

  const handleClearLetters = () => {
    setUserGuess('');
    setSelectedLetterIndices([]);
    setFeedback(null);
  };

  const handleCheckUnscramble = (e) => {
    e?.preventDefault();
    if (!userGuess.trim()) return;

    if (userGuess.trim().toUpperCase() === exercise.solution.toUpperCase()) {
      setFeedback({ type: 'success', message: 'Spot on! You unscrambled the word perfectly!' });
      completeTodayExercise();
    } else {
      setFeedback({ type: 'error', message: 'Not quite. Try rearranging the letters or use the hint!' });
    }
  };

  const handleOptionSelect = (index) => {
    if (isCompletedToday || quizSubmitted) return;
    setSelectedOptionIndex(index);
    setFeedback(null);
  };

  const handleCheckQuiz = () => {
    if (selectedOptionIndex === null) return;
    setQuizSubmitted(true);

    if (exercise.type === 'quiz') {
      const option = exercise.options[selectedOptionIndex];
      if (option.correct) {
        setFeedback({ type: 'success', message: option.explanation });
        completeTodayExercise();
      } else {
        setFeedback({ type: 'error', message: option.explanation });
      }
    } else if (exercise.type === 'verse-fill') {
      const selectedWord = exercise.options[selectedOptionIndex];
      if (selectedWord.toUpperCase() === exercise.missingWord.toUpperCase()) {
        setFeedback({ type: 'success', message: `Amen! "${exercise.missingWord}" completes the scripture.` });
        completeTodayExercise();
      } else {
        setFeedback({ type: 'error', message: 'Not quite that word. Re-read the verse and try another option!' });
      }
    }
  };

  const handleShareStreak = () => {
    const text = `🔥 I just completed today's Graced Relationship Exercise! My daily streak is ${streak} days. Join in and grow with me: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: 'Graced Relationship Exercise', text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Streak share link copied to clipboard!');
    }
  };

  const scrambledLetters = exercise.type === 'unscramble' ? exercise.scrambled.split('') : [];

  return (
    <div className={`daily-exercise-card ${standalone ? 'standalone' : ''}`}>
      {/* Top Header Bar */}
      <div className="exercise-header">
        <div className="exercise-meta-left">
          <span className="exercise-badge">
            <Sparkles size={14} />
            <span>Daily Interactive Exercise</span>
          </span>
          <span className="exercise-type-tag">{exercise.title}</span>
        </div>

        <div className={`streak-badge ${streak > 0 ? 'active' : ''}`} title="Your daily visit & completion streak">
          <Flame size={16} className="flame-icon" />
          <span>{streak === 0 ? 'Start Daily Streak' : `${streak} Day Streak!`}</span>
        </div>
      </div>

      <div className="exercise-body">
        {/* Already Completed Today Screen */}
        {isCompletedToday ? (
          <div className="completion-success-view">
            <div className="completion-icon-ring">
              <Award size={36} color="#7e22ce" />
            </div>

            <h3 className="completion-title">Today's Exercise Completed! 🎉</h3>
            <p className="completion-subtext">
              Great dedication! You’ve nurtured your relationship with intentional reflection today.
            </p>

            <div className="streak-callout-card">
              <div className="streak-flame-display">
                <Flame size={28} className="big-flame" />
                <div>
                  <span className="streak-count-big">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                  <span className="streak-label">Consecutive Streak Active</span>
                </div>
              </div>
              <p className="streak-hint">Next daily challenge arrives automatically at midnight.</p>
            </div>

            {/* Wisdom Reflection Box */}
            <div className="completed-reflection-box">
              <div className="ref-scripture">
                <strong>{exercise.scriptureReference}</strong>
              </div>
              <p className="ref-text">"{exercise.reflection}"</p>
            </div>

            <button onClick={handleShareStreak} className="share-streak-btn">
              <Share2 size={15} />
              <span>Share Streak to WhatsApp / Status</span>
            </button>
          </div>
        ) : (
          /* Active Interactive Game View */
          <div className="active-game-view">
            <h3 className="exercise-headline">{exercise.tagline}</h3>

            {/* Mode 1: Word Unscramble */}
            {exercise.type === 'unscramble' && (
              <div className="unscramble-container">
                <div className="letter-tiles-row">
                  {scrambledLetters.map((char, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={selectedLetterIndices.includes(idx)}
                      onClick={() => handleTileClick(char, idx)}
                      className={`letter-tile ${selectedLetterIndices.includes(idx) ? 'used' : ''}`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                <div className="solution-input-row">
                  <div className="guess-display-box">
                    {userGuess ? (
                      <span className="current-guess-text">{userGuess}</span>
                    ) : (
                      <span className="guess-placeholder">Tap tiles above or type answer...</span>
                    )}
                  </div>
                  {userGuess && (
                    <button onClick={handleClearLetters} className="clear-btn" title="Clear letters">
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>

                {showHint && (
                  <div className="hint-reveal-box">
                    <HelpCircle size={15} color="#7e22ce" />
                    <span><strong>Scripture Clue:</strong> {exercise.hint}</span>
                  </div>
                )}

                <div className="game-actions-row">
                  <button 
                    type="button" 
                    onClick={() => setShowHint(!showHint)} 
                    className="toggle-hint-btn"
                  >
                    <HelpCircle size={15} />
                    <span>{showHint ? 'Hide Clue' : 'Need a Clue?'}</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={handleCheckUnscramble} 
                    disabled={!userGuess.trim()} 
                    className="check-answer-btn"
                  >
                    <span>Check Word</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Wisdom Quiz */}
            {exercise.type === 'quiz' && (
              <div className="quiz-container">
                <p className="quiz-scenario-question">{exercise.question}</p>

                <div className="quiz-options-list">
                  {exercise.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionSelect(idx)}
                      className={`quiz-option-item ${selectedOptionIndex === idx ? 'selected' : ''}`}
                    >
                      <span className="option-bullet">{String.fromCharCode(65 + idx)}</span>
                      <span className="option-text">{opt.text}</span>
                    </button>
                  ))}
                </div>

                <div className="game-actions-row right">
                  <button 
                    type="button" 
                    onClick={handleCheckQuiz} 
                    disabled={selectedOptionIndex === null} 
                    className="check-answer-btn"
                  >
                    <span>Submit Answer</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Scripture Verse Fill */}
            {exercise.type === 'verse-fill' && (
              <div className="verse-fill-container">
                <div className="verse-fill-box">
                  <p>"{exercise.versePrompt}"</p>
                  <span className="verse-ref">— {exercise.scriptureReference}</span>
                </div>

                <p className="pick-label">Select the missing word:</p>

                <div className="verse-options-row">
                  {exercise.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionSelect(idx)}
                      className={`verse-pill-btn ${selectedOptionIndex === idx ? 'selected' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="game-actions-row right">
                  <button 
                    type="button" 
                    onClick={handleCheckQuiz} 
                    disabled={selectedOptionIndex === null} 
                    className="check-answer-btn"
                  >
                    <span>Confirm Word</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Feedback alert if incorrect */}
            {feedback && feedback.type === 'error' && (
              <div className="game-feedback-alert error">
                <p>{feedback.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
