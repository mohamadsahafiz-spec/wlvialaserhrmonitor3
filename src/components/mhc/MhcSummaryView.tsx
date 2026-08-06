import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Cpu, 
  Building2, 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { MHCSession } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface MhcSummaryViewProps {
  session: MHCSession;
  onNavigateStage: (stageNumber: number) => void;
  onProceedToReportBuilder: () => void;
}

export const MhcSummaryView: React.FC<MhcSummaryViewProps> = ({
  session,
  onNavigateStage,
  onProceedToReportBuilder
}) => {
  const stageDefinitions = [
    { num: 1, key: 'sec_01', name: '01 Current Laser Hour' },
    { num: 2, key: 'sec_02', name: '02 Laser Profile / Product' },
    { num: 3, key: 'sec_03', name: '03 Laser Output & Power' },
    { num: 4, key: 'sec_04', name: '04 Optics & Beam Profile' },
    { num: 5, key: 'sec_05', name: '05 Cooling System' },
    { num: 6, key: 'sec_06', name: '06 Product Quality / Visual' },
    { num: 7, key: 'sec_07', name: '07 Spare Parts & Consumables' },
    { num: 8, key: 'sec_08', name: '08 Engineer Remarks' },
  ];

  const completedCount = stageDefinitions.filter(
    (s) => session.sectionStatuses[s.key] === 'COMPLETED'
  ).length;

  const incompleteStages = stageDefinitions.filter(
    (s) => session.sectionStatuses[s.key] !== 'COMPLETED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/50">
                OPERATIONAL REVIEW SUMMARY
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {session.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              {session.machineName}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>{session.customerName}</span> • <span>{session.plantName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => onNavigateStage(incompleteStages[0]?.num || 1)}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs py-2.5 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Editing Stages
            </Button>

            <Button
              onClick={onProceedToReportBuilder}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <FileCheck className="w-4 h-4" />
              Generate MHC Report
            </Button>
          </div>
        </div>

        {/* Progress Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Stages Completion</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {completedCount} / 8 Completed
            </div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Field Engineer</span>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {session.engineerName || 'Field Engineer'}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Release Verdict</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {session.stage08_engineerRemarks?.productionReleaseVerdict || 'APPROVED'}
            </div>
          </div>
        </div>
      </div>

      {/* Incomplete Warning Banner */}
      {incompleteStages.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-300">
              {incompleteStages.length} Incomplete Inspection Section(s) Detected
            </h4>
            <p className="text-slate-300">
              The following sections have not been marked complete yet:
              <strong className="text-amber-200 ml-1">
                {incompleteStages.map((s) => s.name).join(', ')}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* 01-08 Section Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageDefinitions.map((s) => {
          const status = session.sectionStatuses[s.key] || 'NOT_STARTED';
          const isDone = status === 'COMPLETED';

          return (
            <Card
              key={s.key}
              onClick={() => onNavigateStage(s.num)}
              className={`cursor-pointer border transition p-4 ${
                isDone
                  ? 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                  : 'border-amber-900/40 bg-slate-900/30 hover:border-amber-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{s.name}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                Status: <span className={isDone ? 'text-emerald-400' : 'text-amber-400'}>{status}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Operational Conclusion Summary */}
      <Card className="border border-slate-800 bg-slate-900/80 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Engineering Findings & Production Release
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
          {session.stage08_engineerRemarks?.generalFindings || 'System verified operational during health check cycle.'}
        </p>
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-400">
            Follow-Up Required:{' '}
            <strong className="text-slate-200">
              {session.stage08_engineerRemarks?.followUpRequired ? 'YES' : 'NO'}
            </strong>
          </span>
          <Button
            onClick={onProceedToReportBuilder}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5"
          >
            Open Report Builder Workspace
          </Button>
        </div>
      </Card>
    </div>
  );
};
