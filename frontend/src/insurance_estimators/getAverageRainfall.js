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

    // Initialize season sums and counts
    let seasons = { Winter: [0, 0], Spring: [0, 0], Summer: [0, 0], Fall: [0, 0] };
    let seasonDays = { Winter: new Set(), Spring: new Set(), Summer: new Set(), Fall: new Set() };

    // Loop through the data and update season sums and counts
    for (let i = 0; i < data.hourly.time.length; i++) {
        let date = new Date(data.hourly.time[i]);
        let rain = data.hourly.rain[i];
        let season;

        // Adjust seasons based on the hemisphere
        if (latitude >= 0) {
            // Northern Hemisphere
            if (date.getMonth() < 2 || date.getMonth() === 11) season = "Winter";
            else if (date.getMonth() < 5) season = "Spring";
            else if (date.getMonth() < 8) season = "Summer";
            else season = "Fall";
        } else {
            // Southern Hemisphere
            if (date.getMonth() < 2 || date.getMonth() === 11) season = "Summer";
            else if (date.getMonth() < 5) season = "Fall";
            else if (date.getMonth() < 8) season = "Winter";
            else season = "Spring";
        }

        // Update season sums and counts
        seasons[season][0] += rain;
        seasons[season][1] += 1;

        // Update season day counts
        seasonDays[season].add(date.toISOString().split("T")[0]);
    }

    // Calculate averages
    let averages = {};
    for (let season in seasons) {
        averages[season] = seasons[season][0] / seasonDays[season].size;
    }

    return averages;
}

module.exports = getAverageRainfall;
