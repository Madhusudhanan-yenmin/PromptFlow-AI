import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Layers, History as HistoryIcon } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'Create Workspace', icon: PlusCircle },
    { to: '/results/latest', label: 'Results', icon: Layers },
    { to: '/history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-61px)] glass-panel border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
        <p className="font-semibold mb-1">Architecture Ready</p>
        <p className="text-slate-400">FastAPI backend & PyMongo structure configured. AI engines ready to connect in phase 2.</p>
      </div>
    </aside>
  );
};
