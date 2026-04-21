import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const WorkoutTracker = () => {
  const [selectedDay, setSelectedDay] = useState('Day 1 - Push');
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('workoutProgress');
    return saved ? JSON.parse(saved) : {};
  });

  const workoutPlan = {
    'Day 1 - Push': [
      { name: 'Chest press machine', sets: 4, reps: '8,8,6,6', isSuperSet: false },
      { name: 'Incline DB press', sets: 4, reps: '10,8,8,6', isSuperSet: false },
      { name: 'Incline DB fly', sets: 3, reps: '10', isSuperSet: false },
      { name: 'Shoulder press machine', sets: 4, reps: '8', isSuperSet: false },
      { name: 'Upright rows', sets: 3, reps: '10', isSuperSet: false },
      { name: 'Overhead triceps ext. + Bench dips (SS)', sets: 3, reps: '12 / 15', isSuperSet: true },
    ],
    'Day 2 - Pull': [
      { name: 'Incline bench pulls', sets: 4, reps: '8', isSuperSet: false },
      { name: 'Lat pulldowns', sets: 3, reps: '8,8,6', isSuperSet: false },
      { name: 'Seated row machine', sets: 3, reps: '10', isSuperSet: false },
      { name: 'Close grip pulldown + KB shrugs (SS)', sets: 3, reps: '8 / 16', isSuperSet: true },
      { name: 'Hyperextension', sets: 2, reps: '10,6', isSuperSet: false },
      { name: 'BB curls + Hammer curls (SS)', sets: 3, reps: '8 / 14', isSuperSet: true },
    ],
    'Day 3 - Legs': [
      { name: 'Leg press', sets: 5, reps: '10,8,8,6,5', isSuperSet: false },
      { name: 'Stationary lunges/Squats', sets: 3, reps: '10', isSuperSet: false },
      { name: 'Hip thrusts/Romanian deadlift', sets: 5, reps: '8', isSuperSet: false },
      { name: 'Standing calf raises', sets: 2, reps: '25', isSuperSet: false },
      { name: 'Crunches', sets: 5, reps: '30', isSuperSet: false },
    ],
    'Day 4 - Push (Volume)': [
      { name: 'Flat bench DB press', sets: 3, reps: '14', isSuperSet: false },
      { name: 'Incline bench DB press', sets: 3, reps: '12', isSuperSet: false },
      { name: 'Cable fly high to low', sets: 3, reps: '16', isSuperSet: false },
      { name: 'DB push press', sets: 4, reps: '14', isSuperSet: false },
      { name: 'Lateral raises', sets: 3, reps: '18', isSuperSet: false },
      { name: 'Front raises', sets: 2, reps: '20', isSuperSet: false },
    ],
    'Day 5 - Pull (Volume)': [
      { name: 'Lat pulldowns', sets: 3, reps: '8-6-4', isSuperSet: false },
      { name: 'Incline bench pull + DB shrugs (SS)', sets: 3, reps: '14 / 12', isSuperSet: true },
      { name: 'Straight arm pulldown', sets: 3, reps: '12', isSuperSet: false },
      { name: 'Seated row on cable', sets: 3, reps: '12', isSuperSet: false },
      { name: 'Hammer curls + DB curls (SS)', sets: 3, reps: '18 / 12', isSuperSet: true },
    ],
  };

  // Initialize day if not exists
  useEffect(() => {
    if (!progress[selectedDay]) {
      setProgress((prev) => {
        const updated = {
          ...prev,
          [selectedDay]: workoutPlan[selectedDay].reduce((acc, exercise, idx) => {
            acc[idx] = { naman: 0, akash: 0 };
            return acc;
          }, {}),
        };
        localStorage.setItem('workoutProgress', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedDay]);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem('workoutProgress', JSON.stringify(progress));
  }, [progress]);

  const resetDay = () => {
    setProgress((prev) => ({
      ...prev,
      [selectedDay]: workoutPlan[selectedDay].reduce((acc, exercise, idx) => {
        acc[idx] = { naman: 0, akash: 0 };
        return acc;
      }, {}),
    }));
  };

  const getDayProgress = () => {
    if (!progress[selectedDay]) return { naman: 0, akash: 0, total: 0 };

    let namanTotal = 0;
    let akashTotal = 0;
    let overallTotal = 0;

    workoutPlan[selectedDay].forEach((exercise, idx) => {
      namanTotal += progress[selectedDay][idx]?.naman || 0;
      akashTotal += progress[selectedDay][idx]?.akash || 0;
      overallTotal += exercise.sets;
    });

    return {
      naman: Math.round((namanTotal / overallTotal) * 100),
      akash: Math.round((akashTotal / overallTotal) * 100),
      total: overallTotal,
      namanSets: namanTotal,
      akashSets: akashTotal,
    };
  };

  const dayProgress = getDayProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            💪 Workout Set Tracker
          </h1>
          <p className="text-slate-300">Track sets with Naman & Akash</p>
        </div>

        {/* Day Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {Object.keys(workoutPlan).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-3 px-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg scale-105'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {day.split(' - ')[0]}
            </button>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
            <p className="text-slate-300 text-sm mb-2">Naman Progress</p>
            <p className="text-3xl font-bold text-orange-400">
              {dayProgress.namanSets}/{dayProgress.total}
            </p>
            <div className="mt-3 bg-slate-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${dayProgress.naman}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{dayProgress.naman}% Complete</p>
          </div>

          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
            <p className="text-slate-300 text-sm mb-2">Akash Progress</p>
            <p className="text-3xl font-bold text-blue-400">
              {dayProgress.akashSets}/{dayProgress.total}
            </p>
            <div className="mt-3 bg-slate-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${dayProgress.akash}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{dayProgress.akash}% Complete</p>
          </div>

          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600 flex flex-col justify-between">
            <div>
              <p className="text-slate-300 text-sm mb-2">Day Info</p>
              <p className="text-2xl font-bold text-green-400">{dayProgress.total} Sets</p>
            </div>
            <button
              onClick={resetDay}
              className="mt-4 bg-red-600 hover:bg-red-700 w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <RotateCcw size={16} /> Reset Day
            </button>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {workoutPlan[selectedDay].map((exercise, idx) => {
            const exerciseProgress = progress[selectedDay]?.[idx] || {
              naman: 0,
              akash: 0,
            };

            return (
              <div
                key={idx}
                className={`rounded-xl p-6 hover:border-slate-500 transition ${
                  exercise.isSuperSet
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 border-2 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>

                  {/* Set Counters */}
                  <div className="flex gap-8 flex-wrap sm:flex-nowrap">
                    {/* Naman */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-semibold text-orange-400 mb-2">Naman</p>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                          <button
                            key={setIdx}
                            onClick={() =>
                              setProgress((prev) => ({
                                ...prev,
                                [selectedDay]: {
                                  ...prev[selectedDay],
                                  [idx]: {
                                    ...prev[selectedDay][idx],
                                    naman:
                                      exerciseProgress.naman === setIdx + 1
                                        ? setIdx
                                        : setIdx + 1,
                                  },
                                },
                              }))
                            }
                            className={`w-10 h-10 rounded-lg font-bold transition-all ${
                              exerciseProgress.naman > setIdx
                                ? 'bg-orange-500 text-white shadow-lg scale-105'
                                : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                            }`}
                          >
                            {setIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Akash */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-semibold text-blue-400 mb-2">Akash</p>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                          <button
                            key={setIdx}
                            onClick={() =>
                              setProgress((prev) => ({
                                ...prev,
                                [selectedDay]: {
                                  ...prev[selectedDay],
                                  [idx]: {
                                    ...prev[selectedDay][idx],
                                    akash:
                                      exerciseProgress.akash === setIdx + 1
                                        ? setIdx
                                        : setIdx + 1,
                                  },
                                },
                              }))
                            }
                            className={`w-10 h-10 rounded-lg font-bold transition-all ${
                              exerciseProgress.akash > setIdx
                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                            }`}
                          >
                            {setIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>💾 Progress auto-saves to your device</p>
          <p className="mt-2">Share this app with Akash to track workouts together!</p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
