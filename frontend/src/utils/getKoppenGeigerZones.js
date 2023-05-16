const http = require("http");
const { randomPoint } = require("./randomPointInRectangle");

export default function getKoppenGeigerZones(rectangleBounds) {
    return new Promise(async (resolve, reject) => {
        while (true) {
            let points = [];
            for (let i = 0; i < 3; i++) {
                points.push(randomPoint(rectangleBounds));
            }

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
                            resolve(result.return_values[0]);
                        });

                        res.on("error", (err) => {
                            reject(err);
                        });
                    });
                });
            });

            try {
                const values = await Promise.all(promises);
                const zoneCounts = {};
                const zoneDescriptions = {};

                for (let value of values) {
                    const zone = value.koppen_geiger_zone;
                    if (zone in zoneCounts) {
                        zoneCounts[zone]++;
                    } else {
                        zoneCounts[zone] = 1;
                        zoneDescriptions[zone] = value.zone_description;
                    }
                }

                for (let zone in zoneCounts) {
                    if (zoneCounts[zone] >= 2) {
                        resolve({ zone: zone, description: zoneDescriptions[zone] });
                        return;
                    }
                }
            } catch (err) {
                reject(err);
            }
        }
    });
}

module.exports = getKoppenGeigerZones;
