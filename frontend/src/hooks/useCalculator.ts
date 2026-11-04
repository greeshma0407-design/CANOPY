import { useState } from 'react';
import { CalculationLine, ActivityRecord, EmissionCategory } from '../types';
import { mockEmissionFactors } from '../data/emissionFactors';
import { useLocalStorage } from './useLocalStorage';
import { canopyApi, PreviewItemInput, ActivityRecordCreate } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

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

export function useCalculator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EmissionCategory>('electricity');

  // Input states
  const [elecForm, setElecForm] = useState<ElectricityInput>({
    periodId: 'period-2025',
    monthlyKwh: 48000,
    sourceType: 'grid',
    notes: 'Main academic block meter readings'
  });

  const [transForm, setTransForm] = useState<TransportInput>({
    periodId: 'period-2025',
    mode: 'bus',
    activityType: 'passenger_km',
    quantity: 120000,
    tripsCount: 440,
    notes: 'College daily student shuttle service routes'
  });

  const [wasteForm, setWasteForm] = useState<WasteInput>({
    periodId: 'period-2025',
    wasteType: 'organic',
    treatmentRoute: 'landfill',
    quantityTonnes: 15.5,
    notes: 'Mess and food court unsegregated waste haul'
  });

  // Saved records in session
  const [savedRecords, setSavedRecords] = useLocalStorage<ActivityRecord[]>('canopy_session_records', []);

  // Calculation results
  const [calculatedLines, setCalculatedLines] = useState<CalculationLine[]>([]);
  const [lastCalculatedCategory, setLastCalculatedCategory] = useState<EmissionCategory | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiWarnings, setApiWarnings] = useState<string[]>([]);

  // Electricity Calculation via Backend API
  const calculateElectricity = async () => {
    const newErrors: Record<string, string> = {};
    if (elecForm.monthlyKwh <= 0 || isNaN(elecForm.monthlyKwh)) {
      newErrors.monthlyKwh = 'Electricity consumption must be greater than 0 kWh.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});
    setIsCalculating(true);

    const activityType = elecForm.sourceType === 'solar' ? 'solar_electricity' : 'grid_electricity';
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
      const kg = firstLine?.emissions_kg_co2e ?? 0;
      const t = firstLine?.emissions_tco2e ?? (kg / 1000);

      const line: CalculationLine = {
        id: `calc-elec-${Date.now()}`,
        category: 'electricity',
        description: `Electricity: ${elecForm.sourceType === 'solar' ? 'On-site Rooftop Solar PV' : 'Grid Electricity (CEA Baseline)'}`,
        quantity: elecForm.monthlyKwh,
        unit: 'kWh',
        factor_id: firstLine?.factor_id || (elecForm.sourceType === 'solar' ? 'ef-elec-solar-onsite-v1' : 'ef-elec-india-telangana-2024-v1'),
        factor_value: firstLine?.factor_value || (elecForm.sourceType === 'solar' ? 0.048 : 0.82),
        factor_unit: 'kgCO2e/kWh',
        factor_source: elecForm.sourceType === 'solar' ? 'Lifecycle rooftop solar estimation' : 'CEA Baseline Database v19',
        methodology: 'Market-based Scope 2',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: false,
        notes: elecForm.notes,
        assumptions: elecForm.sourceType === 'solar'
          ? 'Explicit solar PV factor applied (0.048 kgCO2e/kWh) — not assumed zero-emission.'
          : 'Applies CEA v19 regional grid factor for Telangana state.'
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'electricity')]);
      setLastCalculatedCategory('electricity');
      return line;
    } catch {
      // Local fallback calculation if backend temporarily offline
      const factorValue = elecForm.sourceType === 'solar' ? 0.048 : 0.82;
      const kg = Math.round(elecForm.monthlyKwh * factorValue * 100) / 100;
      const t = Math.round((kg / 1000) * 1000) / 1000;

      const line: CalculationLine = {
        id: `calc-elec-${Date.now()}`,
        category: 'electricity',
        description: `Electricity: ${elecForm.sourceType === 'solar' ? 'On-site Rooftop Solar PV' : 'Grid Electricity (CEA Baseline)'}`,
        quantity: elecForm.monthlyKwh,
        unit: 'kWh',
        factor_id: elecForm.sourceType === 'solar' ? 'ef-elec-solar-onsite-v1' : 'ef-elec-india-telangana-2024-v1',
        factor_value: factorValue,
        factor_unit: 'kgCO2e/kWh',
        factor_source: 'CEA Baseline Database v19 approximate',
        methodology: 'Market-based Scope 2',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: elecForm.notes,
        assumptions: 'Calculated using fallback factor.'
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'electricity')]);
      setLastCalculatedCategory('electricity');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // Transport Calculation via Backend API
  const calculateTransport = async () => {
    const newErrors: Record<string, string> = {};
    if (transForm.quantity <= 0 || isNaN(transForm.quantity)) {
      newErrors.quantity = 'Distance / passenger-km must be greater than 0.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});
    setIsCalculating(true);

    let activityType = 'bus_diesel';
    let unit = 'passenger_km';
    let desc = 'Campus Bus Fleet (Diesel)';

    if (transForm.mode === 'car') {
      activityType = 'car_petrol';
      unit = 'vehicle_km';
      desc = 'Faculty & Staff Car Commute (Petrol/Diesel)';
    } else if (transForm.mode === 'twowheeler') {
      activityType = 'motorcycle';
      unit = 'vehicle_km';
      desc = 'Motorcycle & Scooter Commute';
    } else if (transForm.mode === 'auto') {
      activityType = 'auto_cng';
      unit = 'passenger_km';
      desc = 'Auto-Rickshaw Shared Transit (CNG)';
    } else if (transForm.mode === 'cycling') {
      activityType = 'bus_diesel';
      unit = 'passenger_km';
      desc = 'Walking / Cycling (Active Transit)';
    }

    const isCycling = transForm.mode === 'cycling';
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
      const kg = isCycling ? 0 : (firstLine?.emissions_kg_co2e ?? 0);
      const t = isCycling ? 0 : (firstLine?.emissions_tco2e ?? (kg / 1000));

      const line: CalculationLine = {
        id: `calc-trans-${Date.now()}`,
        category: 'transport',
        description: desc,
        quantity: transForm.quantity,
        unit: unit === 'passenger_km' ? 'passenger-km' : 'vehicle-km',
        factor_id: firstLine?.factor_id || `ef-trans-${transForm.mode}-v1`,
        factor_value: isCycling ? 0 : (firstLine?.factor_value || 0.089),
        factor_unit: `kgCO2e/${unit === 'passenger_km' ? 'p-km' : 'v-km'}`,
        factor_source: 'ARAI / CPCB composite approximation',
        methodology: 'Modal distance-based factor',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: false,
        notes: transForm.notes,
        assumptions: `Based on ${transForm.tripsCount || 1} logged trips using backend factor.`
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'transport')]);
      setLastCalculatedCategory('transport');
      return line;
    } catch {
      const fallbackFactor = transForm.mode === 'car' ? 0.192 : transForm.mode === 'twowheeler' ? 0.113 : transForm.mode === 'auto' ? 0.045 : 0.089;
      const kg = isCycling ? 0 : (Math.round(transForm.quantity * fallbackFactor * 100) / 100);
      const t = Math.round((kg / 1000) * 1000) / 1000;

      const line: CalculationLine = {
        id: `calc-trans-${Date.now()}`,
        category: 'transport',
        description: desc,
        quantity: transForm.quantity,
        unit: unit,
        factor_id: `ef-trans-${transForm.mode}-v1`,
        factor_value: fallbackFactor,
        factor_unit: `kgCO2e/${unit}`,
        factor_source: 'ARAI / CPCB illustrative factor',
        methodology: 'Distance-based Scope 3',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: transForm.notes
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'transport')]);
      setLastCalculatedCategory('transport');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // Waste Calculation via Backend API
  const calculateWaste = async () => {
    const newErrors: Record<string, string> = {};
    if (wasteForm.quantityTonnes <= 0 || isNaN(wasteForm.quantityTonnes)) {
      newErrors.quantityTonnes = 'Waste quantity must be greater than 0 tonnes.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});
    setIsCalculating(true);

    let activityType = 'organic_waste';
    let desc = 'Municipal Solid Waste (Landfill)';

    if (wasteForm.treatmentRoute === 'compost') {
      activityType = 'organic_waste_compost';
      desc = 'Organic Food & Mess Waste (Aerobic Composting)';
    } else if (wasteForm.wasteType === 'mixed') {
      activityType = 'mixed_msw';
      desc = 'Mixed Municipal Solid Waste (Landfill)';
    }

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
      const t = firstLine?.emissions_tco2e ?? (kg / 1000);

      const line: CalculationLine = {
        id: `calc-waste-${Date.now()}`,
        category: 'waste',
        description: desc,
        quantity: wasteForm.quantityTonnes,
        unit: 'tonne',
        factor_id: firstLine?.factor_id || 'ef-waste-organic-landfill-v1',
        factor_value: firstLine?.factor_value || 580.0,
        factor_unit: 'kgCO2e/tonne',
        factor_source: 'IPCC 2006 Tier 1 waste model',
        methodology: 'Methane commitment disposal factor',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: false,
        notes: wasteForm.notes,
        assumptions: `Evaluated using backend factor: ${firstLine?.factor_value ?? 580} kgCO2e/tonne.`
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'waste')]);
      setLastCalculatedCategory('waste');
      return line;
    } catch {
      const fallbackFactor = wasteForm.treatmentRoute === 'compost' ? 100.0 : wasteForm.wasteType === 'mixed' ? 467.0 : 580.0;
      const kg = Math.round(wasteForm.quantityTonnes * fallbackFactor * 100) / 100;
      const t = Math.round((kg / 1000) * 1000) / 1000;

      const line: CalculationLine = {
        id: `calc-waste-${Date.now()}`,
        category: 'waste',
        description: desc,
        quantity: wasteForm.quantityTonnes,
        unit: 'tonne',
        factor_id: 'ef-waste-organic-landfill-v1',
        factor_value: fallbackFactor,
        factor_unit: 'kgCO2e/tonne',
        factor_source: 'IPCC 2006 Tier 1 model',
        methodology: 'Scope 3 Solid Waste',
        emissions_kg_co2e: kg,
        emissions_t_co2e: t,
        is_illustrative: true,
        notes: wasteForm.notes
      };

      setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'waste')]);
      setLastCalculatedCategory('waste');
      return line;
    } finally {
      setIsCalculating(false);
    }
  };

  // Save current lines to backend and local session records
  const saveRecord = async (
    targetCampusId?: string,
    targetPeriodId?: string,
    reportingPeriodLabel: string = 'CY 2025'
  ): Promise<boolean> => {
    if (calculatedLines.length === 0) return false;
    setIsSaving(true);

    const campusId = targetCampusId || user?.campus_id || 'campus-mlrit-01';
    const periodId = targetPeriodId || 'period-cy2025-01';

    const totalKg = calculatedLines.reduce((acc, l) => acc + l.emissions_kg_co2e, 0);
    const totalT = calculatedLines.reduce((acc, l) => acc + l.emissions_t_co2e, 0);

    // 1. Submit to real backend POST /api/v1/records
    try {
      const recordPayload: ActivityRecordCreate = {
        campus_id: campusId,
        reporting_period_id: periodId,
        category: activeTab,
        status: 'verified',
        notes: `Entry for ${reportingPeriodLabel} — ${activeTab}`,
        data_source: 'Canopy Carbon Calculator',
        items: calculatedLines.map(l => ({
          activity_type: l.category === 'electricity' ? (elecForm.sourceType === 'solar' ? 'solar_electricity' : 'grid_electricity')
                       : l.category === 'transport' ? (transForm.mode === 'car' ? 'car_petrol' : transForm.mode === 'twowheeler' ? 'motorcycle' : transForm.mode === 'auto' ? 'auto_cng' : 'bus_diesel')
                       : (wasteForm.treatmentRoute === 'compost' ? 'organic_waste_compost' : wasteForm.wasteType === 'mixed' ? 'mixed_msw' : 'organic_waste'),
          quantity: l.quantity,
          unit: l.unit === 'passenger-km' ? 'passenger_km' : l.unit === 'vehicle-km' ? 'vehicle_km' : l.unit,
          subcategory: activeTab,
          factor_id: l.factor_id
        }))
      };

      await canopyApi.createRecord(recordPayload);
    } catch (err: any) {
      console.error('[CANOPY API] Backend record creation error:', err);
      setErrors(prev => ({ ...prev, save: err?.message || 'Failed to persist record to backend database.' }));
      setIsSaving(false);
      return false;
    }

    setIsSaving(false);

    // 2. Also save to session records for instant UI update
    const newRecord: ActivityRecord = {
      id: `session-rec-${Date.now()}`,
      campus_id: campusId,
      reporting_period_id: periodId,
      month: new Date().toISOString().slice(0, 7),
      month_name: `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} (Session Entry)`,
      category: activeTab,
      status: 'verified',
      data_source: 'Canopy Carbon Calculator',
      notes: `Calculated for ${reportingPeriodLabel} session`,
      total_kg_co2e: totalKg,
      total_t_co2e: totalT,
      items: calculatedLines.map(l => ({
        id: `item-${Date.now()}-${l.id}`,
        activity_record_id: `session-rec-${Date.now()}`,
        activity_type: l.category,
        quantity: l.quantity,
        unit: l.unit,
        factor_id: l.factor_id,
        factor_value: l.factor_value,
        emissions_kg_co2e: l.emissions_kg_co2e,
        emissions_t_co2e: l.emissions_t_co2e,
        is_illustrative: l.is_illustrative,
        notes: l.notes
      }))
    };

    setSavedRecords(prev => [newRecord, ...prev]);
    return true;
  };

  const resetAll = () => {
    setElecForm({
      periodId: 'period-2025',
      monthlyKwh: 48000,
      sourceType: 'grid',
      notes: ''
    });
    setTransForm({
      periodId: 'period-2025',
      mode: 'bus',
      activityType: 'passenger_km',
      quantity: 120000,
      tripsCount: 440,
      notes: ''
    });
    setWasteForm({
      periodId: 'period-2025',
      wasteType: 'organic',
      treatmentRoute: 'landfill',
      quantityTonnes: 15.5,
      notes: ''
    });
    setCalculatedLines([]);
    setLastCalculatedCategory(null);
    setErrors({});
    setApiWarnings([]);
  };

  return {
    activeTab,
    setActiveTab,
    elecForm,
    setElecForm,
    transForm,
    setTransForm,
    wasteForm,
    setWasteForm,
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
    allEmissionFactors: mockEmissionFactors
  };
}
