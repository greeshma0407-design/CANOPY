import { useState } from 'react';
import { CalculationLine, ActivityRecord, EmissionCategory } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { canopyApi, PreviewItemInput, ActivityRecordCreate, ActivityRecordRead } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface ElectricityInput {
  periodId: string;
  monthlyKwh: number;
  sourceType: 'grid' | 'solar';
  notes: string;
}

export interface TransportInput {
  periodId: string;
  mode: string;
  activityType: 'passenger_km' | 'vehicle_km';
  quantity: number;
  tripsCount: number;
  notes: string;
}

export interface WasteInput {
  periodId: string;
  wasteType: string;
  treatmentRoute: string;
  quantityTonnes: number;
  notes: string;
}

// ---------------------------------------------------------------------------
// Activity type registry — single source of truth for all backend mappings.
// These strings must exactly match the activity_type values in the DB factors.
// ---------------------------------------------------------------------------
const ELEC_ACTIVITY_TYPES: Record<string, string> = {
  grid:  'grid_electricity',
  solar: 'solar_electricity',
};

const TRANS_ACTIVITY_TYPES: Record<string, { type: string; unit: 'passenger_km' | 'vehicle_km' }> = {
  bus:        { type: 'bus_diesel',      unit: 'passenger_km' },
  car:        { type: 'car_petrol',      unit: 'vehicle_km'   },
  twowheeler: { type: 'motorcycle',      unit: 'vehicle_km'   },
  auto:       { type: 'auto_cng',        unit: 'passenger_km' },
  cycling:    { type: 'walking_cycling', unit: 'passenger_km' }, // FIX: was incorrectly 'bus_diesel'
};

function getWasteActivityType(wasteType: string, treatmentRoute: string): string {
  if (treatmentRoute === 'compost') return 'organic_waste_compost';
  if (treatmentRoute === 'recycle') return 'organic_waste';
  if (wasteType === 'mixed') return 'mixed_msw';
  return 'organic_waste';
}


