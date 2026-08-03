import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminSlice, AIRecipe } from '../../store/adminSlice';
import {
  ArrowLeft,
  Sparkles,
  Pencil,
  Trash2,
  Heart,
  X,
  Loader2,
  Wand2 } from
'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SheetModal, ConfirmModal } from '../../components/modals';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Juice',
  'Smoothie',
  'Dessert',
  'Soup',
  'Salad'
];
const RECIPE_TYPE_PRESETS = ['Any', ...CATEGORIES];
const COUNT_PRESETS = [3, 5, 10, 15, 20];
const DIETARY_PRESETS = [
  'Any',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
  'Mediterranean',
  'Halal',
  'Nut-Free',
  'Anti-Inflammatory',
  'Whole-Food'
];

type GenFormState = {
  recipeTypePreset: string;
  customRecipeType: string;
  recipeCount: number;
  dietarySelected: string[];
  customDietary: string[];
  customDietaryInput: string;
  specificRequest: string;
};

const defaultGenForm = (): GenFormState => ({
  recipeTypePreset: 'Any',
  customRecipeType: '',
  recipeCount: 5,
  dietarySelected: ['Any'],
  customDietary: [],
  customDietaryInput: '',
  specificRequest: ''
});

function resolveRecipeType(form: GenFormState): string {
  const custom = form.customRecipeType.trim();
  if (custom) return custom;
  if (form.recipeTypePreset !== 'Any') return form.recipeTypePreset;
  return 'Any';
}

function resolveDietaryFocus(form: GenFormState): string[] {
  if (form.dietarySelected.includes('Any') && form.customDietary.length === 0) {
    return [];
  }
  return [
    ...form.dietarySelected.filter((d) => d !== 'Any'),
    ...form.customDietary
  ];
}

function buildGenerationPrompt(form: GenFormState): string {
  const parts: string[] = [];
  const type = resolveRecipeType(form);
  if (type !== 'Any') parts.push(`Recipe type: ${type}`);
  const dietary = resolveDietaryFocus(form);
  if (dietary.length) parts.push(`Dietary focus: ${dietary.join(', ')}`);
  if (form.specificRequest.trim()) {
    parts.push(`Specific request: ${form.specificRequest.trim()}`);
  }
  return parts.join('. ') || 'Balanced family-friendly recipes';
}

function categoryFromType(type: string, prompt: string): string {
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === type.toLowerCase()
  );
  if (match) return match;
  const lower = `${type} ${prompt}`.toLowerCase();
  if (lower.includes('juice')) return 'Juice';
  if (lower.includes('smoothie')) return 'Smoothie';
  if (lower.includes('breakfast') || lower.includes('oat')) return 'Breakfast';
  if (lower.includes('lunch') || lower.includes('bowl')) return 'Lunch';
  if (lower.includes('dinner')) return 'Dinner';
  if (lower.includes('soup')) return 'Soup';
  if (lower.includes('salad')) return 'Salad';
  if (lower.includes('dessert')) return 'Dessert';
  return 'Snack';
}

const sampleGenerated = (
  prompt: string,
  form: GenFormState,
  index: number,
  total: number
): AIRecipe => {
  const type = resolveRecipeType(form);
  const category = categoryFromType(type, prompt);
  const base =
    prompt
      .split(/\s+/)
      .slice(0, 6)
      .join(' ')
      .replace(/[^a-zA-Z0-9 ]/g, '') || `${category} Recipe`;
  const title =
    total > 1 ?
      `${base.charAt(0).toUpperCase() + base.slice(1)} #${index + 1}`
    : base.charAt(0).toUpperCase() + base.slice(1);

  return {
    id: `ar-${Date.now()}-${index}`,
    title,
    prompt,
    category,
    ingredients: [
      '2 cups leafy greens or seasonal vegetables',
      '1 cup chopped fruit or whole grains',
      '1 tbsp seeds (chia or flax)',
      '1 cup water or nut milk',
      '1 tsp lemon juice or apple cider vinegar',
      'Salt, pepper, and herbs to taste'
    ],
    steps: [
      'Wash and prep all ingredients.',
      'Combine in a blender, bowl, or pan as appropriate.',
      'Cook or process until desired texture is reached.',
      'Taste and adjust seasoning or sweetness.',
      'Serve immediately for best flavor.'
    ],
    createdAt: 'just now',
    favorite: false
  };
};

