import React from 'react';
export function MobileFrame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen bg-surface-2 flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-background relative overflow-hidden shadow-2xl sm:border-x border-border flex flex-col">
        {children}
      </div>
    </div>);

}