/**
 * Carbon Credit Calculator
 *
 * Scientific Constants:
 *   0.47 — Average carbon fraction of biomass
 *   3.67 — Molecular weight ratio of CO₂ to Carbon (44/12)
 *   0.85 — 15% buffer deduction to prevent over-crediting
 *
 * Formula:
 *   Credits = Area × BiomassFactor × 0.47 × 3.67 × (SurvivalRate/100) × 0.85
 */
function calculateCarbonCredits(area, biomassFactor, survivalRate) {
    const biomass = area * biomassFactor;
    const carbon = biomass * 0.47;
    const co2 = carbon * 3.67;
    const adjustedCo2 = co2 * (survivalRate / 100);
    const finalCo2 = adjustedCo2 * 0.85;
    const credits = Math.round(finalCo2);

    return {
        biomass: parseFloat(biomass.toFixed(4)),
        carbon: parseFloat(carbon.toFixed(4)),
        co2: parseFloat(co2.toFixed(4)),
        adjustedCo2: parseFloat(adjustedCo2.toFixed(4)),
        finalCo2: parseFloat(finalCo2.toFixed(4)),
        credits,
    };
}

module.exports = calculateCarbonCredits;
