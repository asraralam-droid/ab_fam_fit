import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { PillarOutletContext } from './pillarOutletContext';
import { productsForPillar } from './pillarProductData';

export function PillarProducts() {
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
  const products = productsForPillar(pillarId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Recommended Products</h2>
        <p className="text-sm text-text-muted mt-1">
          Tools that support this path — preview only for now.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {products.map((product) => {
          const open = expandedId === product.id;
          return (
            <li
              key={product.id}
              className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="p-3.5 flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text truncate">
                      {product.name}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex-shrink-0">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {product.note}
                  </p>
                  {open && (
                    <p className="text-xs text-text mt-2 leading-relaxed">
                      Purchase and unlock flows for this product aren&apos;t
                      connected yet. When available, owning it will unlock the
                      matching tools inside your account.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedId(open ? null : product.id);
                      if (!open) {
                        toast.message('Demo preview — checkout coming later');
                      }
                    }}
                    className="mt-3 text-xs font-bold text-primary">
                    {open ? 'Hide details' : 'Learn more'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
