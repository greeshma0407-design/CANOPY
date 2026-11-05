import { EmissionFactor } from '../types';

export const mockEmissionFactors: EmissionFactor[] = [
  // --- Electricity Factors ---
  {
    id: 'EF-ELEC-GRID-IN',
    category: 'electricity',
    activity_type: 'grid_purchased_electricity',
    geography: 'India (Southern Regional Grid)',
    activity_unit: 'kWh',
    factor_value: 0.82, // 0.82 kgCO2e/kWh
    factor_unit: 'kgCO2e/kWh',
    source_name: 'Central Electricity Authority (CEA) CO2 Baseline Database v19 (Illustrative)',
    source_url: 'https://cea.nic.in/cdm-co2-baseline-database/',
    methodology: 'Combined Margin (Operating Margin + Build Margin weighted)',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Illustrative emission factor for Southern regional power distribution grid in Telangana/AP.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-ELEC-SOLAR-ONSITE',
    category: 'electricity',
    // FIX: activity_type now matches what useCalculator sends to the backend ('solar_electricity')
    activity_type: 'solar_electricity',
    geography: 'global',
    activity_unit: 'kWh',
    factor_value: 0.048,
    factor_unit: 'kgCO2e/kWh',
    source_name: 'ILLUSTRATIVE — Lifecycle estimate, not zero-emission assumption',
    methodology: 'Lifecycle/upstream illustrative only. Not market-based. See backend DB factor.',
    version: '2024.1',
    valid_from: '2024-01-01',
    valid_to: '2026-12-31',
    notes: 'TEST/DEMO ONLY. Matches backend DB factor ef-elec-solar-onsite-v1.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-ELEC-DIESEL-GENSET',
    category: 'electricity',
    activity_type: 'backup_diesel_generator',
    geography: 'India',
    activity_unit: 'litre',
    factor_value: 2.68, // 2.68 kgCO2e/L diesel
    factor_unit: 'kgCO2e/litre',
    source_name: 'IPCC Guidelines for National GHG Inventories (Stationary Combustion)',
    methodology: 'Tier 1 default emission factors for gas oil / diesel combustion',
    version: '2023.2-demo',
    valid_from: '2023-01-01',
    valid_to: '2026-12-31',
    notes: 'For campus backup generator sets during grid curtailment.',
    is_active: true,
    is_illustrative: true
  },

  // --- Transport Factors ---
  {
    id: 'EF-TRANS-BUS-DIESEL',
    category: 'transport',
    activity_type: 'college_bus_fleet',
    geography: 'India Urban / Semi-Urban',
    activity_unit: 'passenger-km',
    factor_value: 0.089, // ~0.089 kgCO2e/p-km
    factor_unit: 'kgCO2e/passenger-km',
    source_name: 'ARAI / CPCB Emission Factors for Indian Transport Fleet (Illustrative)',
    methodology: 'Average occupancy model for 45-seater diesel college shuttle routes',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Illustrative fleet factor accounting for regular Hyderabad suburban student routes.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-TRANS-CAR-PETROL',
    category: 'transport',
    activity_type: 'faculty_staff_car',
    geography: 'India',
    activity_unit: 'vehicle-km',
    factor_value: 0.171, // 0.171 kgCO2e/v-km
    factor_unit: 'kgCO2e/vehicle-km',
    source_name: 'MoEFCC / ARAI Composite Light Duty Passenger Fleet (Illustrative)',
    methodology: 'Mid-size gasoline/petrol passenger vehicles (1.2L - 1.5L engines)',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Illustrative factor for single-occupant commuter car travel.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-TRANS-2W-PETROL',
    category: 'transport',
    activity_type: 'motorcycle_scooter',
    geography: 'India',
    activity_unit: 'vehicle-km',
    factor_value: 0.103, // 0.103 kgCO2e/v-km
    factor_unit: 'kgCO2e/vehicle-km',
    source_name: 'ARAI Two-Wheeler Test Cycle Emissions (Illustrative)',
    methodology: 'BS-VI compliant 100cc-150cc commuter motorcycles and scooters',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Illustrative factor for student and staff two-wheeler commuting.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-TRANS-AUTO-CNG',
    category: 'transport',
    activity_type: 'auto_rickshaw',
    geography: 'Hyderabad Urban',
    activity_unit: 'passenger-km',
    factor_value: 0.076,
    factor_unit: 'kgCO2e/passenger-km',
    source_name: 'TERI Urban Mobility Emissions Assessment (Illustrative)',
    methodology: '3-seater shared CNG auto-rickshaw transit in peri-urban corridors',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'First/last mile connection from Miyapur/JNTU metro stations.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-TRANS-ZERO-ACTIVE',
    category: 'transport',
    activity_type: 'walking_and_cycling',
    geography: 'Campus Internal',
    activity_unit: 'passenger-km',
    factor_value: 0.0,
    factor_unit: 'kgCO2e/passenger-km',
    source_name: 'Active Mobility Carbon Accounting Standard',
    methodology: 'Zero direct operating tailpipe and combustion emissions',
    version: '2024.1',
    valid_from: '2020-01-01',
    valid_to: '2030-12-31',
    notes: 'Zero emission active transport.',
    is_active: true,
    is_illustrative: true
  },

  // --- Waste Factors ---
  {
    id: 'EF-WASTE-LANDFILL',
    category: 'waste',
    activity_type: 'municipal_landfill_disposal',
    geography: 'India (Jawaharnagar Regional Landfill)',
    activity_unit: 'tonne',
    factor_value: 580.0, // 0.58 tCO2e/tonne = 580 kgCO2e/tonne
    factor_unit: 'kgCO2e/tonne',
    source_name: 'IPCC Waste Model Tier 1 (First Order Decay Default - Illustrative)',
    methodology: 'Methane generation potential from unmanaged semi-aerobic solid waste landfill',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Illustrative factor for unsegregated municipal solid waste sent to Jawaharnagar site.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-WASTE-COMPOST',
    category: 'waste',
    activity_type: 'aerobic_composting',
    geography: 'Campus Composting Facility',
    activity_unit: 'tonne',
    factor_value: 100.0, // 0.10 tCO2e/tonne = 100 kgCO2e/tonne
    factor_unit: 'kgCO2e/tonne',
    source_name: 'IPCC Guidelines 2006 (Biological Treatment of Solid Waste - Illustrative)',
    methodology: 'CH4 and N2O emissions from managed aerobic windrow composting',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'On-campus organic and mess food waste treatment pit.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-WASTE-RECYCLE',
    category: 'waste',
    activity_type: 'segregated_dry_recycling',
    geography: 'Hyderabad Recyclers',
    activity_unit: 'tonne',
    factor_value: 40.0, // 0.04 tCO2e/tonne = 40 kgCO2e/tonne
    factor_unit: 'kgCO2e/tonne',
    source_name: 'WRAP / EPA WARM Model Adapted (Illustrative)',
    methodology: 'Processing and transport energy for segregated paper, cardboard and HDPE/PET plastics',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'Diverted recyclables collected by authorized vendor.',
    is_active: true,
    is_illustrative: true
  },
  {
    id: 'EF-WASTE-INCIN',
    category: 'waste',
    activity_type: 'waste_incineration',
    geography: 'Regional Waste-to-Energy Plant',
    activity_unit: 'tonne',
    factor_value: 350.0, // 0.35 tCO2e/tonne = 350 kgCO2e/tonne
    factor_unit: 'kgCO2e/tonne',
    source_name: 'CPCB Incineration Guidelines (Illustrative)',
    methodology: 'Combustion of fossil carbon fractions in mixed reject waste',
    version: '2024.1-demo',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    notes: 'High-temperature thermal disposal of non-recyclable solid residues.',
    is_active: true,
    is_illustrative: true
  }
];

export const getFactorById = (id: string): EmissionFactor | undefined => {
  return mockEmissionFactors.find(f => f.id === id);
};

export const getFactorsByCategory = (category: string): EmissionFactor[] => {
  return mockEmissionFactors.filter(f => f.category === category && f.is_active);
};
