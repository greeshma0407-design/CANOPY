import { Scenario } from '../types';

export const mockScenarios: Scenario[] = [
  {
    id: 'scen-solar-ev',
    campus_id: 'campus-mlrit-01',
    name: 'Solar Rooftop (250 kWp) + EV Bus Fleet',
    description: 'Installs a 250 kWp rooftop solar PV array covering academic blocks and transitions 4 college shuttle routes to dedicated electric buses.',
    created_at: '2025-10-15',
    is_prebuilt: true,
    assumptions: {
      electricity_reduction_pct: 20,
      renewable_energy_share_pct: 40,
      bus_usage_increase_pct: 35,
      car_usage_reduction_pct: 30,
      waste_diversion_rate_pct: 55
    },
    baseline_t_co2e: 842.0,
    projected_t_co2e: 538.5,
    avoided_t_co2e: 303.5,
    avoided_pct: 36.0,
    trees_equivalent: 13795,
    disclaimer: 'These are modelled projections using illustrative factors. Not verified reductions.',
    category_deltas: [
      {
        category: 'electricity',
        label: 'Electricity',
        baseline_t_co2e: 522.0,
        projected_t_co2e: 250.6,
        reduction_t_co2e: 271.4,
        reduction_pct: 52.0,
        key_lever: '250 kWp solar PV + LED daylight harvesting'
      },
      {
        category: 'transport',
        label: 'Transportation',
        baseline_t_co2e: 202.0,
        projected_t_co2e: 178.5,
        reduction_t_co2e: 23.5,
        reduction_pct: 11.6,
        key_lever: 'Subsidized electric feeder buses & carpool priority parking'
      },
      {
        category: 'waste',
        label: 'Waste',
        baseline_t_co2e: 118.0,
        projected_t_co2e: 109.4,
        reduction_t_co2e: 8.6,
        reduction_pct: 7.3,
        key_lever: 'Hostel mess organic segregation and biodigester installation'
      }
    ]
  },
  {
    id: 'scen-net-zero',
    campus_id: 'campus-mlrit-01',
    name: 'Net-Zero Campus Pathway 2030',
    description: 'Comprehensive decarbonization strategy with campus-wide smart building controls, 85% renewable power purchase agreement (PPA), and zero-waste dining halls.',
    created_at: '2025-09-01',
    is_prebuilt: true,
    assumptions: {
      electricity_reduction_pct: 40,
      renewable_energy_share_pct: 85,
      bus_usage_increase_pct: 60,
      car_usage_reduction_pct: 50,
      waste_diversion_rate_pct: 75
    },
    baseline_t_co2e: 842.0,
    projected_t_co2e: 272.0,
    avoided_t_co2e: 570.0,
    avoided_pct: 67.7,
    trees_equivalent: 25909,
    disclaimer: 'These are modelled projections using illustrative factors. Not verified reductions.',
    category_deltas: [
      {
        category: 'electricity',
        label: 'Electricity',
        baseline_t_co2e: 522.0,
        projected_t_co2e: 78.3,
        reduction_t_co2e: 443.7,
        reduction_pct: 85.0,
        key_lever: 'Green tariff PPA + full inverter HVAC scheduling'
      },
      {
        category: 'transport',
        label: 'Transportation',
        baseline_t_co2e: 202.0,
        projected_t_co2e: 112.0,
        reduction_t_co2e: 90.0,
        reduction_pct: 44.5,
        key_lever: 'Mandatory EV fleet & park-and-ride shuttles'
      },
      {
        category: 'waste',
        label: 'Waste',
        baseline_t_co2e: 118.0,
        projected_t_co2e: 81.7,
        reduction_t_co2e: 36.3,
        reduction_pct: 30.8,
        key_lever: 'Zero-landfill dining policy & community bio-compost'
      }
    ]
  },
  {
    id: 'scen-quick-wins',
    campus_id: 'campus-mlrit-01',
    name: 'Quick Wins: Operational Adjustments & Composting',
    description: 'Immediate low-cost interventions requiring zero capital expenditure: set-point HVAC tuning, campus lighting curfews, and expanded organic waste pits.',
    created_at: '2025-10-20',
    is_prebuilt: true,
    assumptions: {
      electricity_reduction_pct: 12,
      renewable_energy_share_pct: 0,
      bus_usage_increase_pct: 15,
      car_usage_reduction_pct: 10,
      waste_diversion_rate_pct: 40
    },
    baseline_t_co2e: 842.0,
    projected_t_co2e: 754.2,
    avoided_t_co2e: 87.8,
    avoided_pct: 10.4,
    trees_equivalent: 3991,
    disclaimer: 'These are modelled projections using illustrative factors. Not verified reductions.',
    category_deltas: [
      {
        category: 'electricity',
        label: 'Electricity',
        baseline_t_co2e: 522.0,
        projected_t_co2e: 459.4,
        reduction_t_co2e: 62.6,
        reduction_pct: 12.0,
        key_lever: 'Thermostat set to 25°C + evening lighting auto-shutoff'
      },
      {
        category: 'transport',
        label: 'Transportation',
        baseline_t_co2e: 202.0,
        projected_t_co2e: 184.2,
        reduction_t_co2e: 17.8,
        reduction_pct: 8.8,
        key_lever: 'Carpool matching board and route optimization'
      },
      {
        category: 'waste',
        label: 'Waste',
        baseline_t_co2e: 118.0,
        projected_t_co2e: 110.6,
        reduction_t_co2e: 7.4,
        reduction_pct: 6.3,
        key_lever: 'Campus canteen wet-waste composting expansion'
      }
    ]
  }
];
