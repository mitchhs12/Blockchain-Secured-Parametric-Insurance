import { privateDecrypt } from "crypto";
import { calculateOverrideValues } from "next/dist/server/font-utils";
const normDist = require("@/utils/getCumulativeDistribution");
const getKoppenGeigerZones = require("@/utils/getKoppenGeigerZones");
const getAverageRainfall = require("../insurance_estimators/getAverageRainfall");

function sinCurveNothern(x) {
    // returns a multiplier between 1 and 2 given a day of the year.
    const pi = Math.PI;
    const term1 = (2 * pi * x) / 365.25;
    const term2 = 365.25 / 4 / 2;
    const term3 = (2 * pi) / 365.25;
    const result = 0.5 * Math.sin(term1 + term2 * term3) + 1.5;
    console.log(result);
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
    console.log(result);
    return result;
}

function getDayOfYear(x) {
    var date = new Date(x);
    var year = date.getFullYear();
    var firstDayOfYear = new Date(year, 0, 1);
    var timeDifference = date.getTime() - firstDayOfYear.getTime();
    var dayOfYear = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return dayOfYear;
}

function calculateDailyPrice(sinVar, dayNumber, cutoff, area, inputValue) {
    const mlExcess = (inputValue - cutoff) / 2; // adjusts cutoff
    const constant = 500;
    const exponent = Math.exp(mlExcess * (constant ^ (sinVar / dayNumber)));
    console.log(exponent);
    const result = exponent * (area ^ 4) + sinVar;
    console.log(result);
    return result;
}

function calculatePayout(cutoff, averages, sds, area, inputValue, sum) {
    const actualRainfall = inputValue + 1;
    console.log("actualRainfall: ", actualRainfall);
    let additionalCheck = 1;

    const payouts = {};
    for (let season in averages) {
        const mlExcess = (inputValue - cutoff[season]) / 2; // adjusts cutoff
        if (inputValue < mlExcess) {
            additionalCheck = inputValue / Math.pow(mlExcess, 2);
        }

        console.log(`Season: ${season}, Mean: ${averages[season]}, SD: ${sds[season]}`);
        const pActualRainfall = normDist(actualRainfall, averages[season], sds[season], true);
        console.log(`Probability of Actual Rainfall: ${pActualRainfall}`);
        const pMyRainfall = normDist(inputValue, averages[season], sds[season], true);
        console.log(`Probability of My Rainfall: ${pMyRainfall}`);
        const pDifference = (1 - (pActualRainfall - pMyRainfall)) * sum;
        let firstTest, secondTest;
        // checks if rainFall is <= actualRainfall
        if (actualRainfall <= inputValue) {
            firstTest = 0;
        } else {
            firstTest = 1;
        }
        // checks if inputValue is < cutoff/2
        if (inputValue < cutoff / 2) {
            secondTest = inputValue / Math.pow(cutoff / 2, 2);
        } else {
            secondTest = 1;
        }
        const payout = pDifference - mlExcess * (1 / area) * (firstTest * secondTest);
        payouts[season] = payout;
    }
    return payouts;
}

export async function estimateRainfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center) {
    console.log(rectangleBounds);
    console.log(area);
    console.log(dateRange);
    console.log(aboveOrBelow);
    console.log(inputValue);
    console.log(center);

    try {
        // const { zone, description } = await getKoppenGeigerZones(rectangleBounds);
        // console.log("Zone: ", zone);
        // console.log("Description: ", description);

        const { cutoffs, averages, sds } = await getAverageRainfall(dateRange.from, center.lat, center.lng);
        for (let season in cutoffs) {
            console.log(`Season: ${season}, Cutoff: ${cutoffs[season]}`);
        }
        let startDateIndex = getDayOfYear(dateRange.from);
        console.log("Start Day of Year:", startDateIndex);
        let endDateIndex = getDayOfYear(dateRange.to);
        console.log("End Day of Year:", endDateIndex);
        var timeDifference = dateRange.to.getTime() - dateRange.from.getTime();
        var daysDifference = timeDifference / (1000 * 3600 * 24);

        var currentDate = dateRange.from;
        var season;
        var dayNumber = 0;
        let sinVar;
        let dailyPrice = [];

        while (currentDate <= dateRange.to) {
            console.log(currentDate);

            if (center.lat > 0) {
                // Northern Hemisphere
                if (
                    (currentDate.getMonth() === 11 && currentDate.getDate() >= 21) ||
                    currentDate.getMonth() < 2 ||
                    (currentDate.getMonth() === 2 && currentDate.getDate() < 20)
                )
                    season = "Winter";
                else if (
                    (currentDate.getMonth() === 2 && currentDate.getDate() >= 20) ||
                    currentDate.getMonth() < 5 ||
                    (currentDate.getMonth() === 5 && currentDate.getDate() < 20)
                )
                    season = "Spring";
                else if (
                    (currentDate.getMonth() === 5 && currentDate.getDate() >= 20) ||
                    currentDate.getMonth() < 8 ||
                    (currentDate.getMonth() === 8 && currentDate.getDate() < 22)
                )
                    season = "Summer";
                else season = "Fall";
                sinVar = sinCurveNothern(dayNumber);
            } else {
                // Southern Hemisphere
                if (
                    (currentDate.getMonth() === 11 && currentDate.getDate() >= 21) ||
                    currentDate.getMonth() < 2 ||
                    (currentDate.getMonth() === 2 && currentDate.getDate() < 20)
                )
                    season = "Summer";
                else if (
                    (currentDate.getMonth() === 2 && currentDate.getDate() >= 20) ||
                    currentDate.getMonth() < 5 ||
                    (currentDate.getMonth() === 5 && currentDate.getDate() < 20)
                )
                    season = "Fall";
                else if (
                    (currentDate.getMonth() === 5 && currentDate.getDate() >= 20) ||
                    currentDate.getMonth() < 8 ||
                    (currentDate.getMonth() === 8 && currentDate.getDate() < 22)
                )
                    season = "Winter";
                else season = "Spring";
                sinVar = sinCurveSouthern(dayNumber);
            }
            dailyPrice.push({
                date: new Date(currentDate),
                price: calculateDailyPrice(sinVar, dayNumber, cutoffs[season], area, Number(inputValue)),
            });
            console.log(dayNumber, season, cutoffs[season]);
            currentDate.setDate(currentDate.getDate() + 1);
            dayNumber++;
        }

        // Sum
        const sum = dailyPrice.reduce((accumulator, currentObject) => accumulator + currentObject.price, 0);
        // Average
        const average = sum / dailyPrice.length;

        const payouts = calculatePayout(cutoffs, averages, sds, area, Number(inputValue), sum);
        console.log("Payout: ", payouts);
        console.log("Sum of daily prices: ", sum);
        console.log("Average daily price: ", average);
        return { sum, average, payouts };
    } catch (error) {
        console.error(error);
    }
}
