import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, TrendingUp, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8a_CqYSF8OmuyK_xN0jElC_y2Dm4oUpA",
  authDomain: "workout-tracker-10833.firebaseapp.com",
  databaseURL: "https://workout-tracker-10833-default-rtdb.firebaseio.com",
  projectId: "workout-tracker-10833",
  storageBucket: "workout-tracker-10833.firebasestorage.app",
  messagingSenderId: "588081252653",
  appId: "1:588081252653:web:37028f1d8a0959a725eba4",
  measurementId: "G-VNMB0NF84Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const WorkoutTracker = () => {
  const [selectedDay, setSelectedDay] = useState('Day 1 - Push');
  const [progress, setProgress] = useState({});
  const [weights, setWeights] = useState({});
  const [treadmill, setTreadmill] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'naman');
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('userName'));
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker', 'weights', 'cardio', 'weekly'
  const listenerRef = useRef(null);

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

  const days = ['Day 1 - Push', 'Day 2 - Pull', 'Day 3 - Legs', 'Day 4 - Push (Volume)', 'Day 5 - Pull (Volume)'];

  // Initialize Firebase sync
  useEffect(() => {
    if (!showNamePrompt && userName) {
      const session = localStorage.getItem('sessionId') || 'default-session';
      setSessionId(session);
      localStorage.setItem('sessionId', session);

      const progressRef = ref(database, `sessions/${session}`);
      listenerRef.current = onValue(progressRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProgress(data.progress || {});
          setWeights(data.weights || {});
          setTreadmill(data.treadmill || {});
        }
        setIsConnected(true);
      }, (error) => {
        console.error('Firebase error:', error);
        setIsConnected(false);
      });

      return () => {
        if (listenerRef.current) {
          listenerRef.current();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNamePrompt, userName]);

  const setUserAndStart = (name) => {
    localStorage.setItem('userName', name);
    setUserName(name);
    setShowNamePrompt(false);
  };

  const logout = () => {
    localStorage.removeItem('userName');
    setShowNamePrompt(true);
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const updateProgress = (day, exerciseIdx, person, newCount) => {
    const newProgress = {
      ...progress,
      [day]: {
        ...progress[day],
        [exerciseIdx]: {
          ...(progress[day]?.[exerciseIdx] || { naman: 0, akash: 0 }),
          [person]: newCount,
        },
      },
    };
    setProgress(newProgress);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        progress: newProgress,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const updateWeight = (day, exerciseIdx, weight) => {
    const today = getTodayDateString();
    const key = `${today}-${day}-${exerciseIdx}`;
    
    const newWeights = {
      ...weights,
      [key]: weight,
    };
    setWeights(newWeights);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        weights: newWeights,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const updateTreadmill = (duration) => {
    const today = getTodayDateString();
    const newTreadmill = {
      ...treadmill,
      [today]: duration > 0 ? duration : null,
    };
    setTreadmill(newTreadmill);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        treadmill: newTreadmill,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const resetDay = () => {
    const newProgress = {
      ...progress,
      [selectedDay]: workoutPlan[selectedDay].reduce((acc, exercise, idx) => {
        acc[idx] = { naman: 0, akash: 0 };
        return acc;
      }, {}),
    };
    setProgress(newProgress);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        progress: newProgress,
        lastUpdated: new Date().toISOString(),
      });
    }
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

  const getWeeklyLog = () => {
    const weekLog = [];
    const today = new Date();

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const day = days[i % days.length];

      let namanSets = 0, akashSets = 0, totalSets = 0;

      if (progress[day]) {
        workoutPlan[day].forEach((exercise, idx) => {
          namanSets += progress[day][idx]?.naman || 0;
          akashSets += progress[day][idx]?.akash || 0;
          totalSets += exercise.sets;
        });
      }

      weekLog.push({
        date: dateStr,
        day,
        namanSets,
        akashSets,
        totalSets,
        namanPercent: totalSets > 0 ? Math.round((namanSets / totalSets) * 100) : 0,
        akashPercent: totalSets > 0 ? Math.round((akashSets / totalSets) * 100) : 0,
      });
    }

    return weekLog;
  };

  const getTodayTreadmill = () => {
    const today = getTodayDateString();
    return treadmill[today] || 0;
  };

  const dayProgress = getDayProgress();
  const weeklyLog = getWeeklyLog();

  // Name prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-700 rounded-xl p-8 border border-slate-600 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-center">Welcome! 💪</h2>
          <p className="text-slate-300 mb-6 text-center">Who are you?</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => setUserAndStart('naman')}
              className="flex-1 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold text-lg transition"
            >
              Naman
            </button>
            <button
              onClick={() => setUserAndStart('akash')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-lg transition"
            >
              Akash
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              💪 Workout Tracker
            </h1>
            <p className="text-slate-300 text-sm">
              {userName === 'naman' ? '🟠 Naman' : '🔵 Akash'}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
          >
            <LogOut size={16} /> Switch User
          </button>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-3 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-300 text-sm">Connected to Firebase ✓</p>
          </div>
        ) : (
          <div className="bg-red-900/30 border border-red-500 rounded-xl p-3 mb-6 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">Connecting...</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'tracker', label: '📋 Tracker' },
            { id: 'weights', label: '⚖️ Weights' },
            { id: 'cardio', label: '🏃 Cardio' },
            { id: 'weekly', label: '📊 Weekly Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <>
            {/* Day Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {days.map((day) => (
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {exercise.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>

                      <div className="flex gap-8 flex-wrap sm:flex-nowrap">
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-semibold text-orange-400 mb-2">Naman</p>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                              <button
                                key={setIdx}
                                onClick={() =>
                                  updateProgress(
                                    selectedDay,
                                    idx,
                                    'naman',
                                    exerciseProgress.naman === setIdx + 1
                                      ? setIdx
                                      : setIdx + 1
                                  )
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

                        <div className="flex flex-col items-center">
                          <p className="text-xs font-semibold text-blue-400 mb-2">Akash</p>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                              <button
                                key={setIdx}
                                onClick={() =>
                                  updateProgress(
                                    selectedDay,
                                    idx,
                                    'akash',
                                    exerciseProgress.akash === setIdx + 1
                                      ? setIdx
                                      : setIdx + 1
                                  )
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
          </>
        )}

        {/* Weights Tab */}
        {activeTab === 'weights' && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm">Enter the weight you're using for each exercise today</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {days.map((day) => (
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

            <div className="space-y-4">
              {workoutPlan[selectedDay].map((exercise, idx) => {
                const today = getTodayDateString();
                const key = `${today}-${selectedDay}-${idx}`;
                const currentWeight = weights[key] || '';

                return (
                  <div key={idx} className="bg-slate-700 border border-slate-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{exercise.name}</h3>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-sm text-slate-300 mb-2 block">Weight (kg)</label>
                        <input
                          type="number"
                          value={currentWeight}
                          onChange={(e) => updateWeight(selectedDay, idx, e.target.value)}
                          placeholder="Enter weight"
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400"
                        />
                      </div>
                      {currentWeight && (
                        <div className="text-2xl font-bold text-orange-400">{currentWeight}kg</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cardio Tab */}
        {activeTab === 'cardio' && (
          <div className="max-w-2xl">
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">🏃 Treadmill/Cardio Today</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => updateTreadmill(0)}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition ${
                      getTodayTreadmill() === 0
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  >
                    ❌ No
                  </button>
                  <button
                    onClick={() => updateTreadmill(1)}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition ${
                      getTodayTreadmill() > 0
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  >
                    ✅ Yes
                  </button>
                </div>

                {getTodayTreadmill() > 0 && (
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Duration (minutes)</label>
                    <input
                      type="number"
                      value={getTodayTreadmill()}
                      onChange={(e) => updateTreadmill(parseInt(e.target.value) || 0)}
                      placeholder="Enter duration"
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-400"
                    />
                    <p className="text-green-400 text-lg font-bold mt-4 text-center">
                      🏃 {getTodayTreadmill()} min
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Log Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-green-400" size={24} />
              <h2 className="text-2xl font-bold">This Week's Progress</h2>
            </div>

            {weeklyLog.map((log, idx) => {
              const dateObj = new Date(log.date + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={idx} className="bg-slate-700 border border-slate-600 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{log.day.split(' - ')[0]}</h3>
                      <p className="text-sm text-slate-400">{dayName} • {log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">Total Sets</p>
                      <p className="text-2xl font-bold text-green-400">{log.totalSets}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-orange-400 text-sm font-semibold mb-2">Naman</p>
                      <p className="text-2xl font-bold text-white">{log.namanSets}/{log.totalSets}</p>
                      <div className="mt-2 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${log.namanPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{log.namanPercent}%</p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-blue-400 text-sm font-semibold mb-2">Akash</p>
                      <p className="text-2xl font-bold text-white">{log.akashSets}/{log.totalSets}</p>
                      <div className="mt-2 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${log.akashPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{log.akashPercent}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>🔄 Real-time sync with Firebase</p>
          <p className="mt-2">Keep crushing those workouts! 💪</p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
