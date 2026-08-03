import React, { useEffect, useState, Component, type ComponentType } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import {
  contentSlice,
  ContentRecipe,
  ContentCategory,
  ContentLesson,
  ContentQuote,
  QuoteDisplayMode } from
'../../store/contentSlice';
import { WEEKDAY_LABELS } from '../../utils/quoteDisplay';
import { challengesSlice } from '../../store/slices';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Sparkles,
  ImageIcon,
  X,
  Tag,
  LayoutGrid,
  Sunrise,
  UtensilsCrossed,
  Moon,
  Cookie,
  Citrus,
  GraduationCap,
  Quote,
  Trophy,
  ChefHat,
  Search } from
'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, ConfirmModal, ModalField } from '../../components/modals';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
type Tab = 'recipes' | 'categories' | 'lessons' | 'quotes' | 'challenges';
const TABS: {
  id: Tab;
  label: string;
  icon: ComponentType<any>;
}[] = [
{
  id: 'recipes',
  label: 'Recipes',
  icon: ChefHat
},
{
  id: 'categories',
  label: 'Categories',
  icon: LayoutGrid
},
{
  id: 'lessons',
  label: 'Lessons',
  icon: GraduationCap
},
{
  id: 'quotes',
  label: 'Quotes',
  icon: Quote
},
{
  id: 'challenges',
  label: 'Challenges',
  icon: Trophy
}];

const CATEGORY_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Juice'];

function getCategoryIcon(name: string): ComponentType<{
  className?: string;
  strokeWidth?: number;
}> {
  switch (name.trim().toLowerCase()) {
    case 'breakfast':
      return Sunrise;
    case 'lunch':
      return UtensilsCrossed;
    case 'dinner':
      return Moon;
    case 'snack':
      return Cookie;
    case 'juice':
      return Citrus;
    default:
      return LayoutGrid;
  }
}
const TAG_OPTIONS = [
'Vegan',
'Keto',
'Gluten-Free',
'High-Protein',
'Low-Carb',
'Quick',
'Anti-Inflammatory',
'Detox',
'High-Fiber',
'Raw',
'Dairy-Free'];

