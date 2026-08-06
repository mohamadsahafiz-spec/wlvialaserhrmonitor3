import React, { useState } from 'react';
import { 
  FilePlus, 
  Layout, 
  FileText, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  SlidersHorizontal,
  Trash2,
  BookOpen,
  Zap,
  ArrowRight,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { ReportTemplate, ReportDraft, FounderBrandingConfig } from '../../../types';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { useTheme } from '../../../context/ThemeContext';

interface ReportStudioHomeProps {
  templates: ReportTemplate[];
  drafts: ReportDraft[];
  branding: FounderBrandingConfig;
  onCreateNewReport: () => void;
  onSelectTemplate: (template: ReportTemplate) => void;
  onOpenDraft: (draft: ReportDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onOpenBrandingModal: () => void;
  onViewExecutivePreview: () => void;
}

export const ReportStudioHome: React.FC<ReportStudioHomeProps> = ({
  templates,
  drafts,
  branding,
  onCreateNewReport,
  onSelectTemplate,
  onOpenDraft,
  onDeleteDraft,
  onOpenBrandingModal,
  onViewExecutivePreview
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [draftToDelete, setDraftToDelete] = useState<ReportDraft | null>(null);

  const categories = ['ALL', 'Preventive Maintenance', 'Corrective Maintenance', 'Commissioning', 'Emergency', 'Internal', 'Quick Visit'];

  const filteredTemplates = selectedCategory === 'ALL' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-250 pb-12">
      {/* 1. Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-r from-[#1A1D21] via-[#20252B] to-[#1A1D21] border-[#2B323A]' 
          : 'bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 border-indigo-200/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#8B9DFF]/10 text-[#8B9DFF] border-[#8B9DFF]/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}>
                Report Studio Foundation v0.7.1
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Layout Engine Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report Configuration Studio
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Design, arrange, and manage field service report structures. Customize section order, visibility, page breaks, and customer branding without code changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              icon={<Building2 className="w-4 h-4 text-[#8ECDF7]" />}
              onClick={onOpenBrandingModal}
              className="text-xs font-semibold"
            >
              Founder Branding
            </Button>

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={onCreateNewReport}
              className="text-xs font-bold shadow-md"
            >
              Create New Report Layout
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Architecture Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Section Library
            </span>
            <p className={`text-xl font-extrabold font-mono mt-0.5 ${isDark ? 'text-[#8ECDF7]' : 'text-indigo-600'}`}>
              21 Sections
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Modular components available</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#8ECDF7]/15 border-[#8ECDF7]/30 text-[#8ECDF7]' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            <Layout className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Templates
            </span>
            <p className={`text-xl font-extrabold font-mono mt-0.5 ${isDark ? 'text-[#8B9DFF]' : 'text-indigo-600'}`}>
              {templates.length} Preset Layouts
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">PM, CM, Emergency, Commissioning</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#8B9DFF]/15 border-[#8B9DFF]/30 text-[#8B9DFF]' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Draft Workspaces
            </span>
            <p className={`text-xl font-extrabold font-mono mt-0.5 ${isDark ? 'text-[#EFCB7A]' : 'text-amber-600'}`}>
              {drafts.length} Active Drafts
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Saved in-progress layouts</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#EFCB7A]/15 border-[#EFCB7A]/30 text-[#EFCB7A]' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Branding Profile
            </span>
            <p className={`text-xl font-extrabold font-mono mt-0.5 ${isDark ? 'text-[#7FD4A6]' : 'text-emerald-600'}`}>
              {branding.companyName ? 'CONFIGURED' : 'DEFAULT'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Logo, Header, Signatures active</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#7FD4A6]/15 border-[#7FD4A6]/30 text-[#7FD4A6]' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Draft Reports Section */}
      {drafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EFCB7A]" />
                <span>In-Progress Draft Layouts</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Saved report configurations currently being assembled.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{drafts.length} Drafts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A] hover:border-[#8B9DFF]/50' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      draft.status === 'READY_FOR_REVIEW'
                        ? isDark ? 'bg-[#7FD4A6]/15 text-[#7FD4A6] border-[#7FD4A6]/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isDark ? 'bg-[#EFCB7A]/15 text-[#EFCB7A] border-[#EFCB7A]/30' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {draft.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Last saved: {draft.updatedAt}</span>
                  </div>

                  <h3 className="text-sm font-bold line-clamp-1">{draft.reportTitle}</h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Template: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{draft.templateName || 'Custom Layout'}</strong> • {draft.customerName || 'All Customers'}
                  </p>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-[#2B323A]' : 'border-slate-100'
                }`}>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {draft.sections.length} Configured Sections
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDraftToDelete(draft)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-rose-950/40 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                      }`}
                      title="Delete report layout draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                      onClick={() => onOpenDraft(draft)}
                    >
                      Edit Layout
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Report Templates Manager */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B9DFF]" />
              <span>Report Templates Library</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select a pre-configured template layout to start building or editing a report structure.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? isDark
                      ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] font-bold shadow-2xs'
                      : 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                    : isDark
                      ? 'bg-[#1A1D21] text-slate-300 border-[#2B323A] hover:bg-[#20252B]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                isDark 
                  ? 'bg-[#111315] border-[#2B323A] hover:border-[#8B9DFF]/60 hover:bg-[#1A1D21]' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#8B9DFF]/15 text-[#8B9DFF] border-[#8B9DFF]/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {template.code}
                  </span>
                  {template.isDefault && (
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Default</span>
                  )}
                </div>

                <h3 className="text-sm font-bold group-hover:text-[#8B9DFF] transition-colors">
                  {template.name}
                </h3>

                <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {template.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Structure Outline Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {template.sections.length} Sections
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {template.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#2B323A]">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                    onClick={() => onSelectTemplate(template)}
                  >
                    Configure Layout
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Document Preview Reference Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#7FD4A6]/15 border-[#7FD4A6]/30 text-[#7FD4A6]' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Executive Report Document View</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Preview how configured report layouts assemble executive field engineering documents.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={onViewExecutivePreview}
        >
          View Executive Report Document
        </Button>
      </div>

      {/* Delete Draft Confirmation Modal (ENGINEERING RULE #001) */}
      {draftToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 ${
            isDark ? 'bg-[#181B1E] border-[#2B323A] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-4 border-b border-[#2B323A]">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-500">Confirm Report Draft Deletion</h3>
                <p className="text-xs text-slate-400">FSOS Engineering Rule #001 — Confirmation Required</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  REPORT DRAFT TO BE REMOVED
                </span>
                <p className="font-bold text-sm text-slate-100 dark:text-white">
                  {draftToDelete.reportTitle}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>Template: <strong className="text-slate-200">{draftToDelete.templateName || 'Custom'}</strong></span>
                  <span>•</span>
                  <span>Sections: <strong className="text-slate-200">{draftToDelete.sections.length}</strong></span>
                  <span>•</span>
                  <span>Saved: <strong className="text-slate-200">{draftToDelete.updatedAt}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Warning:</strong> Deleting this configured report draft will permanently remove all section arrangements, field notes, and custom section visibility settings for this draft. This action is <strong>irreversible</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2B323A]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraftToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  onDeleteDraft(draftToDelete.id);
                  setDraftToDelete(null);
                }}
              >
                Permanently Delete Draft
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
