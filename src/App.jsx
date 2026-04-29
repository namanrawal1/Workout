import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, TrendingUp, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [setWeights, setSetWeights] = useState({});
  const [cardio, setCardio] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'naman');
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('userName'));
  const [activeTab, setActiveTab] = useState('tracker');
  const [expandedExercise, setExpandedExercise] = useState(null);
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
          setSetWeights(data.setWeights || {});
          setCardio(data.cardio || {});
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

  const updateSetWeight = (day, exerciseIdx, person, setIdx, weight) => {
    const today = getTodayDateString();
    const key = `${today}-${day}-${exerciseIdx}-${person}-set${setIdx}`;
    
    const newSetWeights = {
      ...setWeights,
      [key]: weight,
    };
    setSetWeights(newSetWeights);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        setWeights: newSetWeights,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const updateCardio = (person, duration) => {
    const today = getTodayDateString();
    const key = `${today}-${person}`;
    
    const newCardio = {
      ...cardio,
      [key]: duration > 0 ? duration : null,
    };
    setCardio(newCardio);

    if (sessionId) {
      update(ref(database, `sessions/${sessionId}`), {
        cardio: newCardio,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const getCardioData = (person) => {
    const today = getTodayDateString();
    const key = `${today}-${person}`;
    return cardio[key] || 0;
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
      let namanExercises = [];
      let akashExercises = [];

      if (progress[day]) {
        workoutPlan[day].forEach((exercise, idx) => {
          const namanCompleted = progress[day][idx]?.naman || 0;
          const akashCompleted = progress[day][idx]?.akash || 0;
          
          namanSets += namanCompleted;
          akashSets += akashCompleted;
          totalSets += exercise.sets;

          let namanWeights = [];
          let akashWeights = [];

          for (let setIdx = 0; setIdx < exercise.sets; setIdx++) {
            const namanWeightKey = `${dateStr}-${day}-${idx}-naman-set${setIdx}`;
            const akashWeightKey = `${dateStr}-${day}-${idx}-akash-set${setIdx}`;
            
            if (setWeights[namanWeightKey]) {
              namanWeights.push(setWeights[namanWeightKey]);
            }
            if (setWeights[akashWeightKey]) {
              akashWeights.push(setWeights[akashWeightKey]);
            }
          }

          if (namanCompleted > 0) {
            namanExercises.push({
              name: exercise.name,
              setsCompleted: namanCompleted,
              weights: namanWeights,
            });
          }
          if (akashCompleted > 0) {
            akashExercises.push({
              name: exercise.name,
              setsCompleted: akashCompleted,
              weights: akashWeights,
            });
          }
        });
      }

      const namanCardioKey = `${dateStr}-naman`;
      const akashCardioKey = `${dateStr}-akash`;

      weekLog.push({
        date: dateStr,
        day,
        namanSets,
        akashSets,
        totalSets,
        namanPercent: totalSets > 0 ? Math.round((namanSets / totalSets) * 100) : 0,
        akashPercent: totalSets > 0 ? Math.round((akashSets / totalSets) * 100) : 0,
        namanExercises,
        akashExercises,
        namanCardio: cardio[namanCardioKey] || 0,
        akashCardio: cardio[akashCardioKey] || 0,
      });
    }

    return weekLog;
  };

  const dayProgress = getDayProgress();
  const weeklyLog = getWeeklyLog();

  // Name prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 max-w-md w-full relative z-10 shadow-2xl">
          <h2 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Workout Tracker
          </h2>
          <p className="text-center text-slate-300 mb-8">Who are you?</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => setUserAndStart('naman')}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Naman
            </button>
            <button
              onClick={() => setUserAndStart('akash')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Akash
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Workout Tracker
            </h1>
            <p className="text-slate-300 text-sm">
              {userName === 'naman' ? '🟠 Naman' : '🔵 Akash'}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
          >
            <LogOut size={16} /> Switch
          </button>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-300 text-sm">Connected ✓</p>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">Connecting...</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'tracker', label: 'Tracker' },
            { id: 'weekly', label: 'Weekly Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                  : 'bg-slate-700/50 hover:bg-slate-700'
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
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  {day.split(' - ')[0]}
                </button>
              ))}
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
                <p className="text-slate-300 text-sm mb-2">Naman</p>
                <p className="text-3xl font-bold text-orange-400">
                  {dayProgress.namanSets}/{dayProgress.total}
                </p>
                <div className="mt-3 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${dayProgress.naman}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{dayProgress.naman}%</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
                <p className="text-slate-300 text-sm mb-2">Akash</p>
                <p className="text-3xl font-bold text-blue-400">
                  {dayProgress.akashSets}/{dayProgress.total}
                </p>
                <div className="mt-3 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${dayProgress.akash}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{dayProgress.akash}%</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <p className="text-slate-300 text-sm mb-2">Total Sets</p>
                  <p className="text-3xl font-bold text-purple-400">{dayProgress.total}</p>
                </div>
                <button
                  onClick={resetDay}
                  className="mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4 mb-8">
              {workoutPlan[selectedDay].map((exercise, idx) => {
                const exerciseProgress = progress[selectedDay]?.[idx] || {
                  naman: 0,
                  akash: 0,
                };
                const today = getTodayDateString();
                const isExpanded = expandedExercise === idx;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl backdrop-blur transition ${
                      exercise.isSuperSet
                        ? 'bg-slate-800/50 border-2 border-yellow-500/50'
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                  >
                    <div 
                      className="p-6 cursor-pointer hover:bg-slate-700/30"
                      onClick={() => setExpandedExercise(isExpanded ? null : idx)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="text-slate-400" />
                          ) : (
                            <ChevronDown className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-8">
                        <div>
                          <p className="text-xs font-semibold text-orange-400 mb-2">Naman</p>
                          <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                              <button
                                key={setIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProgress(
                                    selectedDay,
                                    idx,
                                    'naman',
                                    exerciseProgress.naman === setIdx + 1
                                      ? setIdx
                                      : setIdx + 1
                                  );
                                }}
                                className={`w-10 h-10 rounded-lg font-bold transition-all text-sm ${
                                  exerciseProgress.naman > setIdx
                                    ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                              >
                                {setIdx + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-blue-400 mb-2">Akash</p>
                          <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                              <button
                                key={setIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProgress(
                                    selectedDay,
                                    idx,
                                    'akash',
                                    exerciseProgress.akash === setIdx + 1
                                      ? setIdx
                                      : setIdx + 1
                                  );
                                }}
                                className={`w-10 h-10 rounded-lg font-bold transition-all text-sm ${
                                  exerciseProgress.akash > setIdx
                                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                              >
                                {setIdx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-700/50 p-6 bg-slate-900/50 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-orange-400 mb-3">Naman - Weight per Set</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                              const weightKey = `${today}-${selectedDay}-${idx}-naman-set${setIdx}`;
                              const weight = setWeights[weightKey] || '';
                              
                              return (
                                <div key={setIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 w-6">S{setIdx + 1}:</span>
                                  <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => updateSetWeight(selectedDay, idx, 'naman', setIdx, e.target.value)}
                                    placeholder="kg"
                                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-400 mb-3">Akash - Weight per Set</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                              const weightKey = `${today}-${selectedDay}-${idx}-akash-set${setIdx}`;
                              const weight = setWeights[weightKey] || '';
                              
                              return (
                                <div key={setIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 w-6">S{setIdx + 1}:</span>
                                  <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => updateSetWeight(selectedDay, idx, 'akash', setIdx, e.target.value)}
                                    placeholder="kg"
                                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cardio Section */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Cardio</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold text-orange-400 mb-4">Naman</p>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateCardio('naman', 0)}
                      className={`flex-1 py-3 rounded-lg font-bold transition ${
                        getCardioData('naman') === 0
                          ? 'bg-red-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      No
                    </button>
                    <button
                      onClick={() => updateCardio('naman', 1)}
                      className={`flex-1 py-3 rounded-lg font-bold transition ${
                        getCardioData('naman') > 0
                          ? 'bg-green-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                  
                  {getCardioData('naman') > 0 && (
                    <div>
                      <input
                        type="number"
                        value={getCardioData('naman') || ''}
                        onChange={(e) => updateCardio('naman', parseInt(e.target.value) || 0)}
                        placeholder="Minutes"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 text-sm"
                      />
                      {getCardioData('naman') > 0 && (
                        <p className="text-orange-400 font-bold mt-2 text-center">{getCardioData('naman')} min</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-400 mb-4">Akash</p>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateCardio('akash', 0)}
                      className={`flex-1 py-3 rounded-lg font-bold transition ${
                        getCardioData('akash') === 0
                          ? 'bg-red-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      No
                    </button>
                    <button
                      onClick={() => updateCardio('akash', 1)}
                      className={`flex-1 py-3 rounded-lg font-bold transition ${
                        getCardioData('akash') > 0
                          ? 'bg-green-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                  
                  {getCardioData('akash') > 0 && (
                    <div>
                      <input
                        type="number"
                        value={getCardioData('akash') || ''}
                        onChange={(e) => updateCardio('akash', parseInt(e.target.value) || 0)}
                        placeholder="Minutes"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 text-sm"
                      />
                      {getCardioData('akash') > 0 && (
                        <p className="text-blue-400 font-bold mt-2 text-center">{getCardioData('akash')} min</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Weekly Log Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Weekly Progress</h2>

            {weeklyLog.map((log, idx) => {
              const dateObj = new Date(log.date + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={idx} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{log.day.split(' - ')[0]}</h3>
                      <p className="text-sm text-slate-400">{dayName} • {log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="text-2xl font-bold text-purple-400">{log.totalSets}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-orange-400 text-sm font-semibold mb-3">Naman</p>
                      <p className="text-2xl font-bold text-white mb-2">{log.namanSets}/{log.totalSets}</p>
                      <div className="bg-slate-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                          style={{ width: `${log.namanPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{log.namanPercent}%</p>
                      
                      {log.namanCardio > 0 && (
                        <div className="bg-green-900/30 border border-green-600 rounded p-2 mb-3">
                          <p className="text-green-400 text-xs font-semibold">Cardio: {log.namanCardio} min</p>
                        </div>
                      )}
                      
                      {log.namanExercises.length > 0 && (
                        <div className="space-y-2 text-xs border-t border-slate-600 pt-3">
                          {log.namanExercises.map((ex, i) => (
                            <div key={i}>
                              <p className="text-orange-300 font-semibold truncate">{ex.name}</p>
                              <p className="text-slate-400">
                                {ex.setsCompleted} set{ex.setsCompleted > 1 ? 's' : ''} 
                                {ex.weights.length > 0 && ` • ${ex.weights.join(', ')}kg`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-blue-400 text-sm font-semibold mb-3">Akash</p>
                      <p className="text-2xl font-bold text-white mb-2">{log.akashSets}/{log.totalSets}</p>
                      <div className="bg-slate-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${log.akashPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{log.akashPercent}%</p>
                      
                      {log.akashCardio > 0 && (
                        <div className="bg-green-900/30 border border-green-600 rounded p-2 mb-3">
                          <p className="text-green-400 text-xs font-semibold">Cardio: {log.akashCardio} min</p>
                        </div>
                      )}
                      
                      {log.akashExercises.length > 0 && (
                        <div className="space-y-2 text-xs border-t border-slate-600 pt-3">
                          {log.akashExercises.map((ex, i) => (
                            <div key={i}>
                              <p className="text-blue-300 font-semibold truncate">{ex.name}</p>
                              <p className="text-slate-400">
                                {ex.setsCompleted} set{ex.setsCompleted > 1 ? 's' : ''} 
                                {ex.weights.length > 0 && ` • ${ex.weights.join(', ')}kg`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
