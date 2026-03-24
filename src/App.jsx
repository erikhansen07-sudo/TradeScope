import { useState, useEffect, useMemo } from "react";
import {
  Plus, Trash2, Edit2, ChevronDown, ChevronRight,
  X, Settings, Building2, AlertCircle, RotateCcw
} from "lucide-react";

// =============================================================================
// DATABASE — Single source of truth (tradescope_seed_database_v2.json)
// DO NOT hardcode rates or formulas in components — read them from here only.
// =============================================================================
const DB = {
  meta: {
    name: "TradeScope Seed Database",
    version: "2.0",
    region: "San Diego, CA",
    primaryUse: "Retail TI",
    pricingTiers: ["low", "mid", "high"],
  },
  rates: {
    framing_interior_wall:              { label: "Interior Non-Load Bearing Wall",          unit: "LF", category: "Framing",          low: 45,    mid: 60,    high: 75    },
    drywall_hang_tape_finish:           { label: "Drywall Hang + Tape + Finish",             unit: "SF", category: "Drywall",          low: 2.5,   mid: 3.5,   high: 4.5   },
    drywall_level5_add:                 { label: "Drywall Level 5 Add",                      unit: "SF", category: "Drywall",          low: 0.75,  mid: 1.0,   high: 1.5   },
    insulation_batt:                    { label: "Batt Insulation",                          unit: "SF", category: "Insulation",       low: 1.5,   mid: 2.25,  high: 3.0   },
    paint_walls:                        { label: "Wall Paint",                               unit: "SF", category: "Paint",            low: 1.5,   mid: 2.25,  high: 3.5   },
    floor_install_lvp:                  { label: "LVP Install",                              unit: "SF", category: "Flooring",         low: 3.0,   mid: 4.5,   high: 6.0   },
    floor_install_hardwood:             { label: "Hardwood Install",                         unit: "SF", category: "Flooring",         low: 8.0,   mid: 11.0,  high: 15.0  },
    tile_install_standard:              { label: "Tile Install Standard",                    unit: "SF", category: "Tile",             low: 10.0,  mid: 15.0,  high: 25.0  },
    demo_light:                         { label: "Light Interior Demo",                      unit: "SF", category: "Demo",             low: 3.0,   mid: 5.0,   high: 8.0   },
    demo_selective:                     { label: "Selective Interior Demo",                  unit: "SF", category: "Demo",             low: 6.0,   mid: 9.0,   high: 14.0  },
    demo_heavy:                         { label: "Heavy Interior Demo",                      unit: "SF", category: "Demo",             low: 10.0,  mid: 15.0,  high: 24.0  },
    demo_wall:                          { label: "Wall Demo",                                unit: "LF", category: "Demo",             low: 20.0,  mid: 35.0,  high: 50.0  },
    door_prehung_install:               { label: "Prehung Door Install",                     unit: "EA", category: "Doors",            low: 250.0, mid: 400.0, high: 600.0 },
    baseboard_install:                  { label: "Baseboard Install",                        unit: "LF", category: "Finish Carpentry", low: 8.0,   mid: 12.0,  high: 18.0  },
    act_refresh_tile_replace:           { label: "ACT Tile Replacement Refresh",             unit: "SF", category: "Ceilings",         low: 3.0,   mid: 4.5,   high: 7.0   },
    act_refresh_grid_touchup:           { label: "ACT Grid Touch-Up / Minor Repair",         unit: "SF", category: "Ceilings",         low: 0.75,  mid: 1.25,  high: 2.0   },
    act_refresh_grid_replace_allowance: { label: "ACT Grid Replacement Allowance",           unit: "SF", category: "Ceilings",         low: 2.0,   mid: 3.5,   high: 5.5   },
    electrical_rough_sf_light:          { label: "Electrical Rough by SF — Light Refresh",   unit: "SF", category: "Electrical",       low: 3.0,   mid: 4.5,   high: 6.5   },
    electrical_rough_sf_standard:       { label: "Electrical Rough by SF — Standard TI",     unit: "SF", category: "Electrical",       low: 6.0,   mid: 9.0,   high: 13.0  },
    electrical_rough_sf_heavy:          { label: "Electrical Rough by SF — Heavy TI",        unit: "SF", category: "Electrical",       low: 10.0,  mid: 14.0,  high: 20.0  },
    electrical_panel_allowance:         { label: "Panel / Circuit Expansion Allowance",      unit: "EA", category: "Electrical",       low: 1500,  mid: 3000,  high: 6000  },
    restroom_refresh_allowance:         { label: "Restroom Refresh Allowance",               unit: "EA", category: "Restroom",         low: 4500,  mid: 8500,  high: 15000 },
    restroom_fixture_allowance:         { label: "Restroom Fixture Allowance",               unit: "EA", category: "Restroom",         low: 1200,  mid: 2500,  high: 5000  },
    restroom_accessories_allowance:     { label: "Restroom Accessories Allowance",           unit: "EA", category: "Restroom",         low: 400,   mid: 900,   high: 1800  },
    restroom_tile_refresh_allowance:    { label: "Restroom Tile Refresh Allowance",          unit: "EA", category: "Restroom",         low: 800,   mid: 1800,  high: 3500  },
    restroom_paint_allowance:           { label: "Restroom Paint Allowance",                 unit: "EA", category: "Restroom",         low: 350,   mid: 750,   high: 1500  },
    millwork_allowance_basic:           { label: "Millwork — Basic Painted Base Cabinetry",  unit: "LF", category: "Millwork",         low: 250,   mid: 400,   high: 650   },
    millwork_allowance_service_counter: { label: "Millwork — Retail Service Counter",        unit: "LF", category: "Millwork",         low: 500,   mid: 800,   high: 1300  },
    millwork_allowance_midgrade_casework:{ label: "Millwork — Mid-Grade Laminate Casework",  unit: "LF", category: "Millwork",         low: 350,   mid: 550,   high: 900   },
    millwork_allowance_premium_custom:  { label: "Millwork — Premium Custom",                unit: "LF", category: "Millwork",         low: 800,   mid: 1200,  high: 2000  },
    hvac_refresh_light:                 { label: "HVAC Refresh / Light Update",              unit: "SF", category: "HVAC",             low: 2.0,   mid: 3.5,   high: 5.5   },
    hvac_update_moderate:               { label: "HVAC Moderate Update",                     unit: "SF", category: "HVAC",             low: 4.0,   mid: 6.5,   high: 9.5   },
    hvac_update_heavy:                  { label: "HVAC Heavy Update",                        unit: "SF", category: "HVAC",             low: 7.0,   mid: 11.0,  high: 16.0  },
    hvac_diffuser_replace:              { label: "HVAC Diffuser / Register Replacement",     unit: "EA", category: "HVAC",             low: 150,   mid: 300,   high: 600   },
    hvac_air_balance_allowance:         { label: "HVAC Air Balance / Test Allowance",        unit: "SF", category: "HVAC",             low: 0.35,  mid: 0.75,  high: 1.25  },
  },
  assemblies: [
    {
      id: "interior_wall", name: "Interior Wall", group: "Structural",
      inputs: [
        { key: "linearFeet",       label: "Linear Feet",       type: "number",  required: true },
        { key: "heightFt",         label: "Wall Height (ft)",  type: "number",  required: true,  default: 9 },
        { key: "includeInsulation",label: "Include Insulation",type: "boolean", required: false, default: true },
        { key: "level5Finish",     label: "Level 5 Finish",    type: "boolean", required: false, default: false },
      ],
      calculations: { wallArea: "linearFeet * heightFt", drywallArea: "wallArea * 2" },
      lineItems: [
        { rateKey: "framing_interior_wall",   quantityFormula: "linearFeet" },
        { rateKey: "drywall_hang_tape_finish", quantityFormula: "drywallArea" },
        { rateKey: "insulation_batt",          quantityFormula: "wallArea",    condition: "includeInsulation == true" },
        { rateKey: "paint_walls",              quantityFormula: "drywallArea" },
        { rateKey: "drywall_level5_add",       quantityFormula: "drywallArea", condition: "level5Finish == true" },
      ],
    },
    {
      id: "flooring", name: "Flooring", group: "Finishes",
      inputs: [
        { key: "squareFeet",        label: "Square Feet",          type: "number",  required: true },
        { key: "materialType",      label: "Material Type",        type: "select",  required: true,  options: ["lvp","hardwood","tile"] },
        { key: "materialCostPerSF", label: "Material Cost / SF ($)",type: "number", required: true },
        { key: "wastePct",          label: "Waste Factor",         type: "percent", required: false, default: 0.1 },
      ],
      calculations: { netFloorQty: "squareFeet * (1 + wastePct)" },
      lineItems: [
        {
          customItem: { label: "Floor Material", unit: "SF", category: "Flooring Material" },
          quantityFormula: "netFloorQty", unitCostFormula: "materialCostPerSF",
        },
        {
          rateSelector: { materialType: { lvp: "floor_install_lvp", hardwood: "floor_install_hardwood", tile: "tile_install_standard" } },
          quantityFormula: "squareFeet",
        },
      ],
    },
    {
      id: "tile_install", name: "Tile Install", group: "Finishes",
      inputs: [
        { key: "squareFeet",            label: "Square Feet",              type: "number", required: true },
        { key: "tileMaterialCostPerSF", label: "Tile Material Cost / SF ($)", type: "number", required: true },
        { key: "prepLevel",             label: "Prep Level",               type: "select", required: false, default: "none", options: ["none","light","moderate"] },
      ],
      lineItems: [
        {
          customItem: { label: "Tile Material", unit: "SF", category: "Tile Material" },
          quantityFormula: "squareFeet", unitCostFormula: "tileMaterialCostPerSF",
        },
        { rateKey: "tile_install_standard", quantityFormula: "squareFeet" },
      ],
    },
    {
      id: "paint_area", name: "Paint Area", group: "Finishes",
      inputs: [
        { key: "paintableSquareFeet", label: "Paintable Square Feet", type: "number", required: true },
      ],
      lineItems: [
        { rateKey: "paint_walls", quantityFormula: "paintableSquareFeet" },
      ],
    },
    {
      id: "demo_area", name: "Demo Area", group: "Demo",
      inputs: [
        { key: "squareFeet", label: "Square Feet", type: "number", required: true },
        { key: "demoType",   label: "Demo Type",   type: "select", required: true, options: ["light","selective","heavy"] },
      ],
      lineItems: [
        {
          rateSelector: { demoType: { light: "demo_light", selective: "demo_selective", heavy: "demo_heavy" } },
          quantityFormula: "squareFeet",
        },
      ],
    },
    {
      id: "wall_demo", name: "Wall Demo", group: "Demo",
      inputs: [
        { key: "linearFeet",  label: "Linear Feet",       type: "number", required: true },
        { key: "wallHeightFt",label: "Wall Height (ft)",  type: "number", required: false, default: 9 },
      ],
      lineItems: [
        { rateKey: "demo_wall", quantityFormula: "linearFeet" },
      ],
    },
    {
      id: "act_ceiling_refresh", name: "ACT Ceiling Refresh", group: "Ceilings",
      inputs: [
        { key: "squareFeet",                   label: "Total Ceiling SF",               type: "number",  required: true },
        { key: "replacePct",                   label: "Replacement %",                  type: "percent", required: false, default: 0.25 },
        { key: "gridTouchUp",                  label: "Grid Touch-Up",                  type: "boolean", required: false, default: true },
        { key: "includeGridReplacementAllowance", label: "Grid Replacement Allowance",  type: "boolean", required: false, default: false },
      ],
      calculations: { replacementArea: "squareFeet * replacePct" },
      lineItems: [
        { rateKey: "act_refresh_tile_replace",           quantityFormula: "replacementArea" },
        { rateKey: "act_refresh_grid_touchup",           quantityFormula: "squareFeet",      condition: "gridTouchUp == true" },
        { rateKey: "act_refresh_grid_replace_allowance", quantityFormula: "replacementArea", condition: "includeGridReplacementAllowance == true" },
      ],
    },
    {
      id: "electrical_rough_sf", name: "Electrical Rough by SF", group: "MEP",
      inputs: [
        { key: "squareFeet",    label: "Square Feet",     type: "number",  required: true },
        { key: "intensityLevel",label: "Intensity Level", type: "select",  required: true, options: ["light","standard","heavy"] },
        { key: "panelWork",     label: "Panel Work",      type: "boolean", required: false, default: false },
      ],
      lineItems: [
        {
          rateSelector: { intensityLevel: { light: "electrical_rough_sf_light", standard: "electrical_rough_sf_standard", heavy: "electrical_rough_sf_heavy" } },
          quantityFormula: "squareFeet",
        },
        { rateKey: "electrical_panel_allowance", quantityFormula: "1", condition: "panelWork == true" },
      ],
    },
    {
      id: "restroom_refresh", name: "Restroom Refresh", group: "Specialties",
      inputs: [
        { key: "restroomCount",      label: "Number of Restrooms",      type: "number",  required: true },
        { key: "includeFixtures",    label: "Include Fixtures",          type: "boolean", required: false, default: true },
        { key: "includeAccessories", label: "Include Accessories",       type: "boolean", required: false, default: true },
        { key: "includeTileRefresh", label: "Include Tile Refresh",      type: "boolean", required: false, default: false },
        { key: "includePaint",       label: "Include Paint",             type: "boolean", required: false, default: true },
      ],
      lineItems: [
        { rateKey: "restroom_refresh_allowance",      quantityFormula: "restroomCount" },
        { rateKey: "restroom_fixture_allowance",      quantityFormula: "restroomCount", condition: "includeFixtures == true" },
        { rateKey: "restroom_accessories_allowance",  quantityFormula: "restroomCount", condition: "includeAccessories == true" },
        { rateKey: "restroom_tile_refresh_allowance", quantityFormula: "restroomCount", condition: "includeTileRefresh == true" },
        { rateKey: "restroom_paint_allowance",        quantityFormula: "restroomCount", condition: "includePaint == true" },
      ],
    },
    {
      id: "millwork_allowance", name: "Millwork Allowance", group: "Specialties",
      inputs: [
        { key: "linearFeet",    label: "Linear Feet",    type: "number", required: true },
        { key: "allowanceType", label: "Allowance Type", type: "select", required: true,
          options: ["basic","service_counter","midgrade_casework","premium_custom"] },
      ],
      lineItems: [
        {
          rateSelector: { allowanceType: {
            basic: "millwork_allowance_basic",
            service_counter: "millwork_allowance_service_counter",
            midgrade_casework: "millwork_allowance_midgrade_casework",
            premium_custom: "millwork_allowance_premium_custom",
          }},
          quantityFormula: "linearFeet",
        },
      ],
    },
    {
      id: "hvac_refresh_update", name: "HVAC Refresh / Update", group: "MEP",
      inputs: [
        { key: "squareFeet",      label: "Square Feet",            type: "number",  required: true },
        { key: "updateLevel",     label: "Update Level",           type: "select",  required: true, options: ["light","moderate","heavy"] },
        { key: "includeAirBalance",label: "Include Air Balance",   type: "boolean", required: false, default: true },
        { key: "diffuserCount",   label: "Diffuser / Register Count", type: "number", required: false, default: 0 },
      ],
      lineItems: [
        {
          rateSelector: { updateLevel: { light: "hvac_refresh_light", moderate: "hvac_update_moderate", heavy: "hvac_update_heavy" } },
          quantityFormula: "squareFeet",
        },
        { rateKey: "hvac_air_balance_allowance", quantityFormula: "squareFeet",    condition: "includeAirBalance == true" },
        { rateKey: "hvac_diffuser_replace",      quantityFormula: "diffuserCount", condition: "diffuserCount > 0" },
      ],
    },
  ],
  estimateDefaults: {
    pricingTier: "mid",
    salesTaxPct: 0.0,
    contingencyPct: 0.1,
    overheadPct: 0.1,
    profitPct: 0.1,
    pricingMode: "markup",
  },
};

