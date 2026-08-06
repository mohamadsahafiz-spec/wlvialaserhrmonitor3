import React from 'react';
import { LineChart, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, Bar } from 'recharts';
import { Card } from '../common/Card';
import { Machine } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AnalyticsProps {
  machines: Machine[];
}

export const AnalyticsModule: React.FC<AnalyticsProps> = ({ machines }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const mtbfData = [
    { month: 'Q1 2025', mtbfHours: 1420 },
    { month: 'Q2 2025', mtbfHours: 1580 },
    { month: 'Q3 2025', mtbfHours: 1640 },
    { month: 'Q4 2025', mtbfHours: 1710 },
    { month: 'Q1 2026', mtbfHours: 1850 },
    { month: 'Q2 2026', mtbfHours: 1980 }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Mean Time Between Failures (MTBF) Growth" subtitle="Fleet Reliability Index">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mtbfData}>
                <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} domain={[1200, 2200]} />
                <Tooltip contentStyle={{
                  backgroundColor: isDark ? '#111315' : '#ffffff',
                  borderColor: isDark ? '#2B323A' : '#cbd5e1',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} />
                <Area type="monotone" dataKey="mtbfHours" stroke={isDark ? '#7FD4A6' : '#10b981'} fill={isDark ? '#7FD4A620' : '#10b98120'} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Consumables Replacement Lifecycle Forecast" subtitle="Estimated Days to Swap">
          <div className="space-y-3">
            {[
              { name: 'DI Water Cooling Filter (MCH-TSMC-01)', days: 12, critical: true },
              { name: 'Cover Slide Protective Glass D30 (MCH-HYUN-02)', days: 25, critical: false },
              { name: 'N2 Gas Purge Nozzle Assembly (MCH-TSMC-01)', days: 75, critical: false },
              { name: 'Chiller Ion Exchange Resin Filter (MCH-HYUN-02)', days: 95, critical: false }
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg border flex justify-between items-center text-xs ${
                isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</span>
                <span className={`font-mono font-bold ${item.critical ? (isDark ? 'text-[#E98A8A]' : 'text-rose-700') : (isDark ? 'text-[#8ECDF7]' : 'text-sky-800')}`}>
                  {item.days} Days Left
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
