const getKoppenGeigerZones = require("@/utils/getKoppenGeigerZones");
const getAverageRainfall = require("../insurance_estimators/getAverageRainfall");

function sinCurveNothern(x) {
    // returns a multiplier between 1 and 2 given a day of the year.
    const pi = Math.PI;
    const term1 = (2 * pi * x) / 365.25;
    const term2 = 365.25 / 4 / 2;
    const term3 = (2 * pi) / 365.25;
    const result = 0.5 * Math.sin(term1 + term2 * term3) + 1.5;
    return result;
}
function sinCurveSouthern(x) {
    // returns a multiplier between 1 and 2 given a day of the year.
    const pi = Math.PI;
    const term1 = (2 * pi * x) / 365.25;
    const term2 = 365.25 / 4 / 2;
    const term3 = (2 * pi) / 365.25;
    const term4 = 365.25 / 2;
    const result = 0.5 * Math.sin(term1 + (term2 + term4) * term3) + 1.5;
    return result;
}

export function estimateRainfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center) {
    console.log(rectangleBounds);
    console.log(area);
    console.log(dateRange);
    console.log(aboveOrBelow);
    console.log(inputValue);
    console.log(center);

    getKoppenGeigerZones(rectangleBounds)
        .then(({ zone, description }) => {
            console.log("Zone: ", zone);
            console.log("Description: ", description);
        })
        .catch((err) => console.error(err));

    getAverageRainfall(dateRange.from, center.lat, center.lng)
        .then((cutoffs) => {
            for (let season in cutoffs) {
                console.log(`Season: ${season}, Cutoff: ${cutoffs[season]}`);
            }
        })
        .catch((err) => {
            console.error(err);
        });
}
