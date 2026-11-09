import { Sparkles, Flame, Trophy, ShieldCheck, Heart } from 'lucide-react';
import DailyExerciseCard from '../components/DailyExerciseCard';
import { useStreak } from '../context/StreakContext';
import './DailyExercisePage.css';

export default function DailyExercisePage() {
  const { streak, totalCompleted } = useStreak();

  return (
    <div className="daily-exercise-page">
      {/* Header Banner */}
      <section className="exercise-page-banner">
        <div className="exercise-page-container">
          <div className="banner-badge">
            <Flame size={15} color="#ea580c" />
            <span>Interactive Couple & Spiritual Growth</span>
          </div>

          <h1>Daily Grace Exercise</h1>
          <p>
            Build your spiritual rhythm with daily word puzzles, communication scenarios, 
            and scripture memory challenges. Complete each day to grow your streak!
          </p>

          <div className="streak-stats-row">
            <div className="streak-stat-box">
              <span className="stat-number">🔥 {streak}</span>
              <span className="stat-desc">Current Day Streak</span>
            </div>
            <div className="streak-stat-divider"></div>
            <div className="streak-stat-box">
              <span className="stat-number">✨ {totalCompleted}</span>
              <span className="stat-desc">Total Solved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Exercise Card Area */}
      <div className="exercise-card-wrapper">
        <DailyExerciseCard standalone={true} />
      </div>

      {/* Why Daily Streaks Matter Section */}
      <section className="streak-why-section">
        <div className="why-container">
          <div className="why-header">
            <h2>Why Daily Reflection Matters</h2>
            <p>Relationships are not sustained by occasional grand gestures, but by small, intentional daily habits of love and grace.</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">
                <Heart size={22} color="#7e22ce" />
              </div>
              <h3>Scripture in Your Heart</h3>
              <p>Word unscrambles and memory challenges cement biblical virtues deep into your mind before the day's stress begins.</p>
            </div>

            <div className="why-card">
              <div className="why-icon">
                <ShieldCheck size={22} color="#7e22ce" />
              </div>
              <h3>Conflict Preparedness</h3>
              <p>Scenario quizzes prepare you to respond with gentleness and emotional safety before misunderstandings happen.</p>
            </div>

            <div className="why-card">
              <div className="why-icon">
                <Trophy size={22} color="#7e22ce" />
              </div>
              <h3>Consistency & Growth</h3>
              <p>Keeping a daily streak turns healthy relationship communication into an effortless daily rhythm.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
