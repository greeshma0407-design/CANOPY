import { ActivityRecord, MonthlyEmissions, CategoryBreakdown } from '../types';

export const mockMonthlyEmissions: MonthlyEmissions[] = [
  { month: '2025-01', month_short: 'Jan', month_name: 'January', electricity_t_co2e: 38.5, transport_t_co2e: 18.2, waste_t_co2e: 9.8, total_t_co2e: 66.5, is_complete: true },
  { month: '2025-02', month_short: 'Feb', month_name: 'February', electricity_t_co2e: 39.8, transport_t_co2e: 18.9, waste_t_co2e: 9.9, total_t_co2e: 68.6, is_complete: true },
  { month: '2025-03', month_short: 'Mar', month_name: 'March', electricity_t_co2e: 46.2, transport_t_co2e: 19.5, waste_t_co2e: 10.4, total_t_co2e: 76.1, is_complete: true },
  { month: '2025-04', month_short: 'Apr', month_name: 'April', electricity_t_co2e: 54.6, transport_t_co2e: 20.1, waste_t_co2e: 10.8, total_t_co2e: 85.5, is_complete: true },
  { month: '2025-05', month_short: 'May', month_name: 'May', electricity_t_co2e: 56.4, transport_t_co2e: 9.2, waste_t_co2e: 6.2, total_t_co2e: 71.8, is_complete: true }, // summer break
  { month: '2025-06', month_short: 'Jun', month_name: 'June', electricity_t_co2e: 48.2, transport_t_co2e: 11.4, waste_t_co2e: 7.8, total_t_co2e: 67.4, is_complete: true },
  { month: '2025-07', month_short: 'Jul', month_name: 'July', electricity_t_co2e: 42.1, transport_t_co2e: 19.8, waste_t_co2e: 10.6, total_t_co2e: 72.5, is_complete: true }, // new semester
  { month: '2025-08', month_short: 'Aug', month_name: 'August', electricity_t_co2e: 41.5, transport_t_co2e: 20.4, waste_t_co2e: 11.1, total_t_co2e: 73.0, is_complete: true },
  { month: '2025-09', month_short: 'Sep', month_name: 'September', electricity_t_co2e: 43.8, transport_t_co2e: 19.6, waste_t_co2e: 10.9, total_t_co2e: 74.3, is_complete: true },
  { month: '2025-10', month_short: 'Oct', month_name: 'October', electricity_t_co2e: 39.4, transport_t_co2e: 18.2, waste_t_co2e: 10.2, total_t_co2e: 67.8, is_complete: true },
  { month: '2025-11', month_short: 'Nov', month_name: 'November', electricity_t_co2e: 36.5, transport_t_co2e: 17.5, waste_t_co2e: 10.5, total_t_co2e: 64.5, is_complete: true },
  { month: '2025-12', month_short: 'Dec', month_name: 'December', electricity_t_co2e: 35.0, transport_t_co2e: 9.2, waste_t_co2e: 9.8, total_t_co2e: 54.0, is_complete: true } // winter holidays
];

// Totals:
// Electricity: 38.5 + 39.8 + 46.2 + 54.6 + 56.4 + 48.2 + 42.1 + 41.5 + 43.8 + 39.4 + 36.5 + 35.0 = 522.0 tCO2e (62.0%)
// Transport:   18.2 + 18.9 + 19.5 + 20.1 + 9.2 + 11.4 + 19.8 + 20.4 + 19.6 + 18.2 + 17.5 + 9.2 = 202.0 tCO2e (24.0%)
// Waste:       9.8 + 9.9 + 10.4 + 10.8 + 6.2 + 7.8 + 10.6 + 11.1 + 10.9 + 10.2 + 10.5 + 9.8 = 118.0 tCO2e (14.0%)
// Grand Total: 842.0 tCO2e (100%)

export const mockCategoryBreakdowns: CategoryBreakdown[] = [
  {
    category: 'electricity',
    label: 'Electricity (Scope 2)',
    emissions_t_co2e: 522.0,
    percentage: 62.0,
    color: '#A5B58B', // sage
    trend_pct: -5.0,
    trend_direction: 'down'
  },
  {
    category: 'transport',
    label: 'Transportation (Scope 3)',
    emissions_t_co2e: 202.0,
    percentage: 24.0,
    color: '#D4A373', // ochre
    trend_pct: 2.0,
    trend_direction: 'up'
  },
  {
    category: 'waste',
    label: 'Waste & Landfill (Scope 3)',
    emissions_t_co2e: 118.0,
    percentage: 14.0,
    color: '#6B705C', // olive
    trend_pct: -1.0,
    trend_direction: 'down'
  }
];

