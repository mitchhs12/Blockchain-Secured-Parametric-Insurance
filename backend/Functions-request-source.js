// This example shows how to make a decentralized price feed using multiple APIs

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const latNe = args[0]
const longNe = args[1]
const latSe = args[2]
const longSe = args[3]
const latSw = args[4]
const longSw = args[5]
const latNw = args[6]
const longNw = args[7]
const configParam = args[8]
const currentDayString = args[9]
const startDayString = args[10]
const endDayString = args[11]

// Changes to the arguments
const latCenter = (parseFloat(latNe) + parseFloat(latSe) + parseFloat(latSw) + parseFloat(latNw)) / 4
const longCenter = (parseFloat(longNe) + parseFloat(longSe) + parseFloat(longSw) + parseFloat(longNw)) / 4
let currentDay = new Date(currentDayString)
let startDay = new Date(startDayString)
let endDay = new Date(endDayString)
console.log(startDay)

// Functions
async function getAverageRainfall(startDay, latCenter, longCenter) {
  console.log(latCenter, longCenter, startDay)

  // Calculate one year ago date
  let n = new Date().getFullYear() - startDay.getFullYear()
  if (n == 0) {
    n++
  }
  let dataStartDate = new Date()
  let oneYearAgoDate = new Date(dataStartDate.getFullYear() - 1)

  // Build the URL
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latCenter}&longitude=${longCenter}&start_date=${
    oneYearAgoDate.toISOString().split("T")[0]
  }&end_date=${dataStartDate.toISOString().split("T")[0]}&hourly=rain`

  // Fetch data from the URL
  let response = await Functions.makeHttpRequest(url)
  if (response.error) {
    throw Error("Request Failed!")
  }
  let data = await response.json()

  // Initialize season sums, counts and data arrays
  let seasonsData = { Winter: [], Spring: [], Summer: [], Fall: [] }

  // Loop through the data and update season data arrays
  for (let i = 0; i < data.hourly.time.length; i++) {
    let date = new Date(data.hourly.time[i])
    let rain = data.hourly.rain[i]

    // If rain is null or 0, skip the iteration
    if (rain === null || rain === 0) {
      continue
    }

    let season
    let dateStr = date.toISOString().split("T")[0] // to get the date part only

    // Adjust seasons based on the hemisphere and solstice/equinox dates
    if (latitude >= 0) {
      // Northern Hemisphere
      if (
        (date.getMonth() === 11 && date.getDate() >= 21) ||
        date.getMonth() < 2 ||
        (date.getMonth() === 2 && date.getDate() < 20)
      )
        season = "Winter"
      else if (
        (date.getMonth() === 2 && date.getDate() >= 20) ||
        date.getMonth() < 5 ||
        (date.getMonth() === 5 && date.getDate() < 20)
      )
        season = "Spring"
      else if (
        (date.getMonth() === 5 && date.getDate() >= 20) ||
        date.getMonth() < 8 ||
        (date.getMonth() === 8 && date.getDate() < 22)
      )
        season = "Summer"
      else season = "Fall"
    } else {
      // Southern Hemisphere
      if (
        (date.getMonth() === 11 && date.getDate() >= 21) ||
        date.getMonth() < 2 ||
        (date.getMonth() === 2 && date.getDate() < 20)
      )
        season = "Summer"
      else if (
        (date.getMonth() === 2 && date.getDate() >= 20) ||
        date.getMonth() < 5 ||
        (date.getMonth() === 5 && date.getDate() < 20)
      )
        season = "Fall"
      else if (
        (date.getMonth() === 5 && date.getDate() >= 20) ||
        date.getMonth() < 8 ||
        (date.getMonth() === 8 && date.getDate() < 22)
      )
        season = "Winter"
      else season = "Spring"
    }

    if (!seasonsData[season][dateStr]) {
      seasonsData[season][dateStr] = 0 // initialize if not already present
    }

    seasonsData[season][dateStr] += rain // accumulate daily rainfall
  }

  // Convert daily rainfall objects to arrays and calculate averages after removing outliers
  let averages = {}
  let cutoffs = {}
  let sds = {}
  for (let season in seasonsData) {
    let dailyRainfalls = Object.values(seasonsData[season]) // convert daily rainfall data to array
    let mean = dailyRainfalls.reduce((a, b) => a + b) / dailyRainfalls.length
    let max = Math.max(...dailyRainfalls)
    let min = Math.min(...dailyRainfalls)
    let sd = Math.sqrt(dailyRainfalls.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / dailyRainfalls.length)
    console.log("season:", season, "mean:", mean, "sd:", sd, "max:", max, "min:", min)

    // outliers: remove values that are more than 3 standard deviations away from the mean
    let lowerCutoff = mean - 3 * sd
    let upperCutoff = mean + 3 * sd
    let filteredData = dailyRainfalls.filter((rain) => rain >= lowerCutoff && rain <= upperCutoff)

    // calculate new average and new cutoff: 99.7% chance that it will not rain this much in a day in a given season
    averages[season] = filteredData.reduce((a, b) => a + b) / filteredData.length
    sds[season] = sd
    cutoffs[season] = averages[season] + 3 * sd // 99.7% chance that it will not rain this much in a day in a given season
  }
  return { cutoffs, averages, sds }
}

function sinCurveNothern(x) {
  // returns a multiplier between 1 and 2 given a day of the year.
  const pi = Math.PI
  const term1 = (2 * pi * x) / 365.25
  const term2 = 365.25 / 4 / 2
  const term3 = (2 * pi) / 365.25
  const result = 0.5 * Math.sin(term1 + term2 * term3) + 1.5
  console.log(result)
  return result
}
function sinCurveSouthern(x) {
  // returns a multiplier between 1 and 2 given a day of the year.
  const pi = Math.PI
  const term1 = (2 * pi * x) / 365.25
  const term2 = 365.25 / 4 / 2
  const term3 = (2 * pi) / 365.25
  const term4 = 365.25 / 2
  const result = 0.5 * Math.sin(term1 + (term2 + term4) * term3) + 1.5
  console.log(result)
  return result
}

function getDayOfYear(x) {
  var date = new Date(x)
  var year = date.getFullYear()
  var firstDayOfYear = new Date(year, 0, 1)
  var timeDifference = date.getTime() - firstDayOfYear.getTime()
  var dayOfYear = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  return dayOfYear
}

function calculateDailyPrice(sinVar, dayNumber, cutoff, area, inputValue) {
  const mlExcess = (inputValue - cutoff) / 2 // adjusts cutoff
  const constant = 500
  const exponent = Math.exp(mlExcess * (constant ^ (sinVar / dayNumber)))
  console.log(exponent)
  const result = exponent * (area ^ 4) + sinVar
  console.log(result)
  return result
}

// Main
const { cutoffs } = await getAverageRainfall(startDay, latCenter, longCenter)
for (let season in cutoffs) {
  console.log(`Season: ${season}, Cutoff: ${cutoffs[season]}`)
}

var currentDate = startDay
var season
var dayNumber = 0
let sinVar
let dailyPrice = []

while (currentDate <= endDay) {
  console.log(currentDate)

  if (center.lat > 0) {
    // Northern Hemisphere
    if (
      (currentDate.getMonth() === 11 && currentDate.getDate() >= 21) ||
      currentDate.getMonth() < 2 ||
      (currentDate.getMonth() === 2 && currentDate.getDate() < 20)
    )
      season = "Winter"
    else if (
      (currentDate.getMonth() === 2 && currentDate.getDate() >= 20) ||
      currentDate.getMonth() < 5 ||
      (currentDate.getMonth() === 5 && currentDate.getDate() < 20)
    )
      season = "Spring"
    else if (
      (currentDate.getMonth() === 5 && currentDate.getDate() >= 20) ||
      currentDate.getMonth() < 8 ||
      (currentDate.getMonth() === 8 && currentDate.getDate() < 22)
    )
      season = "Summer"
    else season = "Fall"
    sinVar = sinCurveNothern(dayNumber)
  } else {
    // Southern Hemisphere
    if (
      (currentDate.getMonth() === 11 && currentDate.getDate() >= 21) ||
      currentDate.getMonth() < 2 ||
      (currentDate.getMonth() === 2 && currentDate.getDate() < 20)
    )
      season = "Summer"
    else if (
      (currentDate.getMonth() === 2 && currentDate.getDate() >= 20) ||
      currentDate.getMonth() < 5 ||
      (currentDate.getMonth() === 5 && currentDate.getDate() < 20)
    )
      season = "Fall"
    else if (
      (currentDate.getMonth() === 5 && currentDate.getDate() >= 20) ||
      currentDate.getMonth() < 8 ||
      (currentDate.getMonth() === 8 && currentDate.getDate() < 22)
    )
      season = "Winter"
    else season = "Spring"
    sinVar = sinCurveSouthern(dayNumber)
  }
  dailyPrice.push({
    date: new Date(currentDate),
    price: calculateDailyPrice(sinVar, dayNumber, cutoffs[season], area, Number(inputValue)),
  })
  console.log(dayNumber, season, cutoffs[season])
  currentDate.setDate(currentDate.getDate() + 1)
  dayNumber++
}

// Sum
const sum = dailyPrice.reduce((accumulator, currentObject) => accumulator + currentObject.price, 0)
console.log("Sum of daily prices: ", sum)

// price * 100 to move by 2 decimals (Solidity doesn't support decimals)
// Math.round() to round to the nearest integer
// Functions.encodeUint256() helper function to encode the result from uint256 to bytes
return Functions.encodeUint256(sum)