// =============================================================================
// FORMULA ENGINE
// Evaluates string expressions from JSON config at runtime.
// Context includes both raw inputs and intermediate calculations.
// =============================================================================
function evalExpr(expr, ctx) {
  if (expr === undefined || expr === null) return 0;
  const s = String(expr).trim();
  // Fast path for plain numbers
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  try {
    const keys = Object.keys(ctx);
    const vals = keys.map((k) => ctx[k]);
    // eslint-disable-next-line no-new-func
    const result = new Function(...keys, `"use strict"; return (${s});`)(...vals);
    return isFinite(result) ? Number(result) : 0;
  } catch {
    return 0;
  }
}

function evalCond(cond, ctx) {
  if (!cond) return true;
  try {
    const keys = Object.keys(ctx);
    const vals = keys.map((k) => ctx[k]);
    // eslint-disable-next-line no-new-func
    return Boolean(new Function(...keys, `"use strict"; return (${cond});`)(...vals));
  } catch {
    return false;
  }
}

// =============================================================================
// RATE ENGINE
// Resolves rateKey from a lineItem definition using current inputs.
// Supports: direct rateKey, rateSelector (input-driven), customItem.
// =============================================================================
function resolveRateKey(liDef, inputs) {
  if (liDef.rateKey) return liDef.rateKey;
  if (liDef.rateSelector) {
    const [inputKey, mapping] = Object.entries(liDef.rateSelector)[0];
    return mapping[inputs[inputKey]] || null;
  }
  return null;
}

