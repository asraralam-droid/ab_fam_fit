import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { recipesSlice } from '../../store/slices';
import { ArrowLeft, Heart, Clock, ChefHat, Users, Plus } from 'lucide-react';
import { IngredientChecklist } from '../../components/recipes/IngredientChecklist';

export function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recipe = useSelector((state: RootState) =>
    state.recipes.recipes.find((r) => r.id === id)
  );
  const isFavorite = useSelector((state: RootState) =>
    state.recipes.favorites.includes(id || '')
  );
  const checkedIndices = useSelector((state: RootState) =>
    id ? state.recipes.ingredientChecks?.[id] ?? [] : []
  );

  if (!recipe) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <p>Recipe not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary font-medium">
          Go back
        </button>
      </div>
    );
  }

  const handleFavorite = () => {
    if (id) dispatch(recipesSlice.actions.toggleFavorite(id));
  };

  const handleLog = () => {
    navigate('/log', {
      state: {
        prefill: recipe.title
      }
    });
  };

  const handleToggleIngredient = (index: number) => {
    if (!id) return;
    dispatch(
      recipesSlice.actions.toggleIngredientCheck({
        recipeId: id,
        index
      })
    );
  };

  const handleResetIngredients = () => {
    if (!id) return;
    dispatch(recipesSlice.actions.resetIngredientChecks(id));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-surface">
      <div className="relative h-72 w-full">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleFavorite}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 -mt-6 bg-surface rounded-t-3xl relative z-20 flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.dietary.map((diet) => (
            <span
              key={diet}
              className="px-2.5 py-1 bg-accent-sage/10 text-accent-sage text-xs font-bold rounded-md uppercase tracking-wider">
              {diet}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-text mb-2">{recipe.title}</h1>
        <p className="text-text-muted text-sm mb-6">
          Tap each ingredient as you gather or prep — your checklist saves
          automatically.
        </p>

        <div className="flex items-center justify-between py-4 border-y border-border mb-8">
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-text-muted">Prep</span>
            <span className="text-sm font-bold text-text">{recipe.prepTime}</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-text-muted">Difficulty</span>
            <span className="text-sm font-bold text-text">{recipe.difficulty}</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-text-muted">Servings</span>
            <span className="text-sm font-bold text-text">{recipe.servings}</span>
          </div>
        </div>

        <div className="mb-8">
          <IngredientChecklist
            ingredients={recipe.ingredients ?? []}
            checkedIndices={checkedIndices}
            onToggle={handleToggleIngredient}
            onReset={handleResetIngredients}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4">Instructions</h2>
          <div className="space-y-6">
            {(recipe.instructions ?? []).map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-text leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-border z-30 max-w-[420px] mx-auto">
        <button
          onClick={handleLog}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Log this meal
        </button>
      </div>
    </div>
  );
}
