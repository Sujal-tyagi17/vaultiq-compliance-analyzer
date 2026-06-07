import React from 'react'

export default function Header({ title }) {
  return (
    <header className="flex justify-between items-center w-full h-16 px-margin-desktop sticky top-0 bg-surface/80 backdrop-blur-xl border-b border-outline-variant z-40">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-primary">{title}</h2>
        <div className="px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">System Online</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="bg-surface-container-lowest border border-outline-variant rounded px-10 py-1 text-sm focus:border-primary focus:ring-0 w-64 transition-all outline-none"
            placeholder="Search knowledge vault..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  )
}