// =============================================================================
// ASSEMBLY ENGINE
// Core engine: assembly definition + user inputs → computed line items.
// All math driven by JSON formulas — zero hardcoded logic here.
// =============================================================================
function computeLineItems(asmDef, inputs, tier, rateOverrides = {}) {
  // Build evaluation context: start with inputs
  const ctx = { ...inputs };

  // Step 1 — evaluate intermediate calculated values in order
  if (asmDef.calculations) {
    for (const [key, formula] of Object.entries(asmDef.calculations)) {
      ctx[key] = evalExpr(formula, ctx);
    }
  }

  const items = [];

  for (let i = 0; i < asmDef.lineItems.length; i++) {
    const liDef = asmDef.lineItems[i];

    // Step 2 — evaluate condition (skip if false)
    if (liDef.condition && !evalCond(liDef.condition, ctx)) continue;

    // Step 3 — compute quantity from formula
    const qty = evalExpr(liDef.quantityFormula, ctx);
    if (qty <= 0) continue;

    // Step 4 — resolve rate information
    let rateKey, label, unit, category, baseUnitCost;

    if (liDef.rateKey || liDef.rateSelector) {
      rateKey = resolveRateKey(liDef, inputs);
      const rate = DB.rates[rateKey];
      if (!rate) continue;
      label = rate.label;
      unit = rate.unit;
      category = rate.category;
      baseUnitCost = rate[tier];
    } else if (liDef.customItem) {
      // Custom items (e.g. floor material) pull cost from a formula
      rateKey = `__custom_${asmDef.id}_${i}`;
      label = liDef.customItem.label;
      unit = liDef.customItem.unit;
      category = liDef.customItem.category;
      baseUnitCost = evalExpr(liDef.unitCostFormula, ctx);
    } else {
      continue;
    }

    // Step 5 — apply override if present
    const unitCost =
      rateOverrides[rateKey] !== undefined ? rateOverrides[rateKey] : baseUnitCost;

    const qtyRounded = Math.round(qty * 100) / 100;
    items.push({
      id: `${asmDef.id}__li_${i}`,
      rateKey,
      label,
      unit,
      category,
      qty: qtyRounded,
      unitCost,
      baseUnitCost,
      total: Math.round(qtyRounded * unitCost * 100) / 100,
      isOverridden: rateOverrides[rateKey] !== undefined,
      isCustom: !!liDef.customItem,
    });
  }

  return items;
}

