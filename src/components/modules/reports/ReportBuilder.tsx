import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Search, 
  FileText, 
  Layers, 
  Settings, 
  Eye, 
  EyeOff, 
  FileCheck, 
  Check, 
  HelpCircle,
  Sparkles,
  BookOpen,
  GripVertical
} from 'lucide-react';
import { ReportSectionConfig, ReportDraft, ReportTemplate, FounderBrandingConfig } from '../../../types';
import { INITIAL_AVAILABLE_SECTIONS } from '../../../data/mockData';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';

interface ReportBuilderProps {
  initialDraft?: ReportDraft | null;
  branding: FounderBrandingConfig;
  onSaveDraft: (draft: ReportDraft) => void;
  onSaveTemplate: (template: ReportTemplate) => void;
  onBackToStudio: () => void;
  onViewExecutivePreview: () => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  initialDraft,
  branding,
  onSaveDraft,
  onSaveTemplate,
  onBackToStudio,
  onViewExecutivePreview
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Report Level State
  const [reportTitle, setReportTitle] = useState<string>(
    initialDraft?.reportTitle || 'Custom Field Engineering Service Report Layout'
  );
  const [templateName, setTemplateName] = useState<string>(
    initialDraft?.templateName || 'Custom Report Builder'
  );

  // Active Layout Sections State
  const [sections, setSections] = useState<ReportSectionConfig[]>(
    initialDraft?.sections || INITIAL_AVAILABLE_SECTIONS.filter(s => s.visible).slice(0, 8)
  );

