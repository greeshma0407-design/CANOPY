import React, { useState } from 'react';
import {
  Zap,
  Bus,
  Trash2,
  Calculator as CalcIcon,
  RotateCcw,
  Save,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useCalculator } from '../../hooks/useCalculator';
import { useCampusData } from '../../hooks/useCampusData';

export const CalculatorPage: React.FC = () => {
  const { campus, selectedPeriod, reportingPeriods, isLiveBackend, refetch } = useCampusData();
  const {
    activeTab,
    setActiveTab,
    elecForm,
    setElecForm,
    transForm,
    setTransForm,
    wasteForm,
    setWasteForm,
    calculatedLines,
    errors,
    calculateElectricity,
    calculateTransport,
    calculateWaste,
    saveRecord,
    resetAll,
    savedRecords,
    isCalculating,
    isSaving,
    apiWarnings
  } = useCalculator();

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleCalculateCurrent = async () => {
    if (activeTab === 'electricity') {
      await calculateElectricity();
    } else if (activeTab === 'transport') {
      await calculateTransport();
    } else if (activeTab === 'waste') {
      await calculateWaste();
    }
  };

  const handleSave = async () => {
    const periodId = selectedPeriod?.id || 'period-cy2025-01';
    const periodLabel = selectedPeriod?.label || 'CY 2025';
    const campusId = campus?.id || 'campus-mlrit-01';

    const success = await saveRecord(campusId, periodId, periodLabel);
    if (success) {
      setSaveSuccessMsg(`Activity record successfully saved to ${periodLabel} inventory in database.`);
      await refetch();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Aggregated preview sums
  const totalKg = calculatedLines.reduce((acc, l) => acc + l.emissions_kg_co2e, 0);
  const totalT = calculatedLines.reduce((acc, l) => acc + l.emissions_t_co2e, 0);

  const periodOptions = reportingPeriods.map(p => ({
    value: p.id,
    label: p.label
  }));

  const transportModeOptions = [
    { value: 'bus', label: 'College Bus Shuttle (Diesel)' },
    { value: 'car', label: 'Faculty & Staff Car (Petrol/Diesel)' },
    { value: 'twowheeler', label: 'Motorcycle / Scooter' },
    { value: 'auto', label: 'Shared Auto-Rickshaw (CNG)' },
    { value: 'cycling', label: 'Walking & Cycling (Active Transit)' }
  ];

  const wasteTypeOptions = [
    { value: 'organic', label: 'Organic Wet Waste (Hostel Mess & Canteen)' },
    { value: 'paper', label: 'Paper, Exam Answer Sheets & Cardboard' },
    { value: 'plastic', label: 'Packaging Plastics & Single-Use Bottles' },
    { value: 'metal', label: 'Lab Scrap Metals & Cans' },
    { value: 'mixed', label: 'Mixed Municipal Solid Waste' }
  ];

  const treatmentOptions = [
    { value: 'landfill', label: 'Municipal Landfill Disposal (Jawaharnagar)' },
    { value: 'compost', label: 'On-site Aerobic Composting Facility' },
    { value: 'recycle', label: 'Segregated Recycling Haul' },
    { value: 'incinerate', label: 'Thermal Incineration / Waste-to-Energy' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
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
            Carbon Activity Calculator
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Input campus activity records to compute emissions according to verified emission factor models.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLiveBackend ? (
            <Badge variant="success">Backend Factor Engine</Badge>
          ) : (
            <Badge variant="illustrative">Illustrative Factors Applied</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            icon={<RotateCcw size={14} />}
          >
            Reset Form
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

      {errors.save && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(217, 83, 79, 0.18)',
            border: '1px solid rgba(217, 83, 79, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#ff8585',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{errors.save}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'electricity' ? 'active' : ''}`}
          onClick={() => setActiveTab('electricity')}
        >
          <Zap size={18} />
          <span>Electricity (Scope 2)</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          <Bus size={18} />
          <span>Transportation (Scope 3)</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'waste' ? 'active' : ''}`}
          onClick={() => setActiveTab('waste')}
        >
          <Trash2 size={18} />
          <span>Waste & Disposal (Scope 3)</span>
        </button>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid-cols-1-2">
        {/* Form Panel */}
        <Card
          title={
            activeTab === 'electricity'
              ? 'Electricity Activity Input'
              : activeTab === 'transport'
              ? 'Transit & Commuter Input'
              : 'Solid Waste Stream Input'
          }
          subtitle="All factors adhere to CEA Baseline Database v19 or IPCC models"
        >
          {/* Electricity Form */}
          {activeTab === 'electricity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <Select
                label="Reporting Period"
                options={periodOptions}
                value={elecForm.periodId}
                onChange={(e) => setElecForm(prev => ({ ...prev, periodId: e.target.value }))}
              />

              <div className="form-group">
                <label className="form-label">Energy Sourcing Route</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setElecForm(prev => ({ ...prev, sourceType: 'grid' }))}
                    className={`btn ${elecForm.sourceType === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.82rem' }}
                  >
                    TSSPDCL Grid (0.82 kg/kWh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setElecForm(prev => ({ ...prev, sourceType: 'solar' }))}
                    className={`btn ${elecForm.sourceType === 'solar' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.82rem' }}
                  >
                    On-Site Rooftop Solar (0.00 kg/kWh)
                  </button>
                </div>
              </div>

              <Input
                label="Monthly Consumption"
                type="number"
                min="0"
                step="100"
                suffix="kWh"
                value={elecForm.monthlyKwh}
                onChange={(e) => setElecForm(prev => ({ ...prev, monthlyKwh: parseFloat(e.target.value) || 0 }))}
                error={errors.monthlyKwh}
                hint="Campus monthly average: 45,000 - 85,000 kWh"
              />

              <Textarea
                label="Data Source / Invoicing Notes"
                placeholder="e.g. Substation HT meter bill #49281 verified by Electrical Maintenance"
                value={elecForm.notes}
                onChange={(e) => setElecForm(prev => ({ ...prev, notes: e.target.value }))}
              />

              <Button
                variant="primary"
                onClick={handleCalculateCurrent}
                loading={isCalculating}
                icon={<CalcIcon size={16} />}
                style={{ marginTop: '0.5rem' }}
              >
                Validate & Calculate Electricity
              </Button>
            </div>
          )}

          {/* Transport Form */}
          {activeTab === 'transport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <Select
                label="Reporting Period"
                options={periodOptions}
                value={transForm.periodId}
                onChange={(e) => setTransForm(prev => ({ ...prev, periodId: e.target.value }))}
              />

              <Select
                label="Commute / Fleet Mode"
                options={transportModeOptions}
                value={transForm.mode}
                onChange={(e) => {
                  const m = e.target.value;
                  const unit = (m === 'car' || m === 'twowheeler') ? 'vehicle_km' : 'passenger_km';
                  setTransForm(prev => ({ ...prev, mode: m, activityType: unit }));
                }}
              />

              <Input
                label={`Activity Distance (${transForm.activityType === 'vehicle_km' ? 'Vehicle-km' : 'Passenger-km'})`}
                type="number"
                min="0"
                step="500"
                suffix={transForm.activityType === 'vehicle_km' ? 'v-km' : 'p-km'}
                value={transForm.quantity}
                onChange={(e) => setTransForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                error={errors.quantity}
                hint="Sum of commuter trips or fleet GPS odometer distance"
              />

              <Input
                label="Number of Regular Scheduled Trips"
                type="number"
                min="1"
                suffix="trips"
                value={transForm.tripsCount}
                onChange={(e) => setTransForm(prev => ({ ...prev, tripsCount: parseInt(e.target.value) || 1 }))}
                hint="Used for fleet route audit tracking"
              />

              <Textarea
                label="Fleet Log Reference"
                placeholder="e.g. 22 college buses covering Secunderabad / Kukatpally morning routes"
                value={transForm.notes}
                onChange={(e) => setTransForm(prev => ({ ...prev, notes: e.target.value }))}
              />

              <Button
                variant="primary"
                onClick={handleCalculateCurrent}
                loading={isCalculating}
                icon={<CalcIcon size={16} />}
                style={{ marginTop: '0.5rem' }}
              >
                Validate & Calculate Transport
              </Button>
            </div>
          )}

          {/* Waste Form */}
          {activeTab === 'waste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <Select
                label="Reporting Period"
                options={periodOptions}
                value={wasteForm.periodId}
                onChange={(e) => setWasteForm(prev => ({ ...prev, periodId: e.target.value }))}
              />

              <Select
                label="Waste Stream Classification"
                options={wasteTypeOptions}
                value={wasteForm.wasteType}
                onChange={(e) => setWasteForm(prev => ({ ...prev, wasteType: e.target.value }))}
              />

              <Select
                label="Treatment & Disposal Route"
                options={treatmentOptions}
                value={wasteForm.treatmentRoute}
                onChange={(e) => setWasteForm(prev => ({ ...prev, treatmentRoute: e.target.value }))}
              />

              <Input
                label="Mass Disposed / Diverted"
                type="number"
                min="0"
                step="0.5"
                suffix="tonnes"
                value={wasteForm.quantityTonnes}
                onChange={(e) => setWasteForm(prev => ({ ...prev, quantityTonnes: parseFloat(e.target.value) || 0 }))}
                error={errors.quantityTonnes}
                hint="1 tonne = 1,000 kg (Weighbridge certificate basis)"
              />

              <Textarea
                label="Waste Manifest / Vendor Information"
                placeholder="e.g. Weekly collection log from Jawaharnagar GHMC municipal hauler"
                value={wasteForm.notes}
                onChange={(e) => setWasteForm(prev => ({ ...prev, notes: e.target.value }))}
              />

              <Button
                variant="primary"
                onClick={handleCalculateCurrent}
                loading={isCalculating}
                icon={<CalcIcon size={16} />}
                style={{ marginTop: '0.5rem' }}
              >
                Validate & Calculate Waste
              </Button>
            </div>
          )}
        </Card>

        {/* Calculation Preview & Provenance Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card
            title="Calculation Preview & Provenance"
            subtitle="Transparent audit trail with configured emission factors"
            action={
              calculatedLines.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  loading={isSaving}
                  icon={<Save size={15} />}
                >
                  Save to Inventory
                </Button>
              )
            }
            elevated
          >
            {calculatedLines.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <Info size={32} color="var(--sage)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  No calculations evaluated yet
                </h4>
                <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
                  Fill in the activity data for electricity, transport, or waste on the left and click
                  <strong> Validate & Calculate</strong> to generate a verifiable carbon audit line.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Result Total KPI Summary */}
                {apiWarnings.length > 0 && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(212, 163, 115, 0.15)',
                      border: '1px solid var(--ochre)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--ochre)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <AlertCircle size={15} /> Calculation Engine Warnings:
                    </div>
                    {apiWarnings.map((w, idx) => (
                      <div key={idx} style={{ marginLeft: '1.25rem' }}>• {w}</div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--card-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                      Calculated Carbon Load
                    </span>
                    <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {totalT.toFixed(3)} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>tCO2e</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mass Equivalent</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--sage)' }}>
                      {totalKg.toLocaleString()} kgCO2e
                    </div>
                  </div>
                </div>

                {/* Individual Calculation Line Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {calculatedLines.map(line => (
                    <div
                      key={line.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--card-primary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {line.description}
                          </span>
                          <Badge variant="illustrative">Illustrative</Badge>
                        </div>
                        <span style={{ fontFamily: 'var(--font-editorial)', fontWeight: 700, color: 'var(--sage)', fontSize: '1.1rem' }}>
                          {line.emissions_t_co2e.toFixed(3)} tCO2e
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <div>
                          Activity Quantity: <strong style={{ color: 'var(--text-primary)' }}>{line.quantity.toLocaleString()} {line.unit}</strong>
                        </div>
                        <div>
                          Factor Applied: <strong style={{ color: 'var(--ochre)' }}>{line.factor_value} {line.factor_unit}</strong>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          Provenance: <span style={{ color: 'var(--text-muted)' }}>{line.factor_source}</span>
                        </div>
                        {line.assumptions && (
                          <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Note: {line.assumptions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div
                  style={{
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
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>
                    Formula: <code>emissions = quantity × factor</code>. Results are illustrative demonstration calculations.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Session Saved Records List */}
          {savedRecords.length > 0 && (
            <Card
              title={`Saved Session Records (${savedRecords.length})`}
              subtitle="Entries recorded in current browser session"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                {savedRecords.map(rec => (
                  <div
                    key={rec.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--card-primary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{rec.month_name}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({rec.category})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--sage)' }}>
                        {rec.total_t_co2e.toFixed(3)} tCO2e
                      </span>
                      <Badge variant="success">Saved Local</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
