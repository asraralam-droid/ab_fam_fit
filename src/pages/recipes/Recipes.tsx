import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Clock, ChefHat } from 'lucide-react';
export function Recipes() {
  const navigate = useNavigate();
  const { recipes, favorites } = useSelector(
    (state: RootState) => state.recipes
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDietary, setActiveDietary] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const categories = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Juices',
  'Soups'];

  const dietaryOptions = ['Vegan', 'GF', 'High-protein'];
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.
    toLowerCase().
    includes(searchQuery.toLowerCase());
    const matchesCategory =
    activeCategory === 'All' || recipe.category === activeCategory;
    const matchesDietary =
    !activeDietary || recipe.dietary.includes(activeDietary);
    const matchesFavorites = !showFavoritesOnly || favorites.includes(recipe.id);
    return (
      matchesSearch && matchesCategory && matchesDietary && matchesFavorites);

  });
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <div className="px-4 pt-6 pb-4 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-text mb-4">Recipes</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 hide-scrollbar">
            {categories.map((cat) =>
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-surface border border-border text-text hover:bg-surface-2'}`}>
              
                {cat}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {dietaryOptions.map((diet) =>
              <button
                key={diet}
                onClick={() =>
                setActiveDietary(activeDietary === diet ? null : diet)
                }
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${activeDietary === diet ? 'bg-accent-sage text-white' : 'bg-surface-2 text-text-muted hover:bg-border'}`}>
                
                  {diet}
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${showFavoritesOnly ? 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30' : 'bg-surface-2 text-text-muted hover:bg-border'}`}>
              
              <Heart
                className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-red-500' : ''}`} />
              
              Saved
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="px-4 py-2 grid grid-cols-2 gap-4">
        {filteredRecipes.length > 0 ?
        filteredRecipes.map((recipe) =>
        <div
          key={recipe.id}
          onClick={() => navigate(`/recipes/${recipe.id}`)}
          className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col">
          
              <div className="aspect-square relative">
                <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover" />
            
                {favorites.includes(recipe.id) &&
            <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
            }
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-text text-sm line-clamp-2 mb-2 flex-1">
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> {recipe.difficulty}
                  </span>
                </div>
              </div>
            </div>
        ) :

        <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text mb-1">
              No recipes found
            </h3>
            <p className="text-text-muted text-sm">
              Try adjusting your filters or search query.
            </p>
          </div>
        }
      </div>
    </div>);

}