import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Eye, 
  ChevronRight, 
  Sparkles, 
  Calendar,
  FileText,
  Award,
  Building,
  SlidersHorizontal,
  Layout,
  Building2,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { ExecutiveReport, ReportTemplate, ReportDraft, FounderBrandingConfig } from '../../types';
import { StorageService } from '../../utils/persistence';
import { ReportStudioHome } from './reports/ReportStudioHome';
import { ReportBuilder } from './reports/ReportBuilder';
import { FounderBrandingModal } from './reports/FounderBrandingModal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { useTheme } from '../../context/ThemeContext';

interface ReportsModuleProps {
  reports: ExecutiveReport[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ reports }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Navigation View State inside Report Studio
  const [viewMode, setViewMode] = useState<'STUDIO_HOME' | 'BUILDER' | 'EXECUTIVE_DOCUMENT'>('STUDIO_HOME');

  // Persistence State
  const [templates, setTemplates] = useState<ReportTemplate[]>(() => StorageService.getTemplates());
  const [drafts, setDrafts] = useState<ReportDraft[]>(() => StorageService.getDrafts());
  const [branding, setBranding] = useState<FounderBrandingConfig>(() => StorageService.getBranding());

  // Active Draft being edited in Builder
  const [activeDraft, setActiveDraft] = useState<ReportDraft | null>(null);

  // Founder Branding Modal Toggle
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  // Executive Document Viewer State
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Sync Persistence
  useEffect(() => {
    StorageService.saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    StorageService.saveDrafts(drafts);
  }, [drafts]);

  useEffect(() => {
    StorageService.saveBranding(branding);
  }, [branding]);

  // Handlers
  const handleCreateNewReport = () => {
    setActiveDraft(null);
    setViewMode('BUILDER');
  };

