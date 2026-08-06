import React, { useState } from 'react';
import { 
  Clock, 
  Sliders, 
  Zap, 
  Eye, 
  Thermometer, 
  CheckCircle2, 
  Package, 
  FileText, 
  Upload, 
  Trash2, 
  Plus, 
  Edit3, 
  AlertTriangle, 
  Check, 
  Image as ImageIcon,
  HelpCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { LaserEngine } from '../../utils/laserEngine';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  MHCSession, 
  MHCLaserHourItem, 
  MHCLaserPowerItem, 
  MHCSparePartItem,
  MHCCustomField,
  MHCCustomInfoBlock,
  MHCCustomMeasurementItem,
  MHCCustomInspectionItem,
  MHCImageComparisonSet,
  MHCTemperatureSeries,
  MHCTemperatureDataPoint,
  MHCTemperatureGraphConfig
} from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface MhcStageFormsProps {
  session: MHCSession;
  activeStage: number; // 1 to 8
  onUpdateSession: (updatedSession: MHCSession) => void;
  onNavigateStage: (stageNumber: number) => void;
}

// ----------------------------------------------------------------------------
// HELPER EDITABLE FIELD LABEL COMPONENT
// ----------------------------------------------------------------------------

interface EditableFieldLabelProps {
  fieldKey: string;
  defaultLabel: string;
  labelOverrides?: Record<string, string>;
  deletedFieldKeys?: string[];
  onUpdateLabel: (fieldKey: string, newLabel: string) => void;
  onDeleteField?: (fieldKey: string) => void;
  isProtectedSystemField?: boolean;
  protectedReason?: string;
  className?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

const EditableFieldLabel: React.FC<EditableFieldLabelProps> = ({
  fieldKey,
  defaultLabel,
  labelOverrides = {},
  deletedFieldKeys = [],
  onUpdateLabel,
  onDeleteField,
  isProtectedSystemField = false,
  protectedReason = "Required system field",
  className = "block text-slate-400 mb-1 font-medium text-xs",
  badge,
  children
}) => {
  const isDeleted = deletedFieldKeys.includes(fieldKey);
  if (isDeleted) {
    return null;
  }

  const currentLabel = labelOverrides[fieldKey] || defaultLabel;
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(currentLabel);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = tempLabel.trim();
    if (trimmed && trimmed !== currentLabel) {
      onUpdateLabel(fieldKey, trimmed);
    } else if (!trimmed) {
      onUpdateLabel(fieldKey, defaultLabel);
      setTempLabel(defaultLabel);
    }
  };

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setTempLabel(currentLabel);
              }
            }}
            autoFocus
            className="bg-slate-900 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-slate-100 font-semibold focus:outline-none w-full"
            placeholder={defaultLabel}
          />
          <button
            type="button"
            onClick={handleSave}
            className="p-1 text-emerald-400 hover:text-emerald-200 bg-emerald-950/60 rounded"
            title="Save Label"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setTempLabel(currentLabel);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 bg-slate-800 rounded"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className={`group flex items-center justify-between gap-1 mb-1 ${className}`}>
          <span className="flex items-center gap-1.5 flex-wrap">
            <span>{currentLabel}</span>
            {badge}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setTempLabel(currentLabel);
                setIsEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-slate-500 hover:text-sky-300 rounded shrink-0"
              title={`Rename label "${currentLabel}"`}
            >
              <Edit3 className="w-3 h-3" />
            </button>

            {isProtectedSystemField ? (
              <div className="relative inline-block">
                <button
                  type="button"
                  disabled
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="opacity-30 cursor-not-allowed p-0.5 text-slate-600 rounded shrink-0"
                  title={protectedReason}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bottom-full mb-1 z-20 whitespace-nowrap bg-slate-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 text-[10px] rounded font-semibold shadow-lg">
                    {protectedReason}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onDeleteField && onDeleteField(fieldKey)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded shrink-0"
                title={`Delete field "${currentLabel}"`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// HELPER CUSTOM FIELD EDITORS
// ----------------------------------------------------------------------------

interface CustomFieldsEditorProps {
  customFields?: MHCCustomField[];
  onChange: (fields: MHCCustomField[]) => void;
  title?: string;
  placeholderLabel?: string;
}

const CustomFieldsEditor: React.FC<CustomFieldsEditorProps> = ({
  customFields = [],
  onChange,
  title = "Custom Engineering Fields",
  placeholderLabel = "e.g. Diode Temperature / Pulse Width"
}) => {
  const handleAddField = () => {
    const newField: MHCCustomField = {
      id: `cf-${Date.now()}`,
      label: 'Custom Parameter',
      type: 'text',
      value: '',
      unit: ''
    };
    onChange([...customFields, newField]);
  };

  const handleUpdateField = (index: number, key: keyof MHCCustomField, val: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleDeleteField = (index: number) => {
    onChange(customFields.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          {title} ({customFields.length})
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddField}
          icon={<Plus className="w-3.5 h-3.5 text-sky-400" />}
          className="text-[11px] py-1 text-sky-300 border-sky-900/50 hover:bg-sky-950/40"
        >
          Add Field
        </Button>
      </div>

      {customFields.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic">No custom engineering fields added yet. Click "+ Add Field" to create custom metrics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customFields.map((field, idx) => (
            <div key={field.id || idx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                  className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-200 font-semibold text-xs w-full focus:border-sky-500"
                  placeholder={placeholderLabel}
                />
                <select
                  value={field.type || 'text'}
                  onChange={(e) => handleUpdateField(idx, 'type', e.target.value as any)}
                  className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-1 text-sky-300 font-medium text-[11px] focus:border-sky-500 shrink-0"
                  title="Select Field Type"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="time">Time</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteField(idx)}
                  className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded shrink-0"
                  title="Delete Custom Field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
                  step={field.type === 'number' ? 'any' : undefined}
                  value={field.value}
                  onChange={(e) => handleUpdateField(idx, 'value', e.target.value)}
                  className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-100 text-xs w-full font-mono"
                  placeholder={field.type === 'date' ? 'YYYY-MM-DD' : field.type === 'time' ? 'HH:MM' : 'Field value...'}
                />
                {(field.type === 'text' || field.type === 'number' || !field.type) && (
                  <input
                    type="text"
                    value={field.unit || ''}
                    onChange={(e) => handleUpdateField(idx, 'unit', e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-400 text-xs w-20 font-mono"
                    placeholder="Unit"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CustomInfoBlocksEditorProps {
  customBlocks?: MHCCustomInfoBlock[];
  onChange: (blocks: MHCCustomInfoBlock[]) => void;
}

const CustomInfoBlocksEditor: React.FC<CustomInfoBlocksEditorProps> = ({
  customBlocks = [],
  onChange
}) => {
  const handleAddBlock = () => {
    const newBlock: MHCCustomInfoBlock = {
      id: `block-${Date.now()}`,
      title: 'Additional Recipe / Technical Block',
      content: ''
    };
    onChange([...customBlocks, newBlock]);
  };

  const handleUpdateBlock = (index: number, key: keyof MHCCustomInfoBlock, val: string) => {
    const updated = [...customBlocks];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleDeleteBlock = (index: number) => {
    onChange(customBlocks.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          Custom Information Blocks ({customBlocks.length})
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddBlock}
          icon={<Plus className="w-3.5 h-3.5 text-purple-400" />}
          className="text-[11px] py-1 text-purple-300 border-purple-900/50 hover:bg-purple-950/40"
        >
          Add Information Block
        </Button>
      </div>

      {customBlocks.map((block, idx) => (
        <div key={block.id || idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleUpdateBlock(idx, 'title', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-full focus:border-purple-500"
              placeholder="Block Title..."
            />
            <button
              onClick={() => handleDeleteBlock(idx)}
              className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded shrink-0"
              title="Delete Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            rows={2}
            value={block.content}
            onChange={(e) => handleUpdateBlock(idx, 'content', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            placeholder="Record additional technical details, galvo calibration data, or recipe notes..."
          />
        </div>
      ))}
    </div>
  );
};

interface CustomMeasurementsEditorProps {
  customMeasurements?: MHCCustomMeasurementItem[];
  onChange: (items: MHCCustomMeasurementItem[]) => void;
}

const CustomMeasurementsEditor: React.FC<CustomMeasurementsEditorProps> = ({
  customMeasurements = [],
  onChange
}) => {
  const handleAdd = () => {
    const newItem: MHCCustomMeasurementItem = {
      id: `m-${Date.now()}`,
      name: 'Custom Parameter Measurement',
      beforeVal: 0,
      afterVal: 0,
      unit: 'W',
      result: 'PASS'
    };
    onChange([...customMeasurements, newItem]);
  };

  const handleUpdate = (index: number, key: keyof MHCCustomMeasurementItem, val: any) => {
    const updated = [...customMeasurements];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(customMeasurements.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Custom Engineering Measurements ({customMeasurements.length})
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          icon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
          className="text-[11px] py-1 text-amber-300 border-amber-900/50 hover:bg-amber-950/40"
        >
          Add Measurement
        </Button>
      </div>

      <div className="space-y-3">
        {customMeasurements.map((item, idx) => (
          <div key={item.id || idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-full focus:border-amber-500"
                placeholder="Measurement Name..."
              />
              <select
                value={item.result || 'PASS'}
                onChange={(e) => handleUpdate(idx, 'result', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-bold shrink-0"
              >
                <option value="PASS">PASS</option>
                <option value="WARNING">WARNING</option>
                <option value="FAIL">FAIL</option>
              </select>
              <button
                onClick={() => handleDelete(idx)}
                className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded shrink-0"
                title="Delete Measurement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">Before Value</label>
                <input
                  type="text"
                  value={item.beforeVal}
                  onChange={(e) => handleUpdate(idx, 'beforeVal', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-rose-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">After Value</label>
                <input
                  type="text"
                  value={item.afterVal}
                  onChange={(e) => handleUpdate(idx, 'afterVal', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">Unit</label>
                <input
                  type="text"
                  value={item.unit || ''}
                  onChange={(e) => handleUpdate(idx, 'unit', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono"
                  placeholder="e.g. W, °C, bar, LPM"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CustomInspectionsEditorProps {
  customInspections?: MHCCustomInspectionItem[];
  onChange: (items: MHCCustomInspectionItem[]) => void;
}

const CustomInspectionsEditor: React.FC<CustomInspectionsEditorProps> = ({
  customInspections = [],
  onChange
}) => {
  const handleAdd = () => {
    const newItem: MHCCustomInspectionItem = {
      id: `insp-${Date.now()}`,
      name: 'Custom Inspection Check Item',
      status: 'PASS',
      notes: ''
    };
    onChange([...customInspections, newItem]);
  };

  const handleUpdate = (index: number, key: keyof MHCCustomInspectionItem, val: any) => {
    const updated = [...customInspections];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(customInspections.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          Custom Inspection Checks ({customInspections.length})
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          icon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
          className="text-[11px] py-1 text-indigo-300 border-indigo-900/50 hover:bg-indigo-950/40"
        >
          Add Inspection Check
        </Button>
      </div>

      <div className="space-y-3">
        {customInspections.map((item, idx) => (
          <div key={item.id || idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-full focus:border-indigo-500"
                placeholder="Check Item Name..."
              />
              <select
                value={item.status}
                onChange={(e) => handleUpdate(idx, 'status', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-bold shrink-0"
              >
                <option value="PASS">PASS</option>
                <option value="WARNING">WARNING</option>
                <option value="ATTENTION">ATTENTION</option>
                <option value="FAIL">FAIL</option>
              </select>
              <button
                onClick={() => handleDelete(idx)}
                className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded shrink-0"
                title="Delete Inspection Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={item.notes}
              onChange={(e) => handleUpdate(idx, 'notes', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
              placeholder="Inspection notes & observations..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ImageComparisonSetsSectionProps {
  comparisons?: MHCImageComparisonSet[];
  onChange: (sets: MHCImageComparisonSet[]) => void;
  onSimulateUpload: (currentUrls: string[], callback: (urls: string[]) => void) => void;
}

const ImageComparisonSetsSection: React.FC<ImageComparisonSetsSectionProps> = ({
  comparisons = [],
  onChange,
  onSimulateUpload
}) => {
  const handleAddSet = () => {
    const newSet: MHCImageComparisonSet = {
      id: `comp-${Date.now()}`,
      title: `Image Comparison Set ${comparisons.length + 1}`,
      beforeUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      beforeCaption: 'Before Maintenance / Pre-Cleaning Condition',
      afterUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      afterCaption: 'After Maintenance / Post-Cleaning Condition',
      notes: ''
    };
    onChange([...comparisons, newSet]);
  };

  const handleUpdateSet = (index: number, key: keyof MHCImageComparisonSet, val: any) => {
    const updated = [...comparisons];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleDeleteSet = (index: number) => {
    onChange(comparisons.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            Before vs After Image Comparison Sets ({comparisons.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Compare visual evidence side-by-side with customizable captions and observations.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddSet}
          icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
          className="text-xs py-1.5 border-emerald-900/60 hover:bg-emerald-950/40 text-emerald-300"
        >
          Add Comparison Set
        </Button>
      </div>

      <div className="space-y-4">
        {comparisons.map((set, idx) => (
          <Card key={set.id || idx} className="border border-slate-800 bg-slate-950/80 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <input
                type="text"
                value={set.title}
                onChange={(e) => handleUpdateSet(idx, 'title', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-full focus:border-emerald-500 font-mono"
                placeholder="Comparison Set Title..."
              />
              <button
                onClick={() => handleDeleteSet(idx)}
                className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded border border-rose-900/40 shrink-0"
                title="Delete Comparison Set"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* BEFORE IMAGE */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 uppercase text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    BEFORE Inspection
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onSimulateUpload(set.beforeUrl ? [set.beforeUrl] : [], (urls) =>
                          handleUpdateSet(idx, 'beforeUrl', urls[urls.length - 1] || '')
                        )
                      }
                      className="text-[10px] py-0.5 px-2 text-slate-300 border-slate-700 hover:bg-slate-800"
                    >
                      <Upload className="w-3 h-3" />
                      {set.beforeUrl ? 'Replace' : 'Upload'}
                    </Button>
                    {set.beforeUrl && (
                      <button
                        onClick={() => handleUpdateSet(idx, 'beforeUrl', '')}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                        title="Delete BEFORE Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {set.beforeUrl ? (
                  <div className="relative h-40 rounded-lg overflow-hidden border border-slate-800 bg-black">
                    <img src={set.beforeUrl} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
                    <span>No Before Image Uploaded</span>
                  </div>
                )}

                <input
                  type="text"
                  value={set.beforeCaption || ''}
                  onChange={(e) => handleUpdateSet(idx, 'beforeCaption', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  placeholder="BEFORE Caption e.g. Dirty Optic / Pre-Cut Sample"
                />
              </div>

              {/* AFTER IMAGE */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    AFTER Inspection
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onSimulateUpload(set.afterUrl ? [set.afterUrl] : [], (urls) =>
                          handleUpdateSet(idx, 'afterUrl', urls[urls.length - 1] || '')
                        )
                      }
                      className="text-[10px] py-0.5 px-2 text-slate-300 border-slate-700 hover:bg-slate-800"
                    >
                      <Upload className="w-3 h-3" />
                      {set.afterUrl ? 'Replace' : 'Upload'}
                    </Button>
                    {set.afterUrl && (
                      <button
                        onClick={() => handleUpdateSet(idx, 'afterUrl', '')}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                        title="Delete AFTER Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {set.afterUrl ? (
                  <div className="relative h-40 rounded-lg overflow-hidden border border-slate-800 bg-black">
                    <img src={set.afterUrl} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
                    <span>No After Image Uploaded</span>
                  </div>
                )}

                <input
                  type="text"
                  value={set.afterCaption || ''}
                  onChange={(e) => handleUpdateSet(idx, 'afterCaption', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  placeholder="AFTER Caption e.g. Cleaned Lens / Post-Cut Verification"
                />
              </div>
            </div>

            <input
              type="text"
              value={set.notes || ''}
              onChange={(e) => handleUpdateSet(idx, 'notes', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-300 text-xs"
              placeholder="Comparison observations and engineering findings..."
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

interface CoolingTemperatureGraphEditorProps {
  graphConfig?: MHCTemperatureGraphConfig;
  onChange: (config: MHCTemperatureGraphConfig) => void;
}

const CoolingTemperatureGraphEditor: React.FC<CoolingTemperatureGraphEditorProps> = ({
  graphConfig,
  onChange
}) => {
  const currentConfig: MHCTemperatureGraphConfig = graphConfig || {
    id: 'cool-graph-1',
    title: 'Chiller & Laser Head Cooling Temperature Time-Series (°C)',
    series: [
      { id: 's1', key: 'laserTemp', name: 'Laser Head Temp (°C)', color: '#38BDF8' },
      { id: 's2', key: 'chillerTemp', name: 'Chiller Coolant Temp (°C)', color: '#22D3EE' },
      { id: 's3', key: 'ambientTemp', name: 'Cleanroom Ambient (°C)', color: '#A855F7' }
    ],
    dataPoints: [
      { id: 'dp-1', timestamp: '0m', values: { laserTemp: 24.2, chillerTemp: 21.0, ambientTemp: 22.0 } },
      { id: 'dp-2', timestamp: '15m', values: { laserTemp: 23.8, chillerTemp: 20.8, ambientTemp: 22.1 } },
      { id: 'dp-3', timestamp: '30m', values: { laserTemp: 23.5, chillerTemp: 20.5, ambientTemp: 22.1 } },
      { id: 'dp-4', timestamp: '45m', values: { laserTemp: 23.6, chillerTemp: 20.5, ambientTemp: 22.2 } },
      { id: 'dp-5', timestamp: '60m', values: { laserTemp: 23.5, chillerTemp: 20.5, ambientTemp: 22.2 } }
    ]
  };

  const handleUpdateTitle = (title: string) => {
    onChange({ ...currentConfig, title });
  };

  const handleAddSeries = () => {
    const nextNum = currentConfig.series.length + 1;
    const colors = ['#F59E0B', '#10B981', '#EC4899', '#6366F1'];
    const color = colors[nextNum % colors.length];
    const key = `customSeries_${Date.now()}`;
    const newSeries: MHCTemperatureSeries = {
      id: `s-${Date.now()}`,
      key,
      name: `Temperature Series ${nextNum} (°C)`,
      color
    };
    const updatedDataPoints = currentConfig.dataPoints.map(dp => ({
      ...dp,
      values: { ...dp.values, [key]: 22.0 }
    }));
    onChange({
      ...currentConfig,
      series: [...currentConfig.series, newSeries],
      dataPoints: updatedDataPoints
    });
  };

  const handleUpdateSeries = (index: number, field: keyof MHCTemperatureSeries, value: string) => {
    const updatedSeries = [...currentConfig.series];
    updatedSeries[index] = { ...updatedSeries[index], [field]: value };
    onChange({ ...currentConfig, series: updatedSeries });
  };

  const handleDeleteSeries = (index: number) => {
    if (currentConfig.series.length <= 1) {
      alert("At least one temperature series must remain.");
      return;
    }
    const seriesToDelete = currentConfig.series[index];
    const updatedSeries = currentConfig.series.filter((_, i) => i !== index);
    const updatedDataPoints = currentConfig.dataPoints.map(dp => {
      const copy = { ...dp.values };
      delete copy[seriesToDelete.key];
      return { ...dp, values: copy };
    });
    onChange({
      ...currentConfig,
      series: updatedSeries,
      dataPoints: updatedDataPoints
    });
  };

  const handleAddDataPoint = () => {
    const lastDp = currentConfig.dataPoints[currentConfig.dataPoints.length - 1];
    const lastTimeNum = lastDp ? parseInt(lastDp.timestamp) || 0 : 0;
    const nextTime = `${lastTimeNum + 15}m`;
    const newValues: Record<string, number> = {};
    currentConfig.series.forEach(s => {
      newValues[s.key] = lastDp ? (lastDp.values[s.key] || 22.0) : 22.0;
    });
    const newDp: MHCTemperatureDataPoint = {
      id: `dp-${Date.now()}`,
      timestamp: nextTime,
      values: newValues
    };
    onChange({
      ...currentConfig,
      dataPoints: [...currentConfig.dataPoints, newDp]
    });
  };

  const handleUpdateDataPointTime = (dpIndex: number, newTime: string) => {
    const updatedDp = [...currentConfig.dataPoints];
    updatedDp[dpIndex] = { ...updatedDp[dpIndex], timestamp: newTime };
    onChange({ ...currentConfig, dataPoints: updatedDp });
  };

  const handleUpdateDataPointValue = (dpIndex: number, seriesKey: string, valStr: string) => {
    const updatedDp = [...currentConfig.dataPoints];
    const numVal = parseFloat(valStr) || 0;
    updatedDp[dpIndex] = {
      ...updatedDp[dpIndex],
      values: { ...updatedDp[dpIndex].values, [seriesKey]: numVal }
    };
    onChange({ ...currentConfig, dataPoints: updatedDp });
  };

  const handleDeleteDataPoint = (dpIndex: number) => {
    if (currentConfig.dataPoints.length <= 2) {
      alert("At least two data points are required to render the temperature graph.");
      return;
    }
    onChange({
      ...currentConfig,
      dataPoints: currentConfig.dataPoints.filter((_, i) => i !== dpIndex)
    });
  };

  const chartData = currentConfig.dataPoints.map(dp => {
    const row: Record<string, any> = { time: dp.timestamp };
    currentConfig.series.forEach(s => {
      row[s.name] = dp.values[s.key] !== undefined ? dp.values[s.key] : 0;
    });
    return row;
  });

  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            Time-Series Temperature Thermal Graph & Log
          </h4>
          <p className="text-[11px] text-slate-400">
            Log time-series temperature measurements across active cooling loops and render interactive graphs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddSeries}
            icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-[11px] py-1 border-cyan-900/60 text-cyan-300 hover:bg-cyan-950/40"
          >
            Add Temp Series
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddDataPoint}
            icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
            className="text-[11px] py-1 border-emerald-900/60 text-emerald-300 hover:bg-emerald-950/40"
          >
            Add Data Point
          </Button>
        </div>
      </div>

      <Card className="border border-slate-800 bg-slate-950/80 p-4 space-y-4">
        <input
          type="text"
          value={currentConfig.title}
          onChange={(e) => handleUpdateTitle(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-full focus:border-cyan-500 font-mono"
          placeholder="Graph Title..."
        />

        <div className="h-64 w-full bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090D16', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {currentConfig.series.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Temperature Series Legend & Controls</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentConfig.series.map((s, sIdx) => (
              <div key={s.id || sIdx} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800 text-xs">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => handleUpdateSeries(sIdx, 'color', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => handleUpdateSeries(sIdx, 'name', e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs font-semibold w-full"
                />
                <button
                  onClick={() => handleDeleteSeries(sIdx)}
                  className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                  title="Delete Series"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time-Series Data Points Log Table</label>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                  <th className="py-2 px-2.5">Time Step</th>
                  {currentConfig.series.map(s => (
                    <th key={s.id} className="py-2 px-2.5" style={{ color: s.color }}>{s.name}</th>
                  ))}
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentConfig.dataPoints.map((dp, dpIdx) => (
                  <tr key={dp.id || dpIdx} className="hover:bg-slate-900/40">
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        value={dp.timestamp}
                        onChange={(e) => handleUpdateDataPointTime(dpIdx, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs w-20 font-bold"
                      />
                    </td>
                    {currentConfig.series.map(s => (
                      <td key={s.id} className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.1"
                          value={dp.values[s.key] !== undefined ? dp.values[s.key] : ''}
                          onChange={(e) => handleUpdateDataPointValue(dpIdx, s.key, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100 text-xs w-24 font-mono focus:border-cyan-500"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2.5 text-right">
                      <button
                        onClick={() => handleDeleteDataPoint(dpIdx)}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                        title="Delete Data Point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ----------------------------------------------------------------------------
// MAIN MHC STAGE FORMS COMPONENT
// ----------------------------------------------------------------------------

export const MhcStageForms: React.FC<MhcStageFormsProps> = ({
  session,
  activeStage,
  onUpdateSession,
  onNavigateStage
}) => {
  // Modal state for Stage 07 Spare Parts
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<MHCSparePartItem | null>(null);

  // Form states for Stage 07 Part
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [category, setCategory] = useState('Cooling Consumable');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'REPLACED' | 'USED' | 'RECOMMENDED'>('REPLACED');
  const [costIndicator, setCostIndicator] = useState<'CUSTOMER_COST' | 'EO_SUPPORT' | 'WARRANTY'>('EO_SUPPORT');
  const [partNotes, setPartNotes] = useState('');

  // Open part modal
  const handleOpenPartModal = (part?: MHCSparePartItem) => {
    if (part) {
      setEditingPart(part);
      setPartName(part.partName);
      setPartNumber(part.partNumber);
      setCategory(part.category);
      setQuantity(part.quantity);
      setReason(part.reason);
      setAction(part.action);
      setCostIndicator(part.costIndicator);
      setPartNotes(part.notes || '');
    } else {
      setEditingPart(null);
      setPartName('');
      setPartNumber('');
      setCategory('Cooling Consumable');
      setQuantity(1);
      setReason('');
      setAction('REPLACED');
      setCostIndicator('EO_SUPPORT');
      setPartNotes('');
    }
    setPartModalOpen(true);
  };

  // Save spare part
  const handleSavePart = () => {
    if (!partName.trim()) {
      alert('Please enter a valid part name.');
      return;
    }

    const currentParts = session.stage07_spareParts || [];
    let updatedParts: MHCSparePartItem[];

    if (editingPart) {
      updatedParts = currentParts.map((p) =>
        p.id === editingPart.id
          ? {
              ...p,
              partName,
              partNumber,
              category,
              quantity,
              reason,
              action,
              costIndicator,
              notes: partNotes
            }
          : p
      );
    } else {
      const newPart: MHCSparePartItem = {
        id: `part-${Date.now()}`,
        partName,
        partNumber,
        category,
        quantity,
        reason,
        action,
        costIndicator,
        notes: partNotes
      };
      updatedParts = [...currentParts, newPart];
    }

    onUpdateSession({
      ...session,
      stage07_spareParts: updatedParts,
      sectionStatuses: { ...session.sectionStatuses, sec_07: 'COMPLETED' },
      lastUpdated: new Date().toLocaleString()
    });

    setPartModalOpen(false);
  };

  // Delete spare part
  const handleDeletePart = (partId: string) => {
    if (confirm('Delete this spare part record?')) {
      const updatedParts = (session.stage07_spareParts || []).filter((p) => p.id !== partId);
      onUpdateSession({
        ...session,
        stage07_spareParts: updatedParts,
        sectionStatuses: { ...session.sectionStatuses, sec_07: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    }
  };

  // Helper simulated image uploader
  const handleSimulateImageUpload = (
    currentImages: string[],
    callback: (newImages: string[]) => void
  ) => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80'
    ];
    const nextImg = sampleImages[currentImages.length % sampleImages.length];
    callback([...currentImages, nextImg]);
  };

  const labelOverrides = session.fieldLabelOverrides || {};
  const deletedFieldKeys = session.deletedFieldKeys || [];

  const handleUpdateFieldLabel = (fieldKey: string, newLabel: string) => {
    const updated = {
      ...labelOverrides,
      [fieldKey]: newLabel
    };
    onUpdateSession({
      ...session,
      fieldLabelOverrides: updated,
      lastUpdated: new Date().toLocaleString()
    });
  };

  const handleDeleteFieldKey = (fieldKey: string) => {
    if (deletedFieldKeys.includes(fieldKey)) return;
    const updated = [...deletedFieldKeys, fieldKey];
    onUpdateSession({
      ...session,
      deletedFieldKeys: updated,
      lastUpdated: new Date().toLocaleString()
    });
  };

  const handleRestoreSectionFields = (sectionPrefix: string) => {
    const updated = deletedFieldKeys.filter((k) => !k.startsWith(sectionPrefix));
    onUpdateSession({
      ...session,
      deletedFieldKeys: updated,
      lastUpdated: new Date().toLocaleString()
    });
  };

  // --------------------------------------------------------------------------
  // STAGE 01: CURRENT LASER HOUR
  // --------------------------------------------------------------------------
  if (activeStage === 1) {
    const laserHours = session.stage01_laserHours || [];

    const calculateElapsedHours = (rDate?: string, rTime?: string): number => {
      if (!rDate) return 0;
      const timePart = rTime || '00:00';
      const readingDateTime = new Date(`${rDate}T${timePart}:00`);
      if (isNaN(readingDateTime.getTime())) return 0;
      const now = new Date();
      const diffMs = now.getTime() - readingDateTime.getTime();
      return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0;
    };

    const handleAddLaser = () => {
      const nextNum = laserHours.length + 1;
      const newLaser: MHCLaserHourItem = {
        laserId: `laser-${Date.now()}`,
        laserIdentifier: `Laser Head ${nextNum}`,
        recordedLaserHour: 1000,
        readingDate: new Date().toISOString().split('T')[0],
        readingTime: '09:00',
        calculatedCurrentHour: 1000,
        warningThreshold: 15000,
        criticalThreshold: 18000,
        runtimeStatus: 'NORMAL',
        customFields: []
      };
      const updated = [...laserHours, newLaser];
      onUpdateSession({
        ...session,
        stage01_laserHours: updated,
        sectionStatuses: { ...session.sectionStatuses, sec_01: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    const handleDeleteLaser = (index: number) => {
      if (laserHours.length <= 1) {
        alert("At least one laser head must remain in the inspection protocol.");
        return;
      }
      const updated = laserHours.filter((_, i) => i !== index);
      onUpdateSession({
        ...session,
        stage01_laserHours: updated,
        sectionStatuses: { ...session.sectionStatuses, sec_01: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    const handleLaserHourChange = (
      index: number,
      field: keyof MHCLaserHourItem,
      value: any
    ) => {
      const updated = [...laserHours];
      const item = { ...updated[index], [field]: value };

      const rec = Number(field === 'recordedLaserHour' ? value : item.recordedLaserHour ?? 0);
      const rDate = String(field === 'readingDate' ? value : item.readingDate || '');
      const rTime = String(field === 'readingTime' ? value : item.readingTime || '');
      const timePart = rTime || '00:00';
      const baseTs = rDate ? `${rDate}T${timePart}:00` : null;

      // Authoritative LaserEngine calculation
      const curHour = LaserEngine.calculateCurrentHour(rec, baseTs, new Date());
      item.calculatedCurrentHour = curHour !== null ? curHour : rec;

      const warn = Number(field === 'warningThreshold' ? value : item.warningThreshold || 20000);
      const crit = Number(field === 'criticalThreshold' ? value : item.criticalThreshold || 25000);

      const engineStatus = LaserEngine.evaluateStatus(item.calculatedCurrentHour, warn, crit);
      item.runtimeStatus = engineStatus === 'ALARM' ? 'CRITICAL' : engineStatus === 'WARNING' ? 'WARNING' : 'NORMAL';

      updated[index] = item;

      onUpdateSession({
        ...session,
        stage01_laserHours: updated,
        sectionStatuses: { ...session.sectionStatuses, sec_01: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              01 Current Laser Hour Monitoring
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Record laser operating hours, check runtime thresholds, and add fully custom engineering fields.
            </p>
            <p className="text-xs text-sky-400/90 font-mono mt-1 bg-sky-950/40 px-2.5 py-1 rounded border border-sky-800/40 inline-block">
              Calculation Model: Recorded Laser Hour + Reading Date + Reading Time + Elapsed Runtime = Calculated Current Laser Hour
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s1_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s1_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 01"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddLaser}
              icon={<Plus className="w-4 h-4 text-sky-400" />}
              className="text-xs border-sky-800/60 hover:bg-sky-950/50 text-sky-300"
            >
              Add Laser
            </Button>
            <Badge variant={session.sectionStatuses.sec_01 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_01 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {laserHours.map((lh, idx) => {
            const crit = lh.criticalThreshold || 18000;
            const warn = lh.warningThreshold || 15000;
            const cur = lh.calculatedCurrentHour || 0;
            const remainingHours = Math.max(0, crit - cur);
            const isRemainingLow = remainingHours <= 500 || cur >= warn;

            return (
              <Card key={lh.laserId || idx} className={`border p-5 space-y-4 transition-all ${
                isRemainingLow
                  ? 'border-rose-800/80 bg-rose-950/20 shadow-lg'
                  : 'border-slate-800 bg-slate-900/60'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRemainingLow ? 'bg-rose-500 animate-pulse' : 'bg-sky-400'}`}></span>
                    <input
                      type="text"
                      value={lh.laserIdentifier}
                      onChange={(e) => handleLaserHourChange(idx, 'laserIdentifier', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-bold text-sm w-48 font-mono focus:border-sky-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        lh.runtimeStatus === 'CRITICAL'
                          ? 'danger'
                          : lh.runtimeStatus === 'WARNING'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      RUNTIME: {lh.runtimeStatus}
                    </Badge>
                    <button
                      onClick={() => handleDeleteLaser(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded border border-rose-900/40 transition-colors"
                      title="Delete Laser"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono font-semibold ${
                  isRemainingLow
                    ? 'bg-rose-950/50 border-rose-800/80 text-rose-300'
                    : 'bg-slate-950/80 border-slate-800 text-emerald-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Remaining Operating Hours: <strong className="text-white font-mono text-sm">{remainingHours.toLocaleString()} hrs</strong></span>
                  </div>
                  {isRemainingLow ? (
                    <span className="text-xs text-rose-400 flex items-center gap-1 font-bold bg-rose-900/40 px-2 py-0.5 rounded border border-rose-700/50">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      MAINTENANCE / SWAP DUE (≤500 hrs)
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-normal opacity-90">
                      ✓ Optimal Runtime Capacity
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <EditableFieldLabel
                    fieldKey="s1_recordedLaserHour"
                    defaultLabel="Last Recorded Hour"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                    isProtectedSystemField={true}
                    protectedReason="Required system field"
                  >
                    <input
                      type="number"
                      value={lh.recordedLaserHour}
                      onChange={(e) => handleLaserHourChange(idx, 'recordedLaserHour', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                    />
                  </EditableFieldLabel>

                  <EditableFieldLabel
                    fieldKey="s1_calculatedCurrentHour"
                    defaultLabel="Calculated Current Hour"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                    isProtectedSystemField={true}
                    protectedReason="Required system field"
                  >
                    <input
                      type="number"
                      value={lh.calculatedCurrentHour}
                      onChange={(e) => handleLaserHourChange(idx, 'calculatedCurrentHour', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:border-sky-500"
                    />
                  </EditableFieldLabel>

                  <EditableFieldLabel
                    fieldKey="s1_warningThreshold"
                    defaultLabel="Warning Threshold (hrs)"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                    isProtectedSystemField={true}
                    protectedReason="Required system field"
                  >
                    <input
                      type="number"
                      value={lh.warningThreshold}
                      onChange={(e) => handleLaserHourChange(idx, 'warningThreshold', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-amber-300 font-mono"
                    />
                  </EditableFieldLabel>

                  <EditableFieldLabel
                    fieldKey="s1_criticalThreshold"
                    defaultLabel="Critical Threshold (hrs)"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                    isProtectedSystemField={true}
                    protectedReason="Required system field"
                  >
                    <input
                      type="number"
                      value={lh.criticalThreshold}
                      onChange={(e) => handleLaserHourChange(idx, 'criticalThreshold', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-rose-400 font-mono"
                    />
                  </EditableFieldLabel>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <EditableFieldLabel
                    fieldKey="s1_readingDate"
                    defaultLabel="Reading Date"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                  >
                    <input
                      type="date"
                      value={lh.readingDate}
                      onChange={(e) => handleLaserHourChange(idx, 'readingDate', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    />
                  </EditableFieldLabel>

                  <EditableFieldLabel
                    fieldKey="s1_readingTime"
                    defaultLabel="Reading Time"
                    labelOverrides={labelOverrides}
                    deletedFieldKeys={deletedFieldKeys}
                    onUpdateLabel={handleUpdateFieldLabel}
                    onDeleteField={handleDeleteFieldKey}
                  >
                    <input
                      type="time"
                      value={lh.readingTime}
                      onChange={(e) => handleLaserHourChange(idx, 'readingTime', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    />
                  </EditableFieldLabel>
                </div>

                {/* Custom Engineering Fields Editor per Laser Head */}
                <CustomFieldsEditor
                  customFields={lh.customFields}
                  onChange={(fields) => handleLaserHourChange(idx, 'customFields', fields)}
                  title="Stage 01 Custom Laser Fields"
                  placeholderLabel="e.g. Diode Temperature / Pulse Width"
                />
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 02: LASER PROFILE / PRODUCT
  // --------------------------------------------------------------------------
  if (activeStage === 2) {
    const prof = session.stage02_laserProfile;

    const handleProfileChange = (field: keyof typeof prof, value: any) => {
      onUpdateSession({
        ...session,
        stage02_laserProfile: {
          ...prof,
          [field]: value
        },
        sectionStatuses: { ...session.sectionStatuses, sec_02: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              02 Laser Profile & Product Setup
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Verify customer processed product, recipe program, and customize technical info blocks & evidence images.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s2_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s2_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 02"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Badge variant={session.sectionStatuses.sec_02 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_02 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s2_productName"
              defaultLabel="Processed Product Name"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={prof.productName}
                onChange={(e) => handleProfileChange('productName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s2_recipeProgram"
              defaultLabel="Recipe / Program Name"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={prof.recipeProgram}
                onChange={(e) => handleProfileChange('recipeProgram', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s2_profileInfo"
              defaultLabel="Laser Profile Information"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={prof.profileInfo}
                onChange={(e) => handleProfileChange('profileInfo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s2_measurementInfo"
              defaultLabel="Spot / Rayleigh Measurement Info"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={prof.measurementInfo}
                onChange={(e) => handleProfileChange('measurementInfo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </EditableFieldLabel>
          </div>

          <div className="text-xs">
            <EditableFieldLabel
              fieldKey="s2_supportingEvidence"
              defaultLabel="Supporting Evidence Notes"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={3}
                value={prof.supportingEvidence}
                onChange={(e) => handleProfileChange('supportingEvidence', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              />
            </EditableFieldLabel>
          </div>

          {/* Custom Engineering Fields */}
          <CustomFieldsEditor
            customFields={prof.customFields}
            onChange={(fields) => handleProfileChange('customFields', fields)}
            title="Stage 02 Custom Fields"
            placeholderLabel="e.g. Galvo Offset / Scan Speed mm/s"
          />

          {/* Custom Information Blocks */}
          <CustomInfoBlocksEditor
            customBlocks={prof.customBlocks}
            onChange={(blocks) => handleProfileChange('customBlocks', blocks)}
          />

          {/* Profile Images Gallery */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                Beam Profile Evidence Photos ({prof.images?.length || 0})
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleSimulateImageUpload(prof.images || [], (imgs) =>
                    handleProfileChange('images', imgs)
                  )
                }
                className="text-xs flex items-center gap-1.5 py-1 text-purple-300 border-purple-900/50 hover:bg-purple-950/40"
              >
                <Upload className="w-3.5 h-3.5" />
                Add Image
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {(prof.images || []).map((img, i) => (
                <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={img} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    onClick={() => {
                      const updated = prof.images.filter((_, idx) => idx !== i);
                      handleProfileChange('images', updated);
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-950/80 text-rose-300 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 03: LASER OUTPUT & POWER
  // --------------------------------------------------------------------------
  if (activeStage === 3) {
    const powerItems = session.stage03_laserPower || [];

    const handleAddPowerHead = () => {
      const nextNum = powerItems.length + 1;
      const newHead: MHCLaserPowerItem = {
        laserId: `pwr-${Date.now()}`,
        laserIdentifier: `Laser Head ${nextNum}`,
        ratedPowerWatts: 100,
        referenceValueWatts: 100,
        beforeValueWatts: 92,
        afterValueWatts: 99,
        stabilityPercent: 99,
        result: 'PASS',
        notes: '',
        evidenceImages: [],
        customFields: [],
        customMeasurements: []
      };
      onUpdateSession({
        ...session,
        stage03_laserPower: [...powerItems, newHead],
        sectionStatuses: { ...session.sectionStatuses, sec_03: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    const handleDeletePowerHead = (index: number) => {
      if (powerItems.length <= 1) {
        alert("At least one laser power measurement head must remain.");
        return;
      }
      const updated = powerItems.filter((_, i) => i !== index);
      onUpdateSession({
        ...session,
        stage03_laserPower: updated,
        sectionStatuses: { ...session.sectionStatuses, sec_03: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    const handlePowerChange = (
      index: number,
      field: keyof MHCLaserPowerItem,
      value: any
    ) => {
      const updated = [...powerItems];
      const item = { ...updated[index], [field]: value };

      if (field === 'beforeValueWatts' || field === 'afterValueWatts' || field === 'ratedPowerWatts') {
        const rated = Number(field === 'ratedPowerWatts' ? value : item.ratedPowerWatts);
        const after = Number(field === 'afterValueWatts' ? value : item.afterValueWatts);
        if (rated > 0) {
          item.stabilityPercent = Number(((after / rated) * 100).toFixed(1));
          if (item.stabilityPercent >= 98) {
            item.result = 'PASS';
          } else if (item.stabilityPercent >= 94) {
            item.result = 'WARNING';
          } else {
            item.result = 'FAIL';
          }
        }
      }

      updated[index] = item;

      onUpdateSession({
        ...session,
        stage03_laserPower: updated,
        sectionStatuses: { ...session.sectionStatuses, sec_03: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              03 Laser Output & Power Measurements
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Record power meter readings, manage custom measurements, and track stability across active laser heads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s3_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s3_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 03"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddPowerHead}
              icon={<Plus className="w-4 h-4 text-amber-400" />}
              className="text-xs border-amber-800/60 hover:bg-amber-950/50 text-amber-300"
            >
              Add Power Head
            </Button>
            <Badge variant={session.sectionStatuses.sec_03 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_03 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {powerItems.map((p, idx) => (
            <Card key={p.laserId || idx} className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <input
                    type="text"
                    value={p.laserIdentifier}
                    onChange={(e) => handlePowerChange(idx, 'laserIdentifier', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-bold text-xs w-48 font-mono focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Stability: <strong className="text-amber-300">{p.stabilityPercent}%</strong>
                  </span>
                  <Badge variant={p.result === 'PASS' ? 'success' : p.result === 'WARNING' ? 'warning' : 'danger'}>
                    {p.result}
                  </Badge>
                  <button
                    onClick={() => handleDeletePowerHead(idx)}
                    className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded border border-rose-900/40 transition-colors"
                    title="Delete Power Measurement Head"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <EditableFieldLabel
                  fieldKey="s3_ratedPowerWatts"
                  defaultLabel="Rated Power (Watts)"
                  labelOverrides={labelOverrides}
                  deletedFieldKeys={deletedFieldKeys}
                  onUpdateLabel={handleUpdateFieldLabel}
                  onDeleteField={handleDeleteFieldKey}
                  isProtectedSystemField={true}
                  protectedReason="Required system field"
                >
                  <input
                    type="number"
                    value={p.ratedPowerWatts}
                    onChange={(e) => handlePowerChange(idx, 'ratedPowerWatts', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  />
                </EditableFieldLabel>

                <EditableFieldLabel
                  fieldKey="s3_referenceValueWatts"
                  defaultLabel="Reference Value (W)"
                  labelOverrides={labelOverrides}
                  deletedFieldKeys={deletedFieldKeys}
                  onUpdateLabel={handleUpdateFieldLabel}
                  onDeleteField={handleDeleteFieldKey}
                >
                  <input
                    type="number"
                    value={p.referenceValueWatts}
                    onChange={(e) => handlePowerChange(idx, 'referenceValueWatts', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  />
                </EditableFieldLabel>

                <EditableFieldLabel
                  fieldKey="s3_beforeValueWatts"
                  defaultLabel="Before Value (W)"
                  labelOverrides={labelOverrides}
                  deletedFieldKeys={deletedFieldKeys}
                  onUpdateLabel={handleUpdateFieldLabel}
                  onDeleteField={handleDeleteFieldKey}
                  isProtectedSystemField={true}
                  protectedReason="Required system field"
                >
                  <input
                    type="number"
                    value={p.beforeValueWatts}
                    onChange={(e) => handlePowerChange(idx, 'beforeValueWatts', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-rose-300 font-mono"
                  />
                </EditableFieldLabel>

                <EditableFieldLabel
                  fieldKey="s3_afterValueWatts"
                  defaultLabel="After Value (W)"
                  labelOverrides={labelOverrides}
                  deletedFieldKeys={deletedFieldKeys}
                  onUpdateLabel={handleUpdateFieldLabel}
                  onDeleteField={handleDeleteFieldKey}
                  isProtectedSystemField={true}
                  protectedReason="Required system field"
                >
                  <input
                    type="number"
                    value={p.afterValueWatts}
                    onChange={(e) => handlePowerChange(idx, 'afterValueWatts', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-300 font-mono"
                  />
                </EditableFieldLabel>
              </div>

              <div className="text-xs space-y-2">
                <EditableFieldLabel
                  fieldKey="s3_notes"
                  defaultLabel="Power Notes & Observations"
                  labelOverrides={labelOverrides}
                  deletedFieldKeys={deletedFieldKeys}
                  onUpdateLabel={handleUpdateFieldLabel}
                  onDeleteField={handleDeleteFieldKey}
                >
                  <textarea
                    rows={2}
                    value={p.notes || ''}
                    onChange={(e) => handlePowerChange(idx, 'notes', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    placeholder="Record power meter sensor serial number, warm-up time, or power fluctuations..."
                  />
                </EditableFieldLabel>
              </div>

              {/* Custom Measurements for Before/After */}
              <CustomMeasurementsEditor
                customMeasurements={p.customMeasurements}
                onChange={(items) => handlePowerChange(idx, 'customMeasurements', items)}
              />

              {/* Custom Fields */}
              <CustomFieldsEditor
                customFields={p.customFields}
                onChange={(fields) => handlePowerChange(idx, 'customFields', fields)}
                title="Stage 03 Custom Power Head Fields"
                placeholderLabel="e.g. Peak Pulse Energy / Sensor Model"
              />

              {/* Power Head Photos */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Power Meter / Measurement Evidence Photos</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleSimulateImageUpload(p.evidenceImages || [], (imgs) =>
                        handlePowerChange(idx, 'evidenceImages', imgs)
                      )
                    }
                    className="text-xs flex items-center gap-1.5 py-1 text-amber-300 border-amber-900/50 hover:bg-amber-950/30"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Add Photo
                  </Button>
                </div>
                {p.evidenceImages && p.evidenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {p.evidenceImages.map((img, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                        <img src={img} alt="Power Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          onClick={() => {
                            const updated = p.evidenceImages.filter((_, photoIdx) => photoIdx !== i);
                            handlePowerChange(idx, 'evidenceImages', updated);
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-950/80 text-rose-300 rounded opacity-0 group-hover:opacity-100 transition"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 04: OPTICS & BEAM PROFILE
  // --------------------------------------------------------------------------
  if (activeStage === 4) {
    const optics = session.stage04_opticsBeam;

    const handleOpticsChange = (field: keyof typeof optics, value: any) => {
      onUpdateSession({
        ...session,
        stage04_opticsBeam: {
          ...optics,
          [field]: value
        },
        sectionStatuses: { ...session.sectionStatuses, sec_04: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              04 Optics & Beam Profile Inspection
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Inspect optics cleanliness, beam waist diameter, focus offsets, custom checks, and Before/After image comparisons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s4_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s4_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 04"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Badge variant={session.sectionStatuses.sec_04 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_04 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s4_cleanlinessScore"
              defaultLabel="Cleanliness Score (%)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                value={optics.cleanlinessScore}
                onChange={(e) => handleOpticsChange('cleanlinessScore', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-indigo-300 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s4_beamWaistMm"
              defaultLabel="Beam Waist (mm)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.01"
                value={optics.beamWaistMm}
                onChange={(e) => handleOpticsChange('beamWaistMm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s4_focusOffsetMm"
              defaultLabel="Focus Offset (mm)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.01"
                value={optics.focusOffsetMm}
                onChange={(e) => handleOpticsChange('focusOffsetMm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s4_symmetryRatio"
              defaultLabel="Symmetry Ratio"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.01"
                value={optics.symmetryRatio}
                onChange={(e) => handleOpticsChange('symmetryRatio', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s4_m2Value"
              defaultLabel="M² Beam Quality"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.01"
                value={optics.m2Value}
                onChange={(e) => handleOpticsChange('m2Value', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s4_beforeCondition"
              defaultLabel="Before Condition"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={optics.beforeCondition}
                onChange={(e) => handleOpticsChange('beforeCondition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s4_afterCondition"
              defaultLabel="After Condition"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={optics.afterCondition}
                onChange={(e) => handleOpticsChange('afterCondition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Inspection Result:</span>
              <select
                value={optics.inspectionResult}
                onChange={(e) => handleOpticsChange('inspectionResult', e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
              >
                <option value="PASS">PASS</option>
                <option value="WARNING">WARNING</option>
                <option value="FAIL">FAIL</option>
              </select>
            </div>
          </div>

          {/* Custom Engineering Fields */}
          <CustomFieldsEditor
            customFields={optics.customFields}
            onChange={(fields) => handleOpticsChange('customFields', fields)}
            title="Stage 04 Custom Optics Fields"
            placeholderLabel="e.g. Mirror Scratch Score / Collimator Alignment"
          />

          {/* Custom Inspection Items */}
          <CustomInspectionsEditor
            customInspections={optics.customInspections}
            onChange={(items) => handleOpticsChange('customInspections', items)}
          />

          {/* Image Comparisons (Before & After Sets) */}
          <ImageComparisonSetsSection
            comparisons={optics.imageComparisons}
            onChange={(sets) => handleOpticsChange('imageComparisons', sets)}
            onSimulateUpload={(urls, cb) => handleSimulateImageUpload(urls, cb)}
          />
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 05: COOLING SYSTEM
  // --------------------------------------------------------------------------
  if (activeStage === 5) {
    const cool = session.stage05_cooling;

    const handleCoolingChange = (field: keyof typeof cool, value: any) => {
      onUpdateSession({
        ...session,
        stage05_cooling: {
          ...cool,
          [field]: value
        },
        sectionStatuses: { ...session.sectionStatuses, sec_05: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              05 Chiller & Cooling System Verification
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Check DI water conductivity, flow rate, time-series temperature graph, and cooling performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s5_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s5_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 05"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Badge variant={session.sectionStatuses.sec_05 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_05 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s5_chillerTempCelsius"
              defaultLabel="Chiller Temperature (°C)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.1"
                value={cool.chillerTempCelsius}
                onChange={(e) => handleCoolingChange('chillerTempCelsius', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-cyan-300 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s5_chillerFlowLpm"
              defaultLabel="Coolant Flow Rate (LPM)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.1"
                value={cool.chillerFlowLpm}
                onChange={(e) => handleCoolingChange('chillerFlowLpm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s5_diConductivityUs"
              defaultLabel="DI Water Conductivity (µS/cm)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.01"
                value={cool.diConductivityUs}
                onChange={(e) => handleCoolingChange('diConductivityUs', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s5_beforeCondition"
              defaultLabel="Before Condition / Readings"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={cool.beforeCondition}
                onChange={(e) => handleCoolingChange('beforeCondition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s5_afterCondition"
              defaultLabel="After Condition / Post-Maintenance"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={cool.afterCondition}
                onChange={(e) => handleCoolingChange('afterCondition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Cooling Subsystem Verdict:</span>
            <select
              value={cool.result}
              onChange={(e) => handleCoolingChange('result', e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
            >
              <option value="PASS">PASS</option>
              <option value="ATTENTION">ATTENTION REQUIRED</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          {/* Custom Engineering Fields */}
          <CustomFieldsEditor
            customFields={cool.customFields}
            onChange={(fields) => handleCoolingChange('customFields', fields)}
            title="Stage 05 Custom Cooling Fields"
            placeholderLabel="e.g. Pump Pressure Bar / Reservoir Level %"
          />

          {/* Custom Measurements */}
          <CustomMeasurementsEditor
            customMeasurements={cool.customMeasurements}
            onChange={(items) => handleCoolingChange('customMeasurements', items)}
          />

          {/* Interactive Cooling Time-Series Temperature Graph */}
          <CoolingTemperatureGraphEditor
            graphConfig={cool.temperatureGraph}
            onChange={(config) => handleCoolingChange('temperatureGraph', config)}
          />
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 06: PRODUCT QUALITY / VISUAL INSPECTION
  // --------------------------------------------------------------------------
  if (activeStage === 6) {
    const qual = session.stage06_productQuality;

    const handleQualChange = (field: keyof typeof qual, value: any) => {
      onUpdateSession({
        ...session,
        stage06_productQuality: {
          ...qual,
          [field]: value
        },
        sectionStatuses: { ...session.sectionStatuses, sec_06: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              06 Product Quality & Visual Inspection
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Inspect test cut sample wafer quality, via diameter, pad condition, custom check items, and Before/After image comparisons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deletedFieldKeys.some(k => k.startsWith('s6_')) && (
              <button
                type="button"
                onClick={() => handleRestoreSectionFields('s6_')}
                className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded"
                title="Restore deleted default fields in Stage 06"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fields
              </button>
            )}
            <Badge variant={session.sectionStatuses.sec_06 === 'COMPLETED' ? 'success' : 'warning'}>
              {session.sectionStatuses.sec_06 || 'IN_PROGRESS'}
            </Badge>
          </div>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s6_sampleId"
              defaultLabel="Sample ID / Coupon"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={qual.sampleId}
                onChange={(e) => handleQualChange('sampleId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s6_viaDiameterUm"
              defaultLabel="Via Diameter (µm)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.1"
                value={qual.viaDiameterUm}
                onChange={(e) => handleQualChange('viaDiameterUm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-300 font-mono"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s6_viaShape"
              defaultLabel="Via Shape / Roundness"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={qual.viaShape}
                onChange={(e) => handleQualChange('viaShape', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s6_viaOffsetUm"
              defaultLabel="Via Offset (µm)"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="number"
                step="0.1"
                value={qual.viaOffsetUm}
                onChange={(e) => handleQualChange('viaOffsetUm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </EditableFieldLabel>
          </div>

          <div className="text-xs">
            <EditableFieldLabel
              fieldKey="s6_padQuality"
              defaultLabel="Pad Quality & Recast Observations"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <input
                type="text"
                value={qual.padQuality}
                onChange={(e) => handleQualChange('padQuality', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </EditableFieldLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <EditableFieldLabel
              fieldKey="s6_beforeInspectionNotes"
              defaultLabel="Before Inspection Notes"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={qual.beforeInspectionNotes}
                onChange={(e) => handleQualChange('beforeInspectionNotes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>

            <EditableFieldLabel
              fieldKey="s6_afterInspectionNotes"
              defaultLabel="After Inspection Notes"
              labelOverrides={labelOverrides}
              deletedFieldKeys={deletedFieldKeys}
              onUpdateLabel={handleUpdateFieldLabel}
              onDeleteField={handleDeleteFieldKey}
            >
              <textarea
                rows={2}
                value={qual.afterInspectionNotes}
                onChange={(e) => handleQualChange('afterInspectionNotes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </EditableFieldLabel>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Quality Verification Verdict:</span>
            <select
              value={qual.result}
              onChange={(e) => handleQualChange('result', e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
            >
              <option value="PASS">PASS (MEETS LITHO SPEC)</option>
              <option value="ATTENTION">ATTENTION REQUIRED</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          {/* Custom Engineering Fields */}
          <CustomFieldsEditor
            customFields={qual.customFields}
            onChange={(fields) => handleQualChange('customFields', fields)}
            title="Stage 06 Custom Quality Fields"
            placeholderLabel="e.g. Copper Delamination Score / Edge Burrs"
          />

          {/* Custom Inspection Items */}
          <CustomInspectionsEditor
            customInspections={qual.customInspections}
            onChange={(items) => handleQualChange('customInspections', items)}
          />

          {/* Image Comparisons (Before & After Sets) */}
          <ImageComparisonSetsSection
            comparisons={qual.imageComparisons}
            onChange={(sets) => handleQualChange('imageComparisons', sets)}
            onSimulateUpload={(urls, cb) => handleSimulateImageUpload(urls, cb)}
          />
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 07: SPARE PARTS & CONSUMABLE
  // --------------------------------------------------------------------------
  if (activeStage === 7) {
    const parts = session.stage07_spareParts || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-400" />
              07 Spare Parts & Consumables Log
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Record parts replaced during maintenance, consumables used, and recommended stock.
            </p>
          </div>
          <Button
            onClick={() => handleOpenPartModal()}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Spare Part Entry
          </Button>
        </div>

        {parts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No spare parts recorded for this session yet.</p>
            <Button
              onClick={() => handleOpenPartModal()}
              variant="outline"
              className="mt-3 text-xs border-slate-700 text-slate-300"
            >
              Add First Part
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {parts.map((pt) => (
              <Card
                key={pt.id}
                className="border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{pt.partName}</span>
                    <span className="text-xs font-mono text-orange-400">({pt.partNumber})</span>
                    <Badge variant={pt.action === 'REPLACED' ? 'success' : 'warning'}>
                      {pt.action}
                    </Badge>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {pt.costIndicator.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Category: <span className="text-slate-300">{pt.category}</span> • Qty:{' '}
                    <span className="text-slate-200 font-bold">{pt.quantity}</span> • Reason:{' '}
                    <span className="text-slate-300">{pt.reason}</span>
                  </div>
                  {pt.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{pt.notes}</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenPartModal(pt)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePart(pt.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {partModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-slate-100">
                  {editingPart ? 'Edit Spare Part Record' : 'Add Spare Part Entry'}
                </h4>
                <button onClick={() => setPartModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Part Name *</label>
                  <input
                    type="text"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. DI Water Resin Filter Cartridge 10''"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Part Number</label>
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="e.g. EO-FLT-9921"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Action Taken</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    >
                      <option value="REPLACED">REPLACED</option>
                      <option value="USED">USED</option>
                      <option value="RECOMMENDED">RECOMMENDED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cost Indicator</label>
                    <select
                      value={costIndicator}
                      onChange={(e) => setCostIndicator(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                    >
                      <option value="EO_SUPPORT">EO SUPPORT</option>
                      <option value="CUSTOMER_COST">CUSTOMER COST</option>
                      <option value="WARRANTY">WARRANTY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Reason for Action</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Scheduled quarterly preventive replacement"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    value={partNotes}
                    onChange={(e) => setPartNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setPartModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSavePart} className="bg-orange-600 hover:bg-orange-500 text-white">
                  Save Part Entry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STAGE 08: ENGINEER REMARKS & VERDICT
  // --------------------------------------------------------------------------
  if (activeStage === 8) {
    const rem = session.stage08_engineerRemarks;

    const handleRemarkChange = (field: keyof typeof rem, value: any) => {
      onUpdateSession({
        ...session,
        stage08_engineerRemarks: {
          ...rem,
          [field]: value
        },
        sectionStatuses: { ...session.sectionStatuses, sec_08: 'COMPLETED' },
        lastUpdated: new Date().toLocaleString()
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              08 Engineer Remarks & Production Verdict
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Document general findings, observed issues, recommendations, and production release status.
            </p>
          </div>
          <Badge variant={session.sectionStatuses.sec_08 === 'COMPLETED' ? 'success' : 'warning'}>
            {session.sectionStatuses.sec_08 || 'IN_PROGRESS'}
          </Badge>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="text-xs">
            <label className="block text-slate-400 mb-1 font-medium">General Findings</label>
            <textarea
              rows={3}
              value={rem.generalFindings}
              onChange={(e) => handleRemarkChange('generalFindings', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Observed Issues</label>
              <textarea
                rows={3}
                value={rem.observedIssues}
                onChange={(e) => handleRemarkChange('observedIssues', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Corrective Actions Taken</label>
              <textarea
                rows={3}
                value={rem.correctiveActions}
                onChange={(e) => handleRemarkChange('correctiveActions', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-400 mb-1 font-medium">Engineer Recommendations</label>
            <textarea
              rows={2}
              value={rem.recommendations}
              onChange={(e) => handleRemarkChange('recommendations', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rem.followUpRequired}
                onChange={(e) => handleRemarkChange('followUpRequired', e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-slate-300 font-medium">Follow-Up Required before next cycle</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Production Release Verdict:</span>
              <select
                value={rem.productionReleaseVerdict}
                onChange={(e) => handleRemarkChange('productionReleaseVerdict', e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
              >
                <option value="APPROVED">APPROVED FOR FULL PRODUCTION</option>
                <option value="CONDITIONAL_RELEASE">CONDITIONAL RELEASE</option>
                <option value="HALTED">HALTED / DO NOT OPERATE</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