  // Selected Section ID for Right Panel Settings
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ''
  );

  // Left Panel Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Success Feedback Toast
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Filter Left Panel Library
  const categories = ['ALL', 'CORE', 'INSPECTION', 'TIMELINE', 'SIGNATURES', 'OTHER'];

  const filteredLibrary = INITIAL_AVAILABLE_SECTIONS.filter(sec => {
    const matchesSearch = sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sec.sectionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || sec.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate estimated document pages
  const totalPagesEstimate = Math.max(1, sections.reduce((pages, sec) => {
    if (sec.pageBreakBefore && sec.visible) return pages + 1;
    return pages;
  }, 1));

  // Handlers for Center Panel Layout Manipulation
  const handleAddSectionFromLibrary = (librarySection: ReportSectionConfig) => {
    const newId = `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newSec: ReportSectionConfig = {
      ...librarySection,
      id: newId,
      title: `${sections.length + 1}. ${librarySection.title}`,
      visible: true
    };
    setSections([...sections, newSec]);
    setSelectedSectionId(newId);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSections(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSections(updated);
  };

  const handleDuplicate = (index: number) => {
    const target = sections[index];
    const duplicateId = `sec-dup-${Date.now()}`;
    const duplicated: ReportSectionConfig = {
      ...target,
      id: duplicateId,
      title: `${target.title} (Copy)`
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, duplicated);
    setSections(updated);
    setSelectedSectionId(duplicateId);
  };

  const handleRemove = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || '');
    }
  };

  const handleToggleVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  // Update Section Settings from Right Panel
  const handleUpdateSelectedSection = (fields: Partial<ReportSectionConfig>) => {
    if (!selectedSectionId) return;
    setSections(sections.map(s => s.id === selectedSectionId ? { ...s, ...fields } : s));
  };

  // Action: Save Draft
  const handleSaveDraftAction = () => {
    const draftData: ReportDraft = {
      id: initialDraft?.id || `draft-${Date.now()}`,
      reportTitle,
      templateName,
      sections,
      branding,
      status: 'DRAFT',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    onSaveDraft(draftData);
    showToast('Report Draft Saved Successfully!');
  };

  // Action: Save as Template
  const handleSaveTemplateAction = () => {
    const newTemplate: ReportTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      name: reportTitle.length > 30 ? reportTitle.slice(0, 30) + '...' : reportTitle,
      code: `TMPL_${Date.now().toString().slice(-4)}`,
      description: `Custom report layout configured with ${sections.length} sections.`,
      category: 'Preventive Maintenance',
      sections,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    onSaveTemplate(newTemplate);
    showToast('Layout Saved as Reusable Template!');
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-250 pb-12 select-none">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-xs font-bold font-mono flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-[#111315] border-[#2B323A] text-slate-300 hover:bg-[#20252B]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Back to Studio Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border uppercase ${
                isDark ? 'bg-[#8B9DFF]/15 text-[#8B9DFF] border-[#8B9DFF]/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {templateName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {sections.length} Sections ({sections.filter(s => s.visible).length} Visible)
              </span>
            </div>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className={`text-sm font-bold bg-transparent border-b border-transparent focus:border-indigo-500 outline-hidden tracking-tight mt-0.5 w-full sm:w-96 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
              placeholder="Report Layout Title..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<BookOpen className="w-3.5 h-3.5 text-[#8ECDF7]" />}
            onClick={onViewExecutivePreview}
          >
            Preview Document
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleSaveTemplateAction}
          >
            Save as Template
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSaveDraftAction}
          >
            Save Layout Draft
          </Button>
        </div>
      </div>

      {/* THREE-PANEL REPORT BUILDER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[680px]">
        
        {/* PANEL 1: LEFT PANEL — SECTION LIBRARY (3 COLUMNS ON DESKTOP) */}
        <div className={`lg:col-span-3 rounded-2xl border p-4 flex flex-col h-full max-h-[750px] ${
          isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-[#2B323A] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8B9DFF]" />
                <span>Section Library</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">21 Available</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections..."
                className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-200 focus:border-[#8B9DFF]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? isDark ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] font-bold' : 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : isDark ? 'bg-[#1A1D21] text-slate-400 border-[#2B323A]' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section Library List */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {filteredLibrary.map((item) => {
              const currentCount = sections.filter(s => s.sectionType === item.sectionType).length;
              const isIncluded = currentCount > 0;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition-all space-y-1.5 ${
                    isDark 
                      ? 'bg-[#1A1D21] border-[#2B323A] hover:border-[#8B9DFF]/40' 
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                        isDark ? 'bg-[#20252B] text-slate-300 border-[#2B323A]' : 'bg-white text-slate-700 border-slate-200'
                      }`}>
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs mt-1">{item.title}</h4>
                    </div>

                    <button
                      onClick={() => handleAddSectionFromLibrary(item)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 transition-all border ${
                        isDark
                          ? 'bg-[#8B9DFF]/20 text-[#8B9DFF] border-[#8B9DFF]/40 hover:bg-[#8B9DFF] hover:text-slate-950'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                      }`}
                      title="Add section to layout"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {item.description && (
                    <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  )}

                  {isIncluded && (
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        In Layout ({currentCount})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: CENTER PANEL — REPORT LAYOUT EDITOR (6 COLUMNS ON DESKTOP) */}
        <div className={`lg:col-span-6 rounded-2xl border p-4 flex flex-col h-full max-h-[750px] ${
          isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Layout Outline Header */}
          <div className="pb-3 border-b border-slate-200 dark:border-[#2B323A] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7FD4A6]" />
                <span>Report Layout Outline</span>
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Arrange sections, toggle page breaks, and configure section ordering.
              </p>
            </div>

            <div className="text-right font-mono text-[10px]">
              <span className={`px-2 py-1 rounded border font-semibold ${
                isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                Est. ~{totalPagesEstimate} Document Pages
              </span>
            </div>
          </div>

          {/* Section Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
            {sections.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border border-dashed ${
                isDark ? 'border-[#2B323A] bg-[#1A1D21]/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
              }`}>
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Report Layout is Currently Empty</p>
                <p className="text-[11px] mt-1">Select sections from the Left Panel library to add them to your report layout.</p>
              </div>
            ) : (
              sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 relative ${
                      isSelected
                        ? isDark
                          ? 'bg-[#1A1D21] border-[#8B9DFF] ring-1 ring-[#8B9DFF]/50 shadow-md'
                          : 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-300 shadow-xs'
                        : isDark
                          ? 'bg-[#1A1D21] border-[#2B323A] hover:border-[#2B323A]/80'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Section Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded text-slate-400 cursor-grab ${isDark ? 'hover:text-slate-200' : 'hover:text-slate-800'}`}>
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isDark ? 'bg-[#20252B] border-[#2B323A] text-[#8ECDF7]' : 'bg-white border-slate-200 text-indigo-700'
                        }`}>
                          Section {String(idx + 1).padStart(2, '0')}
                        </span>

                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          [{sec.sectionType}]
                        </span>
                      </div>

                      {/* Action Tools */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleVisibility(sec.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            sec.visible
                              ? isDark ? 'bg-[#7FD4A6]/15 text-[#7FD4A6] border-[#7FD4A6]/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isDark ? 'bg-[#20252B] text-slate-500 border-[#2B323A]' : 'bg-slate-200 text-slate-400 border-slate-300'
                          }`}
                          title={sec.visible ? 'Section Visible' : 'Section Hidden'}
                        >
                          {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Move Up */}
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className={`p-1.5 rounded-lg border text-slate-400 disabled:opacity-30 ${
                            isDark ? 'bg-[#20252B] border-[#2B323A] hover:text-slate-100' : 'bg-white border-slate-200 hover:text-slate-900'
                          }`}
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === sections.length - 1}
                          className={`p-1.5 rounded-lg border text-slate-400 disabled:opacity-30 ${
                            isDark ? 'bg-[#20252B] border-[#2B323A] hover:text-slate-100' : 'bg-white border-slate-200 hover:text-slate-900'
                          }`}
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(idx)}
                          className={`p-1.5 rounded-lg border text-slate-400 ${
                            isDark ? 'bg-[#20252B] border-[#2B323A] hover:text-slate-100' : 'bg-white border-slate-200 hover:text-slate-900'
                          }`}
                          title="Duplicate Section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(sec.id)}
                          className={`p-1.5 rounded-lg border text-rose-500 ${
                            isDark ? 'bg-[#20252B] border-[#2B323A] hover:bg-rose-950/40' : 'bg-white border-slate-200 hover:bg-rose-50'
                          }`}
                          title="Remove Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="pl-6">
                      <h4 className={`text-xs font-bold ${
                        !sec.visible ? 'line-through opacity-50' : ''
                      }`}>
                        {sec.title}
                      </h4>
                    </div>

                    {/* Feature Badges Bar */}
                    <div className="pl-6 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      {sec.pageBreakBefore && (
                        <span className={`px-2 py-0.2 rounded border font-semibold ${
                          isDark ? 'bg-[#8ECDF7]/15 text-[#8ECDF7] border-[#8ECDF7]/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          📄 Page Break Before
                        </span>
                      )}

                      {sec.collapsible && (
                        <span className={`px-2 py-0.2 rounded border ${
                          isDark ? 'bg-[#20252B] text-slate-300 border-[#2B323A]' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          Collapsible Section
                        </span>
                      )}

                      {!sec.visible && (
                        <span className="px-2 py-0.2 rounded bg-rose-900/30 text-rose-400 border border-rose-800/40 font-semibold">
                          HIDDEN
                        </span>
                      )}

                      {sec.notes && (
                        <span className={`px-2 py-0.2 rounded border ${
                          isDark ? 'bg-[#EFCB7A]/15 text-[#EFCB7A] border-[#EFCB7A]/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          Notes Attached
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 3: RIGHT PANEL — SECTION SETTINGS & CONFIGURATION (3 COLUMNS ON DESKTOP) */}
        <div className={`lg:col-span-3 rounded-2xl border p-4 flex flex-col h-full max-h-[750px] ${
          isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-[#2B323A]">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-[#EFCB7A]" />
              <span>Section Settings</span>
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure visibility, title overrides, and page break rules.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-4 text-xs">
            {selectedSection ? (
              <>
                {/* Selected Section Header */}
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Selected Code</span>
                  <p className="font-mono font-bold text-xs text-[#8B9DFF] mt-0.5">{selectedSection.sectionType}</p>
                </div>

                {/* Setting 1: Section Title */}
                <div>
                  <label className="block font-semibold mb-1">Section Display Title</label>
                  <input
                    type="text"
                    value={selectedSection.title}
                    onChange={(e) => handleUpdateSelectedSection({ title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border font-sans text-xs ${
                      isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-100 focus:border-[#8B9DFF]' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Setting 2: Visibility Toggle */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-semibold block">Visible in Final Report</span>
                    <span className="text-[10px] text-slate-400">Show or hide this section</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedSection.visible}
                    onChange={(e) => handleUpdateSelectedSection({ visible: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Setting 3: Page Break Before */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-semibold block">Page Break Before</span>
                    <span className="text-[10px] text-slate-400">Start on new page in PDF</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedSection.pageBreakBefore}
                    onChange={(e) => handleUpdateSelectedSection({ pageBreakBefore: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Setting 4: Collapsible */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-semibold block">Collapsible Section</span>
                    <span className="text-[10px] text-slate-400">Allow collapsing in web view</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedSection.collapsible}
                    onChange={(e) => handleUpdateSelectedSection({ collapsible: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Setting 5: Show Section Number */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-semibold block">Show Section Number</span>
                    <span className="text-[10px] text-slate-400">Prepend "1.", "2.", etc.</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedSection.showSectionNumber}
                    onChange={(e) => handleUpdateSelectedSection({ showSectionNumber: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Setting 6: Section Notes */}
                <div>
                  <label className="block font-semibold mb-1">Section Engineering Notes</label>
                  <textarea
                    rows={3}
                    value={selectedSection.notes || ''}
                    onChange={(e) => handleUpdateSelectedSection({ notes: e.target.value })}
                    placeholder="Optional guidance notes for field service engineers..."
                    className={`w-full px-3 py-2 rounded-xl border font-sans text-xs ${
                      isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-bold">No Section Selected</p>
                <p className="text-[11px] mt-1">Select a section from the Center Panel to configure its settings here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
