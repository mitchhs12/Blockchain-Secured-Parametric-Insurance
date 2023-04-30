const Insurance = ({ type }) => {
    const configLabel =
        type === "Rain"
            ? "Quantity of Rainfall (mm)"
            : type === "Earthquake"
            ? "Magnitude of Earthquake (Richter scale)"
            : type === "Snow"
            ? "Quantity of Snowfall (cm)"
            : type === "Drought"
            ? "Lack of Soil moisture"
            : "";

    return (
        <div className="grid h-screen">
            <div className="flex flex-col items-center text-white text-4xl font-bold grid-column-1">
                {type} Insurance
            </div>
            <div class="grid grid-cols-2">
                <div>
                    <div class="w-1/2 h-1/2 bg-white bg-opacity-20"></div>
                </div>
                <div>
                    <div class="flex flex-col">
                        <div class="mb-4">
                            <label for="coordinates" class="text-lg text-white">
                                Latitude and Longitude Coordinates:
                            </label>
                            <div class="mt-2">
                                <input
                                    id="coordinates"
                                    type="text"
                                    class="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div class="mb-4">
                            <label for="config" class="text-lg text-white">
                                Config parameter:
                            </label>
                            <div class="mt-2">
                                <input
                                    id="config"
                                    type="number"
                                    class="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div class="mb-4">
                            <label for="days" class="text-lg text-white">
                                Number of days:
                            </label>
                            <div class="mt-2">
                                <input
                                    id="days"
                                    type="number"
                                    class="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insurance;
