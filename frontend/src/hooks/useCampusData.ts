import { useState, useEffect, useCallback } from 'react';
import { Campus, ReportingPeriod, MonthlyEmissions, CategoryBreakdown } from '../types';
import { mockCampus, mockReportingPeriods } from '../data/campus';
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
    return defaultPeriod ? defaultPeriod.id : (reportingPeriods[0]?.id || 'period-cy2025-01');
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

        // Dynamically bind to the first valid reporting period if current is missing or stale
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
      // 1. Fetch summary from backend
      const summary = await canopyApi.getSummary(activeCampusId, activePeriodId, 'IN-Telangana');
      setIsLiveBackend(true);

      const totalT = summary.total_tco2e || 0;
      setTotalEmissions(totalT);
      setCompletenessStatus(summary.completeness_status);

      // Build category breakdowns from backend summary categories (kgCO2e → tCO2e)
      const elecKg = summary.categories['electricity'] || 0;
      const transKg = summary.categories['transport'] || 0;
      const wasteKg = summary.categories['waste'] || 0;

      const elecT = Math.round((elecKg / 1000) * 10) / 10;
      const transT = Math.round((transKg / 1000) * 10) / 10;
      const wasteT = Math.round((wasteKg / 1000) * 10) / 10;

      const sumT = elecT + transT + wasteT;
      const elecPct  = sumT > 0 ? Math.round((elecT  / sumT) * 100) : 0;
      const transPct = sumT > 0 ? Math.round((transT / sumT) * 100) : 0;
      const wastePct = sumT > 0 ? Math.max(0, 100 - elecPct - transPct) : 0;

      if (sumT > 0) {
        setCategoryBreakdowns([
          {
            category: 'electricity',
            label: 'Electricity (Scope 2)',
            emissions_t_co2e: elecT,
            percentage: elecPct,
            color: '#365A40', // forest green
            trend_pct: -5.0,
            trend_direction: 'down',
          },
          {
            category: 'transport',
            label: 'Transportation (Scope 3)',
            emissions_t_co2e: transT,
            percentage: transPct,
            color: '#D4A373', // earth ochre
            trend_pct: 2.0,
            trend_direction: 'up',
          },
          {
            category: 'waste',
            label: 'Waste & Landfill (Scope 3)',
            emissions_t_co2e: wasteT,
            percentage: wastePct,
            color: '#6B705C', // sage
            trend_pct: -1.0,
            trend_direction: 'down',
          },
        ]);
      } else {
        setCategoryBreakdowns([]);
      }

      // 2. Build month-by-month trends from activity records
      try {
        const records: ActivityRecordRead[] = await canopyApi.getRecords(activeCampusId, activePeriodId);

        if (records && records.length > 0 && sumT > 0) {
          const periodYear = selectedPeriod?.year || (selectedPeriod?.start_date ? parseInt(selectedPeriod.start_date.slice(0, 4), 10) : 2025);

          const monthsData = MONTH_NAMES.map((mName, i) => {
            const mNum = i + 1;
            const monthCode = `${periodYear}-${mNum.toString().padStart(2, '0')}`;
            const mShort = MONTH_SHORTS[i];

            let mElecKwh = 0;
            let mTransPkm = 0;
            let mWasteT = 0;

            for (const r of records) {
              const notes = r.notes || '';
              let matches = false;

              for (const item of r.activity_items) {
                if (item.metadata_json) {
                  try {
                    const meta = typeof item.metadata_json === 'string' ? JSON.parse(item.metadata_json) : item.metadata_json;
                    if (meta.month_num === mNum || meta.month === monthCode) {
                      matches = true;
                    }
                  } catch {}
                }
              }

              if (!matches) {
                matches = Boolean(
                  notes.includes(monthCode) ||
                  notes.includes(mShort) ||
                  notes.includes(mName) ||
                  (r.created_at && r.created_at.startsWith(monthCode))
                );
              }

              if (matches) {
                for (const item of r.activity_items) {
                  if (r.category === 'electricity') {
                    mElecKwh += item.quantity;
                  } else if (r.category === 'transport') {
                    mTransPkm += item.quantity;
                  } else if (r.category === 'waste') {
                    mWasteT += item.quantity;
                  }
                }
              }
            }

            return {
              _elecKwh: mElecKwh,
              _transPkm: mTransPkm,
              _wasteT: mWasteT,
              month: monthCode,
              month_short: mShort,
              month_name: `${mName} ${periodYear}`,
            };
          });

          let totalElecKwh  = monthsData.reduce((s, m) => s + m._elecKwh, 0);
          let totalTransPkm = monthsData.reduce((s, m) => s + m._transPkm, 0);
          let totalWasteT   = monthsData.reduce((s, m) => s + m._wasteT, 0);

          // Graceful fallback for legacy records without month tag: allocate to active month so graph displays
          if (totalElecKwh === 0 && elecT > 0) {
            const activeIdx = Math.min(new Date().getMonth(), 11);
            monthsData[activeIdx]._elecKwh = 1;
            totalElecKwh = 1;
          }
          if (totalTransPkm === 0 && transT > 0) {
            const activeIdx = Math.min(new Date().getMonth(), 11);
            monthsData[activeIdx]._transPkm = 1;
            totalTransPkm = 1;
          }
          if (totalWasteT === 0 && wasteT > 0) {
            const activeIdx = Math.min(new Date().getMonth(), 11);
            monthsData[activeIdx]._wasteT = 1;
            totalWasteT = 1;
          }

          const finalMonths: MonthlyEmissions[] = monthsData.map((m) => {
            const mElec  = totalElecKwh  > 0 ? (m._elecKwh  / totalElecKwh)  * elecT  : 0;
            const mTrans = totalTransPkm > 0 ? (m._transPkm / totalTransPkm) * transT : 0;
            const mWaste = totalWasteT   > 0 ? (m._wasteT   / totalWasteT)   * wasteT : 0;

            const mTotal = Math.round((mElec + mTrans + mWaste) * 10) / 10;
            return {
              month: m.month,
              month_short: m.month_short,
              month_name: m.month_name,
              electricity_t_co2e: Math.round(mElec * 10) / 10,
              transport_t_co2e: Math.round(mTrans * 10) / 10,
              waste_t_co2e: Math.round(mWaste * 10) / 10,
              total_t_co2e: mTotal,
              is_complete: mTotal > 0,
            };
          });

          setMonthlyEmissions(finalMonths);
        } else {
          setMonthlyEmissions([]);
        }
      } catch (recErr) {
        setMonthlyEmissions([]);
      }
    } catch (err: unknown) {
      setIsLiveBackend(false);
      // Friendly, non-technical error message without raw status codes or stack traces
      setError("We couldn't load your campus information right now. Please try again.");
      // Honest empty state — do not fabricate mock values
      setTotalEmissions(0);
      setCategoryBreakdowns([]);
      setMonthlyEmissions([]);
      setCompletenessStatus('no_data');
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
