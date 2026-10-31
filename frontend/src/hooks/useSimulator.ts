import { useState, useMemo } from 'react';
import { Scenario, ScenarioAssumptions } from '../types';
import { mockScenarios } from '../data/scenarios';
import { calculateScenarioProjection } from '../utils/calculations';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_BASELINE = {
  electricity_t_co2e: 522.0,
  transport_t_co2e: 202.0,
  waste_t_co2e: 118.0
};

const DEFAULT_ASSUMPTIONS: ScenarioAssumptions = {
  electricity_reduction_pct: 20,
  renewable_energy_share_pct: 35,
  bus_usage_increase_pct: 25,
  car_usage_reduction_pct: 20,
  waste_diversion_rate_pct: 45
};

export function useSimulator() {
  const [assumptions, setAssumptions] = useState<ScenarioAssumptions>(DEFAULT_ASSUMPTIONS);
  const [savedScenarios, setSavedScenarios] = useLocalStorage<Scenario[]>('canopy_saved_scenarios', mockScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Real-time calculation based on baseline and current assumptions
  const projection = useMemo(() => {
    return calculateScenarioProjection(DEFAULT_BASELINE, assumptions);
  }, [assumptions]);

  const updateAssumption = <K extends keyof ScenarioAssumptions>(key: K, value: ScenarioAssumptions[K]) => {
    setAssumptions(prev => ({
      ...prev,
      [key]: value
    }));
    setSelectedScenarioId(null); // customized from preset
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

  const saveCurrentScenario = (name: string, description: string) => {
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

    setSavedScenarios(prev => [newScenario, ...prev]);
    setSelectedScenarioId(newScenario.id);
    return true;
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
    if (selectedScenarioId === id) {
      setSelectedScenarioId(null);
    }
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
    baseline: DEFAULT_BASELINE
  };
}
