import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Mic, ShieldAlert, BookOpen, Hexagon, UserCheck, Eye, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import OSLogo from '../assets/images/krishna_web_os_logo_1780063756861.png';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'User Profile', path: '/profile', icon: UserCheck },
  { name: 'Krishna Core', path: '/core', icon: BrainCircuit },
  { name: 'Krishna Vision', path: '/vision', icon: Eye },
  { name: 'Krishna Agent', path: '/agent', icon: Zap },
  { name: 'Voice Command', path: '/voice', icon: Mic },
  { name: 'Krishna Learn', path: '/learn', icon: BookOpen },
  { name: 'Guardian OS', path: '/guardian', icon: ShieldAlert },
  { name: 'Universal Life OS', path: '/ulos', icon: Hexagon },
];

export function Sidebar() {
  return (
    <aside className="w-16 md:w-64 border-r border-[#00E5FF]/10 glass-panel border-y-0 border-l-0 rounded-none flex-shrink-0 flex flex-col z-20">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#00E5FF]/10">
        <div className="relative flex items-center justify-center">
          <img src={OSLogo} alt="KRISHNA_OS Logo" className="w-8 h-8 hidden md:block rounded-full object-cover" />
          <img src={OSLogo} alt="KRISHNA_OS Logo" className="w-6 h-6 md:hidden rounded-full object-cover" />
          <span className="absolute inset-0 bg-[#00E5FF] blur-md opacity-30 rounded-full animate-pulse z-[-1]"></span>
        </div>
        <span className="font-mono font-bold tracking-widest ml-3 hidden md:block select-none bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          KRISHNA_OS
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-2 md:px-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group relative',
                isActive
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 border border-[#00E5FF]/30 bg-[#00E5FF]/5 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#00E5FF]" : "text-gray-400 group-hover:text-white")} />
                <span className="font-medium hidden md:block text-sm tracking-wide">{item.name}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#00E5FF] rounded-r-md neural-glow hidden md:block"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto hidden md:block">
        <NavLink to="/guardian" className="block">
          <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:bg-[#FF3B3B]/20 transition-colors">
            <ShieldAlert className="w-5 h-5 text-[#FF3B3B] mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#FF3B3B]">SHIELD Security</h4>
              <p className="text-xs text-[#FF3B3B]/70 mt-1">Monitoring active threats</p>
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