function PillButton({
  active,
  onClick,
  disabled,
  children
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
        active ?
          'bg-primary text-white border-primary'
        : 'bg-surface border-border text-text hover:border-primary/40'
      }`}>
      {children}
    </button>
  );
}
export function AdminRecipes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { aiRecipes } = useSelector((state: RootState) => state.admin);
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState<GenFormState>(defaultGenForm);
  const [generating, setGenerating] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<AIRecipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<AIRecipe | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  if (!user || user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/home" replace />;
  }
  const closeGenerator = () => {
    if (generating) return;
    setGenOpen(false);
    setGenForm(defaultGenForm());
  };

  const setRecipeCount = (n: number) => {
    const clamped = Math.min(25, Math.max(1, n));
    setGenForm((f) => ({ ...f, recipeCount: clamped }));
  };

  const selectRecipeType = (preset: string) => {
    setGenForm((f) => ({
      ...f,
      recipeTypePreset: preset,
      customRecipeType: preset === 'Any' ? f.customRecipeType : ''
    }));
  };

  const toggleDietary = (label: string) => {
    setGenForm((f) => {
      if (label === 'Any') {
        return { ...f, dietarySelected: ['Any'] };
      }
      const withoutAny = f.dietarySelected.filter((d) => d !== 'Any');
      const next = withoutAny.includes(label) ?
        withoutAny.filter((d) => d !== label)
      : [...withoutAny, label];
      return {
        ...f,
        dietarySelected: next.length === 0 ? ['Any'] : next
      };
    });
  };

  const addCustomDietary = () => {
    const value = genForm.customDietaryInput.trim();
    if (!value) return;
    setGenForm((f) => ({
      ...f,
      customDietary: f.customDietary.includes(value) ?
        f.customDietary
      : [...f.customDietary, value],
      customDietaryInput: '',
      dietarySelected: f.dietarySelected.filter((d) => d !== 'Any')
    }));
  };

  const handleGenerate = () => {
    const count = genForm.recipeCount;
    const prompt = buildGenerationPrompt(genForm);
    setGenerating(true);
    setTimeout(() => {
      const created: AIRecipe[] = [];
      for (let i = 0; i < count; i++) {
        const recipe = sampleGenerated(prompt, genForm, i, count);
        dispatch(adminSlice.actions.addAIRecipe(recipe));
        created.push(recipe);
      }
      setGenerating(false);
      setGenOpen(false);
      setGenForm(defaultGenForm());
      if (created.length === 1) setViewRecipe(created[0]);
      toast.success(
        created.length === 1 ?
          'Recipe generated'
        : `${created.length} recipes generated`
      );
    }, 1400 + count * 120);
  };

  const selectedTypeLabel = resolveRecipeType(genForm);
  const handleSaveEdit = () => {
    if (!editRecipe) return;
    if (!editRecipe.title.trim()) {
      toast.error('Title required');
      return;
    }
    dispatch(adminSlice.actions.updateAIRecipe(editRecipe));
    setEditRecipe(null);
    toast.success('Recipe updated');
  };
  const handleDelete = (id: string) => {
    dispatch(adminSlice.actions.deleteAIRecipe(id));
    setConfirmDelete(null);
    setViewRecipe(null);
    toast.success('Recipe deleted');
  };
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
      <div className="h-16 px-4 flex items-center justify-between border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors">
          
          <ArrowLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-base font-bold text-text">AI Recipes</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-5">
        <button
          onClick={() => setGenOpen(true)}
          className="w-full bg-primary text-white rounded-2xl p-4 shadow-md shadow-primary/20 flex items-center gap-3 hover:bg-primary-hover transition-all">
          
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-base">Generate a new recipe</p>
            <p className="text-xs opacity-80">
              Choose type, diet, and count — AI builds your recipes.
            </p>
          </div>
          <Wand2 className="w-5 h-5 opacity-80" strokeWidth={1.75} />
        </button>

        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Generated recipes
          </h2>
          <span className="text-xs text-text-muted font-medium">
            {aiRecipes.length} total
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {aiRecipes.length === 0 ?
          <div className="p-10 text-center text-sm text-text-muted bg-surface border border-border border-dashed rounded-2xl">
              No AI recipes yet — generate your first one.
            </div> :

          aiRecipes.map((r) =>
          <motion.button
            key={r.id}
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            onClick={() => setViewRecipe(r)}
            className="bg-surface border border-border rounded-2xl p-4 text-left hover:border-primary/30 transition-all">
            
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent-sage/15 text-accent-sage flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text text-sm leading-tight mb-1">
                        {r.title}
                      </p>
                      <p className="text-xs text-text-muted line-clamp-1">
                        {r.prompt}
                      </p>
                    </div>
                  </div>
                  {r.favorite &&
              <Heart className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />
              }
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {r.category}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {r.createdAt}
                  </span>
                  <span className="ml-auto text-[11px] text-text-muted">
                    {r.ingredients.length} ingredients · {r.steps.length} steps
                  </span>
                </div>
              </motion.button>
          )
          }
        </div>
      </div>

      <SheetModal
        open={genOpen}
        onClose={closeGenerator}
        closeOnOverlay={!generating}
        wide
        panelClassName="max-h-[92vh]"
        header={
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-text">AI generated recipes</h3>
            </div>
            {!generating && (
              <button
                type="button"
                onClick={closeGenerator}
                className="p-2 -mr-2 text-text-muted hover:text-text"
                aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        }>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_7.5rem]">
            <div>
              <p className="text-sm font-bold text-text mb-2">Recipe Type</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {RECIPE_TYPE_PRESETS.map((preset) => (
                  <PillButton
                    key={preset}
                    active={
                      genForm.recipeTypePreset === preset &&
                      !genForm.customRecipeType.trim()
                    }
                    disabled={generating}
                    onClick={() => selectRecipeType(preset)}>
                    {preset}
                  </PillButton>
                ))}
              </div>
              <input
                type="text"
                value={genForm.customRecipeType}
                onChange={(e) =>
                  setGenForm((f) => ({
                    ...f,
                    customRecipeType: e.target.value,
                    recipeTypePreset: e.target.value.trim() ? 'Any' : f.recipeTypePreset
                  }))
                }
                disabled={generating}
                placeholder="Or type a custom recipe type (e.g. 'High-protein meal prep', 'Post-workout snacks', 'Kids lunches')"
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-sm text-text placeholder:text-text-muted focus:border-primary outline-none disabled:opacity-50"
              />
              <p className="text-xs text-text-muted mt-1.5">
                Selected: {selectedTypeLabel}
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-text mb-2">Number of Recipes</p>
              <input
                type="number"
                min={1}
                max={25}
                value={genForm.recipeCount}
                onChange={(e) => setRecipeCount(Number(e.target.value) || 1)}
                disabled={generating}
                className="w-full h-14 px-3 rounded-xl bg-surface-2 border border-border text-2xl font-bold text-text text-center focus:border-primary outline-none disabled:opacity-50 mb-2"
              />
              <div className="flex flex-wrap gap-1">
                {COUNT_PRESETS.map((n) => (
                  <PillButton
                    key={n}
                    active={genForm.recipeCount === n}
                    disabled={generating}
                    onClick={() => setRecipeCount(n)}>
                    {n}
                  </PillButton>
                ))}
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">
                Enter any number from 1 to 25
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-text">Dietary Focus</p>
            <p className="text-xs text-text-muted mb-2">
              Select from presets or add your own
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DIETARY_PRESETS.map((label) => (
                <PillButton
                  key={label}
                  active={genForm.dietarySelected.includes(label)}
                  disabled={generating}
                  onClick={() => toggleDietary(label)}>
                  {label}
                </PillButton>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={genForm.customDietaryInput}
                onChange={(e) =>
                  setGenForm((f) => ({
                    ...f,
                    customDietaryInput: e.target.value
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomDietary();
                  }
                }}
                disabled={generating}
                placeholder="Add custom dietary focus..."
                className="flex-1 h-11 px-3 rounded-xl bg-surface-2 border border-border text-sm focus:border-primary outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addCustomDietary}
                disabled={generating || !genForm.customDietaryInput.trim()}
                className="h-11 px-4 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors disabled:opacity-50">
                Add
              </button>
            </div>
            {genForm.customDietary.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genForm.customDietary.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {tag}
                    <button
                      type="button"
                      disabled={generating}
                      onClick={() =>
                        setGenForm((f) => ({
                          ...f,
                          customDietary: f.customDietary.filter((d) => d !== tag),
                          dietarySelected:
                            f.customDietary.length === 1 &&
                            f.dietarySelected.filter((d) => d !== 'Any').length === 0 ?
                              ['Any']
                            : f.dietarySelected
                        }))
                      }
                      className="hover:text-primary-hover"
                      aria-label={`Remove ${tag}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-text mb-2">
              Specific Request{' '}
              <span className="font-normal text-text-muted">(optional)</span>
            </p>
            <textarea
              value={genForm.specificRequest}
              onChange={(e) =>
                setGenForm((f) => ({ ...f, specificRequest: e.target.value }))
              }
              disabled={generating}
              rows={4}
              placeholder="e.g. 'vegetable dense dinners under 500 calories', 'quick 15-minute family meals', 'recipes using pantry staples only'..."
              className="w-full p-3 rounded-xl bg-surface-2 border border-border text-sm focus:border-primary outline-none resize-y min-h-[5rem] disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-12 bg-primary text-white rounded-full font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {generating ?
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            : <>
                <Sparkles className="w-4 h-4" />
                Generate {genForm.recipeCount} Recipe
                {genForm.recipeCount === 1 ? '' : 's'}
              </>
            }
          </button>
        </div>
      </SheetModal>

      <SheetModal
        open={!!viewRecipe && !editRecipe}
        onClose={() => setViewRecipe(null)}
        hideHeader
        panelClassName="max-h-[88vh]">
        {viewRecipe && (
          <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {viewRecipe.category}
                  </span>
                  <h2 className="text-xl font-extrabold text-text mt-2 leading-tight">
                    {viewRecipe.title}
                  </h2>
                  <p className="text-xs text-text-muted mt-1 italic">
                    "{viewRecipe.prompt}"
                  </p>
                </div>
                <button
                onClick={() => setViewRecipe(null)}
                className="p-2 -mr-2 text-text-muted hover:text-text">
                
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-5">
                <button
                onClick={() =>
                dispatch(
                  adminSlice.actions.toggleAIRecipeFavorite(viewRecipe.id)
                )
                }
                className={`flex-1 h-10 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${viewRecipe.favorite ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-border text-text hover:bg-surface-2'}`}>
                
                  <Heart
                  className={`w-3.5 h-3.5 ${viewRecipe.favorite ? 'fill-red-500' : ''}`} />
                
                  {viewRecipe.favorite ? 'Favorited' : 'Favorite'}
                </button>
                <button
                onClick={() =>
                setEditRecipe({
                  ...viewRecipe
                })
                }
                className="flex-1 h-10 rounded-lg border border-border text-xs font-bold text-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5">
                
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                onClick={() => setConfirmDelete(viewRecipe.id)}
                className="w-10 h-10 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center">
                
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Ingredients
              </h3>
              <ul className="bg-surface-2 rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                {viewRecipe.ingredients.map((ing, i) =>
              <li
                key={i}
                className="text-sm text-text flex items-center gap-2">
                
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-sage flex-shrink-0" />
                    {ing}
                  </li>
              )}
              </ul>

              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Steps
              </h3>
              <ol className="flex flex-col gap-3">
                {viewRecipe.steps.map((step, i) =>
              <li key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-text leading-relaxed flex-1">
                      {step}
                    </p>
                  </li>
              )}
              </ol>
          </>
        )}
      </SheetModal>

      <SheetModal
        open={!!editRecipe}
        onClose={() => setEditRecipe(null)}
        title="Edit recipe"
        panelClassName="max-h-[88vh]">
        {editRecipe && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Title
                  </label>
                  <input
                  type="text"
                  value={editRecipe.title}
                  onChange={(e) =>
                  setEditRecipe({
                    ...editRecipe,
                    title: e.target.value
                  })
                  }
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <select
                  value={editRecipe.category}
                  onChange={(e) =>
                  setEditRecipe({
                    ...editRecipe,
                    category: e.target.value
                  })
                  }
                  className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none">
                  
                    {CATEGORIES.map((c) =>
                  <option key={c} value={c}>
                        {c}
                      </option>
                  )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Ingredients (one per line)
                  </label>
                  <textarea
                  value={editRecipe.ingredients.join('\n')}
                  onChange={(e) =>
                  setEditRecipe({
                    ...editRecipe,
                    ingredients: e.target.value.
                    split('\n').
                    filter((l) => l.trim())
                  })
                  }
                  rows={6}
                  className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none" />
                
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Steps (one per line)
                  </label>
                  <textarea
                  value={editRecipe.steps.join('\n')}
                  onChange={(e) =>
                  setEditRecipe({
                    ...editRecipe,
                    steps: e.target.value.
                    split('\n').
                    filter((l) => l.trim())
                  })
                  }
                  rows={6}
                  className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none" />
                
                </div>

                <button
                onClick={handleSaveEdit}
                className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all mt-2">
                
                  Save changes
                </button>
              </div>
        )}
      </SheetModal>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete this recipe?"
        message="This action can't be undone."
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
      />
    </div>);

}