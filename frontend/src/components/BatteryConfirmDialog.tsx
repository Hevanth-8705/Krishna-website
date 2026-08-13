import { ShieldAlert, Zap, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BatteryConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatteryConfirmDialog({
  isOpen,
  title,
  description,
  warningText,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel
}: BatteryConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Dialog card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-panel w-full max-w-sm p-6 relative overflow-hidden bg-black/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 flex flex-col gap-4"
        >
          {/* Accent glow */}
          <div className={`absolute top-0 left-0 w-full h-1 ${isDanger ? 'bg-red-500' : 'bg-[#00E5FF]'}`} />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-[#00E5FF]/10 text-[#00E5FF]'}`}>
                {isDanger ? <AlertTriangle size={18} /> : <Zap size={18} />}
              </div>
              <h3 className="text-md font-bold text-white/90 font-sans tracking-tight">{title}</h3>
            </div>
            <button 
              onClick={onCancel}
              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-sans mt-1">
            {description}
          </p>

          {warningText && (
            <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-normal ${
              isDanger 
                ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-300 animate-pulse'
            }`}>
              <div className="font-bold flex items-center gap-1.5 uppercase mb-1">
                <ShieldAlert size={12} /> System Cautionary Advisory
              </div>
              {warningText}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-95 border ${
                isDanger 
                  ? 'bg-red-500/20 text-red-400 border-red-500/35 hover:bg-red-500/30' 
                  : 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/35 hover:bg-[#00E5FF]/30'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
