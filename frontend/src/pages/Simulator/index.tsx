import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Save,
  Trash2,
  TreePine,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Tooltip } from '../../components/ui/Tooltip';
import { ComparisonBarChart } from '../../components/charts/ComparisonBarChart';
import { useSimulator } from '../../hooks/useSimulator';
import { exportToCSV } from '../../utils/csvExport';

export const SimulatorPage: React.FC = () => {
  const {
    assumptions,
    updateAssumption,
    projection,
    savedScenarios,
    selectedScenarioId,
    loadScenario,
    resetToBaseline,
    saveCurrentScenario,
    deleteScenario,
    baseline
  } = useSimulator();

  // Save Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleOpenSaveModal = () => {
    setScenarioName(`Pathway: -${projection.avoided_pct}% Reduction`);
    setScenarioDesc(`Modelled scenario with ${assumptions.electricity_reduction_pct}% energy efficiency, ${assumptions.renewable_energy_share_pct}% solar PV, and ${assumptions.waste_diversion_rate_pct}% waste diversion.`);
    setModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (saveCurrentScenario(scenarioName, scenarioDesc)) {
      setModalOpen(false);
      setSaveSuccessMsg('Scenario saved successfully to browser storage.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const handleExportScenarioCSV = () => {
    const rows = projection.category_deltas.map(d => ({
      Category: d.label,
      'Baseline (tCO2e)': d.baseline_t_co2e,
      'Projected (tCO2e)': d.projected_t_co2e,
      'Avoided (tCO2e)': d.reduction_t_co2e,
      'Reduction (%)': `${d.reduction_pct}%`,
      'Primary Lever': d.key_lever
    }));
    // Append total row
    rows.push({
      Category: 'Grand Total',
      'Baseline (tCO2e)': projection.baseline_total,
      'Projected (tCO2e)': projection.projected_total,
      'Avoided (tCO2e)': projection.avoided_total,
      'Reduction (%)': `${projection.avoided_pct}%`,
      'Primary Lever': `Avoided carbon equivalent to ${projection.trees_equivalent.toLocaleString()} trees`
    });

    exportToCSV(rows, 'canopy-scenario-projection.csv');
  };

  // Prepare data for ComparisonBarChart
  const comparisonData = [
    {
      category: 'Total Campus',
      Baseline: projection.baseline_total,
      Proposed: projection.projected_total,
      Reduction: projection.avoided_total,
      ReductionPct: projection.avoided_pct
    },
    ...projection.category_deltas.map(d => ({
      category: d.label.split(' ')[0], // Electricity, Transportation, Waste
      Baseline: d.baseline_t_co2e,
      Proposed: d.projected_t_co2e,
      Reduction: d.reduction_t_co2e,
      ReductionPct: d.reduction_pct
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            What-If Decarbonization Simulator
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Clone baseline inventory (842.0 tCO2e) and evaluate intervention impacts in real time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="illustrative">Modelled Projections</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToBaseline}
            icon={<RotateCcw size={14} />}
          >
            Reset to Baseline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenSaveModal}
            icon={<Save size={15} />}
          >
            Save Scenario
          </Button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(78, 135, 82, 0.18)',
            border: '1px solid rgba(78, 135, 82, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#8FD895',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Preset Scenarios Quick Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}
      >
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Load Preset Pathway:
        </span>
        {savedScenarios.map(scen => (
          <button
            key={scen.id}
            onClick={() => loadScenario(scen)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selectedScenarioId === scen.id ? 'var(--card-elevated)' : 'var(--card-primary)',
              border: selectedScenarioId === scen.id ? '1px solid var(--sage)' : '1px solid var(--border)',
              color: selectedScenarioId === scen.id ? 'var(--sage)' : 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Sparkles size={13} color="var(--ochre)" />
            <span>{scen.name}</span>
          </button>
        ))}
      </div>

      {/* Real-Time KPI Impact Tiles */}
      <div className="grid-cols-4">
        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Baseline Footprint
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            {projection.baseline_total} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>tCO2e</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Current CY 2025 inventory
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Projected Emissions
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--sage)', marginTop: '0.3rem' }}>
            {projection.projected_total} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>tCO2e</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sage)', marginTop: '0.2rem' }}>
            ↓ {projection.avoided_pct}% Reduction achieved
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Avoided Carbon Load
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: '#8FD895', marginTop: '0.3rem' }}>
            {projection.avoided_total} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>tCO2e</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Annual carbon delta avoided
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Ecological Equivalent
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
            <TreePine size={22} color="var(--sage)" />
            <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {projection.trees_equivalent.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Trees</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Annual seedling sequestration
          </div>
        </Card>
      </div>

      {/* Main Row: Sliders Control (Left) vs Comparison Chart (Right) */}
      <div className="grid-cols-1-2">
        {/* Controls Column */}
        <Card
          title="Intervention Levers"
          subtitle="Adjust assumption sliders to re-calculate modelled impacts"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            {/* Lever 1: Electricity reduction */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Electricity Efficiency & Conservation
                  </label>
                  <Tooltip content="Reduce total campus grid kWh through LED retrofits, HVAC smart scheduling, and equipment curfews.">
                    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                  </Tooltip>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--sage)', fontSize: '0.95rem' }}>
                  {assumptions.electricity_reduction_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={assumptions.electricity_reduction_pct}
                onChange={(e) => updateAssumption('electricity_reduction_pct', parseInt(e.target.value) || 0)}
                className="canopy-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>0% (As-is)</span>
                <span>Max 50%</span>
              </div>
            </div>

            {/* Lever 2: Renewable energy share */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Renewable Solar PPA / On-site PV
                  </label>
                  <Tooltip content="Applies zero-emission market-based Scope 2 factor for rooftop solar generation & green power purchase.">
                    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                  </Tooltip>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--sage)', fontSize: '0.95rem' }}>
                  {assumptions.renewable_energy_share_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={assumptions.renewable_energy_share_pct}
                onChange={(e) => updateAssumption('renewable_energy_share_pct', parseInt(e.target.value) || 0)}
                className="canopy-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>0% (Grid only)</span>
                <span>100% (Fully Renewable)</span>
              </div>
            </div>

            {/* Lever 3: Bus Usage Increase */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Campus Shuttle Ridership Boost
                  </label>
                  <Tooltip content="Increases shared transit occupancy and adds college bus routes to absorb personal vehicle trips.">
                    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                  </Tooltip>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--ochre)', fontSize: '0.95rem' }}>
                  +{assumptions.bus_usage_increase_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={assumptions.bus_usage_increase_pct}
                onChange={(e) => updateAssumption('bus_usage_increase_pct', parseInt(e.target.value) || 0)}
                className="canopy-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>0% (Baseline routes)</span>
                <span>+100% (Double transit)</span>
              </div>
            </div>

            {/* Lever 4: Car usage reduction */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Single-Occupant Car Trip Reduction
                  </label>
                  <Tooltip content="Reduces faculty and student solo car trips through carpooling apps and parking incentives.">
                    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                  </Tooltip>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--ochre)', fontSize: '0.95rem' }}>
                  -{assumptions.car_usage_reduction_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={assumptions.car_usage_reduction_pct}
                onChange={(e) => updateAssumption('car_usage_reduction_pct', parseInt(e.target.value) || 0)}
                className="canopy-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>0% (Current solo driving)</span>
                <span>-50% Reduction</span>
              </div>
            </div>

            {/* Lever 5: Waste diversion */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Organic Waste Diversion to Compost
                  </label>
                  <Tooltip content="Diverts food waste from anaerobic landfill (580 kg/t) to aerobic composting pits (100 kg/t).">
                    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                  </Tooltip>
                </div>
                <span style={{ fontWeight: 600, color: '#6B705C', fontSize: '0.95rem' }}>
                  {assumptions.waste_diversion_rate_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={assumptions.waste_diversion_rate_pct}
                onChange={(e) => updateAssumption('waste_diversion_rate_pct', parseInt(e.target.value) || 0)}
                className="canopy-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>0% Diverted</span>
                <span>80% Diverted</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Comparison Chart & Detailed Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card
            title="Baseline vs Proposed Footprint"
            subtitle="Categorical comparison of current inventory vs modelled pathway (tCO2e)"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportScenarioCSV}
                icon={<Download size={14} />}
              >
                Export CSV
              </Button>
            }
            elevated
          >
            <ComparisonBarChart data={comparisonData} height={290} />

            {/* Category Impact Breakdown Table */}
            <div style={{ marginTop: '1.25rem' }}>
              <div className="table-container">
                <table className="canopy-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Baseline (t)</th>
                      <th>Projected (t)</th>
                      <th>Avoided (t)</th>
                      <th>Reduction</th>
                      <th>Primary Mechanism</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.category_deltas.map(delta => (
                      <tr key={delta.category}>
                        <td style={{ fontWeight: 600 }}>{delta.label}</td>
                        <td>{delta.baseline_t_co2e.toFixed(1)}</td>
                        <td style={{ color: 'var(--sage)', fontWeight: 600 }}>
                          {delta.projected_t_co2e.toFixed(1)}
                        </td>
                        <td style={{ color: '#8FD895' }}>
                          -{delta.reduction_t_co2e.toFixed(1)}
                        </td>
                        <td>
                          <Badge variant={delta.reduction_pct > 20 ? 'success' : 'neutral'}>
                            -{delta.reduction_pct}%
                          </Badge>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {delta.key_lever}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regulatory Disclaimer */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(212, 163, 115, 0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(212, 163, 115, 0.25)',
                fontSize: '0.75rem',
                color: 'var(--ochre)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>
                These are modelled projections using illustrative factors. Not verified reductions for carbon compliance.
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Save Scenario Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Save Custom Scenario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSave} icon={<Save size={15} />}>
              Save Scenario
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Scenario Name"
            placeholder="e.g. Solar Rooftop 250 kWp + Carpool Policy"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <Textarea
            label="Description & Strategic Objectives"
            placeholder="Summarize the planned capital investments and assumptions..."
            value={scenarioDesc}
            onChange={(e) => setScenarioDesc(e.target.value)}
          />
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}
          >
            Projected Impact: <strong style={{ color: 'var(--sage)' }}>{projection.avoided_total} tCO2e (-{projection.avoided_pct}%)</strong> avoided emissions equivalent to <strong>{projection.trees_equivalent.toLocaleString()} trees</strong>.
          </div>
        </div>
      </Modal>
    </div>
  );
};
