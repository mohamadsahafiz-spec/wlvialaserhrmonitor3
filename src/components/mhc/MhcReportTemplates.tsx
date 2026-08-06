import React from 'react';
import { LayoutTemplate, Sparkles, Check, ArrowRight, Layers, FileText, Cpu, Eye, Thermometer } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';

interface MhcReportTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

export const MhcReportTemplates: React.FC<MhcReportTemplatesProps> = ({ onSelectTemplate }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const templates = [
    {
      id: 'template_std_executive',
      title: 'Standard 1-Page Executive MHC Report',
      description: 'Clean single-page summary featuring Laser Life, Power Output, Beam Quality, Process Parameters, and Engineer Release Verdict.',
      category: 'EXECUTIVE & FIELD RELEASE',
      pageCount: '1 A4 Page',
      widgetCount: 8,
      recommendedFor: 'Routine 250-hr service visits & field maintenance sign-offs',
      icon: <Sparkles className="w-5 h-5 text-[#8B9DFF]" />,
      badge: 'POPULAR'
    },
    {
      id: 'template_deep_optical',
      title: 'Deep Optical & Beam Profile Audit',
      description: 'Technical report layout focusing on M² beam factor, galvo scanner calibration, spot size waist comparison, and optics cleanliness.',
      category: 'OPTICAL ENGINE DIAGNOSTICS',
      pageCount: '1 A4 Page',
      widgetCount: 6,
      recommendedFor: 'Optics alignment, beam drift troubleshooting, or cut quality issues',
      icon: <Eye className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'template_thermal_cooling',
      title: 'Thermal & Chiller System Audit',
      description: 'Specialized layout for chiller temperature stability, coolant flow rate trends, DI water conductivity, and laser thermal loops.',
      category: 'UTILITY & INFRASTRUCTURE',
      pageCount: '1 A4 Page',
      widgetCount: 6,
      recommendedFor: 'Overheating alarms, chiller filter replacement, or annual facility audits',
      icon: <Thermometer className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'template_pre_maint_baseline',
      title: 'Pre-Maintenance Machine Health Baseline',
      description: 'Comprehensive baseline inspection report comparing historical specs against real-time pre-service measurements.',
      category: 'PRE-SERVICE BASELINE',
      pageCount: '1 A4 Page',
      widgetCount: 7,
      recommendedFor: 'Major overhaul prep, contract warranty baseline checks',
      icon: <Cpu className="w-5 h-5 text-amber-400" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 rounded-sm border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#15181C] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-[#8B9DFF]" />
            <h2 className="text-base font-bold tracking-tight text-slate-100 dark:text-slate-100">
              SMART MHC REPORT TEMPLATE LIBRARY
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-configured A4 single-page report structures tailored for laser field service engineering & customer deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">4 Templates Available</span>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`p-5 rounded-sm border flex flex-col justify-between transition-all group hover:border-[#8B9DFF]/60 ${
              isDark ? 'bg-[#13161A] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-sm border ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {tpl.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {tpl.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 mt-0.5">{tpl.title}</h3>
                  </div>
                </div>

                {tpl.badge && (
                  <Badge variant="info">{tpl.badge}</Badge>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {tpl.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[9px]">CAPACITY & LENGTH</span>
                  <span className="text-slate-300 font-semibold">{tpl.pageCount} ({tpl.widgetCount} Widgets)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">TARGET USE CASE</span>
                  <span className="text-slate-300 font-semibold truncate block">{tpl.recommendedFor}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">Form Factor: A4 Portrait PDF</span>
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onSelectTemplate(tpl.id)}
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
