import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, Plus, Trash2, Moon, Star, CalendarDays, Bell, BellRing } from 'lucide-react';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type DayTasks = {
  [day: string]: Task[];
};

const ALL_DAYS = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const REAL_DAYS_MAP = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];

const INITIAL_TASKS: DayTasks = {
  "Selasa": [
    { id: "1", text: "Beli lampu raya", completed: false },
    { id: "2", text: "Beli aik gas, aik soya, malta", completed: false },
    { id: "3", text: "Beli whipping cream", completed: false },
    { id: "4", text: "Ambik parcel", completed: false },
    { id: "5", text: "Ambik kek marble cheese/chat suruh hntr mlm selasa", completed: false },
    { id: "6", text: "Pasang lampu raya", completed: false },
    { id: "7", text: "Cuci balang raya & lap gmbr", completed: false },
    { id: "8", text: "Polah cornflake pake batu 12", completed: false },
    { id: "9", text: "Kemas brg pake mbak batu 12", completed: false }
  ],
  "Rabu": [
    { id: "10", text: "Pagi hntr kek marble cheese dekat tanjung bundong", completed: false },
    { id: "11", text: "Mbak cornflake madu pedas pake bt12", completed: false },
    { id: "12", text: "Mbak cadar pake berambeh", completed: false },
    { id: "13", text: "Ptg balit bt12", completed: false },
    { id: "14", text: "Kemas bilit bt 12 & berambeh", completed: false },
    { id: "15", text: "Kupas bawang, kemas rmh etc", completed: false }
  ],
  "Khamis": [
    { id: "16", text: "Balit sebandi kupas bawang", completed: false },
    { id: "17", text: "Iron baju raya", completed: false },
    { id: "18", text: "Beli wet tissue pake lap", completed: false },
    { id: "19", text: "Print gmbr kahwin kecik kecik and beli frame pake hiasan", completed: false },
    { id: "20", text: "Mun rajin beli wallpaper pake ngkh belakang cermin ruang tamu", completed: false },
    { id: "21", text: "Mun rajin gik beli hiasan selamat hari raya", completed: false }
  ]
};

// Ensure all days exist in initial state
ALL_DAYS.forEach(day => {
  if (!INITIAL_TASKS[day]) {
    INITIAL_TASKS[day] = [];
  }
});

