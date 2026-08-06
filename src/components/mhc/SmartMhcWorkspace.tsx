import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LaserEngine } from '../../utils/laserEngine';
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
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  LayoutGrid, 
  SlidersHorizontal, 
  Settings2, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  X, 
  Grid, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  AlertTriangle, 
  Copy, 
  ChevronDown, 
  Search, 
  Filter, 
  RefreshCcw,
  CheckSquare,
  Square,
  Save,
  FolderOpen,
  LayoutTemplate,
  RotateCcw,
  Upload,
  FileCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  FileCode,
  Info,
  Printer,
  FileDown,
  Maximize,
  CheckCircle,
  XCircle,
  Wrench,
  UserCheck
} from 'lucide-react';
import { 
  Machine, 
  MHCSession, 
  SmartMhcDataTrayItem, 
  SmartMhcWidget,
  MhcWorkspaceTemplate,
  MhcWorkspaceDraft,
  MHCCustomField
} from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../utils/persistence';

interface SmartMhcWorkspaceProps {
  machine: Machine;
  session?: MHCSession;
  onUpdateSession?: (session: MHCSession) => void;
  onOpenStageForm?: (stageNum: number) => void;
}

// Built-in Default Report Layout Templates (Structure Only - No machine-specific readings)
const BUILT_IN_TEMPLATES: MhcWorkspaceTemplate[] = [
  {
    id: 'tpl_exec_std',
    title: 'Standard Executive Field MHC Template',
    description: 'A4 Single-Page Executive summary featuring Laser Life, Power Output, Thermal Loop, Beam Quality, and Engineer Verdict.',
    category: 'EXECUTIVE & FIELD RELEASE',
    revision: 'v1.3',
    updatedAt: '2026-08-06',
    isDefault: true,
    widgets: [
      {
        id: 'w-1',
        type: 'Laser Life',
        title: '01. Laser Life & Runtime Monitoring',
        subtitle: 'Recorded vs Calculated Current Laser Runtime Hours',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'Baseline vs Current',
        displayFields: { showGauge: true, showThresholds: true, showCalculated: true }
      },
      {
        id: 'w-2',
        type: 'Laser Temperature',
        title: '02. Thermal Loop & Chiller Status',
        subtitle: 'Laser Head & Coolant Operating Temperature',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'Spec Sheet vs Real-time',
        displayFields: { showChillerTemp: true, showFlowRate: true, showDiConductivity: true }
      },
      {
        id: 'w-3',
        type: 'Laser Power / Trend',
        title: '03. Laser Output Power Calibration',
        subtitle: 'Wattage Output Before vs After Optics Maintenance',
        width: '1/1',
        status: 'NORMAL',
        comparisonSource: 'Previous MHC vs Current',
        displayFields: { showRatedPower: true, showDeltaPct: true, showPowerChart: true }
      },
      {
        id: 'w-4',
        type: 'Beam Comparison',
        title: '04. Optical & Beam Profile Verification',
        subtitle: 'Beam Waist Spot Size, Focus Offset & M² Quality Factor',
        width: '1/1',
        status: 'NORMAL',
        comparisonSource: 'Previous MHC vs Current',
        displayFields: { showSpotSize: true, showM2Factor: true, showSymmetry: true }
      },
      {
        id: 'w-5',
        type: 'Product Info',
        title: '05. Product & Recipe Parameters',
        subtitle: 'Substrate Material & Laser Processing Recipe',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'None',
        displayFields: { showRecipeName: true, showSubstrate: true }
      },
      {
        id: 'w-6',
        type: 'Process Parameters',
        title: '06. Process Execution Settings',
        subtitle: 'Pulse Frequency, Scan Speed & Assist Gas Pressure',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'None',
        displayFields: { showScanSpeed: true, showFrequency: true }
      },
      {
        id: 'w-7',
        type: 'Recommendations',
        title: '07. Maintenance Recommendation',
        subtitle: 'Field Action Plan & ISO 13374-4 Condition Monitoring Intelligence',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'None',
        displayFields: { showVerdict: true, showNextAction: true, showConditionMonitoring: true }
      },
      {
        id: 'w-8',
        type: 'Spare Parts',
        title: '08. Consumables & Spare Parts Status',
        subtitle: 'DI Water Filter & Optics Lens Replacement Schedule',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'None',
        displayFields: { showPartNumbers: true, showStockLevel: true }
      }
    ]
  },
  {
    id: 'tpl_optical_audit',
    title: 'Deep Optical & Beam Profile Audit Template',
    description: 'Specialized layout focusing on M² beam quality, galvo scanner alignment, and optics cleanliness.',
    category: 'OPTICAL DIAGNOSTICS',
    revision: 'v1.0',
    updatedAt: '2026-08-04',
    widgets: [
      {
        id: 'w-op-1',
        type: 'Beam Comparison',
        title: '01. Optical & Beam Profile Spot Comparison',
        subtitle: 'Before vs After Optics Swabbing Beam Profile',
        width: '1/1',
        status: 'NORMAL',
        comparisonSource: 'Before vs After Maintenance',
        displayFields: { showSpotSize: true, showM2Factor: true, showSymmetry: true }
      },
      {
        id: 'w-op-2',
        type: 'Optics Condition',
        title: '02. Optics Surface & Focus Shift Offset',
        subtitle: 'Lens Cleanliness Score & Z-Offset Drift',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'Baseline vs Current',
        displayFields: { showCleanliness: true, showFocusOffset: true }
      },
      {
        id: 'w-op-3',
        type: 'Laser Power / Trend',
        title: '03. Laser Power Stability & Degradation',
        subtitle: 'Optical Power Output Calibration',
        width: '1/2',
        status: 'NORMAL',
        comparisonSource: 'Previous MHC vs Current',
        displayFields: { showRatedPower: true, showDeltaPct: true }
      },
      {
        id: 'w-op-4',
        type: 'Recommendations',
        title: '04. Optical Maintenance Action Plan',
        subtitle: 'Condition Monitoring Findings & Alignment Steps',
        width: '1/1',
        status: 'NORMAL',
        comparisonSource: 'None',
        displayFields: { showVerdict: true, showNextAction: true }
      }
    ]
  }
];

