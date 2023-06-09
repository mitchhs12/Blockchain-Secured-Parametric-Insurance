const fetch = require("node-fetch");

// Assuming this is an async function
async function fetchWeatherData() {
    const latCenter = "51.50736895638911";
    const longCenter = "-0.12078505578148935";
    const startDay = "2023-06-07";
    const endDate = "2023-06-08";
    // Ensure that we do not search beyond today's date
    //let endDate = Number(currentDayString) < Number(endDayString) ? currentDay : endDay;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latCenter}&longitude=${longCenter}&start_date=${startDay}&end_date=${endDate}&hourly=rain`;
    console.log(url);

    try {
        const response = await fetch(url);
        const data = await response.json();

        let dailyRainfall = {};

        for (let i = 0; i < data.hourly.time.length; i++) {
            let date = data.hourly.time[i];
            let rain = data.hourly.rain[i];

            if (rain === null || rain === 0) {
                continue;
            }

            let daysDate = date.substring(0, 10);
            if (!dailyRainfall[daysDate]) {
                dailyRainfall[daysDate] = 0;
            }

            dailyRainfall[daysDate] += rain;
        }

        // Check if rainfall on any day exceeds the seasonal limit
        for (let day in dailyRainfall) {
            let season = getSeason(day, latCenter);
            if (dailyRainfall[day] > inputValue) {
                console.log(season);

                return season;
            }
        }
        console.log(false);
        return false;
    } catch (error) {
        console.error("Request Failed!", error);
    }
}
fetchWeatherData()
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
