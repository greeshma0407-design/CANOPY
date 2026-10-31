import { Recommendation } from '../types';

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-01-ac-schedule',
    title: 'Optimize Air Conditioning Scheduling & Setpoints',
    category: 'electricity',
    category_label: 'Electricity',
    impact_level: 'High',
    effort_level: 'Low',
    status: 'In Progress',
    short_description: 'Standardize thermostat setpoints to 24-25°C across all lecture halls and administrative blocks, with automated shutdown 30 minutes after class conclusion.',
    rationale: 'HVAC cooling accounts for approximately 42% of MLRIT summer electrical loads. Raising cooling setpoints from 21°C to 24°C yields an immediate 15% reduction in chiller energy demand with negligible comfort impact.',
    estimated_annual_savings_t_co2e: 42.0,
    cost_estimate: '₹25,000 (Smart programmable thermostats)',
    payback_period: '1.5 months',
    rule_key: 'ELEC_HVAC_SETPOINT_OPTIMIZATION',
    assumptions: [
      'Applies to 68 split AC units and 4 central VRF systems',
      'Average 7 operating hours per day during academic semesters',
      'Grid emission factor: 0.82 kgCO2e/kWh (CEA illustrative baseline)'
    ],
    co_benefits: ['Extended compressor lifespan', 'Reduced peak demand power charges', 'Lower equipment maintenance overhead'],
    timeline: '2 weeks implementation',
    target_quarter: 'Q1 2026'
  },
  {
    id: 'rec-02-led-retrofit',
    title: 'Campus-wide LED Lighting & Occupancy Sensors',
    category: 'electricity',
    category_label: 'Electricity',
    impact_level: 'High',
    effort_level: 'Low',
    status: 'Planned',
    short_description: 'Replace remaining T8 fluorescent tubes and halogen floodlights in academic corridors, labs, and sports grounds with high-efficiency 140 lm/W LED fixtures and PIR occupancy sensors.',
    rationale: 'Existing legacy lighting consumes roughly 65,000 kWh annually. Switching to LED reduces wattage by 55% while sensors eliminate unnecessary illumination in unoccupied corridors.',
    estimated_annual_savings_t_co2e: 38.0,
    cost_estimate: '₹3,50,000 (Fixtures + labor)',
    payback_period: '11 months',
    rule_key: 'ELEC_LED_LIGHTING_RETROFIT',
    assumptions: [
      'Covers 1,200 lighting points across Academic Blocks A, B, and Central Library',
      'Average burning time: 9 hours/day for classrooms, 12 hours/day for corridors',
      'Calculated based on 46,340 kWh/yr avoided grid electricity'
    ],
    co_benefits: ['Superior illuminance (lux) for study environments', 'Lower heat dissipation reducing AC cooling loads', 'Zero mercury content'],
    timeline: '6 weeks',
    target_quarter: 'Q2 2026'
  },
  {
    id: 'rec-03-solar-pv',
    title: '250 kWp Rooftop Solar Photovoltaic Installation',
    category: 'electricity',
    category_label: 'Electricity',
    impact_level: 'Very High',
    effort_level: 'High',
    status: 'Planned',
    short_description: 'Deploy a grid-tied 250 kWp solar PV array across the flat terraces of the Main Mechanical Block and Indoor Sports Complex with net-metering approval from TSSPDCL.',
    rationale: 'Generating clean solar power on campus displaces high-carbon coal-dominated grid electricity during daytime peak hours. Hyderabad averages over 300 sunny days annually with high global horizontal irradiance.',
    estimated_annual_savings_t_co2e: 185.0,
    cost_estimate: '₹1.15 Cr (Turnkey EPC with net-metering)',
    payback_period: '3.8 years',
    rule_key: 'ELEC_RENEWABLE_SOLAR_PV',
    assumptions: [
      '250 kWp capacity yielding ~375,000 kWh/year (CUF ~17.1%)',
      '100% self-consumption during campus daytime operations',
      'Avoided emissions calculated at 0.82 kgCO2e/kWh CEA factor'
    ],
    co_benefits: ['Fixed electricity cost hedge against future tariff inflation', 'Rooftop shading cooling top-floor classrooms', 'Live laboratory for Electrical & Renewable Energy engineering students'],
    timeline: '4 months',
    target_quarter: 'Q3 2026'
  },
  {
    id: 'rec-04-ev-bus',
    title: 'Transition Core Shuttle Routes to Electric / CNG Buses',
    category: 'transport',
    category_label: 'Transportation',
    impact_level: 'High',
    effort_level: 'Medium',
    status: 'Not Started',
    short_description: 'Replace the 6 oldest diesel buses in the institution transport fleet with dedicated 40-seater electric or CNG buses for high-density commuter corridors from Miyapur and Secunderabad.',
    rationale: 'Student and staff bus transportation currently generates 202 tCO2e annually. Electric shuttles reduce tailpipe emissions to zero and drop lifecycle emissions by over 60% compared to diesel.',
    estimated_annual_savings_t_co2e: 54.0,
    cost_estimate: '₹4.5 Lakhs/year incremental lease or OPEX model',
    payback_period: '2.4 years (fuel cost parity)',
    rule_key: 'TRANS_EV_BUS_CONVERSION',
    assumptions: [
      '6 buses covering an aggregate of 420 km daily during working semesters',
      'Diesel bus baseline: 0.089 kgCO2e/p-km vs EV bus: 0.038 kgCO2e/p-km (grid-charged)',
      '180 operational academic days per annum'
    ],
    co_benefits: ['Zero tailpipe NOx and particulate PM2.5 pollution near campus gates', 'Silent, vibration-free passenger transit', 'Alignment with Telangana EV Policy 2020-2030'],
    timeline: '6 months',
    target_quarter: 'Q4 2026'
  },
  {
    id: 'rec-05-cycling-infra',
    title: 'Campus Cycling Infrastructure & Last-Mile Bike Share',
    category: 'transport',
    category_label: 'Transportation',
    impact_level: 'Medium',
    effort_level: 'Low',
    status: 'In Progress',
    short_description: 'Construct protected bicycle lanes connecting student residential hostels to classroom clusters, install 100 covered bike racks, and deploy a 50-bicycle student sharing pool.',
    rationale: 'Many day-scholars and hostelites use two-wheelers for short internal 1-2 km campus hops. Providing dedicated cycling paths and bikes eliminates motorized trips on campus grounds.',
    estimated_annual_savings_t_co2e: 18.0,
    cost_estimate: '₹1,80,000 (50 robust campus cycles + signage + shelters)',
    payback_period: 'Immediate (student well-being)',
    rule_key: 'TRANS_ACTIVE_CYCLING_LANES',
    assumptions: [
      'Displaces ~175,000 two-wheeler passenger-km annually',
      'Two-wheeler emission factor: 0.103 kgCO2e/vehicle-km',
      'Zero operating tailpipe emissions'
    ],
    co_benefits: ['Student physical fitness and active lifestyle', 'Calmer, pedestrian-safe campus roads', 'Reduced parking congestion at main entrance'],
    timeline: '3 weeks',
    target_quarter: 'Q1 2026'
  },
  {
    id: 'rec-06-organic-composting',
    title: 'Expanded Aerobic Composting Pit for Mess & Garden Waste',
    category: 'waste',
    category_label: 'Waste',
    impact_level: 'Medium',
    effort_level: 'Medium',
    status: 'Completed',
    short_description: 'Upgrade the existing campus composting facility into a 3-chamber aerated static pile composting system handling 100% of cafeteria wet waste and landscape clippings.',
    rationale: 'Organic kitchen waste dumped in municipal landfills undergoes anaerobic decomposition, releasing potent methane (CH4). Managed aerobic composting avoids methane and creates organic nutrient-rich soil fertilizer.',
    estimated_annual_savings_t_co2e: 32.0,
    cost_estimate: '₹95,000 (Compost pits, shredder, bacterial inoculant)',
    payback_period: '6 months (fertilizer savings)',
    rule_key: 'WASTE_ORGANIC_AEROBIC_COMPOSTING',
    assumptions: [
      'Diverts 65 tonnes of wet cafeteria waste and horticultural debris annually from landfill',
      'Avoids 480 kgCO2e/tonne delta between landfill (580 kg) and composting (100 kg)',
      'Total avoided emissions: ~31.2 tCO2e/year'
    ],
    co_benefits: ['Free organic fertilizer for 24 acres of campus lawns and tree plantations', 'No foul odors or leachate runoff', 'Student environmental club learning project'],
    timeline: 'Completed October 2025',
    target_quarter: 'Q4 2025'
  },
  {
    id: 'rec-07-single-use-plastic-ban',
    title: 'Single-Use Plastic Ban & RO Water Refill Stations',
    category: 'waste',
    category_label: 'Waste',
    impact_level: 'Low',
    effort_level: 'Low',
    status: 'In Progress',
    short_description: 'Implement a strict campus ban on disposable plastic bottles, cups, and cutlery in food courts, supplemented by 12 touchless chilled RO water refill stations.',
    rationale: 'Eliminating single-use plastics reduces landfill volume, avoids incineration emissions from contaminated plastic wrappers, and fosters a zero-waste campus ethos.',
    estimated_annual_savings_t_co2e: 8.0,
    cost_estimate: '₹1,20,000 (Water stations & reusable steel canteen wares)',
    payback_period: '4 months',
    rule_key: 'WASTE_SINGLE_USE_PLASTIC_BAN',
    assumptions: [
      'Eliminates ~140,000 single-use PET bottles and 200,000 plastic cups annually',
      'Reduction of 2.1 tonnes of plastic waste from municipal incinerator / landfill streams',
      'Calculated using avoided plastic manufacture and disposal factors'
    ],
    co_benefits: ['Cleaner, litter-free campus surroundings', 'Substantial savings for students on bottled water', 'Promotes circular economy habits'],
    timeline: '4 weeks',
    target_quarter: 'Q1 2026'
  },
  {
    id: 'rec-08-carpooling',
    title: 'Staff & Student Carpooling App & Preferred Parking',
    category: 'transport',
    category_label: 'Transportation',
    impact_level: 'Medium',
    effort_level: 'Low',
    status: 'Planned',
    short_description: 'Launch a campus-verified carpool matching board on the student portal, reserving shaded front-row parking slots for vehicles carrying 3 or more campus commuters.',
    rationale: 'Currently over 80 faculty and senior students drive solo to campus from Secunderabad, Banjara Hills, and Gachibowli. Pooling reduces vehicle trips by 35% across participating routes.',
    estimated_annual_savings_t_co2e: 22.0,
    cost_estimate: '₹15,000 (Carpool parking signage & portal badge integration)',
    payback_period: 'Immediate',
    rule_key: 'TRANS_COMMUTER_CARPOOL_PROGRAM',
    assumptions: [
      'Consolidates 45 daily single-occupant passenger cars into shared rides of 3+ passengers',
      'Average round trip commute: 32 km',
      'Factor: 0.171 kgCO2e/vehicle-km avoided'
    ],
    co_benefits: ['Reduces parking lot congestion by 30+ vehicles daily', 'Inter-departmental networking and commuter fuel savings', 'Reduces peak hour traffic at campus junction'],
    timeline: '3 weeks',
    target_quarter: 'Q2 2026'
  }
];
