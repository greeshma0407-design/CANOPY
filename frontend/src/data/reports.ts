import { Report } from '../types';

export const mockDefaultReport: Report = {
  id: 'rep-cy2025-annual',
  campus_id: 'campus-mlrit-01',
  campus_name: 'Marri Laxman Reddy Institute of Technology (MLRIT)',
  reporting_period_id: 'period-2025',
  period_label: 'Calendar Year 2025 (Jan 1, 2025 – Dec 31, 2025)',
  generated_at: '2025-11-01T10:30:00Z',
  title: 'Canopy Annual Campus Carbon Footprint Assessment 2025',
  version: '1.0-illustrative',
  scope_coverage: 'Scope 2 (Electricity Grid & Backup Gensets) + Scope 3 (Commuter Transport & Solid Waste)',
  total_emissions_t_co2e: 842.0,
  electricity_t_co2e: 522.0,
  transport_t_co2e: 202.0,
  waste_t_co2e: 118.0,
  per_student_t_co2e: 0.281, // 842 / 3000 students = 0.281 tCO2e/student
  status: 'illustrative',
  author: 'MLRIT Sustainability Cell & Canopy Carbon Engine',
  disclaimer: 'This report is based on illustrative demonstration data and should not be used for regulatory submissions.',
  sections: [
    {
      id: 'sec-exec',
      title: '1. Executive Summary',
      subtitle: 'Annual Carbon Accounting & Trend Analysis',
      type: 'executive_summary',
      text_content: 'During the 2025 calendar year, Marri Laxman Reddy Institute of Technology (MLRIT) generated a total illustrative carbon footprint of 842.0 metric tonnes of CO2 equivalent (tCO2e). This reflects an overall 8.0% reduction compared to the 2024 baseline inventory (915.0 tCO2e). Grid-purchased electricity continues to be the dominant contributor at 62.0% (522.0 tCO2e), followed by campus commuter transit at 24.0% (202.0 tCO2e), and solid waste disposal at 14.0% (118.0 tCO2e). With an enrolled student population of 3,000, the per-student carbon intensity stands at 0.281 tCO2e/student/year.'
    },
    {
      id: 'sec-profile',
      title: '2. Campus Institutional Profile',
      subtitle: 'Boundary Conditions & Demographics',
      type: 'profile',
      data: {
        'Institution Name': 'Marri Laxman Reddy Institute of Technology (MLRIT)',
        'Campus Location': 'Dundigal, Hyderabad, Telangana, India',
        'Campus Boundary': '24.5 Acres (Main Academic Campus & Hostels)',
        'Built-up Area': '48,500 m²',
        'Enrolled Student Body': '3,000 students',
        'Academic & Support Staff': '400 faculty & operational staff',
        'Inventory Standard': 'GHG Protocol Corporate Accounting Standard (adapted for Higher Ed)'
      }
    },
    {
      id: 'sec-breakdown',
      title: '3. Category Breakdown & Scope Allocations',
      subtitle: 'Inventory by Emission Source',
      type: 'category_breakdown',
      data: [
        {
          Category: 'Electricity (Scope 2)',
          'Activity Amount': '636,585 kWh',
          'Factor Applied': '0.820 kgCO2e/kWh (CEA Illustrative)',
          'Total Emissions (tCO2e)': 522.0,
          'Share of Total': '62.0%',
          'Year-over-Year Delta': '-5.0% (↓)'
        },
        {
          Category: 'Transportation (Scope 3)',
          'Activity Amount': '1,420,000 passenger/veh-km',
          'Factor Applied': 'Multi-modal weighted composite',
          'Total Emissions (tCO2e)': 202.0,
          'Share of Total': '24.0%',
          'Year-over-Year Delta': '+2.0% (↑)'
        },
        {
          Category: 'Waste & Landfill (Scope 3)',
          'Activity Amount': '210 tonnes total waste',
          'Factor Applied': '0.58 tCO2e/t landfill, 0.10 tCO2e/t compost',
          'Total Emissions (tCO2e)': 118.0,
          'Share of Total': '14.0%',
          'Year-over-Year Delta': '-1.0% (↓)'
        }
      ]
    },
    {
      id: 'sec-methodology',
      title: '4. Carbon Accounting Methodology & Data Quality',
      subtitle: 'Standards, Verification Tiers, and Activity Provenance',
      type: 'methodology',
      text_content: 'All emission calculations adhere to the foundational formula: Emissions (kgCO2e) = Activity Quantity × Emission Factor. Monthly utility electricity quantities are obtained directly from TSSPDCL revenue-grade utility metering bills. Transport activity data incorporates college shuttle fleet fuel and GPS route manifests combined with campus commuter sample surveys (n=640 respondents). Solid waste quantities are recorded via municipal weighbridge slips and daily cafeteria waste bin audits. Data completeness for the 2025 reporting period is evaluated at 95.0%.'
    },
    {
      id: 'sec-factors',
      title: '5. Emission Factor Provenance & Audit Trail',
      subtitle: 'Catalogue of Applied Factors',
      type: 'factors',
      data: [
        {
          'Factor Key': 'EF-ELEC-GRID-IN',
          Category: 'Electricity',
          Value: '0.82 kgCO2e/kWh',
          Source: 'Central Electricity Authority (CEA) Baseline v19 (Illustrative)',
          Geography: 'Southern Regional Grid, India'
        },
        {
          'Factor Key': 'EF-TRANS-BUS-DIESEL',
          Category: 'Transport',
          Value: '0.089 kgCO2e/passenger-km',
          Source: 'ARAI / CPCB Fleet Model (Illustrative)',
          Geography: 'India Suburban Corridor'
        },
        {
          'Factor Key': 'EF-TRANS-CAR-PETROL',
          Category: 'Transport',
          Value: '0.171 kgCO2e/vehicle-km',
          Source: 'MoEFCC / ARAI Light Duty Fleet (Illustrative)',
          Geography: 'India National'
        },
        {
          'Factor Key': 'EF-TRANS-2W-PETROL',
          Category: 'Transport',
          Value: '0.103 kgCO2e/vehicle-km',
          Source: 'ARAI 2-Wheeler Drive Cycle (Illustrative)',
          Geography: 'India National'
        },
        {
          'Factor Key': 'EF-WASTE-LANDFILL',
          Category: 'Waste',
          Value: '580.0 kgCO2e/tonne',
          Source: 'IPCC First Order Decay Model (Illustrative)',
          Geography: 'Jawaharnagar MSW Site'
        },
        {
          'Factor Key': 'EF-WASTE-COMPOST',
          Category: 'Waste',
          Value: '100.0 kgCO2e/tonne',
          Source: 'IPCC Biological Treatment Guidelines (Illustrative)',
          Geography: 'On-site Composting'
        }
      ]
    },
    {
      id: 'sec-limitations',
      title: '6. Assumptions, Uncertainties & Stage 2 Transition',
      subtitle: 'Transparency and Governance Notes',
      type: 'limitations',
      text_content: '1. Factor Caution: The emission factors utilized in this Stage 1 demonstration interface are illustrative approximations calibrated to published Indian institutional research. They do not constitute formal certified factors for carbon credit issuance or ISO 14064 third-party audit.\n2. Scope Exclusions: Embodied emissions from campus capital construction, paper procurement supply chains, and student air travel during semester breaks are presently excluded from the accounting boundary.\n3. Stage 2 Integration: Direct database persistence via Python FastAPI and SQLite will replace local browser memory state in Stage 2.'
    }
  ]
};