export const mockActivityRecords: ActivityRecord[] = [
  {
    id: 'rec-2025-10-elec',
    campus_id: 'campus-mlrit-01',
    reporting_period_id: 'period-2025',
    month: '2025-10',
    month_name: 'October 2025',
    category: 'electricity',
    status: 'final',
    data_source: 'TSSPDCL Monthly Metered Utility Bill #49281',
    total_kg_co2e: 39400,
    total_t_co2e: 39.4,
    notes: 'Campus main 11kV substation grid meter readings verified against utility bills.',
    items: [
      {
        id: 'item-2025-10-elec-1',
        activity_record_id: 'rec-2025-10-elec',
        activity_type: 'grid_purchased_electricity',
        quantity: 48048,
        unit: 'kWh',
        factor_id: 'EF-ELEC-GRID-IN',
        factor_value: 0.82,
        emissions_kg_co2e: 39400,
        emissions_t_co2e: 39.4,
        is_illustrative: true,
        notes: 'Monthly academic buildings and hostel complexes combined consumption.'
      }
    ]
  },
  {
    id: 'rec-2025-10-trans',
    campus_id: 'campus-mlrit-01',
    reporting_period_id: 'period-2025',
    month: '2025-10',
    month_name: 'October 2025',
    category: 'transport',
    status: 'final',
    data_source: 'MLRIT Transport Fleet Log & Student Commuter Survey',
    total_kg_co2e: 18200,
    total_t_co2e: 18.2,
    notes: 'Covers 22 college bus routes across Kukatpally, Secunderabad, and Dilsukhnagar.',
    items: [
      {
        id: 'item-2025-10-trans-1',
        activity_record_id: 'rec-2025-10-trans',
        activity_type: 'college_bus_fleet',
        quantity: 125000,
        unit: 'passenger-km',
        mode: 'Bus (Diesel)',
        factor_id: 'EF-TRANS-BUS-DIESEL',
        factor_value: 0.089,
        emissions_kg_co2e: 11125,
        emissions_t_co2e: 11.12,
        is_illustrative: true
      },
      {
        id: 'item-2025-10-trans-2',
        activity_record_id: 'rec-2025-10-trans',
        activity_type: 'faculty_staff_car',
        quantity: 24500,
        unit: 'vehicle-km',
        mode: 'Car (Petrol/Diesel)',
        factor_id: 'EF-TRANS-CAR-PETROL',
        factor_value: 0.171,
        emissions_kg_co2e: 4189,
        emissions_t_co2e: 4.19,
        is_illustrative: true
      },
      {
        id: 'item-2025-10-trans-3',
        activity_record_id: 'rec-2025-10-trans',
        activity_type: 'motorcycle_scooter',
        quantity: 28000,
        unit: 'vehicle-km',
        mode: 'Two-Wheeler',
        factor_id: 'EF-TRANS-2W-PETROL',
        factor_value: 0.103,
        emissions_kg_co2e: 2884,
        emissions_t_co2e: 2.88,
        is_illustrative: true
      }
    ]
  },
  {
    id: 'rec-2025-10-waste',
    campus_id: 'campus-mlrit-01',
    reporting_period_id: 'period-2025',
    month: '2025-10',
    month_name: 'October 2025',
    category: 'waste',
    status: 'final',
    data_source: 'GHMC Waste Hauler Weighbridge Slips & Hostel Mess Log',
    total_kg_co2e: 10200,
    total_t_co2e: 10.2,
    notes: 'Campus housekeeping weighments across 3 dining halls and academic blocks.',
    items: [
      {
        id: 'item-2025-10-waste-1',
        activity_record_id: 'rec-2025-10-waste',
        activity_type: 'municipal_landfill_disposal',
        quantity: 16.5,
        unit: 'tonne',
        treatment_route: 'Landfill Disposal',
        factor_id: 'EF-WASTE-LANDFILL',
        factor_value: 580.0,
        emissions_kg_co2e: 9570,
        emissions_t_co2e: 9.57,
        is_illustrative: true
      },
      {
        id: 'item-2025-10-waste-2',
        activity_record_id: 'rec-2025-10-waste',
        activity_type: 'aerobic_composting',
        quantity: 6.3,
        unit: 'tonne',
        treatment_route: 'On-site Composting Pit',
        factor_id: 'EF-WASTE-COMPOST',
        factor_value: 100.0,
        emissions_kg_co2e: 630,
        emissions_t_co2e: 0.63,
        is_illustrative: true
      }
    ]
  }
];
