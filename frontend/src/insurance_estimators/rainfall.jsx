const http = require("http");
import { randomPoint } from "../utils/randomPointInRectangle";

export function estimateRainfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue) {
    console.log(rectangleBounds);
    console.log(area);
    console.log(dateRange);
    console.log(aboveOrBelow);
    console.log(inputValue);

    const points = [];
    for (let i = 0; i < 3; i++) {
        points.push(randomPoint(rectangleBounds));
    }

    console.log(points);

    const promises = points.map((point) => {
        return new Promise((resolve, reject) => {
            const apiEndpoint = `http://climateapi.scottpinkelman.com/api/v1/location/${point.lat}/${point.lng}`;

            http.get(apiEndpoint, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    const result = JSON.parse(data);
                    resolve(result);
                });

                res.on("error", (err) => {
                    reject(err);
                });
            });
        });
    });

    Promise.all(promises)
        .then((values) => {
            console.log(values); // 'values' contains the results of all API calls
        })
        .catch((err) => {
            console.log("Error: ", err.message);
        });
}
