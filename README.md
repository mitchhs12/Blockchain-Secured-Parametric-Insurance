# Blockchain-Secured-Parametric-Insurance

An application built for the Chainlink 2023 Spring Hackathon.

#### [You can see a live demo of this project here.](https://chainlink-secured-parametric-insurance-1io1.vercel.app/)

#### [Or watch the video walkthrough here.](https://www.youtube.com/watch?v=f-OytJrvNoc)

You can run the frontend for this project by doing `yarn dev` after navigating to the frontend folder in the terminal.

<h4>Note:</h4>

At the time of development, the request for offchain computation must be from a whitelisted Chainlink functions address in order for the offchain computation to run.

<h2>Cost</h2>

The calculation for the daily cost of insurance is as follows:

```javascript
function calculateDailyPrice(sinVar, dayNumber, cutoff, area, inputValue) {
    const mlExcess = (inputValue - cutoff) / 2; // adjusts cutoff
    const constant = 500;
    const exponent = Math.exp(mlExcess * (constant ^ (sinVar / dayNumber)));
    const result = exponent * (area ^ 4) + sinVar;
    return result;
}
```

Where `sinVar` is the result of:

```javascript
function sinCurve(x, hemisphere) {
    // returns a multiplier between 1 and 2 given a day of the year.
    let sinResult;
    const pi = Math.PI;
    const term1 = (2 * pi * x) / 365.25;
    const term2 = 365.25 / 4 / 2;
    const term3 = (2 * pi) / 365.25;
    const term4 = 365.25 / 2;
    if (hemisphere == "northern") {
        sinResult = 0.5 * Math.sin(term1 + term2 * term3) + 1.5;
    } else {
        sinResult = 0.5 * Math.sin(term1 + (term2 + term4) * term3) + 1.5;
    }
    return sinResult;
}
```

`mlExcess` is determined by taking the difference between the user's `inputValue` to insure for (in mm) and the `cutoff` point which is the amount of daily rainfall that lies 3 standard deviations above the mean for the past year for the center point of the insured area.

<h2>Payout</h2>

The payout formula is calculated by determining the difference in probability between the event actually occurring and the theoretical chance of the event occurring based on the previous year's data: `pDifference`

```javascript
function calculatePayout(cutoff, averages, sds, area, inputValue, sum) {
    const actualRainfall = inputValue + 1;
    let additionalCheck = 1;

    const payouts = {};
    for (let season in averages) {
        const mlExcess = (inputValue - cutoff[season]) / 2; // adjusts cutoff
        if (inputValue < mlExcess) {
            additionalCheck = inputValue / Math.pow(mlExcess, 2);
        }

        const pActualRainfall = normDist(actualRainfall, averages[season], sds[season], true);
        const pMyRainfall = normDist(inputValue, averages[season], sds[season], true);
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
```

`pDifference` is computed by establishing the probabilities of the actual and expected events (`pActualRainfall `and `pMyRainfall `respectively) using a normal distribution function.

Similar to the cost, we then calculate how much the actual rainfall exceeded the 3 standard deviation threshold (`cutoff`) for the season, termed `mlExcess`. The `additionalCheck` is then computed based on whether the input value falls below this `mlExcess` figure. The final payout for the season is computed by deducting a term. The term involves `mlExcess`, the reciprocal of the area, and the results of two conditional checks (`firstTest` and `secondTest`). These checks will cause the function to be 0 if the rainfall is less than the insured for amount (`inputValue`) or 1 if the `inputValue` is less than half of the cutoff.

The result of this is a season-wide payout figure that we use can use for our policy. We then select 3 random points (determined by Chainlink VRF) in the user's `area` whereby if 2 out of 3 points had rainfall that exceeded that of the user's selected rainfall quantity, the user is paid out the amount calculated for the respective time given the respective season.

<h3>Foot Notes:</h3>

The `cutoff / 2` part of both the cost and payout functions isn't technically needed but is added as an extra buffer to ensure that the contract balance effectively always continues to increase as people pay for insurance.

The documentation for the Rainfall API used in this project can be found here:
https://open-meteo.com/en/docs
