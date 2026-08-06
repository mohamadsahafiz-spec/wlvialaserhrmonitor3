import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  Sliders, 
  Zap, 
  Eye, 
  Thermometer, 
  CheckCircle2, 
  Package, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  Save, 
  FileCheck, 
  Building2,
  ArrowLeft,
  Layout,
  Sparkles,
  LayoutTemplate,
  History
} from 'lucide-react';
import { 
  Machine, 
  MHCRecord, 
  ExecutiveReport, 
  MHCSession, 
  MHCReportDraftConfig,
  NavigationTab 
} from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { StorageService } from '../../utils/persistence';

// Subcomponents
import { MhcMachineSelector } from '../mhc/MhcMachineSelector';
import { MhcStageForms } from '../mhc/MhcStageForms';
import { MhcSummaryView } from '../mhc/MhcSummaryView';
import { MhcReportBuilder } from '../mhc/MhcReportBuilder';
import { MhcFinalReportView } from '../mhc/MhcFinalReportView';
import { SmartMhcWorkspace } from '../mhc/SmartMhcWorkspace';
import { MhcReportTemplates } from '../mhc/MhcReportTemplates';
import { MhcHistoryView } from '../mhc/MhcHistoryView';

interface MachineHealthCheckProps {
  machines: Machine[];
  initialMachineId?: string;
  activeSubTab?: NavigationTab;
  onSaveMhcRecord: (record: MHCRecord) => void;
  onGenerateReport: (report: ExecutiveReport) => void;
}

