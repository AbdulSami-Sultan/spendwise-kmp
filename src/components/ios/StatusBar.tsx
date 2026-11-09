import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

interface StatusBarProps {
  useLiveTime?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ useLiveTime = false }) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    if (useLiveTime) {
      const update = () => {
        const d = new Date();
        const hours = d.getHours();
        const mins = d.getMinutes().toString().padStart(2, '0');
        setTimeStr(`${hours}:${mins}`);
      };
      update();
      const interval = setInterval(update, 10000);
      return () => clearInterval(interval);
    }
  }, [useLiveTime]);

  return (
    <div className="flex items-center justify-between px-7 pt-3.5 pb-1 select-none text-slate-900 dark:text-white font-semibold text-xs tracking-tight z-40">
      {/* Left: Time */}
      <div className="w-14 text-left font-semibold text-[13px] tracking-tight">
        {timeStr}
      </div>

      {/* Middle spacing reserved for Dynamic Island */}
      <div className="flex-1" />

      {/* Right: Cellular, Wifi, Battery */}
      <div className="flex items-center gap-1.5 w-14 justify-end">
        {/* Cellular signal bars */}
        <div className="flex items-end gap-[1.5px] h-2.5">
          <div className="w-[2.5px] h-1 bg-current rounded-[0.5px]" />
          <div className="w-[2.5px] h-1.5 bg-current rounded-[0.5px]" />
          <div className="w-[2.5px] h-2 bg-current rounded-[0.5px]" />
          <div className="w-[2.5px] h-2.5 bg-current rounded-[0.5px]" />
        </div>

        {/* Wifi */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />

        {/* iOS Battery icon */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 rounded-[3px] border border-current p-[1px] flex items-center">
            <div className="w-3.5 h-full bg-current rounded-[1.5px]" />
          </div>
          <div className="w-[1px] h-1 bg-current rounded-r-[0.5px] -ml-[0.5px]" />
        </div>
      </div>
    </div>
  );
};