export function useCalculator(initialPeriodId?: string) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EmissionCategory>('electricity');

  const defaultPeriod = initialPeriodId || 'period-cy2025-01';

  const [elecForm, setElecForm] = useState<ElectricityInput>({
    periodId: defaultPeriod,
    monthlyKwh: 48000,
    sourceType: 'grid',
    notes: 'Main academic block meter readings'
  });

  const [transForm, setTransForm] = useState<TransportInput>({
    periodId: defaultPeriod,
    mode: 'bus',
    activityType: 'passenger_km',
    quantity: 120000,
    tripsCount: 440,
    notes: 'College daily student shuttle service routes'
  });

  const [wasteForm, setWasteForm] = useState<WasteInput>({
    periodId: defaultPeriod,
    wasteType: 'organic',
    treatmentRoute: 'landfill',
    quantityTonnes: 15.5,
    notes: 'Mess and food court unsegregated waste haul'
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [savedRecords, setSavedRecords] = useLocalStorage<ActivityRecord[]>('canopy_session_records', []);
  const [calculatedLines, setCalculatedLines] = useState<CalculationLine[]>([]);
  const [lastCalculatedCategory, setLastCalculatedCategory] = useState<EmissionCategory | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiWarnings, setApiWarnings] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Electricity Calculation via Backend API
  // ---------------------------------------------------------------------------
  const calculateElectricity = async () => {
    const newErrors: Record<string, string> = {};
    if (elecForm.monthlyKwh <= 0 || isNaN(elecForm.monthlyKwh)) {
      newErrors.monthlyKwh = 'Electricity consumption must be greater than 0 kWh.';
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return null; }
    setErrors({});
    setIsCalculating(true);

    const activityType = ELEC_ACTIVITY_TYPES[elecForm.sourceType] ?? 'grid_electricity';
    const items: PreviewItemInput[] = [{
      activity_type: activityType,
      quantity: elecForm.monthlyKwh,
      unit: 'kWh',
      category: 'electricity',
      subcategory: elecForm.sourceType
    }];

    try {
      const res = await canopyApi.previewCalculation({ items }, 'IN-Telangana');
      setApiWarnings(res.warnings);

      const firstLine = res.lines[0];

      // FIX: Use ?? (nullish coalescing) for BOTH emissions AND factor value.
      // Never display a hardcoded factor when backend reports missing_factor.
      const kg = firstLine?.emissions_kg_co2e ?? 0;
      const t  = firstLine?.emissions_tco2e   ?? (kg / 1000);
      const factorVal = firstLine?.factor_value ?? null;  // null = no factor found

      const line: CalculationLine = {
        id: `calc-elec-${Date.now()}`,
        category: 'electricity',
        description: elecForm.sourceType === 'solar'
          ? 'Electricity: On-site Rooftop Solar PV'
          : 'Electricity: Grid Electricity (CEA Baseline)',
        quantity: elecForm.monthlyKwh,
        unit: 'kWh',
        factor_id: firstLine?.factor_id ?? null,
        factor_value: factorVal,
        factor_unit: 'kgCO2e/kWh',
        factor_source: firstLine?.factor_id
          ? (elecForm.sourceType === 'solar'
              ? 'ILLUSTRATIVE — Lifecycle estimate (see factor notes)'
              : 'ILLUSTRATIVE — CEA Baseline Database v19 region approximate')
          : 'No matching factor found in database',
        methodology: 'Market-based Scope 2',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: elecForm.notes,
        assumptions: elecForm.sourceType === 'solar'
          ? 'Illustrative lifecycle solar PV factor — not assumed zero-emission.'
          : 'Applies illustrative CEA v19 regional grid factor for Telangana state.',
        status: firstLine?.status ?? 'missing_factor',
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'electricity')]);
      setLastCalculatedCategory('electricity');
      return line;
    } catch {
      // Backend unreachable — show zero with explicit offline indicator
      const line: CalculationLine = {
        id: `calc-elec-${Date.now()}`,
        category: 'electricity',
        description: `Electricity: ${elecForm.sourceType === 'solar' ? 'On-site Rooftop Solar PV' : 'Grid Electricity'} [Backend Offline]`,
        quantity: elecForm.monthlyKwh,
        unit: 'kWh',
        factor_id: null,
        factor_value: null,
        factor_unit: 'kgCO2e/kWh',
        factor_source: 'Backend unreachable — no authoritative factor applied',
        methodology: 'N/A',
        emissions_kg_co2e: 0,
        emissions_t_co2e: 0,
        is_illustrative: true,
        notes: elecForm.notes,
        assumptions: 'Backend offline. Zero result — not a real calculation.',
        status: 'backend_offline',
      };
      setApiWarnings(['Backend is currently unreachable. Emissions cannot be calculated without a server connection.']);
      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'electricity')]);
      setLastCalculatedCategory('electricity');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Transport Calculation via Backend API
  // ---------------------------------------------------------------------------
  const calculateTransport = async () => {
    const newErrors: Record<string, string> = {};
    if (transForm.quantity <= 0 || isNaN(transForm.quantity)) {
      newErrors.quantity = 'Distance / passenger-km must be greater than 0.';
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return null; }
    setErrors({});
    setIsCalculating(true);

    // FIX: Use registry — cycling now correctly maps to 'walking_cycling', not 'bus_diesel'
    const mapping = TRANS_ACTIVITY_TYPES[transForm.mode] ?? TRANS_ACTIVITY_TYPES['bus'];
    const activityType = mapping.type;
    const unit = mapping.unit;

    const modeLabels: Record<string, string> = {
      bus:        'Campus Bus Fleet (Diesel)',
      car:        'Faculty & Staff Car Commute (Petrol/Diesel)',
      twowheeler: 'Motorcycle & Scooter Commute',
      auto:       'Auto-Rickshaw Shared Transit (CNG)',
      cycling:    'Walking / Cycling (Active Transit)',
    };
    const desc = modeLabels[transForm.mode] ?? 'Transport Activity';

    const items: PreviewItemInput[] = [{
      activity_type: activityType,
      quantity: transForm.quantity,
      unit: unit,
      category: 'transport',
      subcategory: transForm.mode
    }];

    try {
      const res = await canopyApi.previewCalculation({ items }, 'IN-Telangana');
      setApiWarnings(res.warnings);

      const firstLine = res.lines[0];
      const kg = firstLine?.emissions_kg_co2e ?? 0;
      const t  = firstLine?.emissions_tco2e   ?? (kg / 1000);
      const factorVal = firstLine?.factor_value ?? null;

      const line: CalculationLine = {
        id: `calc-trans-${Date.now()}`,
        category: 'transport',
        description: desc,
        quantity: transForm.quantity,
        unit: unit === 'vehicle_km' ? 'vehicle-km' : 'passenger-km',
        factor_id: firstLine?.factor_id ?? null,
        factor_value: factorVal,
        factor_unit: `kgCO2e/${unit === 'passenger_km' ? 'p-km' : 'v-km'}`,
        factor_source: firstLine?.factor_id
          ? 'ILLUSTRATIVE — ARAI/CPCB composite approximation'
          : 'No matching factor found in database',
        methodology: 'Modal distance-based factor',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: transForm.notes,
        assumptions: `Based on ${transForm.tripsCount || 1} logged trips using backend factor.`,
        status: firstLine?.status ?? 'missing_factor',
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'transport')]);
      setLastCalculatedCategory('transport');
      return line;
    } catch {
      const line: CalculationLine = {
        id: `calc-trans-${Date.now()}`,
        category: 'transport',
        description: `${desc} [Backend Offline]`,
        quantity: transForm.quantity,
        unit: unit === 'vehicle_km' ? 'vehicle-km' : 'passenger-km',
        factor_id: null,
        factor_value: null,
        factor_unit: `kgCO2e/${unit === 'passenger_km' ? 'p-km' : 'v-km'}`,
        factor_source: 'Backend unreachable — no authoritative factor applied',
        methodology: 'N/A',
        emissions_kg_co2e: 0,
        emissions_t_co2e: 0,
        is_illustrative: true,
        notes: transForm.notes,
        assumptions: 'Backend offline. Zero result — not a real calculation.',
        status: 'backend_offline',
      };
      setApiWarnings(['Backend is currently unreachable. Emissions cannot be calculated without a server connection.']);
      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'transport')]);
      setLastCalculatedCategory('transport');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Waste Calculation via Backend API
  // ---------------------------------------------------------------------------
  const calculateWaste = async () => {
    const newErrors: Record<string, string> = {};
    if (wasteForm.quantityTonnes <= 0 || isNaN(wasteForm.quantityTonnes)) {
      newErrors.quantityTonnes = 'Waste quantity must be greater than 0 tonnes.';
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return null; }
    setErrors({});
    setIsCalculating(true);

    const activityType = getWasteActivityType(wasteForm.wasteType, wasteForm.treatmentRoute);

    const wasteDescriptions: Record<string, string> = {
      organic_waste:          'Municipal Solid Waste (Landfill)',
      mixed_msw:              'Mixed Municipal Solid Waste (Landfill)',
      organic_waste_compost:  'Organic Food & Mess Waste (Aerobic Composting)',
    };
    const desc = wasteDescriptions[activityType] ?? 'Solid Waste Stream';

    const items: PreviewItemInput[] = [{
      activity_type: activityType,
      quantity: wasteForm.quantityTonnes,
      unit: 'tonne',
      category: 'waste',
      subcategory: wasteForm.treatmentRoute
    }];

    try {
      const res = await canopyApi.previewCalculation({ items }, 'IN-Telangana');
      setApiWarnings(res.warnings);

      const firstLine = res.lines[0];
      const kg = firstLine?.emissions_kg_co2e ?? 0;
      const t  = firstLine?.emissions_tco2e   ?? (kg / 1000);
      const factorVal = firstLine?.factor_value ?? null;

      const line: CalculationLine = {
        id: `calc-waste-${Date.now()}`,
        category: 'waste',
        description: desc,
        quantity: wasteForm.quantityTonnes,
        unit: 'tonne',
        factor_id: firstLine?.factor_id ?? null,
        factor_value: factorVal,
        factor_unit: 'kgCO2e/tonne',
        factor_source: firstLine?.factor_id
          ? 'ILLUSTRATIVE — IPCC 2006 Tier 1 approximation'
          : 'No matching factor found in database',
        methodology: 'Scope 3 Solid Waste',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: wasteForm.notes,
        assumptions: `Evaluated using backend factor: ${factorVal !== null ? factorVal + ' kgCO2e/tonne' : 'N/A — factor not found'}.`,
        status: firstLine?.status ?? 'missing_factor',
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'waste')]);
      setLastCalculatedCategory('waste');
      return line;
    } catch {
      const line: CalculationLine = {
        id: `calc-waste-${Date.now()}`,
        category: 'waste',
        description: `${desc} [Backend Offline]`,
        quantity: wasteForm.quantityTonnes,
        unit: 'tonne',
        factor_id: null,
        factor_value: null,
        factor_unit: 'kgCO2e/tonne',
        factor_source: 'Backend unreachable — no authoritative factor applied',
        methodology: 'N/A',
        emissions_kg_co2e: 0,
        emissions_t_co2e: 0,
        is_illustrative: true,
        notes: wasteForm.notes,
        assumptions: 'Backend offline. Zero result — not a real calculation.',
        status: 'backend_offline',
      };
      setApiWarnings(['Backend is currently unreachable. Emissions cannot be calculated without a server connection.']);
      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'waste')]);
      setLastCalculatedCategory('waste');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Load an existing record into the form for editing
  // ---------------------------------------------------------------------------
  const loadRecordForEdit = (record: ActivityRecordRead) => {
    setEditingRecordId(record.id);
    setActiveTab(record.category as EmissionCategory);

    let parsedMonth = selectedMonth;
    let parsedYear = selectedYear;

    const firstItem = record.activity_items[0];
    if (firstItem?.metadata_json) {
      try {
        const meta = typeof firstItem.metadata_json === 'string'
          ? JSON.parse(firstItem.metadata_json)
          : firstItem.metadata_json;
        if (meta.month_num) parsedMonth = Number(meta.month_num);
        if (meta.year) parsedYear = Number(meta.year);
      } catch {}
    } else if (record.notes) {
      const mMatch = record.notes.match(/(\d{4})-(\d{2})/);
      if (mMatch) {
        parsedYear = parseInt(mMatch[1], 10);
        parsedMonth = parseInt(mMatch[2], 10);
      }
    }
    setSelectedMonth(parsedMonth);
    setSelectedYear(parsedYear);

    if (record.category === 'electricity') {
      const isSolar = firstItem?.activity_type.includes('solar');
      setElecForm({
        periodId: record.reporting_period_id,
        monthlyKwh: firstItem?.quantity || 48000,
        sourceType: isSolar ? 'solar' : 'grid',
        notes: record.notes || ''
      });
    } else if (record.category === 'transport') {
      let mode = 'bus';
      if (firstItem?.activity_type.includes('car')) mode = 'car';
      else if (firstItem?.activity_type.includes('motorcycle')) mode = 'twowheeler';
      else if (firstItem?.activity_type.includes('auto')) mode = 'auto';
      else if (firstItem?.activity_type.includes('cycling') || firstItem?.activity_type.includes('walking')) mode = 'cycling';

      setTransForm({
        periodId: record.reporting_period_id,
        mode,
        activityType: (firstItem?.unit === 'vehicle_km' ? 'vehicle_km' : 'passenger_km'),
        quantity: firstItem?.quantity || 120000,
        tripsCount: 440,
        notes: record.notes || ''
      });
    } else if (record.category === 'waste') {
      const isMixed = firstItem?.activity_type.includes('mixed');
      const isCompost = firstItem?.activity_type.includes('compost');
      setWasteForm({
        periodId: record.reporting_period_id,
        wasteType: isMixed ? 'mixed' : 'organic',
        treatmentRoute: isCompost ? 'compost' : 'landfill',
        quantityTonnes: firstItem?.quantity || 15.5,
        notes: record.notes || ''
      });
    }
    setCalculatedLines([]);
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingRecordId(null);
    setCalculatedLines([]);
    setErrors({});
  };

  // ---------------------------------------------------------------------------
  // Save current lines to backend and local session records
  // ---------------------------------------------------------------------------
  const saveRecord = async (
    targetCampusId?: string,
    targetPeriodId?: string,
    reportingPeriodLabel: string = 'CY 2025',
    monthOverride?: number,
    yearOverride?: number
  ): Promise<boolean> => {
    if (calculatedLines.length === 0) return false;
    setIsSaving(true);

    const campusId = targetCampusId || user?.campus_id || '';
    const periodId = targetPeriodId || '';

    // Guard: cannot save without a real campus ID and period ID
    if (!campusId || !periodId) {
      setErrors(prev => ({ ...prev, save: 'Your campus or reporting period could not be identified. Please refresh the page and try again.' }));
      setIsSaving(false);
      return false;
    }

    const monthNum = monthOverride || selectedMonth;
    const yearNum = yearOverride || selectedYear;
    const monthPad = monthNum.toString().padStart(2, '0');
    const monthCode = `${yearNum}-${monthPad}`;
    const monthName = MONTH_NAMES[monthNum - 1] || 'Month';

    const totalKg = calculatedLines.reduce((acc, l) => acc + l.emissions_kg_co2e, 0);
    const totalT  = calculatedLines.reduce((acc, l) => acc + l.emissions_t_co2e, 0);

    const getBackendActivityType = (line: CalculationLine): string => {
      if (line.category === 'electricity') return ELEC_ACTIVITY_TYPES[elecForm.sourceType] ?? 'grid_electricity';
      if (line.category === 'transport')   return TRANS_ACTIVITY_TYPES[transForm.mode]?.type ?? 'bus_diesel';
      if (line.category === 'waste')       return getWasteActivityType(wasteForm.wasteType, wasteForm.treatmentRoute);
      return 'unknown';
    };

    const getBackendUnit = (line: CalculationLine): string =>
      line.unit.replace('passenger-km', 'passenger_km').replace('vehicle-km', 'vehicle_km');

    const metaObj = {
      month: monthCode,
      month_name: `${monthName} ${yearNum}`,
      year: yearNum,
      month_num: monthNum
    };

    const recordPayload: ActivityRecordCreate = {
      campus_id: campusId,
      reporting_period_id: periodId,
      category: activeTab,
      status: 'verified',
      notes: `${reportingPeriodLabel} — ${monthName} ${yearNum} (${monthCode}) — ${activeTab}`,
      data_source: 'Canopy Carbon Calculator',
      items: calculatedLines.map(l => ({
        activity_type: getBackendActivityType(l),
        quantity: l.quantity,
        unit: getBackendUnit(l),
        subcategory: activeTab,
        metadata_json: metaObj,
        factor_id: l.factor_id ?? undefined,
      }))
    };

    try {
      if (editingRecordId) {
        await canopyApi.updateRecord(editingRecordId, recordPayload);
        setEditingRecordId(null);
      } else {
        await canopyApi.createRecord(recordPayload);
      }
    } catch (err: any) {
      console.error('[CANOPY API] Backend record creation error:', err);
      setErrors(prev => ({ ...prev, save: err?.message || 'Failed to persist record to backend database.' }));
      setIsSaving(false);
      return false;
    }

    setIsSaving(false);

    const newRecord: ActivityRecord = {
      id: editingRecordId || `session-rec-${Date.now()}`,
      campus_id: campusId,
      reporting_period_id: periodId,
      month: monthCode,
      month_name: `${monthName} ${yearNum}`,
      category: activeTab,
      status: 'verified',
      data_source: 'Canopy Carbon Calculator',
      notes: `Calculated for ${monthName} ${yearNum}`,
      total_kg_co2e: totalKg,
      total_t_co2e: totalT,
      items: calculatedLines.map(l => ({
        id: `item-${Date.now()}-${l.id}`,
        activity_record_id: editingRecordId || `session-rec-${Date.now()}`,
        activity_type: getBackendActivityType(l),
        quantity: l.quantity,
        unit: getBackendUnit(l),
        factor_id: l.factor_id ?? undefined,
        factor_value: l.factor_value ?? undefined,
        emissions_kg_co2e: l.emissions_kg_co2e,
        emissions_t_co2e: l.emissions_t_co2e,
        is_illustrative: l.is_illustrative,
        notes: l.notes
      }))
    };

    setSavedRecords(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
    return true;
  };

  const resetAll = () => {
    setEditingRecordId(null);
    setElecForm({ periodId: defaultPeriod, monthlyKwh: 48000, sourceType: 'grid', notes: '' });
    setTransForm({ periodId: defaultPeriod, mode: 'bus', activityType: 'passenger_km', quantity: 120000, tripsCount: 440, notes: '' });
    setWasteForm({ periodId: defaultPeriod, wasteType: 'organic', treatmentRoute: 'landfill', quantityTonnes: 15.5, notes: '' });
    setCalculatedLines([]);
    setLastCalculatedCategory(null);
    setErrors({});
    setApiWarnings([]);
  };

  return {
    activeTab, setActiveTab,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    editingRecordId,
    loadRecordForEdit,
    cancelEdit,
    elecForm, setElecForm,
    transForm, setTransForm,
    wasteForm, setWasteForm,
    calculatedLines,
    lastCalculatedCategory,
    errors,
    apiWarnings,
    isCalculating,
    isSaving,
    calculateElectricity,
    calculateTransport,
    calculateWaste,
    saveRecord,
    resetAll,
    savedRecords,
  };
}
