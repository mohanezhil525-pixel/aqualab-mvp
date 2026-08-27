// Hardcoded thresholds standing in for a real regulatory rule engine.
// Loosely based on common drinking-water limits — swap for the real
// standard your lab reports against before this goes near production.
//
// min: null  -> no lower bound checked
// max: null  -> no upper bound checked
const THRESHOLDS = {
  pH:               { min: 6.5,  max: 8.5,  unit: "pH" },
  turbidity:        { min: null, max: 5,    unit: "NTU" },
  tds:              { min: null, max: 500,  unit: "mg/L" },
  chlorine_residual:{ min: 0.2,  max: 1.0,  unit: "mg/L" },
  coliform_count:   { min: null, max: 0,    unit: "CFU/100mL" },
  nitrate:          { min: null, max: 45,   unit: "mg/L" },
};

const DEFAULT_THRESHOLD = { min: null, max: null, unit: null };

/**
 * Look up the threshold for a parameter, and say whether a value is
 * compliant. Parameters with no configured threshold default to
 * compliant=true (nothing to check against) rather than blocking entry.
 */
function evaluateCompliance(parameter, value) {
  const t = THRESHOLDS[parameter] || DEFAULT_THRESHOLD;
  const numericValue = Number(value);

  let isCompliant = true;
  if (t.min !== null && numericValue < t.min) isCompliant = false;
  if (t.max !== null && numericValue > t.max) isCompliant = false;

  return {
    isCompliant,
    thresholdMin: t.min,
    thresholdMax: t.max,
    defaultUnit: t.unit,
  };
}

module.exports = { THRESHOLDS, evaluateCompliance };
