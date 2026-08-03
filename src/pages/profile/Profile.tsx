import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  authSlice,
  themeSlice,
  checkInSlice,
  onboardingSlice,
  Meal } from
'../../store/slices';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Flame,
  BookOpen,
  TrendingUp,
  NotebookPen,
  Users,
  GraduationCap,
  Settings as SettingsIcon,
  Plus,
  X,
  Trophy,
  CheckCircle2,
  PlayCircle,
  Ticket,
  DollarSign,
  Shield,
  Calendar,
  Camera } from
'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, CenteredModal, ModalField } from '../../components/modals';
import { CheckInFeelingDisplay } from '../../components/journal/CheckInFeelingDisplay';
import { normalizeAdminProgram } from '../../store/adminProgramsSlice';
import { computeEnrolledLearningProgress } from '../../utils/programDisplay';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';
type Tab = 'food' | 'progress' | 'journal' | 'team' | 'learning' | 'settings';
const TABS: {
  id: Tab;
  label: string;
  icon: ComponentType<any>;
}[] = [
{
  id: 'food',
  label: 'Food Log',
  icon: BookOpen
},
{
  id: 'progress',
  label: 'Progress',
  icon: TrendingUp
},
{
  id: 'journal',
  label: 'Journal',
  icon: NotebookPen
},
// Re-enable to show My Team tab
// {
//   id: 'team',
//   label: 'My Team',
//   icon: Users
// },
{
  id: 'learning',
  label: 'Learning',
  icon: GraduationCap
},
{
  id: 'settings',
  label: 'Settings',
  icon: SettingsIcon
}];

const INITIAL_WEIGHT_DATA = [
  { week: 'W1', weight: 168 },
  { week: 'W2', weight: 166 },
  { week: 'W3', weight: 165 },
  { week: 'W4', weight: 164 },
  { week: 'W5', weight: 163 },
  { week: 'W6', weight: 162 },
  { week: 'W7', weight: 161 }];

type ProgressPhotoCategory = 'before' | 'progress' | 'after';
interface ProgressPhoto {
  id: string;
  image: string;
  category: ProgressPhotoCategory;
  notes: string;
  date: string;
}
const PHOTO_CATEGORIES: {
  id: ProgressPhotoCategory;
  label: string;
}[] = [
  { id: 'before', label: 'Before' },
  { id: 'progress', label: 'Progress' },
  { id: 'after', label: 'After' }];
const DEMO_PROGRESS_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'];

function formatPhotoDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, familyCode } = useSelector((state: RootState) => state.auth);
  const { streakDays, journeyDay, longestStreak, waterCount } = useSelector(
    (state: RootState) => state.home
  );
  const { mode } = useSelector((state: RootState) => state.theme);
  const { familyMembers } = useSelector((state: RootState) => state.profile);
  const { loggedMeals } = useSelector((state: RootState) => state.meals);
  const { entries } = useSelector((state: RootState) => state.checkIn);
  const { programs: rawPrograms } = useSelector(
    (state: RootState) => state.adminPrograms
  );
  const {
    enrolledIds: rawEnrolled,
    enrolledAt: rawEnrolledAt,
    completedItemKeys: rawCompleted
  } = useSelector((state: RootState) => state.programs);
  const { currentWeight, goalWeight } = useSelector(
    (state: RootState) => state.onboarding
  );
  const [activeTab, setActiveTab] = useState<Tab>('food');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [weightData, setWeightData] = useState(INITIAL_WEIGHT_DATA);
  const [draftWeight, setDraftWeight] = useState('');
  const [draftWeightDate, setDraftWeightDate] = useState('');
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [draftPhotoImage, setDraftPhotoImage] = useState<string | null>(null);
  const [draftPhotoCategory, setDraftPhotoCategory] =
  useState<ProgressPhotoCategory>('progress');
  const [draftPhotoNotes, setDraftPhotoNotes] = useState('');
  const [draftPhotoDate, setDraftPhotoDate] = useState('');
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [draftWord, setDraftWord] = useState('');
  const [draftWin, setDraftWin] = useState('');
  const [draftStruggle, setDraftStruggle] = useState('');
  const [draftDisplayName, setDraftDisplayName] = useState(user?.name ?? '');
  const [draftAvatar, setDraftAvatar] = useState<string | null>(user?.avatar ?? null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const initials =
  user?.name?.
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase() || 'M';
  const draftInitials =
  draftDisplayName?.
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase() || 'M';
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const profileHasChanges =
  draftDisplayName.trim() !== (user?.name ?? '') ||
  (draftAvatar ?? null) !== (user?.avatar ?? null);
  // ---- Food log derived data ----
  const mealsByDay = useMemo(() => {
    // Mock: distribute meals across last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => ({
      day: d,
      meals: [3, 4, 2, 5, 4, 3, loggedMeals.length || 4][i] || 0
    }));
  }, [loggedMeals]);
  const latestWeight =
  weightData[weightData.length - 1]?.weight ?? currentWeight ?? 161;
  const weightChange = latestWeight - (weightData[0]?.weight ?? latestWeight);
  const lbsToGoal = Math.max(0, latestWeight - (goalWeight ?? 150));
  const weightChartDomain = useMemo(() => {
    const values = weightData.map((d) => d.weight);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min - 5, max + 5];
  }, [weightData]);
  const enrolledIds = Array.isArray(rawEnrolled) ? rawEnrolled : [];
  const enrolledAtMap =
    rawEnrolledAt && typeof rawEnrolledAt === 'object'
      ? (rawEnrolledAt as Record<string, number>)
      : {};
  const completedItemKeys = Array.isArray(rawCompleted) ? rawCompleted : [];
  const programs = useMemo(
    () =>
      rawPrograms
        .map((p) =>
          normalizeAdminProgram(p as unknown as Record<string, unknown>)
        )
        .filter((p) => p.active),
    [rawPrograms]
  );
  const learning = computeEnrolledLearningProgress(programs, completedItemKeys, {
    enrolledIds,
    enrolledAt: enrolledAtMap
  });
  const openLogWeight = () => {
    setDraftWeight(String(latestWeight));
    setDraftWeightDate(new Date().toISOString().slice(0, 10));
    setLogWeightOpen(true);
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const shouldOpenLogWeight = params.get('logWeight') === '1';
    if (
      tab === 'food' ||
      tab === 'progress' ||
      tab === 'journal' ||
      tab === 'team' ||
      tab === 'learning' ||
      tab === 'settings'
    ) {
      setActiveTab(tab);
    }
    if (shouldOpenLogWeight) {
      setActiveTab('progress');
      openLogWeight();
    }
  }, [location.search]);

  useEffect(() => {
    setDraftDisplayName(user?.name ?? '');
    setDraftAvatar(user?.avatar ?? null);
  }, [user?.name, user?.avatar]);
  const closeLogWeight = () => setLogWeightOpen(false);
  const saveWeight = () => {
    const parsed = parseFloat(draftWeight);
    if (!draftWeight.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid weight');
      return;
    }
    setWeightData((prev) => {
      const next = [...prev];
      next[next.length - 1] = {
        ...next[next.length - 1],
        weight: parsed
      };
      return next;
    });
    dispatch(
      onboardingSlice.actions.setOnboardingData({
        currentWeight: parsed
      })
    );
    toast.success('Weight logged');
    closeLogWeight();
  };
  const openAddPhoto = () => {
    setDraftPhotoImage(null);
    setDraftPhotoCategory('progress');
    setDraftPhotoNotes('');
    setDraftPhotoDate(new Date().toISOString().slice(0, 10));
    setAddPhotoOpen(true);
  };
  const closeAddPhoto = () => setAddPhotoOpen(false);
  const pickDemoPhoto = () => {
    const next =
    DEMO_PROGRESS_IMAGES[
    Math.floor(Math.random() * DEMO_PROGRESS_IMAGES.length)];
    setDraftPhotoImage(next);
  };
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftPhotoImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const saveProgressPhoto = () => {
    if (!draftPhotoImage) {
      toast.error('Add a photo first');
      return;
    }
    setProgressPhotos((prev) => [
    {
      id: Date.now().toString(),
      image: draftPhotoImage,
      category: draftPhotoCategory,
      notes: draftPhotoNotes.trim(),
      date: draftPhotoDate
    },
    ...prev]
    );
    toast.success('Progress photo saved');
    closeAddPhoto();
  };

  const handleLogout = () => {
    dispatch(authSlice.actions.logout());
    navigate('/login');
  };
  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    dispatch(themeSlice.actions.setTheme(newMode));
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftAvatar(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveProfileEdits = () => {
    const nextName = draftDisplayName.trim();
    if (!nextName) {
      toast.error('Please enter a display name');
      return;
    }
    dispatch(
      authSlice.actions.updateProfile({
        name: nextName,
        avatar: draftAvatar
      })
    );
    toast.success('Profile updated');
  };

  const submitJournal = () => {
    if (!draftWord.trim() && !draftWin.trim() && !draftStruggle.trim()) {
      toast.error('Add at least one note');
      return;
    }
    dispatch(
      checkInSlice.actions.addCheckIn({
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        feeling: 4,
        word: draftWord.trim() || 'Steady',
        win: draftWin.trim(),
        struggle: draftStruggle.trim(),
        need: ''
      })
    );
    toast.success('Journal entry saved');
    setNewEntryOpen(false);
    setDraftWord('');
    setDraftWin('');
    setDraftStruggle('');
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 bg-surface border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-sage text-white flex items-center justify-center font-extrabold text-xl shadow-sm ring-2 ring-surface overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-text leading-tight">
              {user?.name || 'Misty A.'}
            </h1>
            <p className="text-text-muted text-xs truncate">
              {user?.email || 'misty@example.com'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                <Flame className="w-3 h-3 fill-orange-500" /> {streakDays}d
              </span>
              <span className="text-[11px] font-bold text-text-muted">
                Day {journeyDay} · best {longestStreak}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-surface border-b border-border sticky top-0 z-10 px-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 h-12 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${active ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text'}`}>
              
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {t.label}
            </button>);

        })}
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        {/* ============ FOOD LOG ============ */}
        {activeTab === 'food' &&
        <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Logged today" value={loggedMeals.length} />
              <StatCard label="Water" value={`${waterCount}/8`} />
              <StatCard
              label="Food logged"              value={mealsByDay.reduce((a, b) => a + b.meals, 0)} />
            
            </div>

            <ChartCard title="Meals · last 7 days">
              <AreaChart data={mealsByDay}>
                <defs>
                  <linearGradient id="mealsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                    offset="0%"
                    stopColor="var(--accent-sage)"
                    stopOpacity={0.4} />
                  
                    <stop
                    offset="100%"
                    stopColor="var(--accent-sage)"
                    stopOpacity={0} />
                  
                  </linearGradient>
                </defs>
                <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false} />
              
                <XAxis
                dataKey="day"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)" />
              
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                type="monotone"
                dataKey="meals"
                stroke="var(--accent-sage)"
                strokeWidth={2.5}
                fill="url(#mealsGrad)" />
              
              </AreaChart>
            </ChartCard>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Recent meals
                </h3>
                <button
                onClick={() => navigate('/log')}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                
                  <Plus className="w-3.5 h-3.5" /> Log meal
                </button>
              </div>
              {loggedMeals.length === 0 ?
            <EmptyState text="No meals logged yet. Tap Log meal above." /> :

            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {loggedMeals.slice(0, 8).map((m, i, arr) =>
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMeal(m)}
                className={`w-full p-3 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                
                      <div className="w-10 h-10 rounded-xl bg-accent-sage/15 text-accent-sage flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {m.image ?
                <img
                  src={m.image}
                  alt=""
                  className="w-full h-full object-cover" /> :


                <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">
                          {m.description}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {m.type} · {m.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </button>
              )}
                </div>
            }
            </div>
          </>
        }

        {/* ============ PROGRESS ============ */}
        {activeTab === 'progress' &&
        <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
              label="Current weight"
              value={`${latestWeight} lbs`}
              sub={`${weightChange > 0 ? '+' : ''}${weightChange} lbs`} />
            
              <StatCard
              label="Goal"
              value={`${goalWeight ?? 150} lbs`}
              sub={`${lbsToGoal} to go`} />
            
              <StatCard
              label="Streak"
              value={`${streakDays}d`}
              sub={`Best ${longestStreak}d`} />
            
              <StatCard
              label="Lessons"
              value={`${learning.completed}/${learning.total}`}
              sub={`${learning.percent}%`} />
            
            </div>

            <div className="flex items-center justify-end mb-2">
              <button
              type="button"
              onClick={openLogWeight}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              
                <Plus className="w-3.5 h-3.5" /> Log weight
              </button>
            </div>

            <ChartCard title="Weight · last 7 weeks">
              <LineChart data={weightData}>
                <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false} />
              
                <XAxis
                dataKey="week"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)" />
              
                <YAxis hide domain={weightChartDomain} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: 'var(--primary)'
                }}
                activeDot={{
                  r: 5
                }} />
              
              </LineChart>
            </ChartCard>

            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
              {
                label: '7-day streak',
                icon: Flame,
                unlocked: true
              },
              {
                label: '5 lessons',
                icon: GraduationCap,
                unlocked: true
              },
              {
                label: 'First meal',
                icon: BookOpen,
                unlocked: true
              },
              {
                label: 'Hydration hero',
                icon: Trophy,
                unlocked: false
              },
              {
                label: '30-day streak',
                icon: Flame,
                unlocked: false
              },
              {
                label: 'Goal reached',
                icon: Trophy,
                unlocked: false
              }].
              map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.label}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all border ${a.unlocked ? 'bg-accent-sage/10 border-accent-sage/30' : 'bg-surface-2 border-border opacity-50'}`}>
                    
                      <Icon
                      className={`w-5 h-5 mb-1 ${a.unlocked ? 'text-accent-sage' : 'text-text-muted'}`}
                      strokeWidth={1.75} />
                    
                      <span className="text-[10px] font-bold text-text leading-tight">
                        {a.label}
                      </span>
                    </div>);

              })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text">Progress Photos</h3>
                <button
                type="button"
                onClick={openAddPhoto}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                
                  <Plus className="w-3.5 h-3.5" /> Add photo
                </button>
              </div>
              {progressPhotos.length === 0 ?
            <EmptyState text="No progress photos yet. Tap Add photo to start." /> :

            <div className="grid grid-cols-2 gap-3">
                  {progressPhotos.map((photo) =>
              <div
                key={photo.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2">
                
                      <img
                  src={photo.image}
                  alt={photo.notes || 'Progress photo'}
                  className="absolute inset-0 w-full h-full object-cover" />
                
                      <span className="absolute top-2 left-2 text-[10px] font-bold text-white lowercase drop-shadow-sm">
                        {photo.category}
                      </span>
                      <div className="absolute bottom-0 inset-x-0 bg-black/55 py-2 text-center">
                        <span className="text-xs font-semibold text-white">
                          {formatPhotoDate(photo.date)}
                        </span>
                      </div>
                    </div>
              )}
                </div>
            }
            </div>
          </>
        }

        {/* ============ JOURNAL ============ */}
        {activeTab === 'journal' &&
        <>
            <button
            onClick={() => setNewEntryOpen(true)}
            className="w-full bg-primary text-white rounded-2xl p-4 shadow-md shadow-primary/20 flex items-center justify-center gap-2 font-bold hover:bg-primary-hover transition-all">
            
              <Plus className="w-4 h-4" /> New journal entry
            </button>

            {entries.length === 0 ?
          <EmptyState text="No entries yet — start reflecting." /> :

          <div className="flex flex-col gap-3">
                {entries.map((e) =>
            <div
              key={e.id}
              className="bg-surface border border-border rounded-2xl p-4">
              
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {e.date}
                      </p>
                    </div>
                    <CheckInFeelingDisplay feeling={e.feeling} />
                    {e.win &&
              <div className="mb-2">
                        <p className="text-[10px] font-bold text-accent-sage uppercase tracking-wider mb-0.5">
                          Win
                        </p>
                        <p className="text-sm text-text leading-snug">
                          {e.win}
                        </p>
                      </div>
              }
                    {e.struggle &&
              <div className="mb-2">
                        <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-0.5">
                          Struggle
                        </p>
                        <p className="text-sm text-text leading-snug">
                          {e.struggle}
                        </p>
                      </div>
              }
                    {e.word &&
              <div className="mb-2">
                        <p className="text-[10px] font-bold text-accent-lavender uppercase tracking-wider mb-0.5">
                          One word
                        </p>
                        <p className="text-sm text-text leading-snug">
                          {e.word}
                        </p>
                      </div>
              }
                    {e.need &&
              <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                          Next week
                        </p>
                        <p className="text-sm text-text leading-snug">
                          {e.need}
                        </p>
                      </div>
              }
                  </div>
            )}
              </div>
          }
          </>
        }

        {/* ============ MY TEAM ============ */}
        {activeTab === 'team' &&
        <>
            <div className="bg-primary text-white rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mb-1">
                Your family code
              </p>
              <p className="text-2xl font-extrabold tracking-widest mb-3">
                {familyCode || 'ABFAM2K9'}
              </p>
              <div className="flex items-center gap-2">
                <button
                onClick={() => {
                  navigator.clipboard?.writeText(familyCode || 'ABFAM2K9');
                  toast.success('Family code copied');
                }}
                className="flex-1 h-10 rounded-lg bg-white/15 backdrop-blur text-white font-bold text-xs hover:bg-white/25 transition-colors">
                
                  Copy
                </button>
                <button
                onClick={() => toast.success('Share sheet opened')}
                className="flex-1 h-10 rounded-lg bg-white/25 backdrop-blur text-white font-bold text-xs hover:bg-white/35 transition-colors">
                
                  Share
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Members ({familyMembers.length})
              </h3>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                {familyMembers.map((m, i, arr) =>
              <div
                key={m.id}
                className={`p-3 flex items-center gap-3 ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                
                    <div className="w-10 h-10 rounded-full bg-accent-sage text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text truncate">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-text-muted">Member</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      {m.streak}
                    </span>
                  </div>
              )}
              </div>
            </div>

          </>
        }

        {/* ============ LEARNING ============ */}
        {activeTab === 'learning' &&
        <>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-text">Overall progress</p>
                <span className="text-sm font-extrabold text-primary">
                  {learning.percent}%
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-2">
                <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${learning.percent}%`
                }} />
              
              </div>
              <p className="text-xs text-text-muted">
                {learning.completed} of {learning.total} lessons complete
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
              onClick={() => navigate('/learn')}
              className="bg-surface border border-border rounded-2xl p-4 text-left hover:border-primary/30 transition-all">
              
                <div className="w-9 h-9 rounded-xl bg-accent-sage/15 text-accent-sage flex items-center justify-center mb-2">
                  <PlayCircle className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <p className="font-bold text-sm text-text">Continue lessons</p>
                <p className="text-[11px] text-text-muted">
                  Pick up where you left off
                </p>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Completed lessons
              </h3>
              {completedItemKeys.length === 0 ?
            <EmptyState text="No lessons completed yet." /> :

            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {completedItemKeys.map((id, i, arr) =>
              <div
                key={id}
                className={`p-3 flex items-center gap-3 ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                
                      <CheckCircle2 className="w-5 h-5 text-accent-sage flex-shrink-0" />
                      <p className="text-sm text-text flex-1 truncate">
                        Lesson #{id.split(':').slice(-1)[0] || id}
                      </p>
                    </div>
              )}
                </div>
            }
            </div>
          </>
        }

        {/* ============ SETTINGS ============ */}
        {activeTab === 'settings' &&
        <>
            <section>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Appearance
              </h3>
              <div className="flex gap-2 p-1 bg-surface-2 rounded-xl border border-border">
                {[
              {
                id: 'light',
                icon: Sun,
                label: 'Light'
              },
              {
                id: 'dark',
                icon: Moon,
                label: 'Dark'
              },
              {
                id: 'system',
                icon: Monitor,
                label: 'System'
              }].
              map((t) => {
                const Icon = t.icon;
                const active = mode === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id as any)}
                    className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-lg transition-all ${active ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}>
                    
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{t.label}</span>
                    </button>);

              })}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Profile
              </h3>
              <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-sage text-white flex items-center justify-center font-extrabold text-xl shadow-sm ring-2 ring-surface overflow-hidden flex-shrink-0">
                    {draftAvatar ? (
                      <img
                        src={draftAvatar}
                        alt="Profile preview"
                        className="w-full h-full object-cover" />
                    ) : (
                      draftInitials
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleAvatarFile} />

                    <button
                      type="button"
                      onClick={() => avatarFileRef.current?.click()}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 text-text font-bold text-sm hover:bg-surface-2/80 transition-colors">
                      {draftAvatar ? 'Change profile picture' : 'Upload profile picture'}
                    </button>

                    {draftAvatar &&
                    <button
                      type="button"
                      onClick={() => setDraftAvatar(null)}
                      className="mt-2 w-full h-9 rounded-xl text-sm font-bold text-text-muted hover:text-text transition-colors">
                      Remove photo
                    </button>
                    }
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text">Username</label>
                  <input
                    type="text"
                    value={draftDisplayName}
                    onChange={(e) => setDraftDisplayName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" />
                </div>

                <button
                  type="button"
                  disabled={!profileHasChanges}
                  onClick={saveProfileEdits}
                  className={`w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.98] ${
                    profileHasChanges
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-surface-2 text-text-muted cursor-not-allowed shadow-none'
                  }`}>
                  Save changes
                </button>
              </div>
            </section>

            {isAdmin &&
          <section>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Admin
                </h3>
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                  <SettingRow
                icon={Shield}
                label="Admin dashboard"
                onClick={() => navigate('/admin')} />
              
                  <SettingRow
                icon={Users}
                label="Members"
                onClick={() => navigate('/admin/members')} />
              
                  <SettingRow
                icon={Ticket}
                label="Promo codes"
                onClick={() => navigate('/admin/promos')} />
              
                  <SettingRow
                icon={DollarSign}
                label="Pricing & family"
                onClick={() => navigate('/admin/pricing')} />
              
                  <SettingRow
                icon={BookOpen}
                label="Content"
                onClick={() => navigate('/admin/content')}
                last />
              
                </div>
              </section>
          }

            <section>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Account
              </h3>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <SettingRow
                label="Notifications"
                onClick={() => navigate('/notifications')} />
              
                <SettingRow
                label="Change password"
                onClick={() => navigate('/reset-password')}
                last />

                {/* Re-enable to show Timezone setting
                <SettingRow
                label="Timezone"
                value="PST"
                onClick={() => toast.success('Timezone settings coming soon')}
                last />
                */}

              </div>
            </section>

            <button
            onClick={handleLogout}
            className="w-full py-3.5 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
            
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </>
        }
      </div>

      <CenteredModal
        open={logWeightOpen}
        onClose={closeLogWeight}
        title="Log Your Weight">
        <div className="flex flex-col gap-4 mb-6">
          <ModalField label="Weight (lbs)">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              value={draftWeight}
              onChange={(e) => setDraftWeight(e.target.value)}
              placeholder="Weight in lbs"
              className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none transition-all"
            />
          </ModalField>
          <ModalField label="Date">
            <div className="relative">
              <input
                type="date"
                value={draftWeightDate}
                onChange={(e) => setDraftWeightDate(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-xl bg-surface-2 border border-border text-text focus:border-primary outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                strokeWidth={1.75}
              />
            </div>
          </ModalField>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeLogWeight}
            className="flex-1 h-11 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface-2">
            Cancel
          </button>
          <button
            type="button"
            onClick={saveWeight}
            className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-md shadow-primary/20">
            Save
          </button>
        </div>
      </CenteredModal>

      <CenteredModal
        open={addPhotoOpen}
        onClose={closeAddPhoto}
        title="Add Progress Photo"
        panelClassName="max-h-[90vh] overflow-y-auto">
        <input
          ref={photoFileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoFile}
        />

              <div className="mb-4">
                <button
                type="button"
                onClick={() => photoFileRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-surface-2 hover:border-accent-sage/50 hover:bg-surface-2/80 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              
                  {draftPhotoImage ?
              <>
                      <img
                  src={draftPhotoImage}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover" />
                
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors" />
                      <span className="relative z-10 text-white text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                        Replace photo
                      </span>
                    </> :

              <>
                      <Camera
                  className="w-8 h-8 text-accent-sage"
                  strokeWidth={1.75} />
                
                      <p className="text-sm font-semibold text-text">
                        Take Photo or Upload
                      </p>
                    </>
              }
                </button>
                {!draftPhotoImage &&
              <button
                type="button"
                onClick={pickDemoPhoto}
                className="w-full text-center text-[11px] font-bold text-primary hover:underline mt-2">
                
                    Use sample photo
                  </button>
              }
              </div>

              <div className="flex gap-2 mb-4">
                {PHOTO_CATEGORIES.map((c) => {
                const active = draftPhotoCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setDraftPhotoCategory(c.id)}
                    className={`flex-1 h-9 rounded-full text-xs font-bold transition-all border ${active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface-2 text-text border-border hover:border-primary/40'}`}>
                    
                      {c.label}
                    </button>);

              })}
              </div>

              <div className="mb-4">
                <textarea
                value={draftPhotoNotes}
                onChange={(e) => setDraftPhotoNotes(e.target.value)}
                placeholder="Any notes about this photo?"
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border text-text text-sm placeholder:text-text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none transition-all" />
              
              </div>

              <div className="mb-5">
                <div className="relative">
                  <input
                  type="date"
                  value={draftPhotoDate}
                  onChange={(e) => setDraftPhotoDate(e.target.value)}
                  className="w-full h-11 px-3 pr-10 rounded-xl bg-surface-2 border border-border text-text focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                
                  <Calendar
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                  strokeWidth={1.75} />
                
                </div>
              </div>

        <button
          type="button"
          onClick={saveProgressPhoto}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          Save
        </button>
      </CenteredModal>

      <SheetModal
        open={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        hideHeader
        noPadding
        panelClassName="max-h-[88vh]">
        {selectedMeal && (
          <>
            <div className="flex items-center justify-between p-5 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-sage/15 text-accent-sage px-2 py-0.5 rounded-md">
                {selectedMeal.type}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMeal(null)}
                className="p-2 -mr-2 text-text-muted hover:text-text"
                aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

              {selectedMeal.image ?
            <div className="px-5 pb-4">
                  <img
                src={selectedMeal.image}
                alt={selectedMeal.description}
                className="w-full aspect-[4/3] object-cover rounded-2xl border border-border" />
              
                </div> :

            <div className="mx-5 mb-4 aspect-[4/3] rounded-2xl border border-dashed border-border bg-surface-2 flex flex-col items-center justify-center gap-2">
                  <BookOpen
                className="w-8 h-8 text-text-muted"
                strokeWidth={1.75} />
              
                  <p className="text-xs text-text-muted font-medium">
                    No photo for this meal
                  </p>
                </div>
            }

              <div className="px-5 pb-6 flex flex-col gap-3">
                <h3 className="text-xl font-extrabold text-text leading-snug">
                  {selectedMeal.description}
                </h3>

                <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
                  <div className="p-3.5 border-b border-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                      Meal type
                    </p>
                    <p className="text-sm font-semibold text-text">
                      {selectedMeal.type}
                    </p>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                      Logged at
                    </p>
                    <p className="text-sm font-semibold text-text">
                      {selectedMeal.time}
                    </p>
                  </div>
                </div>

            <button
              type="button"
              onClick={() => {
                setSelectedMeal(null);
                navigate('/log');
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
              Log another meal
            </button>
          </div>
          </>
        )}
      </SheetModal>

      <SheetModal
        open={newEntryOpen}
        onClose={() => setNewEntryOpen(false)}
        title="New journal entry">
        <div className="flex flex-col gap-4">
          <ModalField label="Word of the day">
            <input
              type="text"
              value={draftWord}
              onChange={(e) => setDraftWord(e.target.value)}
              placeholder="e.g. Grateful"
              className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none"
            />
          </ModalField>
          <ModalField label="Win">
            <textarea
              value={draftWin}
              onChange={(e) => setDraftWin(e.target.value)}
              rows={2}
              placeholder="What went well?"
              className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
            />
          </ModalField>
          <ModalField label="Struggle">
            <textarea
              value={draftStruggle}
              onChange={(e) => setDraftStruggle(e.target.value)}
              rows={2}
              placeholder="Where did you stumble?"
              className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
            />
          </ModalField>
          <button
            type="button"
            onClick={submitJournal}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
            Save entry
          </button>
        </div>
      </SheetModal>
    </div>);

}
// ---- Local UI helpers ----
const tooltipStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontSize: 12
};
function StatCard({
  label,
  value,
  sub




}: {label: string;value: React.ReactNode;sub?: string;}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-3">
      <p className="text-xl font-extrabold text-text leading-tight">{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
        {label}
      </p>
      {sub &&
      <p className="text-[10px] text-accent-sage font-bold mt-0.5">{sub}</p>
      }
    </div>);

}
function ChartCard({
  title,
  children



}: {title: string;children: React.ReactElement;}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-3">
      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-1">
        {title}
      </p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>);

}
function EmptyState({ text }: {text: string;}) {
  return (
    <div className="p-8 text-center text-sm text-text-muted bg-surface border border-border border-dashed rounded-2xl">
      {text}
    </div>);

}
function SettingRow({
  label,
  icon: Icon,
  value,
  onClick,
  last









}: {label: string;icon?: ComponentType<{className?: string;strokeWidth?: string | number;}>;value?: string;onClick: () => void;last?: boolean;}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center hover:bg-surface-2 transition-colors text-left ${last ? '' : 'border-b border-border'}`}>
      
      {Icon &&
      <Icon className="w-4 h-4 text-text-muted mr-2.5" strokeWidth={1.75} />
      }
      <span className="font-medium text-text flex-1 text-sm">{label}</span>
      {value && <span className="text-xs text-text-muted mr-1">{value}</span>}
      <ChevronRight className="w-4 h-4 text-text-muted" />
    </button>);

}