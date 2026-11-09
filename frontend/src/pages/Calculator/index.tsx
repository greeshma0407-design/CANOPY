import React, { useState, useEffect } from 'react';
import {
  Zap,
  Bus,
  Trash2,
  Calculator as CalcIcon,
  RotateCcw,
  Save,
  CheckCircle,
  Info,
  AlertCircle,
  Calendar,
  Edit3
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useCalculator, MONTH_NAMES } from '../../hooks/useCalculator';
import { useCampusData } from '../../hooks/useCampusData';
import { canopyApi, ActivityRecordRead } from '../../utils/apiClient';

export const CalculatorPage: React.FC = () => {
  const { campus, selectedPeriod, reportingPeriods, refetch } = useCampusData();
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    editingRecordId,
    loadRecordForEdit,
    cancelEdit,
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
    isCalculating,
    isSaving,
    apiWarnings
  } = useCalculator(selectedPeriod?.id);

  const [records, setRecords] = useState<ActivityRecordRead[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!campus?.id) return;
    setIsLoadingRecords(true);
    try {
      const recs = await canopyApi.getRecords(campus.id, selectedPeriod?.id);
      setRecords(recs);
    } catch (err) {
      console.warn('[CANOPY] Failed to fetch activity records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [campus?.id, selectedPeriod?.id]);

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this recorded entry?')) return;
    try {
      await canopyApi.deleteRecord(recordId);
      await fetchRecords();
      await refetch();
    } catch (err) {
      console.error('[CANOPY] Failed to delete record:', err);
    }
  };

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
    if (!campus?.id) return;

    // Find or create reporting period for selectedYear
    let targetPeriod = reportingPeriods.find(p => p.start_date.startsWith(String(selectedYear)));
    if (!targetPeriod) {
      try {
        const created = await canopyApi.createReportingPeriod({
          label: `CY ${selectedYear}`,
          start_date: `${selectedYear}-01-01`,
          end_date: `${selectedYear}-12-31`,
          status: 'open'
        });
        targetPeriod = {
          id: created.id,
          campus_id: created.campus_id,
          label: created.label,
          start_date: created.start_date,
          end_date: created.end_date,
          status: created.status as any,
          is_default: false,
          year: selectedYear,
          records_count: 0,
          completeness_pct: 0
        };
      } catch (err) {
        console.warn('[CANOPY] Could not auto-provision period, falling back to active period:', err);
        targetPeriod = selectedPeriod;
      }
    }

    const periodId = targetPeriod?.id || selectedPeriod?.id || '';
    const periodLabel = targetPeriod?.label || selectedPeriod?.label || `CY ${selectedYear}`;

    const success = await saveRecord(campus.id, periodId, periodLabel, selectedMonth, selectedYear);
    if (success) {
      setSaveSuccessMsg(`Activity record successfully ${editingRecordId ? 'updated' : 'saved'} in ${periodLabel} inventory.`);
      await fetchRecords();
      await refetch();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Aggregated preview sums
  const totalKg = calculatedLines.reduce((acc, l) => acc + l.emissions_kg_co2e, 0);
  const totalT = calculatedLines.reduce((acc, l) => acc + l.emissions_t_co2e, 0);

  const availableYears = [2026, 2025, 2024, 2023, 2022];
  const monthOptions = MONTH_NAMES.map((name, idx) => ({
    value: String(idx + 1),
    label: `${name} (${String(idx + 1).padStart(2, '0')})`
  }));
  const yearOptions = availableYears.map(y => ({
    value: String(y),
    label: `${y} Calendar Year`
  }));

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
          <Badge variant="success">Standardized Factors</Badge>
          <Button
            variant="secondary"
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

      {/* Historical Reporting Cycle & Month Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          padding: '0.9rem 1.25rem',
          backgroundColor: 'var(--card-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--forest-green)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Activity Month:
            </span>
            <select
              value={String(selectedMonth)}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--card-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Reporting Year:
            </span>
            <select
              value={String(selectedYear)}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--card-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {yearOptions.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>
        </div>

        {editingRecordId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Badge variant="warning">
              Editing Record #{editingRecordId.slice(0, 8)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={cancelEdit}>
              Cancel Edit
            </Button>
          </div>
        )}
      </div>

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
                    On-Site Rooftop Solar (0.048 kg/kWh)
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
                  {editingRecordId ? 'Update Record' : 'Save to Inventory'}
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
                          Factor Applied: <strong style={{ color: line.factor_value !== null ? 'var(--ochre)' : 'var(--text-muted)' }}>
                            {line.factor_value !== null && line.factor_value !== undefined
                              ? `${line.factor_value} ${line.factor_unit}`
                              : 'No factor found — see warnings'}
                          </strong>
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

        </div>
      </div>

      {/* Historical Activity Records Table from Backend Database */}
      <Card
        title={`Logged Campus Activity Records (${records.length})`}
        subtitle={`Auditable consumption entries stored in backend database for ${selectedPeriod.label}`}
        action={
          <Badge variant="success">
            {records.length} Verified Entries
          </Badge>
        }
      >
        {isLoadingRecords ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading recorded invoices from backend...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={28} color="var(--sage)" style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontSize: '0.88rem' }}>No activity records saved for this reporting cycle yet.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select a month and year above, calculate emissions, and click Save to Inventory.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '0.5rem' }}>
            <table className="canopy-table">
              <thead>
                <tr>
                  <th>Period / Month</th>
                  <th>Category</th>
                  <th>Activity Details</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => {
                  const firstItem = rec.activity_items[0];
                  let monthLabel = rec.notes || rec.reporting_period_id;
                  if (firstItem?.metadata_json) {
                    try {
                      const meta = typeof firstItem.metadata_json === 'string'
                        ? JSON.parse(firstItem.metadata_json)
                        : firstItem.metadata_json;
                      if (meta.month_name) monthLabel = meta.month_name;
                    } catch {}
                  }

                  const details = rec.activity_items
                    .map(it => `${it.quantity.toLocaleString()} ${it.unit} (${it.activity_type.replace(/_/g, ' ')})`)
                    .join('; ');

                  return (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {monthLabel}
                      </td>
                      <td>
                        <Badge variant={rec.category === 'electricity' ? 'success' : rec.category === 'transport' ? 'warning' : 'neutral'}>
                          {rec.category}
                        </Badge>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {details}
                      </td>
                      <td>
                        <Badge variant="success">
                          {rec.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => loadRecordForEdit(rec)}
                            icon={<Edit3 size={13} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteRecord(rec.id)}
                            icon={<Trash2 size={13} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