export const SmartMhcWorkspace: React.FC<SmartMhcWorkspaceProps> = ({
  machine,
  session,
  onUpdateSession,
  onOpenStageForm
}) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // DOM Refs for Real A4 Capacity Measurement
  const canvasPaperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 1. Local Active Session State
  const activeSession: MHCSession = useMemo(() => {
    if (session) return session;
    return {
      id: `MHC-${new Date().getFullYear()}-${machine.machineNumber.replace('MCH-', '')}`,
      machineId: machine.id,
      machineModel: machine.model,
      machineSerialNumber: machine.serialNumber,
      machineName: `${machine.model} (${machine.machineNumber})`,
      customerId: machine.customerId,
      customerName: machine.customerName,
      plantName: machine.plantName || 'Fab 18A Cleanroom',
      engineerName: 'Sahafiz',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      lastUpdated: new Date().toLocaleString(),
      completionStatus: 'IN_PROGRESS',
      currentSection: 1,
      sectionStatuses: {},
      stage01_laserHours: (machine.laserHeads || []).map((lh, i) => ({
        laserId: lh.id || `lh-${i}`,
        laserIdentifier: lh.model || `Laser Head #${i + 1}`,
        recordedLaserHour: lh.runningHours || 12450,
        readingDate: new Date().toISOString().split('T')[0],
        readingTime: '09:00',
        calculatedCurrentHour: (lh.runningHours || 12450) + 48,
        warningThreshold: 15000,
        criticalThreshold: 18000,
        runtimeStatus: 'NORMAL'
      })),
      stage02_laserProfile: {
        laserId: 'lh-1',
        productName: 'Cleanroom Semiconductor Wafer',
        recipeProgram: 'RECIPE_STD_PROCESS_V1',
        profileInfo: 'TEM00 Gaussian Profile - Single Mode',
        measurementInfo: 'Spot Size: 42.5 µm',
        supportingEvidence: 'Initial beam shape verified.',
        images: []
      },
      stage03_laserPower: (machine.laserHeads || []).map((lh, i) => ({
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
        sampleId: `SAMPLE-${machine.machineNumber}-001`,
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
      stage07_spareParts: [
        {
          id: 'sp-1',
          partName: 'DI Water Resin Filter Cartridge',
          partNumber: 'FIL-DI-9920',
          category: 'Cooling',
          quantity: 1,
          reason: 'Routine replacement cycle',
          action: 'REPLACED',
          costIndicator: 'CUSTOMER_COST',
          notes: 'DI conductivity restored to 0.08 µS/cm.'
        }
      ],
      stage08_engineerRemarks: {
        generalFindings: 'Machine overall operational condition verified. Thermal loop and optical alignment within specifications.',
        observedIssues: 'Minor optics dust buildup detected before swabbing.',
        correctiveActions: 'Cleaned output window lens with optical swab; verified beam profile TEM00.',
        recommendations: 'Continue standard 250-hour PM schedule. Next lens swab recommended in 90 days.',
        followUpRequired: false,
        productionReleaseVerdict: 'APPROVED'
      }
    };
  }, [session, machine]);

  // Update session helper — Single source of truth synchronization
  const handleSessionChange = (updated: MHCSession) => {
    if (onUpdateSession) {
      onUpdateSession(updated);
    }
  };

  // 2. Identify Previous MHC for current machine (Current vs Previous Comparison)
  const previousSession = useMemo(() => {
    const allSessions = StorageService.getMhcSessions();
    const matches = allSessions.filter(s => s.machineId === machine.id && s.id !== activeSession.id);
    return matches[0] || null;
  }, [machine.id, activeSession.id]);

  // 3. Pane Visibility Controls
  const [showDataTray, setShowDataTray] = useState<boolean>(true);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState<boolean>(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState<boolean>(true);
  const [leftPaneTab, setLeftPaneTab] = useState<'TRAY' | 'WIDGETS'>('TRAY');

  // 4. Zoom & Search Filters
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [traySearch, setTraySearch] = useState('');
  const [trayFilter, setTrayFilter] = useState<'ALL' | 'AVAILABLE' | 'MISSING' | 'NA'>('ALL');
  const [widgetSearch, setWidgetSearch] = useState('');

  // 5. Selected Widget State for Properties Panel
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>('w-1');

  // 6. Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 7. Modals State
  const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
  const [isSaveDraftModalOpen, setIsSaveDraftModalOpen] = useState(false);
  const [isLoadDraftModalOpen, setIsLoadDraftModalOpen] = useState(false);
  const [isInlineEditModalOpen, setIsInlineEditModalOpen] = useState(false);
  const [inlineEditItem, setInlineEditItem] = useState<{ key: string; label: string; value: any } | null>(null);
  const [isQualityCheckModalOpen, setIsQualityCheckModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Custom Data Form State
  const [newDataCat, setNewDataCat] = useState<SmartMhcDataTrayItem['category']>('Machine');
  const [newDataLabel, setNewDataLabel] = useState('');
  const [newDataVal, setNewDataVal] = useState('');
  const [newDataUnit, setNewDataUnit] = useState('');

  // Custom Widget Form State
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetWidth, setNewWidgetWidth] = useState<SmartMhcWidget['width']>('1/2');
  const [newWidgetDisplayType, setNewWidgetDisplayType] = useState<SmartMhcWidget['customDisplayType']>('card');
  const [selectedBoundKeys, setSelectedBoundKeys] = useState<string[]>([]);

  // Template Form State
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateCategory, setTemplateCategory] = useState('PREVENTIVE MAINTENANCE');
  const [templateDesc, setTemplateDesc] = useState('');

  // Draft Form State
  const [draftTitle, setDraftTitle] = useState('');

  // 8. DATA TRAY Items Calculation (Derived directly from Machine Passport + Active Session + Previous Session)
  const dataTrayItems = useMemo<SmartMhcDataTrayItem[]>(() => {
    const lh1 = machine.laserHeads?.[0] || machine.lasers?.[0];
    const lm = lh1 ? LaserEngine.calculateLaserMetrics(lh1) : null;
    const sLh1 = activeSession.stage01_laserHours?.[0];
    const sPower = activeSession.stage03_laserPower?.[0];
    const sOptics = activeSession.stage04_opticsBeam;
    const sCooling = activeSession.stage05_cooling;
    const sProfile = activeSession.stage02_laserProfile;
    const sQuality = activeSession.stage06_productQuality;
    const sRemarks = activeSession.stage08_engineerRemarks;

    const items: SmartMhcDataTrayItem[] = [
      // Machine Category
      { id: 'dt-m1', category: 'Machine', key: 'model', label: 'Machine Model', value: machine.model, status: 'AVAILABLE' },
      { id: 'dt-m2', category: 'Machine', key: 'serial', label: 'Serial Number', value: machine.serialNumber, status: 'AVAILABLE' },
      { id: 'dt-m3', category: 'Machine', key: 'customer', label: 'Customer', value: machine.customerName, status: 'AVAILABLE' },
      { id: 'dt-m4', category: 'Machine', key: 'plant', label: 'Plant / Location', value: machine.plantName || 'Cleanroom Fab 18A', status: 'AVAILABLE' },
      { id: 'dt-m5', category: 'Machine', key: 'health_score', label: 'Machine Health Score', value: `${machine.healthScore || 94}%`, status: 'AVAILABLE' },

      // Product & Process
      { id: 'dt-p1', category: 'Product & Process', key: 'product_name', label: 'Product / Recipe', value: sProfile?.productName || 'Cleanroom Semiconductor Wafer', status: sProfile?.productName ? 'AVAILABLE' : 'MISSING' },
      { id: 'dt-p2', category: 'Product & Process', key: 'recipe', label: 'Recipe Program', value: sProfile?.recipeProgram || 'RECIPE_STD_PROCESS_V1', status: sProfile?.recipeProgram ? 'AVAILABLE' : 'MISSING' },
      { id: 'dt-p3', category: 'Product & Process', key: 'via_diameter', label: 'Via Cut Diameter', value: sQuality?.viaDiameterUm || 42.5, unit: 'µm', status: sQuality?.viaDiameterUm ? 'AVAILABLE' : 'MISSING' },
      { id: 'dt-p4', category: 'Product & Process', key: 'sample_id', label: 'Sample Coupon ID', value: sQuality?.sampleId || `SAMPLE-${machine.machineNumber}-001`, status: 'AVAILABLE' },

      // Laser Category (Authoritative LaserEngine Data Tray)
      { id: 'dt-l1', category: 'Laser', key: 'laser_model', label: 'Laser Head Model', value: lm?.name || lh1?.model || 'TruMicro 7070', status: 'AVAILABLE' },
      { id: 'dt-l2', category: 'Laser', key: 'recorded_hours', label: 'Base Physical Meter (Hours)', value: sLh1?.recordedLaserHour || lm?.baseLaserHour || 12000, unit: 'hrs', status: 'AVAILABLE' },
      { id: 'dt-l3', category: 'Laser', key: 'calculated_hours', label: 'Calculated Current Hour', value: sLh1?.calculatedCurrentHour || lm?.calculatedCurrentHour || 12048, unit: 'hrs', status: 'AVAILABLE' },
      { id: 'dt-l3a', category: 'Laser', key: 'life_remaining_pct', label: 'Laser Life Remaining', value: lm?.formattedLifeRemaining || '75.2%', status: 'AVAILABLE' },
      { id: 'dt-l3b', category: 'Laser', key: 'remaining_hours', label: 'Remaining Hours', value: lm?.recommendedRemainingHour ? lm.recommendedRemainingHour.toLocaleString() : '12,952', unit: 'hrs', status: 'AVAILABLE' },
      { id: 'dt-l4', category: 'Laser', key: 'rated_power', label: 'Rated Laser Power', value: sPower?.ratedPowerWatts || lh1?.ratedPowerWatts || 250, unit: 'W', status: 'AVAILABLE' },
      { id: 'dt-l5', category: 'Laser', key: 'before_power', label: 'Laser Power (Before)', value: sPower?.beforeValueWatts || 240, unit: 'W', status: sPower?.beforeValueWatts ? 'AVAILABLE' : 'MISSING' },
      { id: 'dt-l6', category: 'Laser', key: 'after_power', label: 'Laser Power (After)', value: sPower?.afterValueWatts || 242, unit: 'W', status: sPower?.afterValueWatts ? 'AVAILABLE' : 'MISSING' },
      { id: 'dt-l7', category: 'Laser', key: 'laser_temp', label: 'Laser Temperature', value: '22.8', unit: '°C', status: 'AVAILABLE' },

      // Optical / Quality
      { id: 'dt-o1', category: 'Optical / Quality', key: 'beam_waist', label: 'Beam Comparison Images', value: 'Available (TEM00)', status: 'AVAILABLE' },
      { id: 'dt-o2', category: 'Optical / Quality', key: 'optics_condition', label: 'Optics Condition', value: sOptics?.beforeCondition || 'Minor dust on protective lens', status: 'MISSING' },
      { id: 'dt-o3', category: 'Optical / Quality', key: 'product_quality', label: 'Product Quality (B/A)', value: sQuality?.result || 'PASS', status: 'AVAILABLE' },

      // Maintenance
      { id: 'dt-c1', category: 'Maintenance', key: 'spare_parts', label: 'Spare Parts', value: activeSession.stage07_spareParts?.length ? `${activeSession.stage07_spareParts.length} parts` : '1 part pending', status: 'MISSING' },
      { id: 'dt-c2', category: 'Maintenance', key: 'recommendations', label: 'Recommendations', value: 'Replace protective window', status: 'AVAILABLE' },

      // Engineer Category
      { id: 'dt-e1', category: 'Engineer', key: 'remarks', label: 'Remarks', value: sRemarks?.generalFindings ? 'Recorded' : 'Nominal findings', status: 'AVAILABLE' },
      { id: 'dt-e2', category: 'Engineer', key: 'overall_condition', label: 'Overall Condition', value: 'HEALTHY', status: 'NA' },
      { id: 'dt-e3', category: 'Engineer', key: 'signature', label: 'Engineer / Signature', value: activeSession.engineerName || 'Sahafiz', status: 'AVAILABLE' },
    ];

    // Append session custom fields
    if (activeSession.stage01_laserHours?.[0]?.customFields) {
      activeSession.stage01_laserHours[0].customFields.forEach(cf => {
        items.push({
          id: `dt-custom-${cf.id}`,
          category: 'Laser',
          key: cf.label.toLowerCase().replace(/\s+/g, '_'),
          label: cf.label,
          value: cf.value,
          unit: cf.unit,
          status: 'AVAILABLE',
          isCustom: true
        });
      });
    }

    return items;
  }, [machine, activeSession]);

  // Filtered Data Tray Items
  const filteredDataTray = useMemo(() => {
    return dataTrayItems.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(traySearch.toLowerCase()) || 
                            String(item.value).toLowerCase().includes(traySearch.toLowerCase());
      const matchesFilter = trayFilter === 'ALL' || item.status === trayFilter;
      return matchesSearch && matchesFilter;
    });
  }, [dataTrayItems, traySearch, trayFilter]);

  // Grouped Data Tray items by Category
  const groupedDataTray = useMemo(() => {
    const categories: Array<SmartMhcDataTrayItem['category']> = [
      'Machine', 'Product & Process', 'Laser', 'Optical / Quality', 'Maintenance', 'Engineer'
    ];
    return categories.map(cat => ({
      category: cat,
      items: filteredDataTray.filter(i => i.category === cat)
    })).filter(g => g.items.length > 0);
  }, [filteredDataTray]);

  // 9. Canvas Widgets State
  const [canvasWidgets, setCanvasWidgets] = useState<SmartMhcWidget[]>(() => {
    return BUILT_IN_TEMPLATES[0].widgets;
  });

  // Selected Widget Object
  const selectedWidget = useMemo(() => {
    return canvasWidgets.find(w => w.id === selectedWidgetId) || canvasWidgets[0] || null;
  }, [canvasWidgets, selectedWidgetId]);

  // 10. Available Widget Templates for Library Pane
  const availableWidgetTemplates: Array<{
    type: SmartMhcWidget['type'];
    label: string;
    description: string;
    icon: React.ReactNode;
    defaultWidth: SmartMhcWidget['width'];
  }> = [
    { type: 'Machine Identity', label: 'Machine Identity', description: 'Core machine metadata, customer & location', icon: <Cpu className="w-4 h-4 text-sky-400" />, defaultWidth: '1/1' },
    { type: 'Laser Life', label: 'Laser Life', description: 'Recorded & calculated runtime hour gauges', icon: <Clock className="w-4 h-4 text-emerald-400" />, defaultWidth: '1/2' },
    { type: 'Laser Temperature', label: 'Laser Temperature', description: 'Laser head thermal loop & chiller readings', icon: <Thermometer className="w-4 h-4 text-cyan-400" />, defaultWidth: '1/2' },
    { type: 'Laser Power / Trend', label: 'Laser Power (Watt)', description: 'Power calibration table before vs after', icon: <Zap className="w-4 h-4 text-amber-400" />, defaultWidth: '1/1' },
    { type: 'Beam Comparison', label: 'Beam / Optical Condition', description: 'Beam profile spot & Rayleigh waist visualizer', icon: <Eye className="w-4 h-4 text-indigo-400" />, defaultWidth: '1/1' },
    { type: 'Optics Condition', label: 'Optics Condition', description: 'Cleanliness score, focus offset & M² factor', icon: <Sliders className="w-4 h-4 text-purple-400" />, defaultWidth: '1/2' },
    { type: 'Product Info', label: 'Current Product', description: 'Recipe program, material substrate info', icon: <FileText className="w-4 h-4 text-slate-400" />, defaultWidth: '1/2' },
    { type: 'Process Parameters', label: 'Process Parameters', description: 'Pulse frequency, scan speed & assist gas', icon: <SlidersHorizontal className="w-4 h-4 text-cyan-400" />, defaultWidth: '1/2' },
    { type: 'Recommendations', label: 'Maintenance Recommendation', description: 'Field action plan & ISO 13374-4 condition monitoring', icon: <AlertCircle className="w-4 h-4 text-rose-400" />, defaultWidth: '1/2' },
    { type: 'Spare Parts', label: 'Spare Parts', description: 'Consumable replacement checklist & status', icon: <Package className="w-4 h-4 text-orange-400" />, defaultWidth: '1/2' },
    { type: 'Text / Note', label: 'Text / Note', description: 'Freeform text observation block', icon: <FileSpreadsheet className="w-4 h-4 text-slate-400" />, defaultWidth: '1/1' },
    { type: 'Image', label: 'Image', description: 'Single inspection evidence photo block', icon: <ImageIcon className="w-4 h-4 text-indigo-400" />, defaultWidth: '1/2' },
    { type: 'Table', label: 'Table', description: 'Multi-row technical measurement table', icon: <Grid className="w-4 h-4 text-teal-400" />, defaultWidth: '1/1' },
    { type: 'Divider', label: 'Divider', description: 'Visual section boundary separator line', icon: <Layers className="w-4 h-4 text-slate-500" />, defaultWidth: '1/1' },
    { type: 'Custom Widget', label: 'Custom Widget', description: 'User-bound custom engineering widget', icon: <Sparkles className="w-4 h-4 text-amber-400" />, defaultWidth: '1/2' }
  ];

  const filteredLibraryWidgets = availableWidgetTemplates.filter(w =>
    w.label.toLowerCase().includes(widgetSearch.toLowerCase()) ||
    w.description.toLowerCase().includes(widgetSearch.toLowerCase())
  );

  // 11. DOM Measured Real A4 Page Capacity Engine
  const [actualA4Capacity, setActualA4Capacity] = useState<number>(84);

  useEffect(() => {
    if (!canvasPaperRef.current) return;
    const element = canvasPaperRef.current;
    
    // In standard A4 portrait aspect ratio (210:297),
    // target printable height = clientWidth * (297 / 210)
    const clientW = element.clientWidth || 794;
    const targetHeight = clientW * (297 / 210);
    const scrollH = element.scrollHeight;

    if (targetHeight > 0) {
      const fillPct = Math.round((scrollH / targetHeight) * 100);
      setActualA4Capacity(fillPct);
    }
  }, [canvasWidgets, zoomLevel]);

  // Fit Page Handler (Calculates LARGEST complete A4 page that physically fits in available viewport width & height)
  const handleFitPage = useCallback(() => {
    if (!canvasContainerRef.current) {
      setZoomLevel(95);
      return;
    }
    const containerW = canvasContainerRef.current.clientWidth - 48; // padding & margins
    const containerH = canvasContainerRef.current.clientHeight - 85; // canvas controls bar & padding
    
    // Base A4 portrait dimension (210:297) -> 820px x 1160px
    const baseW = 820;
    const baseH = 1160;

    if (containerW > 0 && containerH > 0) {
      const scaleW = containerW / baseW;
      const scaleH = containerH / baseH;
      
      // Calculate fit scale factor for largest complete page fit
      const fitScale = Math.min(scaleW, scaleH);
      const fitPercent = Math.max(50, Math.min(160, Math.round(fitScale * 100)));
      setZoomLevel(fitPercent);
      showToast(`Fit Page: ${fitPercent}% scale`);
    }
  }, []);

  // Auto-fit on mount and when panel toggle states change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitPage();
    }, 100);
    return () => clearTimeout(timer);
  }, [showDataTray, showWidgetLibrary, showPropertiesPanel, handleFitPage]);

  // 12. Add Custom Data Handler
  const handleAddCustomData = () => {
    if (!newDataLabel.trim()) return;
    const newField: MHCCustomField = {
      id: `custom_${Date.now()}`,
      label: newDataLabel.trim(),
      value: newDataVal || 'N/A',
      unit: newDataUnit || undefined,
      type: 'text'
    };

    const updatedSession: MHCSession = { ...activeSession };
    if (!updatedSession.stage01_laserHours[0]) {
      updatedSession.stage01_laserHours[0] = {
        laserId: 'lh-1',
        laserIdentifier: 'Laser Head #1',
        recordedLaserHour: 18240,
        readingDate: new Date().toISOString().split('T')[0],
        readingTime: '09:00',
        calculatedCurrentHour: 18288,
        warningThreshold: 20000,
        criticalThreshold: 25000,
        runtimeStatus: 'NORMAL'
      };
    }
    const currentCustom = updatedSession.stage01_laserHours[0].customFields || [];
    updatedSession.stage01_laserHours[0].customFields = [...currentCustom, newField];

    handleSessionChange(updatedSession);
    setNewDataLabel('');
    setNewDataVal('');
    setNewDataUnit('');
    setIsAddDataModalOpen(false);
    showToast(`Added custom data field "${newField.label}"`);
  };

  // 13. Add Widget to Canvas Handler
  const handleAddWidgetToCanvas = (type: SmartMhcWidget['type'], defaultWidth: SmartMhcWidget['width']) => {
    const template = availableWidgetTemplates.find(t => t.type === type);
    const newWidget: SmartMhcWidget = {
      id: `w-${Date.now()}`,
      type,
      title: template?.label || type,
      subtitle: template?.description || 'Custom report section',
      width: defaultWidth,
      status: 'NORMAL',
      comparisonSource: 'Baseline vs Current',
      displayFields: { showGauge: true, showTable: true }
    };
    setCanvasWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(newWidget.id);
    showToast(`Added "${newWidget.title}" to A4 Canvas`);
  };

  // 14. Create Custom Widget Handler
  const handleCreateCustomWidget = () => {
    if (!newWidgetTitle.trim()) return;
    const customWidget: SmartMhcWidget = {
      id: `w-custom-${Date.now()}`,
      type: 'Custom Widget',
      title: newWidgetTitle.trim(),
      subtitle: `Bound to ${selectedBoundKeys.length} data field(s)`,
      width: newWidgetWidth,
      status: 'NORMAL',
      comparisonSource: 'None',
      displayFields: {},
      boundFieldKeys: selectedBoundKeys,
      customDisplayType: newWidgetDisplayType
    };
    setCanvasWidgets(prev => [...prev, customWidget]);
    setSelectedWidgetId(customWidget.id);
    setNewWidgetTitle('');
    setSelectedBoundKeys([]);
    setIsAddWidgetModalOpen(false);
    showToast(`Created Custom Widget "${customWidget.title}"`);
  };

  // 15. Canvas Drag / Reorder Handlers
  const handleMoveWidget = (id: string, direction: 'UP' | 'DOWN') => {
    const idx = canvasWidgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    if (direction === 'UP' && idx === 0) return;
    if (direction === 'DOWN' && idx === canvasWidgets.length - 1) return;

    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    const newArr = [...canvasWidgets];
    const [moved] = newArr.splice(idx, 1);
    newArr.splice(targetIdx, 0, moved);
    setCanvasWidgets(newArr);
  };

  const handleDuplicateWidget = (widget: SmartMhcWidget) => {
    const copy: SmartMhcWidget = {
      ...widget,
      id: `w-copy-${Date.now()}`,
      title: `${widget.title} (Copy)`
    };
    const idx = canvasWidgets.findIndex(w => w.id === widget.id);
    const newArr = [...canvasWidgets];
    newArr.splice(idx + 1, 0, copy);
    setCanvasWidgets(newArr);
    setSelectedWidgetId(copy.id);
    showToast(`Duplicated widget`);
  };

  const handleRemoveWidget = (id: string) => {
    setCanvasWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(canvasWidgets[0]?.id || null);
    }
    showToast(`Removed widget`);
  };

  // Update Selected Widget Properties Handler
  const handleUpdateSelectedWidget = (updatedFields: Partial<SmartMhcWidget>) => {
    if (!selectedWidgetId) return;
    setCanvasWidgets(prev => prev.map(w => w.id === selectedWidgetId ? { ...w, ...updatedFields } : w));
  };

  // 16. Template Save & Load Handlers (STRICT TEMPLATE SEPARATION - Structure ONLY)
  const handleSaveAsTemplate = () => {
    if (!templateTitle.trim()) return;
    const newTpl: MhcWorkspaceTemplate = {
      id: `tpl_user_${Date.now()}`,
      title: templateTitle.trim(),
      description: templateDesc || 'User defined A4 report structure',
      category: templateCategory,
      revision: 'v1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      widgets: canvasWidgets.map(w => ({
        id: w.id,
        type: w.type,
        title: w.title,
        subtitle: w.subtitle,
        width: w.width,
        status: w.status,
        comparisonSource: w.comparisonSource,
        displayFields: w.displayFields,
        customDisplayType: w.customDisplayType,
        boundFieldKeys: w.boundFieldKeys
        // Strictly strip out serial numbers, readings, images, and session IDs
      }))
    };
    const existingTemplates = StorageService.getMhcWorkspaceTemplates();
    StorageService.saveMhcWorkspaceTemplates([...existingTemplates, newTpl]);
    setTemplateTitle('');
    setTemplateDesc('');
    setIsSaveTemplateModalOpen(false);
    showToast(`Template "${newTpl.title}" saved successfully (Structure Only)`);
  };

  const handleLoadTemplate = (tpl: MhcWorkspaceTemplate) => {
    setCanvasWidgets(tpl.widgets);
    setSelectedWidgetId(tpl.widgets[0]?.id || null);
    setIsLoadTemplateModalOpen(false);
    showToast(`Loaded Template "${tpl.title}"`);
  };

  // 17. Draft Save & Load Handlers (STRICT DRAFT SEPARATION - Full Snapshot)
  const handleSaveDraft = () => {
    const title = draftTitle.trim() || `Draft MHC - ${machine.model} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const draft: MhcWorkspaceDraft = {
      id: `draft_${Date.now()}`,
      sessionId: activeSession.id,
      machineId: machine.id,
      machineName: machine.model,
      draftTitle: title,
      lastSaved: new Date().toLocaleString(),
      widgets: canvasWidgets,
      sessionSnapshot: activeSession
    };
    const drafts = StorageService.getMhcWorkspaceDrafts();
    StorageService.saveMhcWorkspaceDrafts([draft, ...drafts.filter(d => d.id !== draft.id)]);
    setIsSaveDraftModalOpen(false);
    setDraftTitle('');
    showToast(`Draft "${title}" saved`);
  };

  const handleLoadDraft = (draft: MhcWorkspaceDraft) => {
    if (draft.sessionSnapshot) {
      handleSessionChange(draft.sessionSnapshot);
    }
    setCanvasWidgets(draft.widgets);
    setSelectedWidgetId(draft.widgets[0]?.id || null);
    setIsLoadDraftModalOpen(false);
    showToast(`Loaded Draft "${draft.draftTitle}"`);
  };

  // 18. Quick Inline Data Editing inside Smart MHC (Synchronized)
  const handleOpenInlineEdit = (key: string, label: string, value: any) => {
    setInlineEditItem({ key, label, value });
    setIsInlineEditModalOpen(true);
  };

  const handleSaveInlineEdit = (newVal: any) => {
    if (!inlineEditItem) return;
    const updated = { ...activeSession };

    if (inlineEditItem.key === 'before_power' && updated.stage03_laserPower?.[0]) {
      updated.stage03_laserPower[0].beforeValueWatts = Number(newVal);
    } else if (inlineEditItem.key === 'after_power' && updated.stage03_laserPower?.[0]) {
      updated.stage03_laserPower[0].afterValueWatts = Number(newVal);
    } else if (inlineEditItem.key === 'product_name' && updated.stage02_laserProfile) {
      updated.stage02_laserProfile.productName = String(newVal);
    } else if (inlineEditItem.key === 'recipe' && updated.stage02_laserProfile) {
      updated.stage02_laserProfile.recipeProgram = String(newVal);
    } else if (inlineEditItem.key === 'optics_condition' && updated.stage04_opticsBeam) {
      updated.stage04_opticsBeam.beforeCondition = String(newVal);
    }

    handleSessionChange(updated);
    setIsInlineEditModalOpen(false);
    setInlineEditItem(null);
    showToast(`Updated & synchronized "${inlineEditItem.label}"`);
  };

  // 19. Quality Check & Export PDF Handler
  const qualityCheckResults = useMemo(() => {
    const checks = [
      { id: 'qc-mch', label: 'Machine Identity & Serial Number Available', passed: Boolean(machine.model && machine.serialNumber), type: 'INFO' },
      { id: 'qc-cond', label: 'Current Condition & Health Score Represented', passed: Boolean(machine.healthScore), type: 'INFO' },
      { id: 'qc-hist', label: 'Previous MHC Historical Comparison Available', passed: Boolean(previousSession), type: 'INFO' },
      { id: 'qc-prog', label: 'Diode Remaining Life / Prognosis Calculated', passed: true, type: 'INFO' },
      { id: 'qc-recom', label: 'Maintenance Action Plan & Recommendations Present', passed: Boolean(activeSession.stage08_engineerRemarks?.recommendations), type: 'INFO' },
      { id: 'qc-evid', label: 'Required Beam Profile / Visual Evidence Present', passed: true, type: 'INFO' },
      { id: 'qc-a4', label: 'A4 One-Page Capacity Limit (<= 100%)', passed: actualA4Capacity <= 100, type: 'BLOCKING', details: `Current: ${actualA4Capacity}%` }
    ];
    const hasBlockingError = checks.some(c => c.type === 'BLOCKING' && !c.passed);
    return { checks, hasBlockingError };
  }, [machine, activeSession, previousSession, actualA4Capacity]);

  const handleTriggerPdfExport = () => {
    if (qualityCheckResults.hasBlockingError) {
      setIsQualityCheckModalOpen(true);
      return;
    }
    // Open preview modal for isolated printing
    setIsPreviewModalOpen(true);
  };

  const handleExecutePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3 w-full">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP WORKFLOW STEPS HEADER BAR & KEY PRINCIPLE (Matching Reference Layout) */}
      <div className={`p-3 rounded-lg border space-y-2.5 ${
        isDark ? 'bg-[#15181C] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
      }`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Workflow Steps */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 text-xs">
            <div className="flex items-center gap-2 bg-[#1A1D21] border border-[#2B323A] px-2.5 py-1.5 rounded shrink-0">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">1</span>
              <span className="text-slate-300 font-medium">Select Machine</span>
              <span className="text-[10px] text-slate-500">(From Passport)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            <div className="flex items-center gap-2 bg-[#1A1D21] border border-[#2B323A] px-2.5 py-1.5 rounded shrink-0">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">2</span>
              <span className="text-slate-300 font-medium">Start New MHC</span>
              <span className="text-[10px] text-slate-500">(Auto load)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            <div className="flex items-center gap-2 bg-[#1A1D21] border border-[#2B323A] px-2.5 py-1.5 rounded shrink-0">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">3</span>
              <span className="text-slate-300 font-medium">Choose Template</span>
              <span className="text-[10px] text-slate-500">(Or create new)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            <div className="flex items-center gap-2 bg-[#8B9DFF]/15 border border-[#8B9DFF]/40 px-2.5 py-1.5 rounded shrink-0 text-[#8B9DFF] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#8B9DFF] text-slate-950 text-[10px] font-bold flex items-center justify-center">4</span>
              <span>One-Page Workspace</span>
              <span className="text-[10px] text-[#8B9DFF]/80">(Verify & Fill)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            <div className="flex items-center gap-2 bg-[#1A1D21] border border-[#2B323A] px-2.5 py-1.5 rounded shrink-0">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">5</span>
              <span className="text-slate-300 font-medium">Export PDF</span>
              <span className="text-[10px] text-slate-500">(Exactly 1 A4 page)</span>
            </div>
          </div>

          {/* Key Principle Card */}
          <div className="flex items-center gap-2.5 bg-indigo-950/30 border border-indigo-900/50 p-2 rounded-lg text-xs shrink-0 max-w-md">
            <div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-indigo-300 text-[11px] block">KEY PRINCIPLE</span>
              <p className="text-[10px] text-slate-300 leading-tight">
                FSOS fills what it already knows. Engineer only enters new or missing data. Dashboard reduces workload.
              </p>
            </div>
          </div>
        </div>

        {/* Title Bar & Workspace Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div>
            <h2 className="text-sm font-black text-slate-100 tracking-wider uppercase flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#8B9DFF]" />
              FSOS — SMART ONE-PAGE MHC REPORT WORKSPACE
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Measure Less. Verify More. Deliver More.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              onClick={() => setIsSaveDraftModalOpen(true)}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-[11px] py-1 px-2.5 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              Save Draft
            </Button>

            <Button
              onClick={() => setIsLoadDraftModalOpen(true)}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-[11px] py-1 px-2.5 flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              Drafts
            </Button>

            <Button
              onClick={() => setIsSaveTemplateModalOpen(true)}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-[11px] py-1 px-2.5 flex items-center gap-1.5"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
              Save Template
            </Button>

            <Button
              onClick={() => setIsLoadTemplateModalOpen(true)}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-[11px] py-1 px-2.5 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              Load Template
            </Button>

            {/* Pane Toggles */}
            <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
              <button
                onClick={() => setShowDataTray(p => !p)}
                className={`p-1.5 rounded text-[11px] transition border flex items-center gap-1 ${
                  showDataTray ? 'bg-[#8B9DFF]/20 text-[#8B9DFF] border-[#8B9DFF]/40' : 'bg-slate-800/40 text-slate-400 border-slate-700'
                }`}
                title="Toggle Data Tray"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Data Tray</span>
              </button>
              <button
                onClick={() => setShowWidgetLibrary(p => !p)}
                className={`p-1.5 rounded text-[11px] transition border flex items-center gap-1 ${
                  showWidgetLibrary ? 'bg-[#8B9DFF]/20 text-[#8B9DFF] border-[#8B9DFF]/40' : 'bg-slate-800/40 text-slate-400 border-slate-700'
                }`}
                title="Toggle Widget Library"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Widgets</span>
              </button>
              <button
                onClick={() => setShowPropertiesPanel(p => !p)}
                className={`p-1.5 rounded text-[11px] transition border flex items-center gap-1 ${
                  showPropertiesPanel ? 'bg-[#8B9DFF]/20 text-[#8B9DFF] border-[#8B9DFF]/40' : 'bg-slate-800/40 text-slate-400 border-slate-700'
                }`}
                title="Toggle Properties Panel"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Properties</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ISO 13374-4 CONDITION MONITORING INTELLIGENCE BANNER */}
      <div className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isDark ? 'bg-[#121926] border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Condition-Monitoring Intelligence (ISO 13374-4 Inspired)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                Health Score: {machine.healthScore || 94}%
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 mt-0.5">
              CURRENT CONDITION: <strong className="text-emerald-400">NOMINAL OPTICAL POWER (99.2% Stability)</strong> • Chiller 20.0°C • Diode Life: ~6,760 hrs remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Power Change: -3.2% (-8 W) vs Prev</span>
          </div>

          {previousSession && (
            <div className="text-slate-400 border-l border-slate-700 pl-3">
              Prev MHC: <span className="text-slate-200 font-bold">{previousSession.startDate} ({previousSession.id})</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER (DESKTOP HIERARCHY: [ DATA/WIDGETS ] [ LARGE A4 CANVAS ] [ PROPERTIES ]) */}
      <div className="flex gap-2 sm:gap-3 min-h-[calc(100vh-13rem)] items-stretch w-full">
        {/* LEFT SUPPORTING PANEL: DATA TRAY & WIDGET LIBRARY */}
        {(showDataTray || showWidgetLibrary) ? (
          <div className="w-60 lg:w-64 xl:w-72 shrink-0 flex flex-col gap-3 transition-all">
            {/* Tabs header when left panel is active */}
            <div className="flex items-center justify-between bg-[#15181C] p-1 rounded-md border border-[#2B323A] text-xs">
              <div className="flex items-center gap-1 flex-1">
                {showDataTray && (
                  <button
                    onClick={() => setLeftPaneTab('TRAY')}
                    className={`flex-1 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                      leftPaneTab === 'TRAY'
                        ? 'bg-[#8B9DFF] text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Data Tray</span>
                  </button>
                )}
                {showWidgetLibrary && (
                  <button
                    onClick={() => setLeftPaneTab('WIDGETS')}
                    className={`flex-1 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                      leftPaneTab === 'WIDGETS'
                        ? 'bg-emerald-400 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Widgets</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => { setShowDataTray(false); setShowWidgetLibrary(false); }}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 shrink-0 ml-1"
                title="Collapse Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: DATA TRAY */}
            {showDataTray && (leftPaneTab === 'TRAY' || !showWidgetLibrary) && (
              <div className={`p-3.5 rounded-lg border flex-1 flex flex-col justify-between ${
                isDark ? 'bg-[#15181C] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#8B9DFF]" />
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        DATA TRAY (What's Available)
                      </h3>
                    </div>

                    <Button
                      onClick={() => setIsAddDataModalOpen(true)}
                      className="bg-[#8B9DFF]/15 hover:bg-[#8B9DFF]/30 text-[#8B9DFF] border border-[#8B9DFF]/30 text-[10px] py-1 px-2 flex items-center gap-1 rounded"
                    >
                      <Plus className="w-3 h-3" />
                      Add Custom
                    </Button>
                  </div>

                  {/* Search & Filter Tabs */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search data fields..."
                        value={traySearch}
                        onChange={(e) => setTraySearch(e.target.value)}
                        className="w-full bg-[#1A1D21] border border-[#2B323A] rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#8B9DFF]"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#1A1D21] p-1 rounded border border-[#2B323A] text-[10px]">
                      {(['ALL', 'AVAILABLE', 'MISSING', 'NA'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setTrayFilter(tab)}
                          className={`flex-1 py-1 rounded font-semibold transition ${
                            trayFilter === tab
                              ? 'bg-[#8B9DFF] text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grouped Data Items List */}
                  <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
                    {groupedDataTray.map(group => (
                      <div key={group.category} className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          {group.category} ({group.items.length})
                        </span>

                        <div className="space-y-1">
                          {group.items.map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (item.status === 'MISSING') {
                                  handleOpenInlineEdit(item.key, item.label, item.value);
                                }
                              }}
                              className={`p-2 rounded border flex items-center justify-between text-xs transition ${
                                item.status === 'MISSING'
                                  ? 'bg-amber-950/30 border-amber-800/60 hover:bg-amber-950/50 cursor-pointer'
                                  : isDark
                                  ? 'bg-[#1A1D21] border-[#2B323A] hover:border-slate-700'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-medium text-slate-300 block truncate">{item.label}</span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {item.value} {item.unit || ''}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.isCustom && (
                                  <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1 rounded">
                                    Custom
                                  </span>
                                )}
                                <Badge
                                  variant={
                                    item.status === 'AVAILABLE' ? 'success' :
                                    item.status === 'MISSING' ? 'warning' : 'secondary'
                                  }
                                  className="text-[9px] px-1.5 py-0.2"
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
                  Total {dataTrayItems.length} Data Items • Single Source of Truth
                </div>
              </div>
            )}

            {/* TAB 2: WIDGET LIBRARY */}
            {showWidgetLibrary && (leftPaneTab === 'WIDGETS' || !showDataTray) && (
              <div className={`p-3.5 rounded-lg border flex-1 flex flex-col justify-between ${
                isDark ? 'bg-[#15181C] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        WIDGET LIBRARY
                      </h3>
                    </div>

                    <Button
                      onClick={() => setIsAddWidgetModalOpen(true)}
                      className="bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] py-1 px-2 flex items-center gap-1 rounded"
                    >
                      <Plus className="w-3 h-3" />
                      Custom
                    </Button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter widgets..."
                      value={widgetSearch}
                      onChange={(e) => setWidgetSearch(e.target.value)}
                      className="w-full bg-[#1A1D21] border border-[#2B323A] rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5 overflow-y-auto max-h-[580px] pr-1">
                    {filteredLibraryWidgets.map((wt, i) => (
                      <div
                        key={i}
                        onClick={() => handleAddWidgetToCanvas(wt.type, wt.defaultWidth)}
                        className={`p-2 rounded border flex items-center justify-between group cursor-pointer transition ${
                          isDark
                            ? 'bg-[#1A1D21] border-[#2B323A] hover:border-emerald-500/60 hover:bg-slate-800/80'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            {wt.icon}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-xs text-slate-200 block truncate group-hover:text-emerald-400">
                              {wt.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              Width: {wt.defaultWidth}
                            </span>
                          </div>
                        </div>

                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
                  Click widget to add to A4 Canvas
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => setShowDataTray(true)}
            className="w-9 shrink-0 bg-[#15181C] border border-[#2B323A] rounded-lg p-2 flex flex-col items-center py-4 gap-4 hover:bg-[#1A1D21] cursor-pointer transition-all group"
            title="Expand Data Tray & Widget Library"
          >
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8B9DFF]" />
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 group-hover:text-[#8B9DFF] tracking-widest whitespace-nowrap -rotate-90 transform">
                DATA & WIDGETS
              </span>
            </div>
          </div>
        )}

        {/* PRIMARY WORKSPACE: LARGE A4 CANVAS (EXPANDS & RECENTERS WHEN PANELS ARE COLLAPSED) */}
        <div 
          ref={canvasContainerRef}
          className={`flex-1 min-w-0 p-4 rounded-lg border flex flex-col justify-between overflow-y-auto ${
            isDark ? 'bg-[#0B0D10] border-[#2B323A]' : 'bg-slate-200 border-slate-300 shadow-inner'
          }`}
        >
          <div className="space-y-3">
            {/* Canvas View Controls Bar */}
            <div className="p-2.5 rounded-md bg-[#15181C] border border-[#2B323A] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  PRIMARY A4 REPORT CANVAS
                </h3>
              </div>

              {/* View & Capacity Controls */}
              <div className="flex items-center gap-3 text-xs font-mono">
                {/* Real A4 Capacity Indicator */}
                <div className="flex items-center gap-2 bg-[#1A1D21] border border-[#2B323A] px-2.5 py-1 rounded">
                  <span className="text-slate-400">A4 Capacity:</span>
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        actualA4Capacity > 100 ? 'bg-rose-500' : actualA4Capacity > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, actualA4Capacity)}%` }}
                    />
                  </div>
                  <span className={`font-bold ${actualA4Capacity > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {actualA4Capacity}% {actualA4Capacity <= 100 ? '✔ Fits on 1 page' : '⚠️ Exceeds 1 page'}
                  </span>
                </div>

                {/* Document View Controls */}
                <div className="flex items-center gap-1 bg-[#1A1D21] border border-[#2B323A] p-0.5 rounded">
                  <button
                    onClick={() => setZoomLevel(p => Math.max(60, p - 10))}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 text-[10px]"
                    title="Zoom Out"
                  >
                    Zoom -
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[10px]"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    onClick={() => setZoomLevel(p => Math.min(130, p + 10))}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 text-[10px]"
                    title="Zoom In"
                  >
                    Zoom +
                  </button>
                  <button
                    onClick={handleFitPage}
                    className="px-2 py-0.5 rounded bg-[#8B9DFF]/20 text-[#8B9DFF] border border-[#8B9DFF]/30 font-bold text-[10px] hover:bg-[#8B9DFF]/30"
                  >
                    Fit Page
                  </button>
                </div>
              </div>
            </div>

            {/* Overflow Alert Banner if A4 Capacity > 100% */}
            {actualA4Capacity > 100 && (
              <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>A4 Overflow Detected ({actualA4Capacity}%):</strong> Report height exceeds 1 printable page. Resize or remove widgets to enable 1-page PDF export.
                  </span>
                </div>
              </div>
            )}

            {/* A4 CANVAS DOCUMENT CONTAINER (TRUE 210:297 PROPORTION) */}
            <div className="flex justify-center items-start w-full py-2 overflow-auto">
              <div 
                ref={canvasPaperRef}
                style={{ 
                  transform: `scale(${zoomLevel / 100})`, 
                  transformOrigin: 'top center',
                  width: '820px',
                  minHeight: '1160px',
                  marginBottom: zoomLevel < 100 ? `-${(1 - zoomLevel / 100) * 1160}px` : undefined
                }}
                className={`p-8 rounded-lg border space-y-4 transition-transform duration-150 ${
                  isDark ? 'bg-[#15181C] border-slate-700 shadow-2xl' : 'bg-white border-slate-300 shadow-xl text-slate-900'
                }`}
              >
                {/* 1. REPORT DOCUMENT HEADER */}
                <div className="pb-4 border-b-2 border-slate-700 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-100 uppercase">
                      MACHINE HEALTH REPORT
                    </h1>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {machine.model} • {machine.machineNumber} • {machine.serialNumber} • {machine.customerName}
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-[#8B9DFF] font-bold block">{activeSession.id}</span>
                    <span className="text-slate-400 block">{activeSession.startDate || '06 AUGUST 2026'}</span>
                  </div>
                </div>

                {/* 2. REPORT CANVAS WIDGETS GRID */}
                <div className="grid grid-cols-2 gap-3.5">
                  {canvasWidgets.map((widget) => {
                    const isSelected = selectedWidgetId === widget.id;
                    const colSpanClass = widget.width === '1/1' ? 'col-span-2' : 'col-span-1';

                    return (
                      <div
                        key={widget.id}
                        onClick={() => setSelectedWidgetId(widget.id)}
                        className={`${colSpanClass} p-3.5 rounded-lg border transition relative group ${
                          isSelected
                            ? 'border-[#8B9DFF] ring-2 ring-[#8B9DFF]/30 bg-[#1A1D24]'
                            : isDark
                            ? 'bg-[#191C22] border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Widget Header Controls */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-100 truncate">{widget.title}</span>
                            <Badge variant={widget.status === 'NORMAL' ? 'success' : 'warning'} className="text-[9px]">
                              {widget.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveWidget(widget.id, 'UP'); }}
                              className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveWidget(widget.id, 'DOWN'); }}
                              className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicateWidget(widget); }}
                              className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              title="Duplicate Widget"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveWidget(widget.id); }}
                              className="p-1 rounded text-slate-400 hover:bg-rose-950 hover:text-rose-400"
                              title="Remove Widget"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* WIDGET CONTENT RENDERERS MATCHING REFERENCE DESIGNS */}
                        {/* WIDGET 1: LASER LIFE */}
                        {widget.type === 'Laser Life' && (
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex items-center justify-between text-slate-200">
                              <span className="text-base font-black text-emerald-400">18,240 hrs</span>
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                                73%
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-emerald-500 h-full w-[73%]" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                              <div>Remaining: <strong className="text-slate-200">6,760 hrs</strong></div>
                              <div>Replace @: <strong className="text-slate-200">25,000 hrs</strong></div>
                            </div>
                          </div>
                        )}

                        {/* WIDGET 2: LASER TEMPERATURE */}
                        {widget.type === 'Laser Temperature' && (
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center text-[11px] text-slate-300">
                              <span>AVG: <strong className="text-cyan-400">22.8°C</strong></span>
                              <span>MIN: <strong className="text-slate-300">21.4°C</strong></span>
                              <span>MAX: <strong className="text-slate-300">24.1°C</strong></span>
                              <span className="text-emerald-400 font-bold">STABLE</span>
                            </div>
                            {/* Visual Thermal Loop Sparkline */}
                            <div className="h-10 bg-slate-900/80 rounded border border-slate-800 flex items-end justify-between px-2 py-1 gap-1">
                              {[21.4, 22.0, 22.8, 23.1, 22.5, 22.8, 23.0, 22.6, 22.8, 24.1, 22.8].map((v, idx) => (
                                <div key={idx} className="flex-1 bg-cyan-500/80 hover:bg-cyan-400 rounded-t" style={{ height: `${((v - 20) / 5) * 100}%` }} title={`${v}°C`} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* WIDGET 3: LASER POWER (WATT) */}
                        {widget.type === 'Laser Power / Trend' && (
                          <div className="space-y-1.5 text-xs font-mono">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                                  <th className="py-1 font-normal">Previous ({previousSession?.startDate || '04 May 2026'})</th>
                                  <th className="py-1 font-normal">Current (06 Aug 2026)</th>
                                  <th className="py-1 font-normal">Change</th>
                                  <th className="py-1 font-normal text-right">Condition</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="text-slate-200">
                                  <td className="py-1.5 font-bold">250 W</td>
                                  <td className="py-1.5 font-bold text-emerald-400">242 W</td>
                                  <td className="py-1.5 font-bold text-rose-400">-3.2% ▼ 8 W</td>
                                  <td className="py-1.5 font-bold text-right text-emerald-400">NORMAL</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* WIDGET 4: BEAM / OPTICAL CONDITION */}
                        {widget.type === 'Beam Comparison' && (
                          <div className="space-y-2 text-xs font-mono">
                            <table className="w-full text-left border-collapse text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                                  <th className="py-1 font-normal">Component</th>
                                  <th className="py-1 font-normal text-center">PREVIOUS (04 May 2026)</th>
                                  <th className="py-1 text-center font-normal">➔</th>
                                  <th className="py-1 font-normal text-center">CURRENT (06 Aug 2026)</th>
                                  <th className="py-1 font-normal text-right">CHANGE</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50">
                                <tr>
                                  <td className="py-1.5 text-slate-300 font-semibold">Laser Source</td>
                                  <td className="py-1.5 text-center text-indigo-400">● Gaussian TEM00</td>
                                  <td className="py-1.5 text-center text-slate-500">➔</td>
                                  <td className="py-1.5 text-center text-indigo-400">● Gaussian TEM00</td>
                                  <td rowSpan={3} className="py-1.5 text-right align-middle">
                                    <div className="text-[10px] text-slate-400">Profile Deviation</div>
                                    <div className="text-emerald-400 font-bold text-xs">2.1%</div>
                                    <div className="text-[10px] text-emerald-400">ACCEPTABLE</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 text-slate-300 font-semibold">Optics Lens</td>
                                  <td className="py-1.5 text-center text-cyan-400">Clean 98%</td>
                                  <td className="py-1.5 text-center text-slate-500">➔</td>
                                  <td className="py-1.5 text-center text-amber-400">Swabbed (95%)</td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 text-slate-300 font-semibold">Output Mask</td>
                                  <td className="py-1.5 text-center text-slate-300">Aligned 0.00mm</td>
                                  <td className="py-1.5 text-center text-slate-500">➔</td>
                                  <td className="py-1.5 text-center text-slate-300">Aligned 0.01mm</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* WIDGET 5: CURRENT PRODUCT */}
                        {widget.type === 'Product Info' && (
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div><span className="text-slate-400 block text-[10px]">Product</span><strong className="text-slate-200">Semiconductor Wafer</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Recipe</span><strong className="text-slate-200">ABC-123_RECIPE</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Lot / Panel</span><strong className="text-slate-200">LOT20260806-01</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Total Panels</span><strong className="text-slate-200">120</strong></div>
                          </div>
                        )}

                        {/* WIDGET 6: PROCESS PARAMETERS */}
                        {widget.type === 'Process Parameters' && (
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div><span className="text-slate-400 block text-[10px]">Power</span><strong className="text-cyan-400">72%</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Shots</span><strong className="text-slate-200">24</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Frequency</span><strong className="text-slate-200">80 kHz</strong></div>
                            <div><span className="text-slate-400 block text-[10px]">Pulse Width</span><strong className="text-slate-200">8 ns</strong></div>
                          </div>
                        )}

                        {/* WIDGET 7: MAINTENANCE RECOMMENDATION */}
                        {widget.type === 'Recommendations' && (
                          <div className="space-y-2 text-xs">
                            <div className="space-y-1 text-slate-300 text-[11px]">
                              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Replace protective window during next PM (recommended).</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Laser source condition acceptable.</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Cooling system thermal loop stable.</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* WIDGET 8: SPARE PARTS */}
                        {widget.type === 'Spare Parts' && (
                          <div className="space-y-1.5 text-xs font-mono">
                            <table className="w-full text-left text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                                  <th className="py-0.5">SPARE PARTS</th>
                                  <th className="py-0.5 text-right">QTY</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-1 text-slate-300">Protective Window</td>
                                  <td className="py-1 text-right text-amber-400 font-bold">1 pc (Plan next PM)</td>
                                </tr>
                                <tr>
                                  <td className="py-1 text-slate-300">DI Water Filter</td>
                                  <td className="py-1 text-right text-slate-400">0</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* GENERIC / CUSTOM WIDGET RENDERER */}
                        {widget.type !== 'Laser Life' && 
                         widget.type !== 'Laser Temperature' && 
                         widget.type !== 'Laser Power / Trend' && 
                         widget.type !== 'Beam Comparison' && 
                         widget.type !== 'Product Info' && 
                         widget.type !== 'Process Parameters' && 
                         widget.type !== 'Recommendations' && 
                         widget.type !== 'Spare Parts' && (
                          <div className="space-y-2 text-xs text-slate-400 font-mono">
                            <p>{widget.subtitle || 'Bound to machine readings & session data.'}</p>
                            {widget.boundFieldKeys && widget.boundFieldKeys.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {widget.boundFieldKeys.map(k => (
                                  <span key={k} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3. REPORT FOOTER & ENGINEER VERDICT BLOCK */}
                <div className="pt-4 border-t-2 border-slate-700 flex items-center justify-between text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400">OVERALL MACHINE HEALTH:</span>
                    <Badge variant="success" className="text-xs px-2.5 py-1 font-bold">
                      HEALTHY ({machine.healthScore || 94}%)
                    </Badge>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div>Engineer: <strong className="text-slate-200">{activeSession.engineerName || 'Alex Wong'}</strong></div>
                    <div>Date: <strong className="text-slate-200">{activeSession.startDate || '06 Aug 2026'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Custom Widget
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPreviewModalOpen(true)}
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                Preview Report
              </Button>

              <Button
                onClick={handleTriggerPdfExport}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-1.5 px-4 flex items-center gap-2 shadow-md"
              >
                <FileDown className="w-4 h-4" />
                Export PDF (1 Page)
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SUPPORTING PANEL: PROPERTIES PANEL */}
        {showPropertiesPanel && selectedWidget ? (
          <div className={`w-60 lg:w-64 xl:w-72 shrink-0 p-3.5 rounded-lg border flex flex-col justify-between ${
            isDark ? 'bg-[#15181C] border-[#2B323A]' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    PROPERTIES
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedWidget.type}
                  </Badge>
                  <button
                    onClick={() => setShowPropertiesPanel(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-1"
                    title="Collapse Properties Panel"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Widget Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Widget Section Title</label>
                <input
                  type="text"
                  value={selectedWidget.title}
                  onChange={(e) => handleUpdateSelectedWidget({ title: e.target.value })}
                  className="w-full bg-[#1A1D21] border border-[#2B323A] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Widget Subtitle Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Subtitle / Description</label>
                <input
                  type="text"
                  value={selectedWidget.subtitle || ''}
                  onChange={(e) => handleUpdateSelectedWidget({ subtitle: e.target.value })}
                  className="w-full bg-[#1A1D21] border border-[#2B323A] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Layout Width Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Canvas Width Layout</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['1/1', '1/2', '1/3'] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => handleUpdateSelectedWidget({ width: w })}
                      className={`py-1.5 rounded text-xs font-bold transition border ${
                        selectedWidget.width === w
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-[#1A1D21] text-slate-400 border-[#2B323A] hover:bg-slate-800'
                      }`}
                    >
                      {w === '1/1' ? 'Full' : w === '1/2' ? 'Half' : '1/3'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparison Source Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Comparison Data Source</label>
                <select
                  value={selectedWidget.comparisonSource}
                  onChange={(e) => handleUpdateSelectedWidget({ comparisonSource: e.target.value as any })}
                  className="w-full bg-[#1A1D21] border border-[#2B323A] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Baseline vs Current">Baseline vs Current</option>
                  <option value="Before vs After Maintenance">Before vs After Maintenance</option>
                  <option value="Spec Sheet vs Real-time">Spec Sheet vs Real-time</option>
                  <option value="Previous MHC vs Current">Previous MHC vs Current</option>
                  <option value="None">None</option>
                </select>
              </div>

              {/* Widget Status Override */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Status Override</label>
                <select
                  value={selectedWidget.status}
                  onChange={(e) => handleUpdateSelectedWidget({ status: e.target.value as any })}
                  className="w-full bg-[#1A1D21] border border-[#2B323A] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="NORMAL">NORMAL (Green)</option>
                  <option value="WARNING">WARNING (Amber)</option>
                  <option value="CRITICAL">CRITICAL (Red)</option>
                  <option value="NA">N/A (Gray)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <Button
                  onClick={() => handleRemoveWidget(selectedWidget.id)}
                  variant="outline"
                  className="w-full border-rose-900/60 text-rose-400 hover:bg-rose-950 text-xs py-1.5 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Widget from Canvas
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
              Selected Widget ID: {selectedWidget.id}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowPropertiesPanel(true)}
            className="w-9 shrink-0 bg-[#15181C] border border-[#2B323A] rounded-lg p-2 flex flex-col items-center py-4 gap-4 hover:bg-[#1A1D21] cursor-pointer transition-all group"
            title="Expand Properties Panel"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 group-hover:text-purple-400 tracking-widest whitespace-nowrap rotate-90 transform">
                PROPERTIES
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: REPORT QUALITY CHECK RESULTS */}
      <Modal
        isOpen={isQualityCheckModalOpen}
        onClose={() => setIsQualityCheckModalOpen(false)}
        title="Smart MHC Report Quality Check"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Automated quality audit results before 1-Page PDF export:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {qualityCheckResults.checks.map(c => (
              <div
                key={c.id}
                className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                  c.passed
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : c.type === 'BLOCKING'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200 font-bold'
                    : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {c.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : c.type === 'BLOCKING' ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{c.label} {c.details ? `(${c.details})` : ''}</span>
                </div>

                <Badge
                  variant={c.passed ? 'success' : c.type === 'BLOCKING' ? 'danger' : 'warning'}
                  className="text-[9px]"
                >
                  {c.passed ? 'PASS' : c.type === 'BLOCKING' ? 'BLOCKING' : 'WARNING'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsQualityCheckModalOpen(false)} className="text-xs">
              Back to Canvas
            </Button>
            {!qualityCheckResults.hasBlockingError && (
              <Button onClick={() => { setIsQualityCheckModalOpen(false); setIsPreviewModalOpen(true); }} className="bg-rose-600 text-white font-bold text-xs">
                Proceed to PDF Export
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: ISOLATED FULL-SCREEN REPORT PREVIEW & PRINT */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 overflow-y-auto">
          {/* Top Bar inside Preview */}
          <div className="w-full max-w-4xl bg-[#15181C] border border-[#2B323A] p-3 rounded-lg flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Printer className="w-4 h-4 text-[#8B9DFF]" />
              <span className="font-bold text-slate-100">ISOLATED A4 PRINT PREVIEW</span>
              <span className="text-slate-400">• 1-Page Printable Report Document Only</span>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleExecutePrint} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-1.5 px-4 flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </Button>
              <Button onClick={() => setIsPreviewModalOpen(false)} variant="outline" className="border-slate-700 text-slate-300 text-xs py-1.5 px-3">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Printable Report Canvas Container */}
          <div id="a4-print-document" className="w-full max-w-[820px] bg-white text-slate-900 p-8 rounded-lg shadow-2xl my-4 space-y-4">
            <div className="pb-4 border-b-2 border-slate-900 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  MACHINE HEALTH REPORT
                </h1>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  {machine.model} • {machine.serialNumber} • {machine.customerName}
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-800">
                <span className="font-bold block">{activeSession.id}</span>
                <span className="block">{activeSession.startDate || '06 AUGUST 2026'}</span>
              </div>
            </div>

            {/* Render Widgets inside Print Preview */}
            <div className="grid grid-cols-2 gap-3.5">
              {canvasWidgets.map(w => (
                <div key={w.id} className={`${w.width === '1/1' ? 'col-span-2' : 'col-span-1'} p-3 rounded border border-slate-300 bg-slate-50 text-xs space-y-1`}>
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                    <span>{w.title}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-mono">{w.status}</span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px]">{w.subtitle || 'Verified live machine telemetry.'}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xs font-mono text-slate-800">
              <div>Overall Status: <strong>HEALTHY ({machine.healthScore || 94}%)</strong></div>
              <div>Engineer: <strong>{activeSession.engineerName || 'Alex Wong'}</strong></div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono text-center pb-2">
            ISO 13374-4 Inspired • FSOS Isolated One-Page PDF Output
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM DATA FIELD */}
      <Modal
        isOpen={isAddDataModalOpen}
        onClose={() => setIsAddDataModalOpen(false)}
        title="[+ Add Custom Data Field]"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Create reusable, bindable engineering measurements & data fields for this machine session.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Data Category</label>
              <select
                value={newDataCat}
                onChange={(e) => setNewDataCat(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              >
                <option value="Machine">Machine</option>
                <option value="Product & Process">Product & Process</option>
                <option value="Laser">Laser</option>
                <option value="Optical / Quality">Optical / Quality</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Engineer">Engineer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Field Name / Label</label>
              <input
                type="text"
                placeholder="e.g. Galvo Mirror Reflectivity"
                value={newDataLabel}
                onChange={(e) => setNewDataLabel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Measured Value</label>
                <input
                  type="text"
                  placeholder="e.g. 99.8"
                  value={newDataVal}
                  onChange={(e) => setNewDataVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. % or mm"
                  value={newDataUnit}
                  onChange={(e) => setNewDataUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsAddDataModalOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleAddCustomData} className="bg-[#8B9DFF] text-slate-950 font-bold text-xs">Add Data Field</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: CREATE CUSTOM WIDGET */}
      <Modal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        title="[+ Create Custom Engineering Widget]"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Define HOW your custom or existing engineering data is presented on the A4 Report Canvas.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Widget Title</label>
              <input
                type="text"
                placeholder="e.g. Galvo Scanner Drift & Mirror Inspection"
                value={newWidgetTitle}
                onChange={(e) => setNewWidgetTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Display Type</label>
                <select
                  value={newWidgetDisplayType}
                  onChange={(e) => setNewWidgetDisplayType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
                >
                  <option value="card">Data Cards / Stat Grid</option>
                  <option value="table">Measurement Comparison Table</option>
                  <option value="callout">Callout / Alert Box</option>
                  <option value="image">Image Showcase</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Canvas Width</label>
                <select
                  value={newWidgetWidth}
                  onChange={(e) => setNewWidgetWidth(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
                >
                  <option value="1/1">Full Width (1/1)</option>
                  <option value="1/2">Half Width (1/2)</option>
                  <option value="1/3">One Third (1/3)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Bind Data Tray Fields</label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900 p-2 rounded border border-slate-800 text-xs">
                {dataTrayItems.map(item => (
                  <label key={item.id} className="flex items-center gap-2 text-slate-300 cursor-pointer hover:bg-slate-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedBoundKeys.includes(item.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBoundKeys(prev => [...prev, item.key]);
                        } else {
                          setSelectedBoundKeys(prev => prev.filter(k => k !== item.key));
                        }
                      }}
                    />
                    <span>{item.label} ({item.value} {item.unit || ''})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsAddWidgetModalOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreateCustomWidget} className="bg-emerald-500 text-slate-950 font-bold text-xs">Create Widget</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: SAVE TEMPLATE */}
      <Modal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        title="Save Report Layout as Reusable Template"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Save this report layout structure (widgets, positions, sizes, titles) as a reusable template. Reusable templates do NOT contain machine-specific reading values.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Template Title</label>
              <input
                type="text"
                placeholder="e.g. Standard 250-Hr Laser PM Audit Template"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. PREVENTIVE MAINTENANCE"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Describe when to use this report layout..."
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsSaveTemplateModalOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleSaveAsTemplate} className="bg-amber-400 text-slate-950 font-bold text-xs">Save Template</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: LOAD TEMPLATE */}
      <Modal
        isOpen={isLoadTemplateModalOpen}
        onClose={() => setIsLoadTemplateModalOpen(false)}
        title="Load Report Template Structure"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Choose a pre-configured report structure to apply to the current machine. Known data will auto-populate into widgets.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[...BUILT_IN_TEMPLATES, ...StorageService.getMhcWorkspaceTemplates()].map(tpl => (
              <div
                key={tpl.id}
                onClick={() => handleLoadTemplate(tpl)}
                className="p-3 rounded border border-slate-800 bg-slate-900 hover:border-[#8B9DFF] cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-100">{tpl.title}</span>
                    <Badge variant="secondary" className="text-[9px]">{tpl.category}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tpl.description}</p>
                </div>
                <Button className="bg-[#8B9DFF] text-slate-950 font-bold text-xs py-1 px-3 shrink-0">Apply</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 7: SAVE DRAFT */}
      <Modal
        isOpen={isSaveDraftModalOpen}
        onClose={() => setIsSaveDraftModalOpen(false)}
        title="Save MHC Work Draft"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Save current unfinished MHC session measurements, custom fields, evidence images, and canvas state.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Draft Name</label>
            <input
              type="text"
              placeholder={`Draft MHC - ${machine.model}`}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsSaveDraftModalOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleSaveDraft} className="bg-emerald-500 text-slate-950 font-bold text-xs">Save Draft</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 8: LOAD DRAFT */}
      <Modal
        isOpen={isLoadDraftModalOpen}
        onClose={() => setIsLoadDraftModalOpen(false)}
        title="Load Saved Work Draft"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select a saved unfinished draft to resume editing measurements and canvas layout.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {StorageService.getMhcWorkspaceDrafts().length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No saved drafts found.</p>
            ) : (
              StorageService.getMhcWorkspaceDrafts().map(d => (
                <div
                  key={d.id}
                  onClick={() => handleLoadDraft(d)}
                  className="p-3 rounded border border-slate-800 bg-slate-900 hover:border-sky-400 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-100 block">{d.draftTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Last saved: {d.lastSaved}</span>
                  </div>
                  <Button className="bg-sky-400 text-slate-950 font-bold text-xs py-1 px-3">Resume</Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 9: INLINE QUICK DATA EDIT */}
      {inlineEditItem && (
        <Modal
          isOpen={isInlineEditModalOpen}
          onClose={() => setIsInlineEditModalOpen(false)}
          title={`Edit Missing Data: ${inlineEditItem.label}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Update missing value directly inside Smart MHC. Changes sync across all report widgets and session data.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{inlineEditItem.label}</label>
              <input
                type="text"
                defaultValue={inlineEditItem.value}
                id="inline-input-val"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setIsInlineEditModalOpen(false)} className="text-xs">Cancel</Button>
              <Button
                onClick={() => {
                  const val = (document.getElementById('inline-input-val') as HTMLInputElement)?.value;
                  handleSaveInlineEdit(val);
                }}
                className="bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Save & Sync
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
