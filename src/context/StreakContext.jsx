import { createContext, useContext, useState, useEffect } from 'react';

const StreakContext = createContext(null);

const STREAK_KEY = 'grr_visitor_streak_v1';

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function StreakProvider({ children }) {
  const [streakData, setStreakData] = useState(() => {
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      streak: 0,
      lastCompletedDate: null,
      totalCompleted: 0
    };
  });

  const today = getTodayString();
  const yesterday = getYesterdayString();

  const isCompletedToday = streakData.lastCompletedDate === today;

  // Check if streak was broken (last completed date was before yesterday)
  useEffect(() => {
    if (streakData.lastCompletedDate && 
        streakData.lastCompletedDate !== today && 
        streakData.lastCompletedDate !== yesterday &&
        streakData.streak > 0) {
      // Streak broken, reset streak count to 0 so next completion starts back at 1
      setStreakData(prev => {
        const updated = { ...prev, streak: 0 };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [today, yesterday]);

  const totalCompleted = streakData.totalCompleted || 0;

  // Personal Journey Progression:
  // If completed today, show the exercise they finished today.
  // Otherwise, display their current pending exercise in the 365 queue (never skips, continues where left off).
  const currentExerciseIndex = isCompletedToday
    ? Math.max(0, totalCompleted - 1) % 365
    : totalCompleted % 365;

  const currentDayNumber = currentExerciseIndex + 1;

  const completeTodayExercise = () => {
    if (isCompletedToday) return;

    setStreakData(prev => {
      let newStreak = prev.streak;
      if (prev.lastCompletedDate === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1; // Streak restarts back at 1 if a day was missed
      }

      const updated = {
        streak: newStreak,
        lastCompletedDate: today,
        totalCompleted: (prev.totalCompleted || 0) + 1
      };

      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <StreakContext.Provider value={{
      streak: streakData.streak,
      totalCompleted,
      currentExerciseIndex,
      currentDayNumber,
      isCompletedToday,
      completeTodayExercise
    }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