export function AdminContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { recipes, categories, lessons, quotes, quoteDisplayMode } = useSelector(
    (state: RootState) => state.content
  );
  const { challenges } = useSelector((state: RootState) => state.challenges);
  const [tab, setTab] = useState<Tab>('recipes');
  const [query, setQuery] = useState('');
  // Editors
  const [recipeEditor, setRecipeEditor] = useState<ContentRecipe | null>(null);
  const [recipeIsNew, setRecipeIsNew] = useState(false);
  const [categoryEditor, setCategoryEditor] = useState<ContentCategory | null>(
    null
  );
  const [categoryIsNew, setCategoryIsNew] = useState(false);
  const [lessonEditor, setLessonEditor] = useState<ContentLesson | null>(null);
  const [lessonIsNew, setLessonIsNew] = useState(false);
  const [quoteEditor, setQuoteEditor] = useState<ContentQuote | null>(null);
  const [quoteIsNew, setQuoteIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    kind: Tab;
    id: string;
    label: string;
  } | null>(null);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/home" replace />;
  }
  // --- Counts for status row ---
  const counts = (() => {
    if (tab === 'recipes') {
      const total = recipes.length;
      const published = recipes.filter((r) => r.status === 'published').length;
      return {
        total,
        published,
        drafts: total - published
      };
    }
    if (tab === 'categories') {
      return {
        total: categories.length,
        published: categories.length,
        drafts: 0
      };
    }
    if (tab === 'lessons') {
      const total = lessons.length;
      const published = lessons.filter((l) => l.status === 'published').length;
      return {
        total,
        published,
        drafts: total - published
      };
    }
    if (tab === 'quotes') {
      const total = quotes.length;
      const published = quotes.filter((q) => q.status === 'published').length;
      return {
        total,
        published,
        drafts: total - published
      };
    }
    return {
      total: challenges.length,
      published: challenges.length,
      drafts: 0
    };
  })();
  // --- Add handlers ---
  const handleAdd = () => {
    const now = new Date().toISOString();
    if (tab === 'recipes') {
      setRecipeEditor({
        id: `r-${Date.now()}`,
        title: '',
        category: 'Lunch',
        tags: [],
        status: 'draft',
        aiGenerated: false,
        image: ''
      });
      setRecipeIsNew(true);
    } else if (tab === 'categories') {
      setCategoryEditor({
        id: `c-${Date.now()}`,
        name: '',
        recipeCount: 0,
        color: '#7E9568'
      });
      setCategoryIsNew(true);
    } else if (tab === 'lessons') {
      setLessonEditor({
        id: `l-${Date.now()}`,
        title: '',
        module: 'Module 1',
        duration: '5 min',
        status: 'draft'
      });
      setLessonIsNew(true);
    } else if (tab === 'quotes') {
      setQuoteEditor({
        id: `q-${Date.now()}`,
        text: '',
        author: 'Authentic Balance',
        status: 'draft',
        scheduleDays: []
      });
      setQuoteIsNew(true);
    } else if (tab === 'challenges') {
      if (user?.role !== 'admin') {
        toast.error(
          'Only Misty can create challenges at launch. Members unlock create after completing a Misty challenge and working with her.'
        );
        return;
      }
      navigate('/challenges/new');
    }
  };
  // --- Filtered ---
  const q = query.trim().toLowerCase();
  const filteredRecipes = recipes.filter(
    (r) =>
    !q ||
    r.title.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.tags.some((t) => t.toLowerCase().includes(q))
  );
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      {/* Top bar */}
      <div className="bg-primary text-white">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
            
            <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
          </button>
          <h1 className="font-extrabold text-lg">Content</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-5">
        <h2 className="text-2xl font-extrabold text-accent-sage mb-4">
          Content Management
        </h2>

        {/* Tab strip */}
        <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-surface border border-border rounded-2xl p-1 mb-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}>
                
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {t.label}
              </button>);

          })}
        </div>

        {/* Status counters */}
        <div className="flex items-center gap-4 text-xs text-text-muted font-semibold mb-4 px-1">
          <span>
            Total:{' '}
            <span className="font-extrabold text-text">{counts.total}</span>
          </span>
          <span>
            Published:{' '}
            <span className="font-extrabold text-text">{counts.published}</span>
          </span>
          <span>
            Drafts:{' '}
            <span className="font-extrabold text-text">{counts.drafts}</span>
          </span>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-lg font-extrabold text-text capitalize flex-1">
            {tab}
          </h3>
          <button
            onClick={handleAdd}
            className="h-10 px-4 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
            
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add{' '}
            {tab === 'recipes' ?
            'Recipe' :
            tab === 'categories' ?
            'Category' :
            tab === 'lessons' ?
            'Lesson' :
            tab === 'quotes' ?
            'Quote' :
            'Challenge'}
          </button>
        </div>

        {/* Search (recipes only) */}
        {tab === 'recipes' &&
        <div className="relative mb-3">
            <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            strokeWidth={1.75} />
          
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, tags, categories..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm" />
          
          </div>
        }

        {/* ===== RECIPES ===== */}
        {tab === 'recipes' &&
        <div className="flex flex-col gap-2">
            {filteredRecipes.length === 0 ?
          <EmptyState text="No recipes match your search." /> :

          filteredRecipes.map((r) =>
          <motion.div
            key={r.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-surface border border-border rounded-2xl p-3 flex items-start gap-3">
            
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl bg-accent-sage/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {r.image ?
              <img
                src={r.image}
                alt={r.title}
                className="w-full h-full object-cover" /> :


              <ChefHat
                className="w-5 h-5 text-accent-sage"
                strokeWidth={1.75} />

              }
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 flex-wrap mb-1">
                      <p className="font-bold text-text text-sm leading-snug flex-1 min-w-0">
                        {r.title}
                      </p>
                      {r.aiGenerated &&
                <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </span>
                }
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-accent-sage/15 text-accent-sage px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {r.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.tags.slice(0, 2).map((t) =>
                <span
                  key={t}
                  className="text-[10px] font-bold text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                  
                          {t}
                        </span>
                )}
                      {r.tags.length > 2 &&
                <span className="text-[10px] font-bold text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                          +{r.tags.length - 2}
                        </span>
                }
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusToggle
                active={r.status === 'published'}
                onChange={() =>
                dispatch(contentSlice.actions.toggleRecipeStatus(r.id))
                } />
              
                    <div className="flex items-center gap-1">
                      <IconBtn
                  icon={Pencil}
                  ariaLabel="Edit"
                  onClick={() => {
                    setRecipeEditor({
                      ...r
                    });
                    setRecipeIsNew(false);
                  }} />
                
                      <IconBtn
                  icon={Copy}
                  ariaLabel="Duplicate"
                  onClick={() => {
                    dispatch(contentSlice.actions.duplicateRecipe(r.id));
                    toast.success('Recipe duplicated');
                  }} />
                
                      <IconBtn
                  icon={Trash2}
                  ariaLabel="Delete"
                  variant="danger"
                  onClick={() =>
                  setConfirmDelete({
                    kind: 'recipes',
                    id: r.id,
                    label: r.title
                  })
                  } />
                
                    </div>
                  </div>
                </motion.div>
          )
          }
          </div>
        }

        {/* ===== CATEGORIES ===== */}
        {tab === 'categories' &&
        <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => {
              const CategoryIcon = getCategoryIcon(c.name);
              return (
          <motion.div
            key={c.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-surface border border-border rounded-2xl p-4 relative">
            
                <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
              style={{
                background: c.color + '20',
                color: c.color
              }}>
              
                  <CategoryIcon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <p className="font-bold text-text text-sm mb-0.5">{c.name}</p>
                <p className="text-[11px] text-text-muted">
                  {c.recipeCount} recipes
                </p>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <IconBtn
                icon={Pencil}
                ariaLabel="Edit"
                onClick={() => {
                  setCategoryEditor({
                    ...c
                  });
                  setCategoryIsNew(false);
                }} />
              
                  <IconBtn
                icon={Trash2}
                ariaLabel="Delete"
                variant="danger"
                onClick={() =>
                setConfirmDelete({
                  kind: 'categories',
                  id: c.id,
                  label: c.name
                })
                } />
              
                </div>
              </motion.div>
              );
            })}
          </div>
        }

        {/* ===== LESSONS ===== */}
        {tab === 'lessons' &&
        <div className="flex flex-col gap-2">
            {lessons.map((l) =>
          <motion.div
            key={l.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-surface border border-border rounded-2xl p-3 flex items-center gap-3">
            
                <div className="w-10 h-10 rounded-xl bg-accent-sage/15 text-accent-sage flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text text-sm">{l.title}</p>
                  <p className="text-[11px] text-text-muted">
                    {l.module} · {l.duration}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusToggle
                active={l.status === 'published'}
                onChange={() =>
                dispatch(contentSlice.actions.toggleLessonStatus(l.id))
                } />
              
                  <div className="flex items-center gap-1">
                    <IconBtn
                  icon={Pencil}
                  ariaLabel="Edit"
                  onClick={() => {
                    setLessonEditor({
                      ...l
                    });
                    setLessonIsNew(false);
                  }} />
                
                    <IconBtn
                  icon={Trash2}
                  ariaLabel="Delete"
                  variant="danger"
                  onClick={() =>
                  setConfirmDelete({
                    kind: 'lessons',
                    id: l.id,
                    label: l.title
                  })
                  } />
                
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        }

        {/* ===== QUOTES ===== */}
        {tab === 'quotes' &&
        <>
            <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Display logic
              </p>
              <div className="flex gap-2 p-1 bg-surface-2 rounded-xl border border-border mb-3">
                {(
                  [
                    { id: 'random' as QuoteDisplayMode, label: 'Random' },
                    { id: 'scheduled' as QuoteDisplayMode, label: 'Scheduled' }
                  ] as const
                ).map((opt) => {
                  const active = (quoteDisplayMode ?? 'random') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        dispatch(contentSlice.actions.setQuoteDisplayMode(opt.id));
                        toast.success(
                          opt.id === 'random' ?
                            'Quotes rotate randomly each day' :
                            'Quotes show by weekday schedule'
                        );
                      }}
                      className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${active ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {(quoteDisplayMode ?? 'random') === 'random' ?
                  'A published quote is picked at random each day (same quote all day).' :
                  'Shows the quote assigned to today’s weekday. If none is set, falls back to random.'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
            {quotes.map((q) =>
          <motion.div
            key={q.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-surface border border-border rounded-2xl p-4">
            
                <Quote
              className="w-4 h-4 text-primary mb-2"
              strokeWidth={1.75} />
            
                <p className="text-sm italic text-text leading-snug mb-2">
                  "{q.text}"
                </p>
                {(q.scheduleDays?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {WEEKDAY_LABELS.map((label, dayIndex) =>
                      (q.scheduleDays ?? []).includes(dayIndex) ?
                      <span
                        key={label}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {label}
                      </span> :
                      null
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-text-muted">
                    — {q.author}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusToggle
                  active={q.status === 'published'}
                  onChange={() =>
                  dispatch(contentSlice.actions.toggleQuoteStatus(q.id))
                  } />
                
                    <IconBtn
                  icon={Pencil}
                  ariaLabel="Edit"
                  onClick={() => {
                    setQuoteEditor({
                      ...q
                    });
                    setQuoteIsNew(false);
                  }} />
                
                    <IconBtn
                  icon={Trash2}
                  ariaLabel="Delete"
                  variant="danger"
                  onClick={() =>
                  setConfirmDelete({
                    kind: 'quotes',
                    id: q.id,
                    label: q.text.slice(0, 30) + '...'
                  })
                  } />
                
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        </>
        }

        {/* ===== CHALLENGES ===== */}
        {tab === 'challenges' &&
        <div className="flex flex-col gap-2">
            {challenges.map((c) =>
          <button
            key={c.id}
            onClick={() => navigate(`/challenges/${c.id}`)}
            className="bg-surface border border-border rounded-2xl p-3 flex items-center gap-3 text-left hover:border-primary/30 transition-all">
            
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text text-sm">{c.title}</p>
                  <p className="text-[11px] text-text-muted line-clamp-1">
                    {c.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-sage/15 text-accent-sage px-1.5 py-0.5 rounded">
                  {c.participants} joined
                </span>
              </button>
          )}
          </div>
        }
      </div>

      {/* ===== RECIPE EDITOR ===== */}
      <RecipeEditorSheet
        recipe={recipeEditor}
        isNew={recipeIsNew}
        onClose={() => setRecipeEditor(null)}
        onSave={(r) => {
          if (recipeIsNew) {
            dispatch(contentSlice.actions.addRecipe(r));
            toast.success('Recipe created');
          } else {
            dispatch(contentSlice.actions.updateRecipe(r));
            toast.success('Recipe updated');
          }
          setRecipeEditor(null);
        }} />
      

      {/* ===== CATEGORY EDITOR ===== */}
      <CategoryEditorSheet
        category={categoryEditor}
        isNew={categoryIsNew}
        onClose={() => setCategoryEditor(null)}
        onSave={(c) => {
          if (categoryIsNew) {
            dispatch(contentSlice.actions.addCategory(c));
            toast.success('Category added');
          } else {
            dispatch(contentSlice.actions.updateCategory(c));
            toast.success('Category updated');
          }
          setCategoryEditor(null);
        }} />
      

      {/* ===== LESSON EDITOR ===== */}
      <LessonEditorSheet
        lesson={lessonEditor}
        isNew={lessonIsNew}
        onClose={() => setLessonEditor(null)}
        onSave={(l) => {
          if (lessonIsNew) {
            dispatch(contentSlice.actions.addLesson(l));
            toast.success('Lesson added');
          } else {
            dispatch(contentSlice.actions.updateLesson(l));
            toast.success('Lesson updated');
          }
          setLessonEditor(null);
        }} />
      

      {/* ===== QUOTE EDITOR ===== */}
      <QuoteEditorSheet
        quote={quoteEditor}
        isNew={quoteIsNew}
        onClose={() => setQuoteEditor(null)}
        onSave={(q) => {
          if (quoteIsNew) {
            dispatch(contentSlice.actions.addQuote(q));
            toast.success('Quote added');
          } else {
            dispatch(contentSlice.actions.updateQuote(q));
            toast.success('Quote updated');
          }
          setQuoteEditor(null);
        }} />
      

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete this item?"
        message={confirmDelete?.label}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const { kind, id } = confirmDelete;
          if (kind === 'recipes') dispatch(contentSlice.actions.deleteRecipe(id));
          else if (kind === 'categories')
            dispatch(contentSlice.actions.deleteCategory(id));
          else if (kind === 'lessons')
            dispatch(contentSlice.actions.deleteLesson(id));
          else if (kind === 'quotes')
            dispatch(contentSlice.actions.deleteQuote(id));
          setConfirmDelete(null);
          toast.success('Deleted');
        }} />
    </div>);

}
// ============ Subcomponents ============
function StatusToggle({
  active,
  onChange



}: {active: boolean;onChange: () => void;}) {
  return (
    <ToggleSwitch
      checked={active}
      onChange={() => onChange()}
      size="sm"
      aria-label={active ? 'Published' : 'Draft'} />
  );

}
function IconBtn({
  icon: Icon,
  onClick,
  ariaLabel,
  variant = 'default'








}: {icon: ComponentType<{className?: string;strokeWidth?: number;}>;onClick: () => void;ariaLabel: string;variant?: 'default' | 'danger';}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${variant === 'danger' ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-border text-text-muted hover:text-text hover:bg-surface-2'}`}>
      
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
    </button>);

}
function EmptyState({ text }: {text: string;}) {
  return (
    <div className="p-10 text-center text-sm text-text-muted bg-surface border border-border border-dashed rounded-2xl">
      {text}
    </div>);

}
function RecipeEditorSheet({
  recipe,
  isNew,
  onClose,
  onSave





}: {recipe: ContentRecipe | null;isNew: boolean;onClose: () => void;onSave: (r: ContentRecipe) => void;}) {
  const [local, setLocal] = useState<ContentRecipe | null>(null);
  useEffect(() => {
    setLocal(
      recipe ?
      {
        ...recipe
      } :
      null
    );
  }, [recipe]);
  if (!local) return null;
  const toggleTag = (t: string) => {
    setLocal({
      ...local,
      tags: local.tags.includes(t) ?
      local.tags.filter((x) => x !== t) :
      [...local.tags, t]
    });
  };
  return (
    <SheetModal
      open={!!recipe}
      title={isNew ? 'Add recipe' : 'Edit recipe'}
      onClose={onClose}>
      
      <div className="flex flex-col gap-4">
        <ModalField label="Title">
          <input
            type="text"
            value={local.title}
            onChange={(e) =>
            setLocal({
              ...local,
              title: e.target.value
            })
            }
            placeholder="e.g. Ginger-Lime Cabbage Stir-Fry"
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>

        <ModalField label="Category">
          <select
            value={local.category}
            onChange={(e) =>
            setLocal({
              ...local,
              category: e.target.value
            })
            }
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none">
            
            {CATEGORY_OPTIONS.map((c) =>
            <option key={c} value={c}>
                {c}
              </option>
            )}
          </select>
        </ModalField>

        <ModalField label="Image URL">
          <div className="flex gap-2">
            <input
              type="text"
              value={local.image || ''}
              onChange={(e) =>
              setLocal({
                ...local,
                image: e.target.value
              })
              }
              placeholder="https://..."
              className="flex-1 h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
            
            <div className="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {local.image ?
              <img
                src={local.image}
                alt=""
                className="w-full h-full object-cover" /> :


              <ImageIcon
                className="w-4 h-4 text-text-muted"
                strokeWidth={1.75} />

              }
            </div>
          </div>
        </ModalField>

        <ModalField label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((t) => {
              const on = local.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full border transition-all ${on ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text hover:border-primary/40'}`}>
                  
                  {t}
                </button>);

            })}
          </div>
        </ModalField>

        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <ToggleSwitch
              label="Published"
              checked={local.status === 'published'}
              onChange={(on) =>
                setLocal({
                  ...local,
                  status: on ? 'published' : 'draft'
                })
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <ToggleSwitch
              label="AI"
              checked={local.aiGenerated}
              onChange={(aiGenerated) =>
                setLocal({
                  ...local,
                  aiGenerated
                })
              }
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (!local.title.trim()) {
              toast.error('Title required');
              return;
            }
            onSave({
              ...local,
              title: local.title.trim()
            });
          }}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          
          {isNew ? 'Create recipe' : 'Save changes'}
        </button>
      </div>
    </SheetModal>);

}
function CategoryEditorSheet({
  category,
  isNew,
  onClose,
  onSave





}: {category: ContentCategory | null;isNew: boolean;onClose: () => void;onSave: (c: ContentCategory) => void;}) {
  const [local, setLocal] = useState<ContentCategory | null>(null);
  useEffect(() => {
    setLocal(
      category ?
      {
        ...category
      } :
      null
    );
  }, [category]);
  if (!local) return null;
  const COLORS = ['#7E9568', '#2D1B5E', '#B89150', '#C9BDD9', '#EF4444'];
  return (
    <SheetModal
      open={!!category}
      title={isNew ? 'New category' : 'Edit category'}
      onClose={onClose}>
      
      <div className="flex flex-col gap-4">
        <ModalField label="Name">
          <input
            type="text"
            value={local.name}
            onChange={(e) =>
            setLocal({
              ...local,
              name: e.target.value
            })
            }
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>

        <ModalField label="Color">
          <div className="flex gap-2">
            {COLORS.map((c) =>
            <button
              key={c}
              type="button"
              onClick={() =>
              setLocal({
                ...local,
                color: c
              })
              }
              style={{
                background: c
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${local.color === c ? 'border-text scale-110' : 'border-transparent'}`} />

            )}
          </div>
        </ModalField>

        <button
          onClick={() => {
            if (!local.name.trim()) {
              toast.error('Name required');
              return;
            }
            onSave({
              ...local,
              name: local.name.trim()
            });
          }}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          
          {isNew ? 'Create category' : 'Save changes'}
        </button>
      </div>
    </SheetModal>);

}
function LessonEditorSheet({
  lesson,
  isNew,
  onClose,
  onSave





}: {lesson: ContentLesson | null;isNew: boolean;onClose: () => void;onSave: (l: ContentLesson) => void;}) {
  const [local, setLocal] = useState<ContentLesson | null>(null);
  useEffect(() => {
    setLocal(
      lesson ?
      {
        ...lesson
      } :
      null
    );
  }, [lesson]);
  if (!local) return null;
  return (
    <SheetModal
      open={!!lesson}
      title={isNew ? 'New lesson' : 'Edit lesson'}
      onClose={onClose}>
      
      <div className="flex flex-col gap-4">
        <ModalField label="Title">
          <input
            type="text"
            value={local.title}
            onChange={(e) =>
            setLocal({
              ...local,
              title: e.target.value
            })
            }
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>
        <ModalField label="Module">
          <input
            type="text"
            value={local.module}
            onChange={(e) =>
            setLocal({
              ...local,
              module: e.target.value
            })
            }
            placeholder="Module 1"
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>
        <ModalField label="Duration">
          <input
            type="text"
            value={local.duration}
            onChange={(e) =>
            setLocal({
              ...local,
              duration: e.target.value
            })
            }
            placeholder="5 min"
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>
        <ToggleSwitch
          label="Published"
          checked={local.status === 'published'}
          onChange={(on) =>
            setLocal({
              ...local,
              status: on ? 'published' : 'draft'
            })
          }
        />
        <button
          onClick={() => {
            if (!local.title.trim()) {
              toast.error('Title required');
              return;
            }
            onSave({
              ...local,
              title: local.title.trim()
            });
          }}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          
          {isNew ? 'Create lesson' : 'Save changes'}
        </button>
      </div>
    </SheetModal>);

}
function QuoteEditorSheet({
  quote,
  isNew,
  onClose,
  onSave





}: {quote: ContentQuote | null;isNew: boolean;onClose: () => void;onSave: (q: ContentQuote) => void;}) {
  const [local, setLocal] = useState<ContentQuote | null>(null);
  useEffect(() => {
    setLocal(
      quote ?
      {
        ...quote
      } :
      null
    );
  }, [quote]);
  if (!local) return null;
  return (
    <SheetModal
      open={!!quote}
      title={isNew ? 'New quote' : 'Edit quote'}
      onClose={onClose}>
      
      <div className="flex flex-col gap-4">
        <ModalField label="Quote">
          <textarea
            value={local.text}
            onChange={(e) =>
            setLocal({
              ...local,
              text: e.target.value
            })
            }
            rows={4}
            placeholder="Share an inspiring quote..."
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none" />
          
        </ModalField>
        <ModalField label="Author">
          <input
            type="text"
            value={local.author}
            onChange={(e) =>
            setLocal({
              ...local,
              author: e.target.value
            })
            }
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
          
        </ModalField>
        <ToggleSwitch
          label="Published"
          checked={local.status === 'published'}
          onChange={(on) =>
            setLocal({
              ...local,
              status: on ? 'published' : 'draft'
            })
          }
        />

        <ModalField label="Schedule days (for scheduled mode)">
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, dayIndex) => {
              const selected = (local.scheduleDays ?? []).includes(dayIndex);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const current = local.scheduleDays ?? [];
                    const next = selected ?
                      current.filter((d) => d !== dayIndex) :
                      [...current, dayIndex].sort((a, b) => a - b);
                    setLocal({ ...local, scheduleDays: next });
                  }}
                  className={`min-w-[2.5rem] h-9 px-2 rounded-lg text-xs font-bold border transition-all ${selected ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text hover:border-primary/40'}`}>
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Leave empty to only appear in random mode.
          </p>
        </ModalField>

        <button
          onClick={() => {
            if (!local.text.trim()) {
              toast.error('Quote text required');
              return;
            }
            onSave({
              ...local,
              text: local.text.trim(),
              scheduleDays: local.scheduleDays ?? []
            });
          }}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          
          {isNew ? 'Create quote' : 'Save changes'}
        </button>
      </div>
    </SheetModal>);

}