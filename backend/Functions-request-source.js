// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
console.log("Generate Insurance Policy")
const latNe = args[0]
const longNe = args[1]
const latSe = args[2]
const longSe = args[3]
const latSw = args[4]
const longSw = args[5]
const latNw = args[6]
const longNw = args[7]
const configParam = args[8] // amount of rainfall to insure for
const startDayString = args[9] // unix
const endDayString = args[10] // unix
const currentDayString = args[11] // unix

// Additional vars that can be calculated from the arguments above
const latCenter = (parseFloat(latNe) + parseFloat(latSe) + parseFloat(latSw) + parseFloat(latNw)) / 4
const longCenter = (parseFloat(longNe) + parseFloat(longSe) + parseFloat(longSw) + parseFloat(longNw)) / 4

// ----- FUNCTIONS -----
function estimateArea(latitudes, longitudes) {
  const R = 6371 // Earth's radius in km
  const toRadians = (degree) => degree * (Math.PI / 180)

  // Convert latitudes and longitudes to radians
  const lat1 = toRadians(latitudes[0])
  const lat2 = toRadians(latitudes[1])
  const lon1 = toRadians(longitudes[0])
  const lon2 = toRadians(longitudes[1])

  // Calculate the differences in latitude and longitude
  const dLat = Math.abs(lat1 - lat2)
  const dLon = Math.abs(lon1 - lon2)

  // Calculate the length of the sides of the square using the Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const sideLength = R * c

  // Calculate the area of the square
  const area = sideLength * sideLength

  return area
}

