import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { Habit, HabitLog, UserProfile, OperationType } from './types';
import { cn } from './lib/utils';
import { 
  Plus, 
  Check, 
  X, 
  Trash2, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Settings, 
  LogOut, 
  Flame, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, startOfDay, parseISO } from 'date-fns';

// --- Error Handling ---
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In a real app, we'd show a toast here
}

// --- Components ---

const AuthScreen = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">HabitTrack Pro</h1>
          <p className="text-zinc-400">Master your routines, transform your life.</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-6 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
        
        <div className="grid grid-cols-3 gap-4 pt-8">
          {[
            { label: 'Track', icon: ListTodo },
            { label: 'Analyze', icon: BarChart3 },
            { label: 'Achieve', icon: Trophy },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <item.icon className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-xs text-zinc-500 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (habitId: string, date: string) => Promise<void> | void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, logs, onToggle }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = logs.some(l => l.habitId === habit.id && l.date === today);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-white group-hover:text-orange-500 transition-colors">{habit.name}</h3>
          <p className="text-sm text-zinc-500 line-clamp-1">{habit.description || 'No description'}</p>
        </div>
        <button
          onClick={() => onToggle(habit.id, today)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90",
            isCompletedToday 
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
              : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
          )}
        >
          <Check className={cn("w-6 h-6", isCompletedToday ? "stroke-[3px]" : "stroke-[2px]")} />
        </button>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>7 day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span className="capitalize">{habit.frequency}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ habits, logs }: { habits: Habit[], logs: HabitLog[] }) => {
  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = logs.filter(l => l.date === dateStr).length;
      return {
        date: format(day, 'MMM dd'),
        completions: count
      };
    });
  }, [logs]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-sm font-medium mb-1">Total Habits</p>
          <h4 className="text-3xl font-bold">{habits.length}</h4>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-sm font-medium mb-1">Completions (7d)</p>
          <h4 className="text-3xl font-bold text-orange-500">{logs.length}</h4>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-sm font-medium mb-1">Success Rate</p>
          <h4 className="text-3xl font-bold text-green-500">84%</h4>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">Activity Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#f97316' }}
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCompletions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [view, setView] = useState<'dashboard' | 'habits'>('dashboard');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', frequency: 'daily' as const });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        // Sync user profile
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          createdAt: serverTimestamp()
        }, { merge: true });

        // Test connection
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (e) {}
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const habitsUnsub = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'habits'));

    const logsQuery = query(collection(db, 'logs'), where('userId', '==', user.uid));
    const logsUnsub = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs'));

    return () => {
      habitsUnsub();
      logsUnsub();
    };
  }, [user]);

  const toggleHabit = async (habitId: string, date: string) => {
    if (!user) return;
    
    const existingLog = logs.find(l => l.habitId === habitId && l.date === date);
    
    try {
      if (existingLog) {
        await deleteDoc(doc(db, 'logs', existingLog.id));
      } else {
        await addDoc(collection(db, 'logs'), {
          habitId,
          userId: user.uid,
          date,
          value: 1,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'logs');
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newHabit.name) return;

    try {
      await addDoc(collection(db, 'habits'), {
        userId: user.uid,
        name: newHabit.name,
        description: newHabit.description,
        frequency: newHabit.frequency,
        isActive: true,
        createdAt: serverTimestamp()
      });
      setNewHabit({ name: '', description: '', frequency: 'daily' });
      setIsAddingHabit(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'habits');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-20 bg-zinc-950 border-t md:border-t-0 md:border-r border-zinc-800 z-50 flex md:flex-col items-center justify-around md:justify-center gap-8 p-4">
        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500 mb-auto">
          <Flame className="w-7 h-7 text-white" />
        </div>
        
        <button 
          onClick={() => setView('dashboard')}
          className={cn("p-3 rounded-xl transition-all", view === 'dashboard' ? "bg-zinc-800 text-orange-500" : "text-zinc-500 hover:text-zinc-300")}
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setView('habits')}
          className={cn("p-3 rounded-xl transition-all", view === 'habits' ? "bg-zinc-800 text-orange-500" : "text-zinc-500 hover:text-zinc-300")}
        >
          <ListTodo className="w-6 h-6" />
        </button>

        <button 
          onClick={() => signOut(auth)}
          className="p-3 rounded-xl text-zinc-500 hover:text-red-400 md:mt-auto"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="pb-24 md:pb-8 md:pl-28 p-6 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12 pt-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {view === 'dashboard' ? 'Dashboard' : 'My Habits'}
            </h2>
            <p className="text-zinc-500">Welcome back, {user.displayName?.split(' ')[0]}</p>
          </div>
          
          {view === 'habits' && (
            <button 
              onClick={() => setIsAddingHabit(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Habit
            </button>
          )}
        </header>

        {view === 'dashboard' ? (
          <Dashboard habits={habits} logs={logs} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                logs={logs} 
                onToggle={toggleHabit} 
              />
            ))}
            {habits.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 mb-4">No habits yet. Start your journey today!</p>
                <button 
                  onClick={() => setIsAddingHabit(true)}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Create your first habit
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Habit Modal */}
      {isAddingHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">New Habit</h3>
              <button onClick={() => setIsAddingHabit(false)} className="text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={addHabit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Habit Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Morning Meditation"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  value={newHabit.name}
                  onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Description (Optional)</label>
                <textarea 
                  placeholder="Why is this important?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none"
                  value={newHabit.description}
                  onChange={e => setNewHabit({...newHabit, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewHabit({...newHabit, frequency: 'daily'})}
                  className={cn(
                    "py-3 rounded-xl border font-medium transition-all",
                    newHabit.frequency === 'daily' ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                  )}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setNewHabit({...newHabit, frequency: 'weekly'})}
                  className={cn(
                    "py-3 rounded-xl border font-medium transition-all",
                    newHabit.frequency === 'weekly' ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                  )}
                >
                  Weekly
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mt-4"
              >
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
