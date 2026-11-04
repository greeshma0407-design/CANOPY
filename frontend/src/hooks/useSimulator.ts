import { useState, useMemo } from 'react';
import { Scenario, ScenarioAssumptions } from '../types';
import { mockScenarios } from '../data/scenarios';
import { calculateScenarioProjection } from '../utils/calculations';
import { useLocalStorage } from './useLocalStorage';
import { useCampusData } from './useCampusData';
import { canopyApi } from '../utils/apiClient';

const DEFAULT_ASSUMPTIONS: ScenarioAssumptions = {
  electricity_reduction_pct: 20,
  renewable_energy_share_pct: 35,
  bus_usage_increase_pct: 25,
  car_usage_reduction_pct: 20,
  waste_diversion_rate_pct: 45
};

const FALLBACK_BASELINE = {
  electricity_t_co2e: 454.7,
  transport_t_co2e: 214.5,
  waste_t_co2e: 28.1
};

export function useSimulator() {
  const { categoryBreakdowns, totalEmissions_t_co2e, isLiveBackend } = useCampusData();

  // Build live baseline from backend data when available
  const liveBaseline = useMemo(() => {
    if (!isLiveBackend || categoryBreakdowns.length === 0) return FALLBACK_BASELINE;
    const elec = categoryBreakdowns.find(c => c.category === 'electricity')?.emissions_t_co2e ?? FALLBACK_BASELINE.electricity_t_co2e;
    const trans = categoryBreakdowns.find(c => c.category === 'transport')?.emissions_t_co2e ?? FALLBACK_BASELINE.transport_t_co2e;
    const waste = categoryBreakdowns.find(c => c.category === 'waste')?.emissions_t_co2e ?? FALLBACK_BASELINE.waste_t_co2e;
    return { electricity_t_co2e: elec, transport_t_co2e: trans, waste_t_co2e: waste };
  }, [categoryBreakdowns, isLiveBackend]);

  const [assumptions, setAssumptions] = useState<ScenarioAssumptions>(DEFAULT_ASSUMPTIONS);
  const [savedScenarios, setSavedScenarios] = useLocalStorage<Scenario[]>('canopy_saved_scenarios', mockScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isSavingToBackend, setIsSavingToBackend] = useState(false);
  const [backendSaveError, setBackendSaveError] = useState<string | null>(null);

  // Real-time calculation based on live baseline + current assumptions
  const projection = useMemo(() => {
    return calculateScenarioProjection(liveBaseline, assumptions);
  }, [assumptions, liveBaseline]);

  const updateAssumption = <K extends keyof ScenarioAssumptions>(key: K, value: ScenarioAssumptions[K]) => {
    setAssumptions(prev => ({ ...prev, [key]: value }));
    setSelectedScenarioId(null);
  };

  const loadScenario = (scenario: Scenario) => {
    setAssumptions({ ...scenario.assumptions });
    setSelectedScenarioId(scenario.id);
  };

  const resetToBaseline = () => {
    setAssumptions({
      electricity_reduction_pct: 0,
      renewable_energy_share_pct: 0,
      bus_usage_increase_pct: 0,
      car_usage_reduction_pct: 0,
      waste_diversion_rate_pct: 0
    });
    setSelectedScenarioId(null);
  };

  const saveCurrentScenario = async (name: string, description: string): Promise<boolean> => {
    if (!name.trim()) return false;

    const newScenario: Scenario = {
      id: `scen-custom-${Date.now()}`,
      campus_id: 'campus-mlrit-01',
      name: name.trim(),
      description: description.trim() || 'Custom modelled campus decarbonization scenario.',
      created_at: new Date().toISOString().slice(0, 10),
      is_prebuilt: false,
      assumptions: { ...assumptions },
      baseline_t_co2e: projection.baseline_total,
      projected_t_co2e: projection.projected_total,
      avoided_t_co2e: projection.avoided_total,
      avoided_pct: projection.avoided_pct,
      trees_equivalent: projection.trees_equivalent,
      category_deltas: projection.category_deltas,
      disclaimer: 'These are modelled projections using illustrative factors. Not verified reductions.'
    };

    // Save locally first (always)
    setSavedScenarios(prev => [newScenario, ...prev]);
    setSelectedScenarioId(newScenario.id);

    // Also attempt to persist to backend
    if (isLiveBackend) {
      setIsSavingToBackend(true);
      setBackendSaveError(null);
      try {
        // Build scenario items from the projection deltas
        const items = [
          {
            category: 'electricity',
            activity_type: 'grid_electricity',
            quantity: Math.round(((projection.category_deltas.find(d => d.category === 'electricity')?.projected_t_co2e ?? 0) * 1000) / 0.82),
            unit: 'kWh',
          },
          {
            category: 'transport',
            activity_type: 'bus_diesel',
            quantity: Math.round(((projection.category_deltas.find(d => d.category === 'transport')?.projected_t_co2e ?? 0) * 1000) / 0.089),
            unit: 'passenger_km',
          },
          {
            category: 'waste',
            activity_type: 'organic_waste',
            quantity: Math.round(((projection.category_deltas.find(d => d.category === 'waste')?.projected_t_co2e ?? 0) * 1000) / 580),
            unit: 'tonne',
          }
        ];

        await canopyApi.createScenario({
          campus_id: 'campus-mlrit-01',
          name: name.trim(),
          description: description.trim() || 'Custom modelled campus decarbonization scenario.',
          items,
        });
      } catch (err: unknown) {
        console.warn('[CANOPY] Scenario backend save error (still saved locally):', err);
        setBackendSaveError('Saved locally. Backend persist failed — will sync when backend is available.');
      } finally {
        setIsSavingToBackend(false);
      }
    }

    return true;
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
    if (selectedScenarioId === id) setSelectedScenarioId(null);
  };

  return {
    assumptions,
    updateAssumption,
    projection,
    savedScenarios,
    selectedScenarioId,
    loadScenario,
    resetToBaseline,
    saveCurrentScenario,
    deleteScenario,
    baseline: liveBaseline,
    isLiveBaseline: isLiveBackend,
    isSavingToBackend,
    backendSaveError,
    totalBaselineT: totalEmissions_t_co2e
  };
}