// =============================================================================
// STORAGE — localStorage with upgrade path to Supabase
// =============================================================================
const STORAGE_KEY = "tradescope_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// =============================================================================
// UTILITIES
// =============================================================================
const $ = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);

const $2 = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);

const pct = (n) => `${(n * 100).toFixed(0)}%`;

let _id = Date.now();
const uid = () => `ts_${_id++}`;

// Human-readable labels for select options
const OPTION_LABELS = {
  lvp: "LVP (Luxury Vinyl Plank)",
  hardwood: "Hardwood",
  tile: "Tile",
  none: "None",
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
  standard: "Standard TI",
  selective: "Selective",
  basic: "Basic Painted Base Cabinetry",
  service_counter: "Retail Service Counter",
  midgrade_casework: "Mid-Grade Laminate Casework",
  premium_custom: "Premium Custom Millwork",
};

// Assembly groups for the palette
const GROUPS = ["Structural", "Finishes", "Demo", "Ceilings", "MEP", "Specialties"];

// Group colors
const GROUP_COLOR = {
  Structural: "bg-slate-100 text-slate-700",
  Finishes:   "bg-emerald-50 text-emerald-700",
  Demo:       "bg-red-50 text-red-700",
  Ceilings:   "bg-sky-50 text-sky-700",
  MEP:        "bg-amber-50 text-amber-700",
  Specialties:"bg-purple-50 text-purple-700",
};

