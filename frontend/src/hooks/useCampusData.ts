import { useState } from 'react';
import { Campus, ReportingPeriod, MonthlyEmissions, CategoryBreakdown } from '../types';
import { mockCampus, mockReportingPeriods } from '../data/campus';
import { mockMonthlyEmissions, mockCategoryBreakdowns } from '../data/activityRecords';
import { useLocalStorage } from './useLocalStorage';

export function useCampusData() {
  const [campus, setCampus] = useLocalStorage<Campus>('canopy_campus_profile', mockCampus);
  const [reportingPeriods, setReportingPeriods] = useLocalStorage<ReportingPeriod[]>('canopy_reporting_periods', mockReportingPeriods);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const defaultPeriod = reportingPeriods.find(p => p.is_default);
    return defaultPeriod ? defaultPeriod.id : reportingPeriods[0]?.id || 'period-2025';
  });

  const selectedPeriod = reportingPeriods.find(p => p.id === selectedPeriodId) || reportingPeriods[0];

  // For 2025: baseline is 842 tCO2e; 2024 is 915 tCO2e (baseline); 2023 is 980 tCO2e
  const isBaselinePeriod = selectedPeriodId === 'period-2024';
  const isHistoricPeriod = selectedPeriodId === 'period-2023';

  // Multiplier for demo periods if different period selected
  const periodMultiplier = isBaselinePeriod ? 1.0867 : isHistoricPeriod ? 1.1639 : 1.0;

  const currentMonthlyEmissions: MonthlyEmissions[] = mockMonthlyEmissions.map(m => ({
    ...m,
    electricity_t_co2e: Math.round(m.electricity_t_co2e * periodMultiplier * 10) / 10,
    transport_t_co2e: Math.round(m.transport_t_co2e * periodMultiplier * 10) / 10,
    waste_t_co2e: Math.round(m.waste_t_co2e * periodMultiplier * 10) / 10,
    total_t_co2e: Math.round(m.total_t_co2e * periodMultiplier * 10) / 10
  }));

  const currentTotalEmissions = isBaselinePeriod ? 915.0 : isHistoricPeriod ? 980.0 : 842.0;

  const currentCategoryBreakdowns: CategoryBreakdown[] = mockCategoryBreakdowns.map(b => ({
    ...b,
    emissions_t_co2e: Math.round(b.emissions_t_co2e * periodMultiplier * 10) / 10
  }));

  const perStudentEmissions = Math.round((currentTotalEmissions / campus.studentCount) * 1000) / 1000;
  const perSqMEmissions = Math.round(((currentTotalEmissions * 1000) / campus.builtUpAreaSqM) * 10) / 10;

  return {
    campus,
    setCampus,
    reportingPeriods,
    setReportingPeriods,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedPeriod,
    monthlyEmissions: currentMonthlyEmissions,
    categoryBreakdowns: currentCategoryBreakdowns,
    totalEmissions_t_co2e: currentTotalEmissions,
    perStudentEmissions,
    perSqMEmissions,
    dataCompletenessPct: selectedPeriod.completeness_pct
  };
}
