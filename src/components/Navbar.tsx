import { Activity, LayoutDashboard, Map, Megaphone, MessageSquarePlus, Search, User } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'report', label: 'Report a Problem', icon: Megaphone },
  { id: 'community', label: 'Community Updates', icon: MessageSquarePlus },
];

export function Navbar({ activeView, onNavigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <span className="block text-[15px] font-bold leading-tight text-slate-900">
              CityPulse
            </span>
            <span className="block text-[10px] font-medium leading-tight text-slate-400">
              Know what's happening around you
            </span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <Search className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <User className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
