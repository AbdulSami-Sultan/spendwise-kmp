import React from 'react';
import { StatusBar } from '../ios/StatusBar';
import { DynamicIsland } from '../ios/DynamicIsland';
import { TabBar } from '../ios/TabBar';
import { DynamicIslandNotification, ViewTab } from '../../types';

interface IPhoneMockupProps {
  children: React.ReactNode;
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAddExpense: () => void;
  dynamicIslandNotification: DynamicIslandNotification | null;
  dailySafeStr: string;
  onClearNotification: () => void;
  isBare?: boolean; // when embedded in responsive mode without metallic bezel
}

export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  children,
  currentTab,
  onSelectTab,
  onOpenAddExpense,
  dynamicIslandNotification,
  dailySafeStr,
  onClearNotification,
  isBare = false,
}) => {
  if (isBare) {
    return (
      <div className="w-full h-full max-w-md mx-auto flex flex-col bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-white relative overflow-hidden select-none">
        <StatusBar useLiveTime />
        <DynamicIsland
          notification={dynamicIslandNotification}
          dailySafe={dailySafeStr}
          onClearNotification={onClearNotification}
        />
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {children}
        </main>
        <TabBar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          onOpenAddExpense={onOpenAddExpense}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto select-none">
      {/* iPhone 16 Pro Natural Titanium Outer Chassis */}
      <div className="relative w-[385px] h-[795px] rounded-[54px] p-[11px] bg-gradient-to-b from-[#8E8B85] via-[#65635F] to-[#484643] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40">
        {/* Antenna bands */}
        <div className="absolute -left-[2px] top-28 w-[2px] h-2 bg-neutral-400/40 rounded-full" />
        <div className="absolute -left-[2px] bottom-28 w-[2px] h-2 bg-neutral-400/40 rounded-full" />
        <div className="absolute -right-[2px] top-32 w-[2px] h-2 bg-neutral-400/40 rounded-full" />

        {/* Action Button & Volume Rockers */}
        <div className="absolute -left-[14px] top-24 w-[3px] h-8 bg-[#52504D] rounded-l-md shadow-xs" />
        <div className="absolute -left-[14px] top-36 w-[3px] h-12 bg-[#52504D] rounded-l-md shadow-xs" />
        <div className="absolute -left-[14px] top-52 w-[3px] h-12 bg-[#52504D] rounded-l-md shadow-xs" />

        {/* Power Button */}
        <div className="absolute -right-[14px] top-40 w-[3px] h-16 bg-[#52504D] rounded-r-md shadow-xs" />

        {/* Inner Black Bezel */}
        <div className="relative w-full h-full rounded-[44px] overflow-hidden bg-black p-[2px] flex flex-col">
          {/* Screen Glass Area */}
          <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-white flex flex-col">
            {/* iOS Status Bar */}
            <StatusBar useLiveTime />

            {/* Dynamic Island */}
            <DynamicIsland
              notification={dynamicIslandNotification}
              dailySafe={dailySafeStr}
              onClearNotification={onClearNotification}
            />

            {/* Main Application Screen */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
              {children}
            </main>

            {/* Bottom Tab Bar */}
            <TabBar
              currentTab={currentTab}
              onSelectTab={onSelectTab}
              onOpenAddExpense={onOpenAddExpense}
            />

            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none z-50">
              <div className="w-32 h-1 bg-black/40 dark:bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
