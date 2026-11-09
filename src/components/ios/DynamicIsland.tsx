import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, Camera, DollarSign } from 'lucide-react';
import { DynamicIslandNotification } from '../../types';

interface DynamicIslandProps {
  notification: DynamicIslandNotification | null;
  dailySafe: string;
  onClearNotification: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  notification,
  dailySafe,
  onClearNotification,
}) => {
  const [isExpandedManually, setIsExpandedManually] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClearNotification();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [notification, onClearNotification]);

  const activeContent = notification || (isExpandedManually ? {
    id: 'safe-spend',
    title: 'Daily Safe-to-Spend',
    subtitle: `${dailySafe} remaining today`,
    iconType: 'budget' as const,
    amount: dailySafe,
  } : null);

  return (
    <div className="relative z-50 flex justify-center w-full pt-2">
      <motion.div
        layout
        onClick={() => {
          if (!notification) {
            setIsExpandedManually(!isExpandedManually);
          }
        }}
        initial={false}
        animate={{
          width: activeContent ? 280 : 124,
          height: activeContent ? 44 : 32,
          borderRadius: 24,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="bg-black text-white px-3 flex items-center justify-between shadow-2xl cursor-pointer select-none overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {activeContent ? (
            <motion.div
              key={activeContent.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-between w-full text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  {activeContent.iconType === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {activeContent.iconType === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {activeContent.iconType === 'camera' && <Camera className="w-3.5 h-3.5 text-sky-400" />}
                  {activeContent.iconType === 'budget' && <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white truncate text-[11px] leading-tight">
                    {activeContent.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate leading-tight">
                    {activeContent.subtitle}
                  </div>
                </div>
              </div>

              {activeContent.amount && (
                <div className="shrink-0 font-mono font-semibold text-emerald-400 text-xs ml-2 tabular-nums">
                  {activeContent.amount}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-between w-full px-1">
              {/* TrueDepth camera & sensor array styling */}
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/70 border border-indigo-900/40" />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
