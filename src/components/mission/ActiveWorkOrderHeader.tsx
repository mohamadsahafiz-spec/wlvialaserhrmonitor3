import React from 'react';
import { Building2, Cpu, Calendar, ShieldCheck, Zap, ArrowRight, Play, Clock, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { NavigationTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../theme/tokens';

interface ActiveWorkOrderHeaderProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenQuickMhc: () => void;
  engineerName?: string;
  avatarUrl?: string;
}

export const ActiveWorkOrderHeader: React.FC<ActiveWorkOrderHeaderProps> = ({
  onNavigate,
  onOpenQuickMhc,
  engineerName = 'Sahafiz',
  avatarUrl
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const themeCls = getThemeClasses(isDark);

  return (
    <div className={`p-6 md:p-7 rounded-2xl border transition-all duration-250 ${
      isDark 
        ? 'bg-[#20252B] border-[#2B323A]/80 text-[#F3F4F6]' 
        : 'bg-white border-slate-300/80 text-slate-900 shadow-sm'
    }`}>
      {/* Greeting & Work Order Meta Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-5 border-b ${
        isDark ? 'border-[#2B323A]/50' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <UserAvatar
            user={{ fullName: engineerName, avatarUrl }}
            size="lg"
            showStatus={true}
            status="Online"
          />
          <div>
            <span className={`text-[10px] font-mono tracking-wider font-bold uppercase block mb-0.5 ${
              isDark ? 'text-[#8B9DFF]' : 'text-indigo-700'
            }`}>
              WORK ORDER #WO-20260729-TSMC
            </span>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              Good morning, {engineerName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${
            isDark ? 'bg-[#7FD4A6]/10 text-[#7FD4A6] border border-[#7FD4A6]/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SLA-TSMC-2026 (99.8% Target)
          </span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Est. Completion: 11:30 AM UTC</span>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 items-stretch">
        {/* Core Operational Details */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D21] border-[#2B323A]/60' : 'bg-slate-50 border-slate-300/70'}`}>
              <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                CUSTOMER
              </span>
              <p className={`text-sm font-bold ${isDark ? 'text-[#8ECDF7]' : 'text-sky-800'}`}>
                TSMC — Taiwan Semiconductor
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>Fab 18A Cleanroom • Bay 4</p>
            </div>

            {/* Machine */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D21] border-[#2B323A]/60' : 'bg-slate-50 border-slate-300/70'}`}>
              <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                TARGET MACHINE
              </span>
              <p className={`text-sm font-bold ${isDark ? 'text-[#8B9DFF]' : 'text-indigo-800'}`}>
                TRUMPF TruMicro 7000 Series
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>SN: TRU-7070-8841 (MCH-TSMC-01)</p>
            </div>
          </div>

          {/* Today's Mission */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D21] border-[#2B323A]/60' : 'bg-slate-50 border-slate-300/70'}`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${
              isDark ? 'text-[#8B9DFF]' : 'text-indigo-700'
            }`}>
              TODAY'S MISSION
            </span>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
              Q3 Scheduled SLA Maintenance & DI Water Cooling Filter Replacement. Swap filter cartridge and execute 8-Point MHC prior to 14:00 UTC wafer annealing release.
            </p>
          </div>
        </div>

        {/* Current Inspection Stage & Single Primary Action */}
        <div className={`lg:col-span-4 p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-[#1A1D21] border-[#2B323A]/60' : 'bg-slate-50 border-slate-200/60'
        }`}>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              CURRENT STAGE
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8B9DFF]">
              <span className="w-2 h-2 rounded-full bg-[#8B9DFF]" />
              Stage 3 of 5: Galvo Realignment
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Filter swap complete. Servo gain latency check active.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-between font-medium"
            icon={<Play className="w-4 h-4 fill-current" />}
            onClick={onOpenQuickMhc}
          >
            <span>Execute Stage 3 Check</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

