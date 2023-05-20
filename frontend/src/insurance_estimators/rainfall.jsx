const getKoppenGeigerZones = require("../utils/getKoppenGeigerZones");
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

    // Af (Tropical rainforest): 30 (2000-3000mm/y)
    // Am (Tropical monsoon): 29 (1800-2500mm/y)
    // As (Tropical savanna, dry summer): 28 (700-1300mm/y)
    // Aw (Tropical savanna, dry winter): 27 (700-1300mm/y)
    // BWh (Desert, hot): 1 (<250mm/y)
    // BWk (Desert, cold): 2 (<250mm/y)
    // BSh (Steppe, hot): 5 (250-500mm/y)
    // BSk (Steppe, cold): 6 (250-500mm/y)
    // Csa (Mediterranean, hot summer): 12 (400-800mm/y)
    // Csb (Mediterranean, warm summer): 13 (500-900/y)
    // Csc (Mediterranean, cool summer): 14 (600-1000/y)
    // Cwa (Humid subtropical, dry winter): 26 (800-1400mm/y)
    // Cwb (Subtropical highland, dry winter): 25 (800-1200mm/y)
    // Cwc (Subtropical highland, very dry winter): 24 (800-1200mm/y)
    // Cfa (Humid subtropical, no dry season): 28 (1000-2000mm/y)
    // Cfb (Marine, warm summer): 22 (800-1400mm/y)
    // Cfc (Marine, cool summer): 21 (800-1400mm/y)
    // Dsa (Hot-summer humid continental): 17 (400-800mm/y)
    // Dsb (Warm-summer humid continental): 18 (500-900mm/y)
    // Dsc (Cool-summer humid continental): 19 (600-1000mm/y)
    // Dsd (Continental subarctic, extremely dry winter): 20 (500-900mm/y)
    // Dwa (Humid continental, dry winter, hot summer): 16 (600-1000mm/y)
    // Dwb (Humid continental, dry winter, warm summer): 15 (700-1100mm/y)
    // Dwc (Humid continental, dry winter, cool summer): 14 (700-1100mm/y)
    // Dwd (Humid continental, dry winter, extremely dry winter): 13 (600-1200mm/y)
    // Dfa (Humid continental, no dry season, hot summer): 23 (700-1200mm/y)
    // Dfb (Humid continental, no dry season, warm summer): 24 (500-900mm/y)
    // Dfc (Subarctic, no dry season, cool summer): 11 (400-800mm/y)
    // Dfd (Subarctic, no dry season, extremely cold winter): 10 (400-800mm/y)
    // ET (Tundra): 8 (200-600mm/y)
    // EF (Ice cap): 7 (<200mm/y)
}
