import React from 'react';
import { Check } from 'lucide-react';

type IngredientChecklistProps = {
  ingredients: string[];
  checkedIndices: number[];
  onToggle: (index: number) => void;
  onReset?: () => void;
};

export function IngredientChecklist({
  ingredients,
  checkedIndices,
  onToggle,
  onReset
}: IngredientChecklistProps) {
  const checkedSet = new Set(checkedIndices);
  const checkedCount = checkedIndices.length;
  const total = ingredients.length;
  const allChecked = total > 0 && checkedCount === total;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-text">Ingredients</h2>
          <span className="text-xs font-bold text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
            {checkedCount}/{total}
          </span>
        </div>
        {checkedCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-primary hover:underline">
            Reset
          </button>
        )}
      </div>

      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-accent-sage rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-2">
        {ingredients.map((item, index) => {
          const checked = checkedSet.has(index);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => onToggle(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                  checked ?
                    'bg-accent-sage/10 border-accent-sage/30' :
                    'bg-surface border-border hover:border-primary/30 hover:bg-surface-2'
                }`}
                aria-pressed={checked}>
                <span
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    checked ?
                      'bg-accent-sage border-accent-sage' :
                      'border-border bg-surface'
                  }`}
                  aria-hidden>
                  {checked && (
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  )}
                </span>
                <span
                  className={`text-sm leading-snug flex-1 ${
                    checked ? 'text-text-muted line-through' : 'text-text'
                  }`}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {allChecked && (
        <p className="text-xs font-semibold text-accent-sage mt-3 text-center">
          All ingredients checked — ready to cook!
        </p>
      )}
    </div>
  );
}
