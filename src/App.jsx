import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

    // Map each of the last 5 days to consecutive workout days
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simply map to days in order: Day 1, Day 2, Day 3, Day 4, Day 5, Day 1, Day 2...
      const dayIndex = (5 - i - 1) % 5;
      const day = days[dayIndex];

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
      });
    }

    return weekLog;
  };

  const dayProgress = getDayProgress();
  const weeklyLog = getWeeklyLog();

  // Name prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gray-800 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-thin mb-2 tracking-tight">Workout</h1>
            <p className="text-gray-400 text-lg font-light">Track your progress</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setUserAndStart('naman')}
              className="w-full bg-white hover:bg-gray-100 text-black py-4 rounded-xl font-medium transition duration-200"
            >
              Continue as Naman
            </button>
            <button
              onClick={() => setUserAndStart('akash')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-medium transition duration-200 border border-gray-700"
            >
              Continue as Akash
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gray-800 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-6 px-4 border-b border-gray-800">
          <div>
            <h1 className="text-3xl font-thin tracking-tight">Workout Tracker</h1>
            <p className="text-gray-400 text-sm mt-1">
              {userName === 'naman' ? 'Welcome, Naman' : 'Welcome, Akash'}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 transition text-gray-300"
          >
            Switch
          </button>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <div className="mx-4 mt-6 p-3 bg-green-950 border border-green-800 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-400 text-sm font-medium">Synced</p>
          </div>
        ) : (
          <div className="mx-4 mt-6 p-3 bg-orange-950 border border-orange-800 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-orange-400 text-sm font-medium">Connecting...</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 px-4 mt-8 border-b border-gray-800">
          {[
            { id: 'tracker', label: 'Today' },
            { id: 'weekly', label: 'Weekly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 font-medium text-sm transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <div className="px-4 py-6 pb-12">
            {/* Day Selector */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">Select Day</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-3 px-3 rounded-lg font-medium transition text-sm ${
                      selectedDay === day
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {day.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Naman</p>
                <p className="text-4xl font-thin mb-6 text-white">
                  {dayProgress.namanSets}/{dayProgress.total}
                </p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${dayProgress.naman}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">{dayProgress.naman}% complete</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Akash</p>
                <p className="text-4xl font-thin mb-6 text-white">
                  {dayProgress.akashSets}/{dayProgress.total}
                </p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${dayProgress.akash}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">{dayProgress.akash}% complete</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">Total Sets</p>
                  <p className="text-4xl font-thin mb-8 text-white">{dayProgress.total}</p>
                </div>
                <button
                  onClick={resetDay}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition text-gray-300"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-5 mb-12">
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
                    className={`rounded-2xl border transition ${
                      exercise.isSuperSet
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-gray-900 border-gray-800'
                    }`}
                  >
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-800/50"
                      onClick={() => setExpandedExercise(isExpanded ? null : idx)}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-white mb-2">
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="text-gray-500" />
                          ) : (
                            <ChevronDown className="text-gray-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-12">
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Naman</p>
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
                                className={`w-8 h-8 rounded-md font-semibold transition text-xs ${
                                  exerciseProgress.naman > setIdx
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                {setIdx + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Akash</p>
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
                                className={`w-8 h-8 rounded-md font-semibold transition text-xs ${
                                  exerciseProgress.akash > setIdx
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
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
                      <div className="border-t border-gray-800 p-6 bg-gray-800/50 space-y-6">
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Naman - Weight per Set</p>
                          <div className="space-y-2">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                              const weightKey = `${today}-${selectedDay}-${idx}-naman-set${setIdx}`;
                              const weight = setWeights[weightKey] || '';
                              
                              return (
                                <div key={setIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-8">S{setIdx + 1}</span>
                                  <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => updateSetWeight(selectedDay, idx, 'naman', setIdx, e.target.value)}
                                    placeholder="kg"
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 text-xs"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Akash - Weight per Set</p>
                          <div className="space-y-2">
                            {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                              const weightKey = `${today}-${selectedDay}-${idx}-akash-set${setIdx}`;
                              const weight = setWeights[weightKey] || '';
                              
                              return (
                                <div key={setIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-8">S{setIdx + 1}</span>
                                  <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => updateSetWeight(selectedDay, idx, 'akash', setIdx, e.target.value)}
                                    placeholder="kg"
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 text-xs"
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

            {/* Cardio Section - REMOVED */}
            {/* Cardio functionality removed as requested */}
          </div>
        )}

        {/* Weekly Log Tab */}
        {activeTab === 'weekly' && (
          <div className="px-4 py-8 space-y-4">
            {weeklyLog.map((log, idx) => {
              const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
              const dayName = dayNames[idx % 5];
              
              return (
                <div key={idx} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-medium text-white">{log.day.split(' - ')[0]}</h3>
                      <p className="text-sm text-gray-400">{dayName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
                      <p className="text-2xl font-thin text-white">{log.totalSets}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Naman</p>
                      <p className="text-2xl font-thin mb-2 text-white">{log.namanSets}/{log.totalSets}</p>
                      <div className="bg-gray-700 rounded-full h-1.5 mb-3">
                        <div
                          className="bg-white h-1.5 rounded-full"
                          style={{ width: `${log.namanPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{log.namanPercent}%</p>
                      
                      {log.namanExercises.length > 0 && (
                        <div className="space-y-2 text-xs border-t border-gray-700 pt-3">
                          {log.namanExercises.map((ex, i) => (
                            <div key={i}>
                              <p className="text-gray-200 font-medium truncate">{ex.name}</p>
                              <p className="text-gray-500">
                                {ex.setsCompleted} set{ex.setsCompleted > 1 ? 's' : ''} 
                                {ex.weights.length > 0 && ` • ${ex.weights.join(', ')}kg`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Akash</p>
                      <p className="text-2xl font-thin mb-2 text-white">{log.akashSets}/{log.totalSets}</p>
                      <div className="bg-gray-700 rounded-full h-1.5 mb-3">
                        <div
                          className="bg-white h-1.5 rounded-full"
                          style={{ width: `${log.akashPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{log.akashPercent}%</p>
                      
                      {log.akashExercises.length > 0 && (
                        <div className="space-y-2 text-xs border-t border-gray-700 pt-3">
                          {log.akashExercises.map((ex, i) => (
                            <div key={i}>
                              <p className="text-gray-200 font-medium truncate">{ex.name}</p>
                              <p className="text-gray-500">
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
