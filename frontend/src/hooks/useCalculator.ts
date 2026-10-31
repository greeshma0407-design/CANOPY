import { useState } from 'react';
import { CalculationLine, ActivityRecord, EmissionCategory } from '../types';
import { mockEmissionFactors, getFactorById } from '../data/emissionFactors';
import { calculateEmissions } from '../utils/calculations';
import { useLocalStorage } from './useLocalStorage';

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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Electricity Calculation
  const calculateElectricity = () => {
    const newErrors: Record<string, string> = {};
    if (elecForm.monthlyKwh <= 0 || isNaN(elecForm.monthlyKwh)) {
      newErrors.monthlyKwh = 'Electricity consumption must be greater than 0 kWh.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});

    const factorId = elecForm.sourceType === 'solar' ? 'EF-ELEC-SOLAR-ONSITE' : 'EF-ELEC-GRID-IN';
    const factor = getFactorById(factorId);

    if (!factor) {
      setErrors({ factor: 'No configured emission factor found for electricity.' });
      return null;
    }

    const { kgCO2e, tCO2e } = calculateEmissions(elecForm.monthlyKwh, factor.factor_value);

    const line: CalculationLine = {
      id: `calc-elec-${Date.now()}`,
      category: 'electricity',
      description: `Electricity: ${elecForm.sourceType === 'solar' ? 'On-site Rooftop Solar' : 'Grid Electricity (CEA Baseline)'}`,
      quantity: elecForm.monthlyKwh,
      unit: 'kWh',
      factor_id: factor.id,
      factor_value: factor.factor_value,
      factor_unit: factor.factor_unit,
      factor_source: factor.source_name,
      methodology: factor.methodology,
      emissions_kg_co2e: kgCO2e,
      emissions_t_co2e: tCO2e,
      is_illustrative: factor.is_illustrative,
      notes: elecForm.notes,
      assumptions: elecForm.sourceType === 'solar'
        ? 'Zero Scope 2 emissions assigned for self-consumed solar energy.'
        : 'Applies CEA v19 Southern Region combined margin grid emission factor (0.82 kgCO2e/kWh).'
    };

    setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'electricity')]);
    setLastCalculatedCategory('electricity');
    return line;
  };

  // Transport Calculation
  const calculateTransport = () => {
    const newErrors: Record<string, string> = {};
    if (transForm.quantity <= 0 || isNaN(transForm.quantity)) {
      newErrors.quantity = 'Distance / passenger-km must be greater than 0.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});

    let factorId = 'EF-TRANS-BUS-DIESEL';
    let unit = 'passenger-km';
    let desc = 'Campus Bus Fleet (Diesel)';

    if (transForm.mode === 'car') {
      factorId = 'EF-TRANS-CAR-PETROL';
      unit = 'vehicle-km';
      desc = 'Faculty & Staff Car Commute (Petrol/Diesel)';
    } else if (transForm.mode === 'twowheeler') {
      factorId = 'EF-TRANS-2W-PETROL';
      unit = 'vehicle-km';
      desc = 'Motorcycle & Scooter Commute';
    } else if (transForm.mode === 'auto') {
      factorId = 'EF-TRANS-AUTO-CNG';
      unit = 'passenger-km';
      desc = 'Auto-Rickshaw Shared Transit (CNG)';
    } else if (transForm.mode === 'cycling') {
      factorId = 'EF-TRANS-ZERO-ACTIVE';
      unit = 'passenger-km';
      desc = 'Walking / Cycling (Active Transit)';
    }

    const factor = getFactorById(factorId);
    if (!factor) {
      setErrors({ factor: 'No configured emission factor found for transport mode.' });
      return null;
    }

    const { kgCO2e, tCO2e } = calculateEmissions(transForm.quantity, factor.factor_value);

    const line: CalculationLine = {
      id: `calc-trans-${Date.now()}`,
      category: 'transport',
      description: desc,
      quantity: transForm.quantity,
      unit: unit,
      factor_id: factor.id,
      factor_value: factor.factor_value,
      factor_unit: factor.factor_unit,
      factor_source: factor.source_name,
      methodology: factor.methodology,
      emissions_kg_co2e: kgCO2e,
      emissions_t_co2e: tCO2e,
      is_illustrative: factor.is_illustrative,
      notes: transForm.notes,
      assumptions: `Based on ${transForm.tripsCount || 1} logged trips using illustrative factor ${factor.factor_value} ${factor.factor_unit}.`
    };

    setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'transport')]);
    setLastCalculatedCategory('transport');
    return line;
  };

  // Waste Calculation
  const calculateWaste = () => {
    const newErrors: Record<string, string> = {};
    if (wasteForm.quantityTonnes <= 0 || isNaN(wasteForm.quantityTonnes)) {
      newErrors.quantityTonnes = 'Waste quantity must be greater than 0 tonnes.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});

    let factorId = 'EF-WASTE-LANDFILL';
    let desc = 'Municipal Solid Waste (Landfill)';

    if (wasteForm.treatmentRoute === 'compost') {
      factorId = 'EF-WASTE-COMPOST';
      desc = 'Organic Food & Mess Waste (Aerobic Composting)';
    } else if (wasteForm.treatmentRoute === 'recycle') {
      factorId = 'EF-WASTE-RECYCLE';
      desc = 'Segregated Recyclables (Dry Waste Stream)';
    } else if (wasteForm.treatmentRoute === 'incinerate') {
      factorId = 'EF-WASTE-INCIN';
      desc = 'Thermal Incineration / Controlled Burn';
    }

    const factor = getFactorById(factorId);
    if (!factor) {
      setErrors({ factor: 'No configured emission factor found for waste treatment.' });
      return null;
    }

    const { kgCO2e, tCO2e } = calculateEmissions(wasteForm.quantityTonnes, factor.factor_value);

    const line: CalculationLine = {
      id: `calc-waste-${Date.now()}`,
      category: 'waste',
      description: desc,
      quantity: wasteForm.quantityTonnes,
      unit: 'tonne',
      factor_id: factor.id,
      factor_value: factor.factor_value,
      factor_unit: factor.factor_unit,
      factor_source: factor.source_name,
      methodology: factor.methodology,
      emissions_kg_co2e: kgCO2e,
      emissions_t_co2e: tCO2e,
      is_illustrative: factor.is_illustrative,
      notes: wasteForm.notes,
      assumptions: `Evaluated using ${factor.methodology} (Factor: ${factor.factor_value} kgCO2e/tonne).`
    };

    setCalculatedLines(prev => [line, ...prev.filter(l => l.category !== 'waste')]);
    setLastCalculatedCategory('waste');
    return line;
  };

  // Save current lines to local session records
  const saveRecord = (reportingPeriodLabel: string = 'CY 2025') => {
    if (calculatedLines.length === 0) return false;

    const totalKg = calculatedLines.reduce((acc, l) => acc + l.emissions_kg_co2e, 0);
    const totalT = calculatedLines.reduce((acc, l) => acc + l.emissions_t_co2e, 0);

    const newRecord: ActivityRecord = {
      id: `session-rec-${Date.now()}`,
      campus_id: 'campus-mlrit-01',
      reporting_period_id: 'period-2025',
      month: new Date().toISOString().slice(0, 7),
      month_name: `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} (Session Entry)`,
      category: activeTab,
      status: 'draft',
      data_source: 'Manual entry via Canopy Carbon Calculator',
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
    calculateElectricity,
    calculateTransport,
    calculateWaste,
    saveRecord,
    resetAll,
    savedRecords,
    allEmissionFactors: mockEmissionFactors
  };
}