function timestampToDate(ts) {
  let secondsInADay = 24 * 60 * 60
  let daysSinceEpoch = Math.floor(ts / secondsInADay)
  let epochAsJulianDay = 2440587.5 // Julian day at Unix epoch: 1970-01-01
  let julianDay = Math.round(epochAsJulianDay + daysSinceEpoch) // Round the julianDay here
  let a = julianDay + 32044
  let b = Math.floor((4 * a + 3) / 146097)
  let c = a - Math.floor((b * 146097) / 4)
  let d = Math.floor((4 * c + 3) / 1461)
  let e = c - Math.floor((1461 * d) / 4)
  let m = Math.floor((5 * e + 2) / 153)
  let day = e - Math.floor((153 * m + 2) / 5) + 1
  let month = m + 3 - 12 * Math.floor(m / 10)
  let year = b * 100 + d - 4800 + Math.floor(m / 10)
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

async function getAverageRainfall(currentDay, latCenter, longCenter) {
  // Calculate one year ago date
  let [currentYear, month, day] = currentDay.split("-")
  let oneYearAgoDate = `${currentYear - 1}-${month}-${day}`

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latCenter}&longitude=${longCenter}&start_date=${oneYearAgoDate}&end_date=${currentDay}&hourly=rain`
  const response = await Functions.makeHttpRequest({ url: url })

  if (response.error) {
    throw Error("Request Failed!")
  }
  const data = response.data
  // Initialize season sums, counts and data arrays
  let seasonsData = { Winter: {}, Spring: {}, Summer: {}, Fall: {} }

  // Loop through the data and update season data arrays
  for (let i = 0; i < data.hourly.time.length; i++) {
    let date = data.hourly.time[i]
    let rain = data.hourly.rain[i]

    // If rain is null or 0, skip the iteration
    if (rain === null || rain === 0) {
      continue
    }

    let season
    let daysDate = date.substring(0, 10)

    // Adjust seasons based on the hemisphere and solstice/equinox dates
    if (latCenter >= 0) {
      // Northern Hemisphere
      if (
        (getMonth(date) === 11 && getDate(date) >= 21) ||
        getMonth(date) < 2 ||
        (getMonth(date) === 2 && getDate(date) < 20)
      )
        season = "Winter"
      else if (
        (getMonth(date) === 2 && getDate(date) >= 20) ||
        getMonth(date) < 5 ||
        (getMonth(date) === 5 && getDate(date) < 20)
      )
        season = "Spring"
      else if (
        (getMonth(date) === 5 && getDate(date) >= 20) ||
        getMonth(date) < 8 ||
        (getMonth(date) === 8 && getDate(date) < 22)
      )
        season = "Summer"
      else season = "Fall"
    } else {
      // Southern Hemisphere
      if (
        (getMonth(date) === 11 && getDate(date) >= 21) ||
        getMonth(date) < 2 ||
        (getMonth(date) === 2 && getDate(date) < 20)
      )
        season = "Summer"
      else if (
        (getMonth(date) === 2 && getDate(date) >= 20) ||
        getMonth(date) < 5 ||
        (getMonth(date) === 5 && getDate(date) < 20)
      )
        season = "Fall"
      else if (
        (getMonth(date) === 5 && getDate(date) >= 20) ||
        getMonth(date) < 8 ||
        (getMonth(date) === 8 && getDate(date) < 22)
      )
        season = "Winter"
      else season = "Spring"
    }

    if (!seasonsData[season][daysDate]) {
      seasonsData[season][daysDate] = 0 // initialize if not already present
    }

    seasonsData[season][daysDate] += rain // accumulate daily rainfall
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

function calculateDailyPrice(sinVar, dayNumber, cutoff, area, inputValue) {
  const mlExcess = (inputValue - cutoff) / 2 // adjusts cutoff
  const constant = 500
  const exponent = Math.exp(mlExcess * (constant ^ (sinVar / dayNumber)))
  const result = exponent * (area ^ 4) + sinVar
  return result
}

function getYear(date) {
  return parseInt(date.split("-")[0], 10)
}

function getMonth(date) {
  return parseInt(date.split("-")[1], 10)
}

function getDate(date) {
  return parseInt(date.split("-")[2], 10)
}

function incrementDate(date) {
  const year = getYear(date)
  const month = getMonth(date)
  const day = getDate(date)

  // Assuming the month is 1-indexed
  const monthLengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Leap year check
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    monthLengths[2] = 29
  }

  let newDay = day + 1
  let newMonth = month
  let newYear = year

  if (newDay > monthLengths[month]) {
    newDay = 1
    newMonth++
  }

  if (newMonth > 12) {
    newMonth = 1
    newYear++
  }

  return `${newYear}-${newMonth.toString().padStart(2, "0")}-${newDay.toString().padStart(2, "0")}`
}

// ----- MAIN -----
const area = estimateArea([latNe, latSw], [longNe, longSw])
console.log("Area: ", area)
const currentDay = timestampToDate(currentDayString)
const startDay = timestampToDate(startDayString)
const endDay = timestampToDate(endDayString)
console.log(currentDay, startDay, endDay)
const { cutoffs } = await getAverageRainfall(currentDay, latCenter, longCenter)
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

  if (latCenter > 0) {
    // Northern Hemisphere
    if (
      (getMonth(currentDate) === 11 && getDate(currentDate) >= 21) ||
      getMonth(currentDate) < 2 ||
      (getMonth(currentDate) === 2 && getDate(currentDate) < 20)
    )
      season = "Winter"
    else if (
      (getMonth(currentDate) === 2 && getDate(currentDate) >= 20) ||
      getMonth(currentDate) < 5 ||
      (getMonth(currentDate) === 5 && getDate(currentDate) < 20)
    )
      season = "Spring"
    else if (
      (getMonth(currentDate) === 5 && getDate(currentDate) >= 20) ||
      getMonth(currentDate) < 8 ||
      (getMonth(currentDate) === 8 && getDate(currentDate) < 22)
    )
      season = "Summer"
    else season = "Fall"
    sinVar = sinCurveNothern(dayNumber)
  } else {
    // Southern Hemisphere
    if (
      (getMonth(currentDate) === 11 && getDate(currentDate) >= 21) ||
      getMonth(currentDate) < 2 ||
      (getMonth(currentDate) === 2 && getDate(currentDate) < 20)
    )
      season = "Summer"
    else if (
      (getMonth(currentDate) === 2 && getDate(currentDate) >= 20) ||
      getMonth(currentDate) < 5 ||
      (getMonth(currentDate) === 5 && getDate(currentDate) < 20)
    )
      season = "Fall"
    else if (
      (getMonth(currentDate) === 5 && getDate(currentDate) >= 20) ||
      getMonth(currentDate) < 8 ||
      (getMonth(currentDate) === 8 && getDate(currentDate) < 22)
    )
      season = "Winter"
    else season = "Spring"
    sinVar = sinCurveSouthern(dayNumber)
  }
  dailyPrice.push({
    date: currentDate,
    price: calculateDailyPrice(sinVar, dayNumber, cutoffs[season], area, Number(configParam)),
  })
  console.log(dayNumber, season, cutoffs[season])
  currentDate = incrementDate(currentDate)
  dayNumber++
}

// Sum
const sum = dailyPrice.reduce((accumulator, currentObject) => accumulator + currentObject.price, 0)
console.log("Sum of daily prices: ", sum)

const result = sum.toFixed(2)

return Functions.encodeUint256(Math.round(result * 100))
