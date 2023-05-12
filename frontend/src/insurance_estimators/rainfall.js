const http = require("http");

const latitude = -31.9523;
const longitude = 115.8613;
const apiEndpoint = `http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;

http.get(apiEndpoint, (res) => {
    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        const result = JSON.parse(data);
        console.log(result);
    });
}).on("error", (err) => {
    console.log("Error: ", err.message);
});
