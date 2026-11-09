"""Dynamic recommendation engine for CANOPY.

Generates actionable, prioritized decarbonization recommendations strictly tailored
to the actual measured emissions and activity quantities of a specific campus.
"""
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.activity import ActivityRecord, ActivityItem
from app.models.recommendation import Recommendation
from app.schemas.calculation import PreviewItemInput
from app.services.calculation_service import calculation_service


class RecommendationService:

    def get_recommendations_for_campus(
        self,
        db: Session,
        campus_id: str,
        category: Optional[str] = None,
        status: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Dict[str, Any]]:
        """Compute tailored decarbonization recommendations based on actual campus activity."""
        if not campus_id:
            return []

        # 1. Fetch all activity records for this campus
        records = (
            db.query(ActivityRecord)
            .filter(ActivityRecord.campus_id == campus_id)
            .all()
        )

        if not records:
            return []

        # 2. Aggregate quantities by category and type
        elec_kwh = 0.0
        elec_solar_kwh = 0.0
        bus_pkm = 0.0
        car_vkm = 0.0
        trans_total_qty = 0.0
        organic_tonnes = 0.0
        mixed_tonnes = 0.0
        waste_total_tonnes = 0.0

        all_items: List[PreviewItemInput] = []
        for rec in records:
            for item in rec.activity_items:
                all_items.append(
                    PreviewItemInput(
                        activity_type=item.activity_type,
                        quantity=item.quantity,
                        unit=item.unit,
                        category=rec.category,
                        subcategory=item.subcategory,
                    )
                )
                if rec.category == "electricity":
                    if "solar" in item.activity_type:
                        elec_solar_kwh += item.quantity
                    else:
                        elec_kwh += item.quantity
                elif rec.category == "transport":
                    trans_total_qty += item.quantity
                    if "bus" in item.activity_type:
                        bus_pkm += item.quantity
                    else:
                        car_vkm += item.quantity
                elif rec.category == "waste":
                    waste_total_tonnes += item.quantity
                    if "mixed" in item.activity_type:
                        mixed_tonnes += item.quantity
                    else:
                        organic_tonnes += item.quantity

        if not all_items:
            return []

        # 3. Calculate verified emissions using calculation engine
        calc_result = calculation_service.calculate_preview(db, all_items, campus_geography="IN-Telangana")
        if calc_result.total_kg_co2e <= 0:
            return []

        # Emissions breakdown by category (in tCO2e)
        cat_emissions_kg: Dict[str, float] = {}
        for line in calc_result.lines:
            if line.emissions_kg_co2e is not None:
                cat_emissions_kg[line.category] = cat_emissions_kg.get(line.category, 0.0) + line.emissions_kg_co2e

        total_kg = calc_result.total_kg_co2e
        total_t = total_kg / 1000.0

        elec_t = cat_emissions_kg.get("electricity", 0.0) / 1000.0
        trans_t = cat_emissions_kg.get("transport", 0.0) / 1000.0
        waste_t = cat_emissions_kg.get("waste", 0.0) / 1000.0

        elec_pct = round((elec_t / total_t) * 100) if total_t > 0 else 0
        trans_pct = round((trans_t / total_t) * 100) if total_t > 0 else 0
        waste_pct = max(0, 100 - elec_pct - trans_pct) if total_t > 0 else 0

        # Rank categories by emissions weight
        cat_rank = sorted(
            [("electricity", elec_t), ("transport", trans_t), ("waste", waste_t)],
            key=lambda x: x[1],
            reverse=True,
        )
        highest_cat = cat_rank[0][0]

        recs: List[Dict[str, Any]] = []

        # -----------------------------------------------------------------
        # Category: Electricity
        # -----------------------------------------------------------------
        if elec_t > 0:
            # Rec 1: Rooftop Solar PV
            # 30% grid replacement with solar (0.820 - 0.048 = 0.772 kg/kWh saving)
            grid_kwh_effective = elec_kwh if elec_kwh > 0 else (elec_t * 1000.0 / 0.820)
            solar_savings = round((grid_kwh_effective * 0.30 * 0.772) / 1000.0, 2)
            solar_impact = "Very High" if elec_pct >= 40 else "High"
            solar_priority = 1 if highest_cat == "electricity" else 2

            recs.append({
                "id": f"rec-{campus_id[:8]}-solar-pv",
                "title": "On-site Rooftop Solar PV Deployment",
                "category": "electricity",
                "short_description": (
                    f"Electricity accounts for {elec_pct}% ({elec_t:.1f} tCO2e) of campus emissions. "
                    f"Transitioning 30% of metered grid draw to rooftop solar PV on academic blocks "
                    f"substitutes high-carbon regional grid electricity with low-carbon clean power."
                ),
                "rationale": (
                    f"Current campus electricity consumption generates {elec_t:.1f} tCO2e using the CEA Southern Grid "
                    f"factor (0.820 kgCO2e/kWh). Installing a captive rooftop solar array (lifecycle factor 0.048 kgCO2e/kWh) "
                    f"delivers direct Scope 2 avoidance with positive long-term utility bill savings."
                ),
                "effort_level": "Medium",
                "impact_level": solar_impact,
                "priority": solar_priority,
                "rule_key": "rule_solar_pv_transition",
                "assumptions": '["Replaces 30% of baseline grid electricity", "Southern Regional Grid emission factor: 0.820 kgCO2e/kWh", "Captive Solar PV factor: 0.048 kgCO2e/kWh"]',
                "co_benefits": '["Lowers monthly utility expenditures", "Insulates campus from peak tariff escalation", "Enhances institutional NAAC / NIRF green ranking"]',
                "estimated_annual_savings_tco2e": solar_savings,
                "cost_estimate": "Capital Intensive (Institutional Capex / RESCO model)",
                "payback_period": "4 - 5 years",
                "target_quarter": "Q2",
                "timeline": "6 - 12 months",
                "status": "Not Started",
                "is_active": True,
            })

            # Rec 2: LED & HVAC Smart Scheduling
            # 15% efficiency conservation
            efficiency_savings = round(elec_t * 0.15, 2)
            eff_priority = 2 if highest_cat == "electricity" else 3

            recs.append({
                "id": f"rec-{campus_id[:8]}-efficiency-retrofit",
                "title": "Building HVAC & LED Lighting Automation",
                "category": "electricity",
                "short_description": (
                    f"Campus power metering indicates significant continuous base load. "
                    f"Installing occupancy sensors, scheduling central cooling to 24°C, and upgrading "
                    f"remaining fluorescent fixtures to LEDs can eliminate roughly 15% of electricity waste."
                ),
                "rationale": (
                    f"Auditing academic and laboratory power draw reveals off-hours baseload consumption. "
                    f"Smart timer switches and sensor-governed LED retrofits prevent vacant room consumption."
                ),
                "effort_level": "Low",
                "impact_level": "High" if elec_pct >= 50 else "Medium",
                "priority": eff_priority,
                "rule_key": "rule_building_efficiency_led",
                "assumptions": '["15% electricity conservation through occupancy-linked controls and LED retrofits"]',
                "co_benefits": '["Extends HVAC equipment operational life", "Improves student lighting comfort", "Zero civil disruption during installation"]',
                "estimated_annual_savings_tco2e": efficiency_savings,
                "cost_estimate": "Low to Moderate",
                "payback_period": "1 - 2 years",
                "target_quarter": "Q1",
                "timeline": "2 - 4 months",
                "status": "Not Started",
                "is_active": True,
            })

        # -----------------------------------------------------------------
        # Category: Transport
        # -----------------------------------------------------------------
        if trans_t > 0:
            # Rec 3: Bus Fleet Electrification / Shared Transit
            # Replacing diesel buses with electric / CNG or routing optimization
            bus_savings = round(trans_t * 0.35, 2)
            trans_priority = 1 if highest_cat == "transport" else (3 if elec_t > 0 else 1)
            trans_impact = "Very High" if trans_pct >= 40 else ("High" if trans_pct >= 20 else "Medium")

            recs.append({
                "id": f"rec-{campus_id[:8]}-fleet-electrification",
                "title": "Campus Shuttle Fleet Electrification & Route Consolidation",
                "category": "transport",
                "short_description": (
                    f"Commuter transportation accounts for {trans_pct}% ({trans_t:.1f} tCO2e) of campus emissions. "
                    f"Transitioning high-mileage diesel student buses to electric/CNG vehicles and consolidating "
                    f"overlapping routes achieves an estimated 35% reduction in commuter Scope 3 emissions."
                ),
                "rationale": (
                    f"Diesel bus shuttles operate at 0.089 kgCO2e/pkm. Phasing in electric commuter buses "
                    f"or CNG shuttles significantly lowers tailpipe particulate emissions and localized carbon intensity."
                ),
                "effort_level": "High",
                "impact_level": trans_impact,
                "priority": trans_priority,
                "rule_key": "rule_transport_fleet_electrification",
                "assumptions": '["35% reduction in shuttle emissions via route optimization and clean-fuel fleet substitution"]',
                "co_benefits": '["Zero localized tailpipe exhaust around campus gates", "Decreased diesel fuel volatility exposure", "Reduced acoustic noise near academic zones"]',
                "estimated_annual_savings_tco2e": bus_savings,
                "cost_estimate": "High (Fleet lease / Contractor transition)",
                "payback_period": "3 - 4 years",
                "target_quarter": "Q3",
                "timeline": "6 - 18 months",
                "status": "Not Started",
                "is_active": True,
            })

            # Rec 4: Active Campus Mobility & Carpool Incentives
            carpool_savings = round(trans_t * 0.12, 2)
            recs.append({
                "id": f"rec-{campus_id[:8]}-active-mobility",
                "title": "Carpool Matching Program & Dedicated Bicycle Corridors",
                "category": "transport",
                "short_description": (
                    f"Faculty, staff, and student private vehicles contribute noticeably to peak morning emissions. "
                    f"Introducing a verified campus carpool matching portal alongside protected bicycle corridors "
                    f"diverts single-occupancy passenger trips to shared and non-motorized modes."
                ),
                "rationale": (
                    f"Encouraging multimodal commute shifts directly reduces private vehicle-km. Active cycling "
                    f"and walking infrastructure carries zero emission factor while easing campus parking congestion."
                ),
                "effort_level": "Low",
                "impact_level": "Medium",
                "priority": trans_priority + 1,
                "rule_key": "rule_active_transit_carpool",
                "assumptions": '["12% reduction in private vehicle commuter mileage through carpooling and cycling shift"]',
                "co_benefits": '["Decreases on-campus parking congestion", "Promotes staff and student cardiovascular wellness", "Zero ongoing operating maintenance cost"]',
                "estimated_annual_savings_tco2e": carpool_savings,
                "cost_estimate": "Minimal",
                "payback_period": "Immediate (< 6 months)",
                "target_quarter": "Q1",
                "timeline": "1 - 3 months",
                "status": "Not Started",
                "is_active": True,
            })

        # -----------------------------------------------------------------
        # Category: Waste
        # -----------------------------------------------------------------
        if waste_t > 0:
            # Rec 5: On-site Composting of Organic Waste
            # Diverting organic waste from landfill (580 kg/t) to aerobic compost (100 kg/t)
            compost_savings = round(waste_t * 0.55, 2)
            waste_priority = 1 if highest_cat == "waste" else (len(recs) + 1)
            waste_impact = "High" if waste_pct >= 25 else "Medium"

            recs.append({
                "id": f"rec-{campus_id[:8]}-organic-composting",
                "title": "Decentralized On-Campus Organic Waste Composting",
                "category": "waste",
                "short_description": (
                    f"Solid waste generates {waste_pct}% ({waste_t:.1f} tCO2e) of the institutional footprint. "
                    f"Diverting mess and canteen wet food waste from municipal landfills to an on-site "
                    f"aerobic composting pit avoids anaerobic methane generation, saving approximately 55% of waste emissions."
                ),
                "rationale": (
                    f"Landfilling organic waste yields 580 kgCO2e/tonne due to anaerobic methane decomposition. "
                    f"Aerobic composting produces only 100 kgCO2e/tonne—a net avoidance of 480 kgCO2e per diverted tonne. "
                    f"Finished compost can directly nourish campus gardens."
                ),
                "effort_level": "Medium",
                "impact_level": waste_impact,
                "priority": waste_priority,
                "rule_key": "rule_waste_composting_diversion",
                "assumptions": '["55% reduction in solid waste emissions via organic fraction landfill diversion to aerobic composting"]',
                "co_benefits": '["Produces nutrient-dense organic fertilizer for campus landscaping", "Dramatically reduces municipal waste tipping and transport fees", "Hands-on environmental education resource for biology and civil departments"]',
                "estimated_annual_savings_tco2e": compost_savings,
                "cost_estimate": "Low to Moderate",
                "payback_period": "1 - 2 years",
                "target_quarter": "Q2",
                "timeline": "2 - 4 months",
                "status": "Not Started",
                "is_active": True,
            })

            # Rec 6: Source Segregation & Recyclables Stream
            seg_savings = round(waste_t * 0.20, 2)
            recs.append({
                "id": f"rec-{campus_id[:8]}-waste-segregation",
                "title": "3-Stream Source Segregation & Dry Recyclables Material Recovery",
                "category": "waste",
                "short_description": (
                    f"Deploying standardized 3-bin collection stations (Organic, Dry Recyclable, Non-Recyclable) "
                    f"in all academic corridors, labs, and libraries diverts dry paper, cardboard, and plastics "
                    f"into formal recycling channels."
                ),
                "rationale": (
                    f"Contaminated mixed waste defaults to municipal landfills. Source segregation ensures high "
                    f"material recovery rates for packaging plastics and examination papers."
                ),
                "effort_level": "Low",
                "impact_level": "Medium" if waste_pct >= 20 else "Low",
                "priority": waste_priority + 1,
                "rule_key": "rule_waste_source_segregation",
                "assumptions": '["20% diversion of recyclable dry waste streams away from landfills"]',
                "co_benefits": '["Generate scrap revenue from verified paper and plastic recycling", "Fosters waste consciousness across campus community", "Cleaner corridors and dining facilities"]',
                "estimated_annual_savings_tco2e": seg_savings,
                "cost_estimate": "Low",
                "payback_period": "< 1 year",
                "target_quarter": "Q1",
                "timeline": "1 - 2 months",
                "status": "Not Started",
                "is_active": True,
            })

        # Apply optional filters
        filtered_recs = recs
        if category:
            filtered_recs = [r for r in filtered_recs if r["category"] == category]
        if status:
            filtered_recs = [r for r in filtered_recs if r["status"] == status]
        if is_active is not None:
            filtered_recs = [r for r in filtered_recs if r["is_active"] == is_active]

        # Sort by priority
        filtered_recs.sort(key=lambda r: r["priority"])
        return filtered_recs


recommendation_service = RecommendationService()