export const MachineHealthCheckModule: React.FC<MachineHealthCheckProps> = ({
  machines,
  initialMachineId,
  activeSubTab = 'mhc',
  onSaveMhcRecord,
  onGenerateReport
}) => {
  // 1. Selected Machine
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    initialMachineId || machines[0]?.id || ''
  );
  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // 2. All MHC Sessions persistence state
  const [mhcSessions, setMhcSessions] = useState<MHCSession[]>(() =>
    StorageService.getMhcSessions()
  );

  // Active Session for current machine
  const activeSession = mhcSessions.find(
    (s) => s.machineId === selectedMachineId && s.completionStatus !== 'COMPLETED'
  ) || mhcSessions.find((s) => s.machineId === selectedMachineId) || mhcSessions[0];

  // 3. View Mode: 'smart_workspace' | 'report_templates' | 'mhc_history' | 'stage_forms' | 'summary' | 'report_builder' | 'final_report' | 'overview'
  const [viewMode, setViewMode] = useState<
    'smart_workspace' | 'report_templates' | 'mhc_history' | 'stage_forms' | 'summary' | 'report_builder' | 'final_report' | 'overview'
  >('smart_workspace');

  // 4. Stage Number: 1 to 8 for Engineering Data stage forms
  const [activeStage, setActiveStage] = useState<number>(1);

  // Handle activeSubTab mapping from sidebar navigation
  useEffect(() => {
    if (!activeSubTab) return;

    if (activeSubTab === 'mhc') {
      setViewMode('smart_workspace');
    } else if (activeSubTab === 'mhc_templates') {
      setViewMode('report_templates');
    } else if (activeSubTab === 'mhc_history') {
      setViewMode('mhc_history');
    } else if (activeSubTab.startsWith('mhc_0')) {
      const stageNum = parseInt(activeSubTab.replace('mhc_0', ''), 10);
      if (stageNum >= 1 && stageNum <= 8) {
        setActiveStage(stageNum);
        setViewMode('stage_forms');
      }
    }
  }, [activeSubTab]);

  // Draft config state for final report
  const [activeDraftConfig, setActiveDraftConfig] = useState<MHCReportDraftConfig | null>(null);

  // Update session state helper
  const handleUpdateSession = (updatedSession: MHCSession) => {
    const updatedList = mhcSessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setMhcSessions(updatedList);
    StorageService.saveMhcSessions(updatedList);
  };

  // Start new MHC Session for a machine
  const handleStartNewSession = (mchId: string) => {
    const targetMch = machines.find((m) => m.id === mchId) || selectedMachine;
    const newSession: MHCSession = {
      id: `MHC-${new Date().getFullYear()}-${targetMch.machineNumber.replace('MCH-', '')}`,
      machineId: targetMch.id,
      machineModel: targetMch.model,
      machineSerialNumber: targetMch.serialNumber,
      machineName: `${targetMch.model} (${targetMch.machineNumber})`,
      customerId: targetMch.customerId,
      customerName: targetMch.customerName,
      plantName: targetMch.plantName,
      engineerName: StorageService.getProfile()?.name || StorageService.getAuth()?.engineerName || 'Field Service Engineer',
      startDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: new Date().toLocaleString(),
      completionStatus: 'IN_PROGRESS',
      currentSection: 1,
      sectionStatuses: {
        sec_01: 'NOT_STARTED',
        sec_02: 'NOT_STARTED',
        sec_03: 'NOT_STARTED',
        sec_04: 'NOT_STARTED',
        sec_05: 'NOT_STARTED',
        sec_06: 'NOT_STARTED',
        sec_07: 'NOT_STARTED',
        sec_08: 'NOT_STARTED'
      },
      stage01_laserHours: (targetMch.laserHeads || []).map((lh, i) => {
        const rec = lh.runningHours || 10000;
        const rDate = new Date().toISOString().split('T')[0];
        const rTime = '09:00';
        const readingDateTime = new Date(`${rDate}T${rTime}:00`);
        const now = new Date();
        const diffMs = now.getTime() - readingDateTime.getTime();
        const elapsedHours = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0;
        const calcCurrent = rec + elapsedHours;

        return {
          laserId: lh.id || `lh-${i}`,
          laserIdentifier: lh.model || `Laser Head #${i + 1}`,
          recordedLaserHour: rec,
          readingDate: rDate,
          readingTime: rTime,
          calculatedCurrentHour: calcCurrent,
          warningThreshold: 15000,
          criticalThreshold: 18000,
          runtimeStatus: calcCurrent >= 18000 ? 'CRITICAL' : calcCurrent >= 15000 ? 'WARNING' : 'NORMAL'
        };
      }),
      stage02_laserProfile: {
        laserId: targetMch.laserHeads?.[0]?.id || 'lh-1',
        productName: 'Cleanroom Semiconductor Process Wafer',
        recipeProgram: 'RECIPE_STD_PROCESS_V1',
        profileInfo: 'TEM00 Gaussian Profile - Single Mode',
        measurementInfo: 'Spot Size: 42.5 µm',
        supportingEvidence: 'Initial beam shape verified.',
        images: []
      },
      stage03_laserPower: (targetMch.laserHeads || []).map((lh, i) => ({
        laserId: lh.id || `lh-${i}`,
        laserIdentifier: lh.model || `Laser Head #${i + 1}`,
        ratedPowerWatts: lh.ratedPowerWatts || 250,
        referenceValueWatts: lh.ratedPowerWatts || 250,
        beforeValueWatts: (lh.powerOutputWatts || 245) - 5,
        afterValueWatts: lh.powerOutputWatts || 248,
        stabilityPercent: 99.2,
        result: 'PASS',
        notes: 'Optics verified.',
        evidenceImages: []
      })),
      stage04_opticsBeam: {
        cleanlinessScore: 95,
        beamWaistMm: 1.05,
        focusOffsetMm: 0.01,
        symmetryRatio: 0.98,
        m2Value: 1.12,
        beforeCondition: 'Standard dust inspection.',
        afterCondition: 'Cleaned with optical swab.',
        inspectionResult: 'PASS',
        images: [],
        notes: ''
      },
      stage05_cooling: {
        chillerTempCelsius: 20.0,
        chillerFlowLpm: 18.0,
        diConductivityUs: 0.35,
        coolingCondition: 'Cooling loop nominal.',
        thermalCondition: 'Thermal gradient stable.',
        beforeCondition: 'Normal operating temp.',
        afterCondition: 'Verified under full load.',
        result: 'PASS',
        notes: ''
      },
      stage06_productQuality: {
        sampleId: `SAMPLE-${targetMch.machineNumber}-001`,
        viaDiameterUm: 42.5,
        viaShape: 'Circular',
        viaOffsetUm: 0.2,
        padQuality: 'No recast layer.',
        visualVerification: 'Visual cut verified clean.',
        beforeInspectionNotes: '',
        afterInspectionNotes: '',
        beforeImages: [],
        afterImages: [],
        result: 'PASS',
        notes: ''
      },
      stage07_spareParts: [],
      stage08_engineerRemarks: {
        generalFindings: 'Machine overall operational condition verified.',
        observedIssues: 'None critical.',
        correctiveActions: 'Cleaned optics, verified chiller.',
        recommendations: 'Continue standard maintenance schedule.',
        followUpRequired: false,
        productionReleaseVerdict: 'APPROVED'
      }
    };

    const updated = [newSession, ...mhcSessions];
    setMhcSessions(updated);
    StorageService.saveMhcSessions(updated);
    setSelectedMachineId(mchId);
    setActiveStage(1);
    setViewMode('smart_workspace');
  };

  const handleContinueSession = (sessionId: string) => {
    const targetSession = mhcSessions.find((s) => s.id === sessionId);
    if (targetSession) {
      setSelectedMachineId(targetSession.machineId);
      setActiveStage(targetSession.currentSection || 1);
      setViewMode('smart_workspace');
    }
  };

  // Stage definitions for workspace header tab bar
  const stageTabs = [
    { num: 1, key: 'sec_01', label: '01 Laser Hour', icon: Clock },
    { num: 2, key: 'sec_02', label: '02 Profile', icon: Sliders },
    { num: 3, key: 'sec_03', label: '03 Power Output', icon: Zap },
    { num: 4, key: 'sec_04', label: '04 Optics', icon: Eye },
    { num: 5, key: 'sec_05', label: '05 Cooling', icon: Thermometer },
    { num: 6, key: 'sec_06', label: '06 Quality', icon: CheckCircle2 },
    { num: 7, key: 'sec_07', label: '07 Spare Parts', icon: Package },
    { num: 8, key: 'sec_08', label: '08 Remarks', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* 1. PRIMARY SMART MHC WORKSPACE */}
      {viewMode === 'smart_workspace' && (
        <SmartMhcWorkspace
          machine={selectedMachine}
          session={activeSession}
          onUpdateSession={handleUpdateSession}
          onOpenStageForm={(stageNum) => {
            setActiveStage(stageNum);
            setViewMode('stage_forms');
          }}
        />
      )}

      {/* 2. REPORT TEMPLATES VIEW */}
      {viewMode === 'report_templates' && (
        <MhcReportTemplates
          onSelectTemplate={(templateId) => {
            setViewMode('smart_workspace');
          }}
        />
      )}

      {/* 3. MHC HISTORY VIEW */}
      {viewMode === 'mhc_history' && (
        <MhcHistoryView
          sessions={mhcSessions}
          machines={machines}
          onOpenSmartWorkspace={(sessionId) => {
            const target = mhcSessions.find(s => s.id === sessionId);
            if (target) {
              setSelectedMachineId(target.machineId);
              setViewMode('smart_workspace');
            }
          }}
          onOpenStageForm={(sessionId, stageNum) => {
            const target = mhcSessions.find(s => s.id === sessionId);
            if (target) {
              setSelectedMachineId(target.machineId);
              setActiveStage(stageNum);
              setViewMode('stage_forms');
            }
          }}
        />
      )}

      {/* 4. OVERVIEW MODE: Machine Selection */}
      {viewMode === 'overview' && (
        <MhcMachineSelector
          machines={machines}
          selectedMachineId={selectedMachineId}
          onSelectMachine={(id) => setSelectedMachineId(id)}
          mhcSessions={mhcSessions}
          onStartNewSession={handleStartNewSession}
          onContinueSession={handleContinueSession}
        />
      )}

      {/* 5. ENGINEERING DATA STAGE FORMS (01 to 08 preserved) */}
      {viewMode === 'stage_forms' && activeSession && (
        <div className="space-y-6">
          {/* Active Session Header Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode('smart_workspace')}
                variant="outline"
                className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs py-2 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Smart MHC Workspace
              </Button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/50">
                    ENGINEERING DATA INSPECTION
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {activeSession.id}</span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-0.5">
                  {activeSession.machineName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Last saved: {activeSession.lastUpdated}
              </span>

              <Button
                onClick={() => setViewMode('summary')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5 shadow-md"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Review MHC Summary
              </Button>
            </div>
          </div>

          {/* 8-Stage Operational Step Bar */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-[720px]">
              {stageTabs.map((st) => {
                const Icon = st.icon;
                const status = activeSession.sectionStatuses[st.key] || 'NOT_STARTED';
                const isActive = activeStage === st.num;
                const isDone = status === 'COMPLETED';

                return (
                  <button
                    key={st.num}
                    onClick={() => setActiveStage(st.num)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                      isActive
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-sm'
                        : isDone
                        ? 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                        : 'bg-slate-900/20 text-slate-500 border-slate-900 hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isDone ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <span>{st.label}</span>
                    {isDone && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Stage Form */}
          <MhcStageForms
            session={activeSession}
            activeStage={activeStage}
            onUpdateSession={handleUpdateSession}
            onNavigateStage={(num) => setActiveStage(num)}
          />

          {/* Footer Navigation Buttons (Previous / Next) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              disabled={activeStage === 1}
              onClick={() => setActiveStage((p) => Math.max(1, p - 1))}
              variant="outline"
              className="border-slate-800 text-slate-300 text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Stage
            </Button>

            {activeStage < 8 ? (
              <Button
                onClick={() => setActiveStage((p) => Math.min(8, p + 1))}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-5 flex items-center gap-1.5"
              >
                Next Stage ({activeStage + 1}/8)
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setViewMode('summary')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-5 flex items-center gap-1.5"
              >
                Complete & Review Summary
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 6. SUMMARY MODE: Operational Review before Report Generation */}
      {viewMode === 'summary' && activeSession && (
        <MhcSummaryView
          session={activeSession}
          onNavigateStage={(stageNum) => {
            setActiveStage(stageNum);
            setViewMode('stage_forms');
          }}
          onProceedToReportBuilder={() => setViewMode('report_builder')}
        />
      )}

      {/* 7. REPORT BUILDER MODE */}
      {viewMode === 'report_builder' && activeSession && (
        <MhcReportBuilder
          session={activeSession}
          onFinalizeReport={(draft) => {
            setActiveDraftConfig(draft);
            setViewMode('final_report');
          }}
          onBackToSummary={() => setViewMode('summary')}
        />
      )}

      {/* 8. FINAL REPORT MODE */}
      {viewMode === 'final_report' && activeSession && activeDraftConfig && (
        <MhcFinalReportView
          session={activeSession}
          draftConfig={activeDraftConfig}
          onBackToBuilder={() => setViewMode('report_builder')}
        />
      )}
    </div>
  );
};
