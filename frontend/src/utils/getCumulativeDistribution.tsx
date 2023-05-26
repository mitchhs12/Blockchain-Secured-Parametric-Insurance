export function normDist(x: number, mean: number, stdDev: number, cumulative: boolean) {
    // Normal Distribution Factor
    var factor = 1 / Math.sqrt(2 * Math.PI * Math.pow(stdDev, 2));

    // Exponential part of formula
    var expFactor = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));

    var pdf = factor * expFactor;

    if (cumulative) {
        var z = (x - mean) / stdDev;
        var cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));
        return cdf;
    } else {
        return pdf;
    }
}

function erf(x: number) {
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    var t = 1.0 / (1.0 + p * x);
    var y = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;

    return sign * (1 - y * Math.exp(-x * x));
}
module.exports = normDist;