// =============================================================================
// COMPONENT: TierSelector
// =============================================================================
function TierSelector({ tier, onChange }) {
  const tiers = [
    { key: "low",  label: "Low",  active: "bg-emerald-500 text-white", dot: "bg-emerald-500" },
    { key: "mid",  label: "Mid",  active: "bg-blue-500 text-white",    dot: "bg-blue-500" },
    { key: "high", label: "High", active: "bg-amber-500 text-white",   dot: "bg-amber-500" },
  ];
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400 text-xs mr-1">Pricing:</span>
      <div className="flex rounded-lg overflow-hidden border border-gray-600">
        {tiers.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              tier === t.key ? t.active : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: AssemblyPalette (left panel)
// =============================================================================
function AssemblyPalette({ onAdd }) {
  const byGroup = {};
  GROUPS.forEach((g) => {
    byGroup[g] = DB.assemblies.filter((a) => a.group === g);
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="px-3 py-3 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assembly Palette</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-1">
              {group}
            </p>
            <div className="space-y-0.5">
              {byGroup[group].map((def) => (
                <button
                  key={def.id}
                  onClick={() => onAdd(def)}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-2 text-xs rounded-md
                    border border-transparent hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
                    text-gray-700 bg-white border-gray-200 transition-all ${GROUP_COLOR[group]}`}
                >
                  <Plus className="w-3 h-3 flex-shrink-0 opacity-60" />
                  <span className="truncate font-medium">{def.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: AssemblyFormModal
// Dynamically generates form fields from JSON input definitions.
// =============================================================================
function AssemblyFormModal({ asmDef, initialInputs, onSave, onClose }) {
  const getDefault = (inp) => {
    if (initialInputs && initialInputs[inp.key] !== undefined) {
      // For percent fields, display as 0–100
      if (inp.type === "percent") return (initialInputs[inp.key] * 100).toFixed(1);
      return initialInputs[inp.key];
    }
    if (inp.default !== undefined) {
      if (inp.type === "percent") return (inp.default * 100).toFixed(1);
      return inp.default;
    }
    if (inp.type === "boolean") return false;
    if (inp.type === "number" || inp.type === "percent") return "";
    if (inp.type === "select") return inp.options[0];
    return "";
  };

  const [vals, setVals] = useState(() => {
    const init = {};
    asmDef.inputs.forEach((inp) => { init[inp.key] = getDefault(inp); });
    return init;
  });

  const set = (key, val) => setVals((v) => ({ ...v, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = {};
    asmDef.inputs.forEach((inp) => {
      if (inp.type === "number") {
        parsed[inp.key] = parseFloat(vals[inp.key]) || 0;
      } else if (inp.type === "percent") {
        // Store as decimal (0–1)
        parsed[inp.key] = (parseFloat(vals[inp.key]) || 0) / 100;
      } else {
        parsed[inp.key] = vals[inp.key];
      }
    });
    onSave(parsed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {initialInputs ? "Edit" : "Add"} — {asmDef.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Enter quantities to generate line items
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {asmDef.inputs.map((inp) => (
            <div key={inp.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {inp.label}
                {inp.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {(inp.type === "number" || inp.type === "percent") && (
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required={inp.required}
                    value={vals[inp.key]}
                    onChange={(e) => set(inp.key, e.target.value)}
                    placeholder={inp.default !== undefined ? `Default: ${inp.type === "percent" ? (inp.default * 100).toFixed(0) : inp.default}` : ""}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {inp.type === "percent" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  )}
                </div>
              )}

              {inp.type === "boolean" && (
                <button
                  type="button"
                  onClick={() => set(inp.key, !vals[inp.key])}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    vals[inp.key]
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    vals[inp.key] ? "bg-blue-500 border-blue-500" : "border-gray-400"
                  }`}>
                    {vals[inp.key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {vals[inp.key] ? "Yes — Included" : "No — Excluded"}
                </button>
              )}

              {inp.type === "select" && (
                <select
                  value={vals[inp.key]}
                  onChange={(e) => set(inp.key, e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {inp.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {OPTION_LABELS[opt] || opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {initialInputs ? "Update Assembly" : "Add to Estimate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: LineItemRow — single row in the assembly cost table
// =============================================================================
function LineItemRow({ item, onOverride, onResetOverride }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");

  const startEdit = () => {
    setEditVal(item.unitCost.toFixed(2));
    setEditing(true);
  };

  const commit = () => {
    const v = parseFloat(editVal);
    if (!isNaN(v) && v >= 0) onOverride(item.rateKey, v);
    setEditing(false);
  };

  return (
    <tr className={`group transition-colors ${item.isOverridden ? "bg-amber-50/60" : "hover:bg-gray-50/80"}`}>
      {/* Description */}
      <td className="py-2 pl-5 pr-3 text-sm">
        <div className="flex items-start gap-1.5">
          {item.isOverridden && (
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Rate overridden" />
          )}
          <div>
            <span className="text-gray-800">{item.label}</span>
            <span className="block text-[11px] text-gray-400">{item.category}</span>
          </div>
        </div>
      </td>

      {/* Quantity */}
      <td className="py-2 px-3 text-sm text-right text-gray-500 tabular-nums whitespace-nowrap">
        {item.qty.toLocaleString()} <span className="text-gray-400">{item.unit}</span>
      </td>

      {/* Unit Cost (editable) */}
      <td className="py-2 px-3 text-sm text-right tabular-nums">
        {editing ? (
          <div className="flex items-center justify-end gap-0.5">
            <span className="text-gray-400 text-xs">$</span>
            <input
              autoFocus
              type="number"
              step="0.01"
              min="0"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-20 px-1.5 py-0.5 text-right border border-blue-400 rounded text-sm focus:outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <span className={item.isOverridden ? "text-amber-600 font-medium" : "text-gray-600"}>
              {$2(item.unitCost)}
            </span>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={startEdit}
                className="p-0.5 text-gray-400 hover:text-blue-500"
                title="Override rate"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {item.isOverridden && !item.isCustom && (
                <button
                  onClick={() => onResetOverride(item.rateKey)}
                  className="p-0.5 text-amber-400 hover:text-amber-600"
                  title="Reset to default"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </td>

      {/* Total */}
      <td className="py-2 pl-3 pr-5 text-sm text-right font-semibold text-gray-800 tabular-nums">
        {$(item.total)}
      </td>
    </tr>
  );
}

// =============================================================================
// COMPONENT: AssemblyCard
// =============================================================================
function AssemblyCard({ instance, asmDef, tier, rateOverrides, onEdit, onRemove, onRateOverride, onResetRateOverride }) {
  const [collapsed, setCollapsed] = useState(false);

  const lineItems = useMemo(
    () => computeLineItems(asmDef, instance.inputs, tier, rateOverrides),
    [asmDef, instance.inputs, tier, rateOverrides]
  );

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);

  // Build a compact input summary for the card header
  const summary = asmDef.inputs
    .filter((inp) => (inp.type === "number" || inp.type === "percent") && instance.inputs[inp.key])
    .slice(0, 2)
    .map((inp) => {
      const v = instance.inputs[inp.key];
      const unit = inp.key.toLowerCase().includes("feet") ? (inp.key.includes("linear") || inp.key.includes("Linear") ? " LF" : " SF") : "";
      return `${inp.type === "percent" ? (v * 100).toFixed(0) + "%" : v}${unit}`;
    })
    .join(" · ");

  const groupColor = GROUP_COLOR[asmDef.group] || "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-100 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-gray-400 flex-shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{asmDef.name}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${groupColor}`}>
              {asmDef.group}
            </span>
            {summary && <span className="text-xs text-gray-400">{summary}</span>}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-bold text-gray-900 text-sm tabular-nums">{$(subtotal)}</div>
        </div>

        {/* Actions — stop propagation so they don't toggle collapse */}
        <div className="flex items-center gap-0.5 ml-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(instance)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit assembly"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(instance.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove assembly"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Line items table */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 pl-5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-2 px-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="py-2 px-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="py-2 pl-3 pr-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onOverride={onRateOverride}
                  onResetOverride={onResetRateOverride}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50/50">
                <td
                  colSpan={3}
                  className="py-2.5 pl-5 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Assembly Subtotal
                </td>
                <td className="py-2.5 pl-3 pr-5 text-sm font-bold text-gray-900 text-right tabular-nums">
                  {$(subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT: SettingsModal
// =============================================================================
function SettingsModal({ settings, onUpdate, onClose }) {
  const [local, setLocal] = useState({ ...settings });
  const setField = (key, val) => setLocal((s) => ({ ...s, [key]: val }));

  const fields = [
    { key: "contingencyPct", label: "Contingency", hint: "Applied to direct costs" },
    { key: "overheadPct",    label: "Overhead",    hint: "Applied after contingency" },
    { key: "profitPct",      label: "Profit",      hint: "Applied after contingency" },
    { key: "salesTaxPct",    label: "Sales Tax",   hint: "Applied to direct costs" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Estimate Settings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Modifiers applied to all line items</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{hint}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={(local[key] * 100).toFixed(1)}
                  onChange={(e) => setField(key, parseFloat(e.target.value) / 100 || 0)}
                  className="w-20 px-2 py-1.5 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400 w-4">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { onUpdate(local); onClose(); }}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: SummaryPanel (right panel)
// =============================================================================
function SummaryPanel({ instances, tier, rateOverrides, settings, onSettingsOpen }) {
  // Compute all line items across all assemblies
  const allItems = useMemo(() => {
    return instances.flatMap((inst) => {
      const def = DB.assemblies.find((a) => a.id === inst.assemblyId);
      if (!def) return [];
      return computeLineItems(def, inst.inputs, tier, rateOverrides);
    });
  }, [instances, tier, rateOverrides]);

  const directCosts = allItems.reduce((s, i) => s + i.total, 0);
  const contingency = directCosts * settings.contingencyPct;
  const costBase = directCosts + contingency;
  const overhead = costBase * settings.overheadPct;
  const profit = costBase * settings.profitPct;
  const tax = directCosts * settings.salesTaxPct;
  const totalSell = costBase + overhead + profit + tax;
  const grossMargin = totalSell > 0 ? ((totalSell - directCosts) / totalSell) * 100 : 0;

  // By category
  const byCategory = {};
  allItems.forEach((item) => {
    byCategory[item.category] = (byCategory[item.category] || 0) + item.total;
  });
  const sortedCats = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  const tierBadge = {
    low:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    mid:  "bg-blue-100 text-blue-700 border-blue-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">Cost Summary</h2>
          <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${tierBadge[tier]}`}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Pricing
          </span>
        </div>
        <button
          onClick={onSettingsOpen}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {directCosts === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Building2 className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">Add assemblies to see cost summary</p>
          </div>
        ) : (
          <>
            {/* Breakdown */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Breakdown
              </p>
              <div className="space-y-2.5">
                <Row label="Direct Costs" value={$(directCosts)} bold />
                <Row
                  label={`Contingency (${pct(settings.contingencyPct)})`}
                  value={`+ ${$(contingency)}`}
                  sub
                />
                <div className="border-t border-gray-100 pt-2.5">
                  <Row label="Cost w/ Contingency" value={$(costBase)} bold />
                </div>
                <Row
                  label={`Overhead (${pct(settings.overheadPct)})`}
                  value={`+ ${$(overhead)}`}
                  sub
                />
                <Row
                  label={`Profit (${pct(settings.profitPct)})`}
                  value={`+ ${$(profit)}`}
                  sub
                />
                {settings.salesTaxPct > 0 && (
                  <Row
                    label={`Tax (${pct(settings.salesTaxPct)})`}
                    value={`+ ${$(tax)}`}
                    sub
                  />
                )}
              </div>

              {/* Total */}
              <div className="mt-4 pt-3 border-t-2 border-gray-900">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-sm">Total Sell Price</span>
                  <span className="font-black text-gray-900 text-xl tabular-nums">{$(totalSell)}</span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Gross Margin</span>
                  <span className="tabular-nums font-medium">{grossMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* By Trade */}
            {sortedCats.length > 0 && (
              <div className="px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  By Trade
                </p>
                <div className="space-y-3">
                  {sortedCats.map(([cat, amt]) => {
                    const barPct = directCosts > 0 ? (amt / directCosts) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium truncate">{cat}</span>
                          <span className="text-gray-500 tabular-nums ml-2 flex-shrink-0">{$(amt)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 text-right mt-0.5">
                          {barPct.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Small helper for summary rows
function Row({ label, value, bold, sub }) {
  return (
    <div className={`flex items-center justify-between ${sub ? "pl-2" : ""}`}>
      <span className={`text-xs ${bold ? "font-semibold text-gray-800" : "text-gray-500"}`}>
        {label}
      </span>
      <span className={`text-xs tabular-nums ${bold ? "font-semibold text-gray-800" : "text-gray-500"}`}>
        {value}
      </span>
    </div>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================
const DEFAULT_SETTINGS = {
  projectName: "New Estimate",
  ...DB.estimateDefaults,
};

export default function TradeScope() {
  // ── State ────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(() => {
    const saved = loadState();
    return saved?.settings ?? { ...DEFAULT_SETTINGS };
  });
  const [instances, setInstances] = useState(() => {
    const saved = loadState();
    return saved?.instances ?? [];
  });
  // Global rate overrides — keyed by rateKey, applied across all assemblies
  const [rateOverrides, setRateOverrides] = useState(() => {
    const saved = loadState();
    return saved?.rateOverrides ?? {};
  });

  // UI modals
  const [addingDef, setAddingDef] = useState(null);
  const [editingPair, setEditingPair] = useState(null); // { instance, def }
  const [showSettings, setShowSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);

  // ── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => {
    persistState({ settings, instances, rateOverrides });
  }, [settings, instances, rateOverrides]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const addAssembly = (def, inputs) => {
    setInstances((prev) => [
      ...prev,
      { id: uid(), assemblyId: def.id, inputs },
    ]);
    setAddingDef(null);
  };

  const updateAssembly = (id, inputs) => {
    setInstances((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inputs } : i))
    );
    setEditingPair(null);
  };

  const removeAssembly = (id) => {
    setInstances((prev) => prev.filter((i) => i.id !== id));
  };

  const setRateOverride = (rateKey, val) => {
    setRateOverrides((prev) => ({ ...prev, [rateKey]: val }));
  };

  const resetRateOverride = (rateKey) => {
    setRateOverrides((prev) => {
      const next = { ...prev };
      delete next[rateKey];
      return next;
    });
  };

  const clearEstimate = () => {
    if (window.confirm("Clear all assemblies from this estimate?")) {
      setInstances([]);
      setRateOverrides({});
    }
  };

  const tier = settings.pricingTier;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ── Header ── */}
      <header className="bg-gray-900 text-white flex items-center gap-4 px-5 py-2.5 flex-shrink-0 shadow-lg z-10">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="font-black text-base tracking-tight">TradeScope</span>
          <span className="text-gray-600 text-xs">· San Diego, CA</span>
        </div>

        <div className="h-4 w-px bg-gray-700" />

        {/* Project name */}
        {editingName ? (
          <input
            autoFocus
            type="text"
            value={settings.projectName}
            onChange={(e) => setSettings((s) => ({ ...s, projectName: e.target.value }))}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 outline-none w-52"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white group"
          >
            <span>{settings.projectName}</span>
            <Edit2 className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
          </button>
        )}

        <div className="flex-1" />

        {/* Assembly count */}
        {instances.length > 0 && (
          <span className="text-xs text-gray-500 hidden sm:block">
            {instances.length} assembl{instances.length === 1 ? "y" : "ies"}
          </span>
        )}

        {/* Clear button */}
        {instances.length > 0 && (
          <button
            onClick={clearEstimate}
            className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded hidden sm:block"
          >
            Clear
          </button>
        )}

        <div className="h-4 w-px bg-gray-700" />

        {/* Tier selector */}
        <TierSelector
          tier={tier}
          onChange={(t) => setSettings((s) => ({ ...s, pricingTier: t }))}
        />
      </header>

      {/* ── 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Assembly palette */}
        <div className="w-48 flex-shrink-0">
          <AssemblyPalette onAdd={(def) => setAddingDef(def)} />
        </div>

        {/* CENTER: Estimate view */}
        <div className="flex-1 overflow-y-auto">
          {instances.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 pb-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-1">No assemblies yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Select an assembly from the left panel to start building your estimate.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                All costs are driven by the JSON rate database — no hardcoded values.
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3 max-w-3xl">
              {instances.map((inst) => {
                const def = DB.assemblies.find((a) => a.id === inst.assemblyId);
                if (!def) return null;
                return (
                  <AssemblyCard
                    key={inst.id}
                    instance={inst}
                    asmDef={def}
                    tier={tier}
                    rateOverrides={rateOverrides}
                    onEdit={(inst) => setEditingPair({ instance: inst, def })}
                    onRemove={removeAssembly}
                    onRateOverride={setRateOverride}
                    onResetRateOverride={resetRateOverride}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Summary panel */}
        <div className="w-60 flex-shrink-0">
          <SummaryPanel
            instances={instances}
            tier={tier}
            rateOverrides={rateOverrides}
            settings={settings}
            onSettingsOpen={() => setShowSettings(true)}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {addingDef && (
        <AssemblyFormModal
          asmDef={addingDef}
          initialInputs={null}
          onSave={(inputs) => addAssembly(addingDef, inputs)}
          onClose={() => setAddingDef(null)}
        />
      )}

      {editingPair && (
        <AssemblyFormModal
          asmDef={editingPair.def}
          initialInputs={editingPair.instance.inputs}
          onSave={(inputs) => updateAssembly(editingPair.instance.id, inputs)}
          onClose={() => setEditingPair(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