export default function App() {
  const [tasks, setTasks] = useState<DayTasks>(() => {
    const saved = localStorage.getItem('raya-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        ALL_DAYS.forEach(day => {
          if (!parsed[day]) parsed[day] = [];
        });
        return parsed;
      } catch (e) {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  });

  const [activeDay, setActiveDay] = useState("Selasa");
  const [newTaskText, setNewTaskText] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');

  // Initialize active day to actual current day
  useEffect(() => {
    const todayIndex = new Date().getDay();
    const todayName = REAL_DAYS_MAP[todayIndex];
    if (ALL_DAYS.includes(todayName)) {
      setActiveDay(todayName);
    }
    
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('raya-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for incomplete tasks and notify (Client-side simulation)
  useEffect(() => {
    if (notificationPermission === "granted") {
      const todayIndex = new Date().getDay();
      const todayName = REAL_DAYS_MAP[todayIndex];
      const todaysTasks = tasks[todayName] || [];
      const incomplete = todaysTasks.filter(t => !t.completed).length;

      if (incomplete > 0) {
        // Only notify once per session to avoid spamming
        const hasNotified = sessionStorage.getItem(`notified-${todayName}`);
        if (!hasNotified) {
          try {
            new Notification(`Persiapan Raya: ${todayName}`, {
              body: `Anda ada ${incomplete} tugasan yang belum selesai hari ini!`,
              icon: "https://fav.farm/🌙"
            });
            sessionStorage.setItem(`notified-${todayName}`, 'true');
          } catch (e) {
            console.error("Notification failed", e);
          }
        }
      }
    }
  }, [tasks, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("Notifikasi Diaktifkan!", {
          body: "Kami akan mengingatkan anda tentang persiapan Raya yang belum selesai.",
          icon: "https://fav.farm/✨"
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const toggleTask = (day: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [day]: prev[day].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false
    };
    
    setTasks(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), newTask]
    }));
    
    setNewTaskText("");
  };

  const deleteTask = (day: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [day]: prev[day].filter(t => t.id !== taskId)
    }));
  };

  const currentDayTasks = tasks[activeDay] || [];
  const completedCount = currentDayTasks.filter(t => t.completed).length;
  const totalCount = currentDayTasks.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-stone-800 pb-24">
      {/* Header */}
      <header className="bg-emerald-800 text-emerald-50 pt-14 pb-8 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 opacity-10 text-emerald-200">
          <Moon size={240} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-semibold tracking-widest uppercase">Persiapan</span>
            </div>
            
            {/* Notification Toggle */}
            <button 
              onClick={requestNotificationPermission}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                notificationPermission === 'granted' 
                  ? 'bg-emerald-700/50 text-amber-400' 
                  : 'bg-emerald-900/30 text-emerald-200 hover:bg-emerald-700/50'
              }`}
              title={notificationPermission === 'granted' ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
            >
              {notificationPermission === 'granted' ? <BellRing size={18} /> : <Bell size={18} />}
            </button>
          </div>
          <h1 className="text-5xl font-bold mb-3 font-serif tracking-tight">Hari Raya</h1>
          <p className="text-emerald-200/90 text-sm font-medium">Jejak tugasan harian anda menjelang Syawal.</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 -mt-6 relative z-20">
        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-8"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-800">Progress {activeDay}</h2>
              <p className="text-sm font-medium text-stone-500 mt-1">{completedCount} dari {totalCount} selesai</p>
            </div>
            <span className="text-3xl font-black text-emerald-600 tracking-tighter">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Day Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2.5 mb-8 pb-2 -mx-5 px-5">
          {ALL_DAYS.map(day => {
            const isActive = activeDay === day;
            const dayTaskCount = tasks[day]?.length || 0;
            const dayCompletedCount = tasks[day]?.filter(t => t.completed).length || 0;
            const isAllDone = dayTaskCount > 0 && dayTaskCount === dayCompletedCount;
            
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`relative px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                  isActive 
                    ? 'bg-emerald-700 text-white shadow-md transform scale-105' 
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {day}
                {isAllDone && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Task List */}
        <div className="space-y-3 mb-10">
          <AnimatePresence mode="popLayout">
            {currentDayTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                  task.completed 
                    ? 'bg-stone-50/80 border-stone-200' 
                    : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                <button 
                  onClick={() => toggleTask(activeDay, task.id)}
                  className="mt-0.5 flex-shrink-0 focus:outline-none transition-transform active:scale-90"
                >
                  {task.completed ? (
                    <CheckCircle className="text-emerald-500 fill-emerald-100" size={24} />
                  ) : (
                    <Circle className="text-stone-300 hover:text-emerald-400 transition-colors" size={24} />
                  )}
                </button>
                <span className={`flex-grow text-[15px] leading-relaxed pt-0.5 transition-colors duration-200 ${
                  task.completed ? 'text-stone-400 line-through' : 'text-stone-700 font-medium'
                }`}>
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(activeDay, task.id)}
                  className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all focus:outline-none focus:opacity-100 p-1"
                  aria-label="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {currentDayTasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-stone-400 bg-white/50 rounded-3xl border border-stone-100 border-dashed"
            >
              <CalendarDays className="mx-auto mb-4 opacity-40" size={40} strokeWidth={1.5} />
              <p className="text-sm font-medium">Tiada tugasan untuk hari ini.</p>
              <p className="text-xs mt-1 opacity-70">Tambah tugasan baru di bawah.</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Fixed Add Task Input at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7] to-transparent z-30">
        <form 
          onSubmit={addTask}
          className="max-w-md mx-auto flex gap-2 bg-white p-2 rounded-2xl shadow-lg border border-stone-100"
        >
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Tambah tugasan baru..."
            className="flex-grow bg-transparent px-4 py-2 text-[15px] font-medium text-stone-800 focus:outline-none placeholder:text-stone-400"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white p-3 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