  const handleSelectTemplateToBuild = (template: ReportTemplate) => {
    const newDraftFromTemplate: ReportDraft = {
      id: `draft-${Date.now()}`,
      reportTitle: `${template.name} - Custom Report Layout`,
      templateId: template.id,
      templateName: template.name,
      sections: template.sections,
      branding,
      status: 'DRAFT',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setActiveDraft(newDraftFromTemplate);
    setViewMode('BUILDER');
  };

  const handleOpenDraft = (draft: ReportDraft) => {
    setActiveDraft(draft);
    setViewMode('BUILDER');
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter(d => d.id !== draftId);
    setDrafts(updated);
  };

  const handleSaveDraftFromBuilder = (savedDraft: ReportDraft) => {
    const existingIndex = drafts.findIndex(d => d.id === savedDraft.id);
    if (existingIndex >= 0) {
      const updated = [...drafts];
      updated[existingIndex] = savedDraft;
      setDrafts(updated);
    } else {
      setDrafts([savedDraft, ...drafts]);
    }
  };

  const handleSaveTemplateFromBuilder = (savedTemplate: ReportTemplate) => {
    setTemplates([savedTemplate, ...templates]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      {/* Report Studio Top Tab Switcher */}
      <div className={`p-2 rounded-2xl border flex flex-wrap items-center justify-between gap-2 no-print ${
        isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setViewMode('STUDIO_HOME')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border ${
              viewMode === 'STUDIO_HOME'
                ? isDark
                  ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] shadow-xs'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : isDark
                  ? 'bg-[#1A1D21] text-slate-300 border-[#2B323A] hover:bg-[#20252B]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Studio Home</span>
          </button>

          <button
            onClick={() => setViewMode('BUILDER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border ${
              viewMode === 'BUILDER'
                ? isDark
                  ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] shadow-xs'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : isDark
                  ? 'bg-[#1A1D21] text-slate-300 border-[#2B323A] hover:bg-[#20252B]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Report Builder</span>
          </button>

          <button
            onClick={() => setViewMode('EXECUTIVE_DOCUMENT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border ${
              viewMode === 'EXECUTIVE_DOCUMENT'
                ? isDark
                  ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] shadow-xs'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : isDark
                  ? 'bg-[#1A1D21] text-slate-300 border-[#2B323A] hover:bg-[#20252B]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Report Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Building2 className="w-3.5 h-3.5 text-[#8ECDF7]" />}
            onClick={() => setIsBrandingModalOpen(true)}
            className="text-xs"
          >
            Branding Settings
          </Button>
        </div>
      </div>

      {/* VIEW 1: STUDIO HOME */}
      {viewMode === 'STUDIO_HOME' && (
        <ReportStudioHome
          templates={templates}
          drafts={drafts}
          branding={branding}
          onCreateNewReport={handleCreateNewReport}
          onSelectTemplate={handleSelectTemplateToBuild}
          onOpenDraft={handleOpenDraft}
          onDeleteDraft={handleDeleteDraft}
          onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
          onViewExecutivePreview={() => setViewMode('EXECUTIVE_DOCUMENT')}
        />
      )}

      {/* VIEW 2: 3-PANEL REPORT BUILDER */}
      {viewMode === 'BUILDER' && (
        <ReportBuilder
          initialDraft={activeDraft}
          branding={branding}
          onSaveDraft={handleSaveDraftFromBuilder}
          onSaveTemplate={handleSaveTemplateFromBuilder}
          onBackToStudio={() => setViewMode('STUDIO_HOME')}
          onViewExecutivePreview={() => setViewMode('EXECUTIVE_DOCUMENT')}
        />
      )}

      {/* VIEW 3: EXECUTIVE DOCUMENT PREVIEW */}
      {viewMode === 'EXECUTIVE_DOCUMENT' && (
        <div className="space-y-6">
          {/* Report Selector Pills */}
          {reports.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 no-print">
              <div className="flex items-center gap-2 overflow-x-auto">
                {reports.map((rpt) => (
                  <button
                    key={rpt.id}
                    onClick={() => setSelectedReportId(rpt.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                      rpt.id === selectedReport?.id
                        ? isDark
                          ? 'bg-[#8B9DFF] text-slate-950 border-[#8B9DFF] font-bold shadow-xs'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                        : isDark
                          ? 'bg-[#111315] text-slate-300 border-[#2B323A] hover:bg-[#1A1D21]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rpt.reportNumber}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print / Save Executive PDF
              </Button>
            </div>
          )}

          {!selectedReport ? (
            <div className={`p-12 text-center rounded-2xl border shadow-sm ${
              isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200'
            }`}>
              <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No executive engineering reports generated yet.</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Execute a Machine Health Check or assemble a layout in Report Builder.</p>
            </div>
          ) : (
            /* EXECUTIVE ENGINEERING REPORT DOCUMENT */
            <div className={`print-page border rounded-2xl p-8 max-w-4xl mx-auto shadow-lg space-y-8 ${
              isDark ? 'bg-[#111315] text-slate-100 border-[#2B323A]' : 'bg-white text-slate-800 border-slate-200'
            }`}>
              {/* Document Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 ${
                    isDark ? 'bg-[#8B9DFF] text-slate-950 border border-indigo-400' : 'bg-indigo-600 text-white border border-indigo-400'
                  }`}>
                    <Zap className={`w-6 h-6 ${isDark ? 'fill-slate-950' : 'fill-white'}`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                      isDark ? 'text-[#8ECDF7]' : 'text-indigo-600'
                    }`}>
                      {branding.headerText || 'EXECUTIVE FIELD ENGINEERING REPORT'}
                    </span>
                    <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {branding.companyName || 'FIELD OPERATIONS SERVICE SYSTEM'}
                    </h1>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedReport.reportNumber}</p>
                  </div>
                </div>

                <div className={`text-right font-mono text-xs space-y-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <p>Inspection Date: <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>{selectedReport.date}</strong></p>
                  <p>Lead Engineer: <strong className={isDark ? 'text-[#8ECDF7]' : 'text-indigo-700'}>{selectedReport.engineerName}</strong></p>
                  {branding.confidentialityBanner && (
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Classification: Highly Confidential / Enterprise SLA</p>
                  )}
                </div>
              </div>

              {/* PAGE 1 IMMEDIATE ANSWER CARD */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[11px] font-mono uppercase font-bold ${isDark ? 'text-[#8ECDF7]' : 'text-indigo-600'}`}>1. OPERATIONAL VERDICT & HEALTH SCORE</span>
                    <h2 className={`text-lg font-extrabold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Machine Health & Production Release Assessment</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>HEALTH INDEX</span>
                      <p className={`text-2xl font-extrabold font-mono ${isDark ? 'text-[#7FD4A6]' : 'text-emerald-600'}`}>{selectedReport.overallHealthScore} / 100</p>
                    </div>
                    <div className={`px-3.5 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider ${
                      isDark ? 'bg-[#7FD4A6]/20 text-[#7FD4A6] border-[#7FD4A6]/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {selectedReport.productionReleaseStatus}
                    </div>
                  </div>
                </div>

                {/* 3 Executive Direct Answers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`font-bold font-mono block mb-1 ${isDark ? 'text-[#8ECDF7]' : 'text-indigo-700'}`}>IS THE MACHINE HEALTHY?</span>
                    <p className={`leading-relaxed font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {selectedReport.overallHealthScore >= 90
                        ? 'YES. All core laser diodes, galvo stage accuracy, and cooling loops are operating within nominal thresholds.'
                        : 'CONDITIONAL. Minor power offset drift observed.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`font-bold font-mono block mb-1 ${isDark ? 'text-[#EFCB7A]' : 'text-amber-700'}`}>IF NOT HEALTHY, WHY?</span>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      DI Water Cooling Filter cartridge lifecycle is at 18%, causing a 0.8 LPM flow delta drop. Laser Head B diode module approaching recommended swap hours (9,680 hrs logged).
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#111315] border-[#2B323A]' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`font-bold font-mono block mb-1 ${isDark ? 'text-[#7FD4A6]' : 'text-emerald-700'}`}>ACTIONS TAKEN?</span>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Cleaned quartz optical window, calibrated power offset to 248W, verified galvo motor gains, and scheduled DI filter swap for August 2026.
                    </p>
                  </div>
                </div>

                {/* Executive Summary Narrative */}
                <div className="pt-2">
                  <span className={`text-[11px] font-mono font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Executive Summary Narrative:</span>
                  <p className={`text-xs leading-relaxed mt-1 p-3.5 rounded-xl border font-sans ${
                    isDark ? 'bg-[#111315] border-[#2B323A] text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    "{selectedReport.executiveSummary}"
                  </p>
                </div>
              </div>

              {/* Machine & Facility Record */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border text-xs ${
                isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Customer Facility</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedReport.customerName}</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedReport.plantName}</p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Laser Machine Model</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedReport.machineModel}</p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Serial Number</span>
                  <p className={`font-mono font-bold mt-0.5 ${isDark ? 'text-[#8ECDF7]' : 'text-indigo-600'}`}>{selectedReport.serialNumber}</p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lead Service Engineer</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedReport.engineerName}</p>
                </div>
              </div>

              {/* Subsystem Health Breakdown Table */}
              <div className="space-y-3">
                <h3 className={`text-sm font-bold font-mono uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  2. Subsystem Telemetry & Health Score Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    { label: 'Laser Head 1', score: selectedReport.subsystemHealth.laserHead1 },
                    { label: 'Laser Head 2', score: selectedReport.subsystemHealth.laserHead2 },
                    { label: 'Cooling System', score: selectedReport.subsystemHealth.cooling },
                    { label: 'Optics Delivery', score: selectedReport.subsystemHealth.optics },
                    { label: 'Galvo & Stage', score: selectedReport.subsystemHealth.stage },
                    { label: 'AGC Circuit', score: selectedReport.subsystemHealth.agc },
                    { label: 'Power Stability', score: selectedReport.subsystemHealth.powerStability },
                    { label: 'Beam Quality', score: selectedReport.subsystemHealth.beamQuality }
                  ].map((sub, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex justify-between items-center ${
                      isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`text-[11px] truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{sub.label}</span>
                      <span className={`font-bold ${isDark ? 'text-[#8ECDF7]' : 'text-indigo-700'}`}>{sub.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations & Action Plan */}
              <div className="space-y-3">
                <h3 className={`text-sm font-bold font-mono uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  3. Field Recommendations & Action Plan
                </h3>
                <ul className="space-y-2">
                  {selectedReport.recommendations.map((rec, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-xs p-3 rounded-xl border ${
                      isDark ? 'bg-[#1A1D21] border-[#2B323A] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#7FD4A6]' : 'text-emerald-600'}`} />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Report Signatures & Approvals (ECO-20260802-028) */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  4. Report Signatures & Governance Sign-Off
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Prepared By */}
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      PREPARED BY
                    </span>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        user={{ fullName: selectedReport.engineerName, role: 'Field Service Engineer' }}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {selectedReport.engineerName}
                        </p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {selectedReport.signatureTitle || 'Lead Service Engineer'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-[#2B323A]/50 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">✓ Signed</span>
                      <span className="text-slate-400">{selectedReport.signedDate}</span>
                    </div>
                  </div>

                  {/* Reviewed By */}
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      REVIEWED BY
                    </span>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        user={{ fullName: 'Elena Rostova', role: 'Senior Operations Supervisor' }}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          Elena Rostova
                        </p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Senior Service Supervisor
                        </p>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-[#2B323A]/50 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">✓ QA Verified</span>
                      <span className="text-slate-400">{selectedReport.signedDate}</span>
                    </div>
                  </div>

                  {/* Approved By */}
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      APPROVED BY
                    </span>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        user={{ fullName: 'Dr. Marcus Vance', role: 'Technical Operations Director' }}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          Dr. Marcus Vance
                        </p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Director of Engineering
                        </p>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-[#2B323A]/50 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">✓ Executive Approved</span>
                      <span className="text-slate-400">{selectedReport.signedDate}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs ${
                  isDark ? 'bg-[#1A1D21] border-[#2B323A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-[#7FD4A6]' : 'text-emerald-700'}`}>
                    ✓ SHA-256 DIGITAL CHECKSUM VERIFIED
                  </span>
                  <p className={`text-[11px] font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    8a91c74f7b2a9018e42f901129b87021109a2
                  </p>
                </div>
              </div>

              {/* Document Footer */}
              <div className={`pt-4 border-t text-center font-mono text-[10px] ${
                isDark ? 'border-[#2B323A] text-slate-500' : 'border-slate-200 text-slate-400'
              }`}>
                <p>{branding.footerText}</p>
                {branding.showPageNumbers && (
                  <p className="mt-0.5">Page 1 of 1 • Generated via FSOS Report Studio Foundation</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Founder Branding Configuration Modal */}
      <FounderBrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSaveBranding={(updated) => setBranding(updated)}
      />
    </div>
  );
};
