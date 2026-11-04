import { useState, useEffect, useCallback } from 'react';
import { Campus, ReportingPeriod, MonthlyEmissions, CategoryBreakdown } from '../types';
import { mockCampus, mockReportingPeriods } from '../data/campus';
import { mockMonthlyEmissions, mockCategoryBreakdowns } from '../data/activityRecords';
import { useLocalStorage } from './useLocalStorage';
import { canopyApi, ActivityRecordRead } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORTS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function useCampusData() {
  const { isAuthenticated } = useAuth();

  const [campus, setCampus] = useLocalStorage<Campus>('canopy_campus_profile', mockCampus);
  const [reportingPeriods, setReportingPeriods] = useLocalStorage<ReportingPeriod[]>('canopy_reporting_periods', mockReportingPeriods);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const defaultPeriod = reportingPeriods.find(p => p.is_default);
    return defaultPeriod ? defaultPeriod.id : reportingPeriods[0]?.id || 'period-cy2025-01';
  });

  const selectedPeriod = reportingPeriods.find(p => p.id === selectedPeriodId) || reportingPeriods[0] || {
    id: 'period-cy2025-01',
    campus_id: campus?.id || 'campus-mlrit-01',
    label: 'CY 2025',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'open',
    is_default: true,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  // Live data states
  const [totalEmissions_t_co2e, setTotalEmissions] = useState<number>(0);
  const [categoryBreakdowns, setCategoryBreakdowns] = useState<CategoryBreakdown[]>([]);
  const [monthlyEmissions, setMonthlyEmissions] = useState<MonthlyEmissions[]>([]);
  const [completenessStatus, setCompletenessStatus] = useState<string>('no_data');

  // Sync Campus Profile & Reporting Periods from Backend
  const syncCampusProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const myCampus = await canopyApi.getMyCampus();
      if (myCampus) {
        setCampus({
          id: myCampus.id,
          name: myCampus.name,
          institution_name: myCampus.institution_name || undefined,
          institution_type: myCampus.institution_type || undefined,
          code: myCampus.code || myCampus.id,
          location: myCampus.location,
          city: myCampus.city || undefined,
          state: myCampus.state || 'Telangana',
          country: myCampus.country || 'India',
          population: myCampus.population ?? 0,
          studentCount: myCampus.student_count ?? myCampus.population ?? 0,
          facultyCount: myCampus.faculty_count ?? 0,
          staffCount: myCampus.staff_count ?? 0,
          campusAreaAcres: myCampus.campus_area_acres ?? 0,
          builtUpAreaSqM: myCampus.built_up_area_sq_m ?? 0,
          buildingCount: myCampus.building_count ?? 0,
          timezone: myCampus.timezone || 'Asia/Kolkata',
          academicYear: myCampus.academic_year || '2025-2026',
          baselineYear: myCampus.baseline_year || '2023',
          description: `Campus profile for ${myCampus.name}`,
        });
      }

      const periods = await canopyApi.getMyCampusPeriods();
      if (periods && periods.length > 0) {
        const formattedPeriods: ReportingPeriod[] = periods.map((p, idx) => ({
          id: p.id,
          campus_id: p.campus_id,
          label: p.label,
          start_date: p.start_date,
          end_date: p.end_date,
          status: p.status as 'open' | 'closed' | 'locked',
          is_default: idx === 0,
          year: parseInt(p.start_date.slice(0, 4)) || 2025,
          records_count: 0,
          completeness_pct: 100,
        }));
        setReportingPeriods(formattedPeriods);
        if (!formattedPeriods.some(p => p.id === selectedPeriodId)) {
          setSelectedPeriodId(formattedPeriods[0].id);
        }
      }
    } catch (err) {
      console.warn('[CANOPY API] Failed to sync campus profile from server:', err);
    }
  }, [isAuthenticated, selectedPeriodId, setCampus, setReportingPeriods]);

  useEffect(() => {
    syncCampusProfile();
  }, [syncCampusProfile]);

  // Fetch summary & activity records
  const fetchData = useCallback(async () => {
    const activeCampusId = campus?.id;
    const activePeriodId = selectedPeriod?.id;

    if (!activeCampusId || !activePeriodId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch summary from live backend
      const summary = await canopyApi.getSummary(activeCampusId, activePeriodId, 'IN-Telangana');
      setIsLiveBackend(true);

      const totalT = summary.total_tco2e || 0;
      setTotalEmissions(totalT);
      setCompletenessStatus(summary.completeness_status);

      // Build category breakdowns from backend summary
      const elecKg = summary.categories['electricity'] || 0;
      const transKg = summary.categories['transport'] || 0;
      const wasteKg = summary.categories['waste'] || 0;

      const elecT = Math.round((elecKg / 1000) * 10) / 10;
      const transT = Math.round((transKg / 1000) * 10) / 10;
      const wasteT = Math.round((wasteKg / 1000) * 10) / 10;

      const sumT = elecT + transT + wasteT;
      const elecPct = sumT > 0 ? Math.round((elecT / sumT) * 100) : 0;
      const transPct = sumT > 0 ? Math.round((transT / sumT) * 100) : 0;
      const wastePct = sumT > 0 ? Math.max(0, 100 - elecPct - transPct) : 0;

      setCategoryBreakdowns([
        {
          category: 'electricity',
          label: 'Electricity (Scope 2)',
          emissions_t_co2e: elecT,
          percentage: elecPct,
          color: '#A5B58B',
          trend_pct: -5.0,
          trend_direction: 'down',
        },
        {
          category: 'transport',
          label: 'Transportation (Scope 3)',
          emissions_t_co2e: transT,
          percentage: transPct,
          color: '#D4A373',
          trend_pct: 2.0,
          trend_direction: 'up',
        },
        {
          category: 'waste',
          label: 'Waste & Landfill (Scope 3)',
          emissions_t_co2e: wasteT,
          percentage: wastePct,
          color: '#6B705C',
          trend_pct: -1.0,
          trend_direction: 'down',
        },
      ]);

      // 2. Fetch records to build accurate month-by-month trends
      try {
        const records: ActivityRecordRead[] = await canopyApi.getRecords(activeCampusId, activePeriodId);
        const monthsData: MonthlyEmissions[] = MONTH_NAMES.map((mName, i) => {
          const mNum = i + 1;
          const monthCode = `2025-${mNum.toString().padStart(2, '0')}`;

          let mElec = 0;
          let mTrans = 0;
          let mWaste = 0;

          if (records && records.length > 0) {
            for (const r of records) {
              const notes = r.notes || '';
              const matchesMonth = notes.includes(MONTH_SHORTS[i]) || notes.includes(mName);
              if (matchesMonth) {
                for (const item of r.activity_items) {
                  let factor = 0;
                  if (item.activity_type === 'grid_electricity') factor = 0.82;
                  else if (item.activity_type === 'solar_electricity') factor = 0.048;
                  else if (item.activity_type === 'bus_diesel') factor = 0.089;
                  else if (item.activity_type === 'car_petrol') factor = 0.192;
                  else if (item.activity_type === 'motorcycle') factor = 0.113;
                  else if (item.activity_type === 'auto_cng') factor = 0.045;
                  else if (item.activity_type === 'organic_waste') factor = 580.0;
                  else if (item.activity_type === 'organic_waste_compost') factor = 100.0;
                  else if (item.activity_type === 'mixed_msw') factor = 467.0;

                  const itemT = (item.quantity * factor) / 1000;
                  if (r.category === 'electricity') mElec += itemT;
                  else if (r.category === 'transport') mTrans += itemT;
                  else if (r.category === 'waste') mWaste += itemT;
                }
              }
            }
          }

          const mTotal = Math.round((mElec + mTrans + mWaste) * 10) / 10;
          return {
            month: monthCode,
            month_short: MONTH_SHORTS[i],
            month_name: mName,
            electricity_t_co2e: Math.round(mElec * 10) / 10,
            transport_t_co2e: Math.round(mTrans * 10) / 10,
            waste_t_co2e: Math.round(mWaste * 10) / 10,
            total_t_co2e: mTotal,
            is_complete: mTotal > 0,
          };
        });

        setMonthlyEmissions(monthsData);
      } catch (recErr) {
        console.warn('[CANOPY API] Failed to fetch monthly record breakdown:', recErr);
      }
    } catch (err: unknown) {
      console.warn('[CANOPY API] Live fetch error, using fallback:', err);
      setIsLiveBackend(false);
      setError((err as { message?: string })?.message || 'Backend unreachable; using offline cache');

      // Only use MLRIT mock data if active campus is the demo MLRIT campus
      if (activeCampusId === 'campus-mlrit-01') {
        setTotalEmissions(842.0);
        setCategoryBreakdowns(mockCategoryBreakdowns);
        setMonthlyEmissions(mockMonthlyEmissions);
        setCompletenessStatus('complete');
      } else {
        setTotalEmissions(0);
        setCategoryBreakdowns([]);
        setMonthlyEmissions([]);
        setCompletenessStatus('no_data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [campus?.id, selectedPeriod?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const population = campus?.population || campus?.studentCount || 1;
  const area = campus?.builtUpAreaSqM || 1;
  const perStudentEmissions = totalEmissions_t_co2e > 0
    ? Math.round((totalEmissions_t_co2e / population) * 1000) / 1000
    : 0;
  const perSqMEmissions = totalEmissions_t_co2e > 0
    ? Math.round(((totalEmissions_t_co2e * 1000) / area) * 10) / 10
    : 0;
  const dataCompletenessPct = completenessStatus === 'complete' ? 100 : completenessStatus === 'partial' ? 75 : 0;

  return {
    campus,
    setCampus,
    reportingPeriods,
    setReportingPeriods,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedPeriod,
    monthlyEmissions,
    categoryBreakdowns,
    totalEmissions_t_co2e,
    perStudentEmissions,
    perSqMEmissions,
    dataCompletenessPct,
    completenessStatus,
    isLoading,
    error,
    isLiveBackend,
    refetch: fetchData,
    syncCampusProfile,
  };
}
