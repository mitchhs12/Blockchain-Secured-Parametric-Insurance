async function getAverageRainfall(startDate, latitude, longitude) {
    // Calculate one year ago date
    let oneYearAgoDate = new Date(startDate);
    oneYearAgoDate.setFullYear(startDate.getFullYear() - 1);

    // Build the URL
    let url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${
        oneYearAgoDate.toISOString().split("T")[0]
    }&end_date=${startDate.toISOString().split("T")[0]}&hourly=rain`;

    // Fetch data from the URL
    let response = await fetch(url);
    let data = await response.json();

    // Initialize season sums, counts and data arrays
    let seasonsData = { Winter: [], Spring: [], Summer: [], Fall: [] };

    // Loop through the data and update season data arrays
    for (let i = 0; i < data.hourly.time.length; i++) {
        let date = new Date(data.hourly.time[i]);
        let rain = data.hourly.rain[i];

        // If rain is null or 0, skip the iteration
        if (rain === null || rain === 0) {
            continue;
        }

        let season;
        let dateStr = date.toISOString().split("T")[0]; // to get the date part only

        // Adjust seasons based on the hemisphere and solstice/equinox dates
        if (latitude >= 0) {
            // Northern Hemisphere
            if (
                (date.getMonth() === 11 && date.getDate() >= 21) ||
                date.getMonth() < 2 ||
                (date.getMonth() === 2 && date.getDate() < 20)
            )
                season = "Winter";
            else if (
                (date.getMonth() === 2 && date.getDate() >= 20) ||
                date.getMonth() < 5 ||
                (date.getMonth() === 5 && date.getDate() < 20)
            )
                season = "Spring";
            else if (
                (date.getMonth() === 5 && date.getDate() >= 20) ||
                date.getMonth() < 8 ||
                (date.getMonth() === 8 && date.getDate() < 22)
            )
                season = "Summer";
            else season = "Fall";
        } else {
            // Southern Hemisphere
            if (
                (date.getMonth() === 11 && date.getDate() >= 21) ||
                date.getMonth() < 2 ||
                (date.getMonth() === 2 && date.getDate() < 20)
            )
                season = "Summer";
            else if (
                (date.getMonth() === 2 && date.getDate() >= 20) ||
                date.getMonth() < 5 ||
                (date.getMonth() === 5 && date.getDate() < 20)
            )
                season = "Fall";
            else if (
                (date.getMonth() === 5 && date.getDate() >= 20) ||
                date.getMonth() < 8 ||
                (date.getMonth() === 8 && date.getDate() < 22)
            )
                season = "Winter";
            else season = "Spring";
        }

        if (!seasonsData[season][dateStr]) {
            seasonsData[season][dateStr] = 0; // initialize if not already present
        }

        seasonsData[season][dateStr] += rain; // accumulate daily rainfall
    }

    // Convert daily rainfall objects to arrays and calculate averages after removing outliers
    let averages = {};
    let cutoffs = {};
    for (let season in seasonsData) {
        let dailyRainfalls = Object.values(seasonsData[season]); // convert daily rainfall data to array
        let mean = dailyRainfalls.reduce((a, b) => a + b) / dailyRainfalls.length;
        let max = Math.max(...dailyRainfalls);
        let min = Math.min(...dailyRainfalls);
        let sd = Math.sqrt(
            dailyRainfalls.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / dailyRainfalls.length
        );
        console.log("season:", season, "mean:", mean, "sd:", sd, "max:", max, "min:", min);

        // outliers: remove values that are more than 3 standard deviations away from the mean
        let lowerCutoff = mean - 3 * sd;
        let upperCutoff = mean + 3 * sd;
        let filteredData = dailyRainfalls.filter((rain) => rain >= lowerCutoff && rain <= upperCutoff);

        // calculate new average and new cutoff: 99.7% chance that it will not rain this much in a day in a given season
        averages[season] = filteredData.reduce((a, b) => a + b) / filteredData.length;
        cutoffs[season] = averages[season] + 3 * sd; // 99.7% chance that it will not rain this much in a day in a given season
    }
    return cutoffs;
}

module.exports = getAverageRainfall;
