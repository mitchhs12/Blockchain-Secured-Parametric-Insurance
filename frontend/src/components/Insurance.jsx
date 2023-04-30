import Map from "@/components/Map";

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
        <div className="grid">
            <div className="flex flex-col items-center text-white pb-20 text-4xl font-bold">{type} Insurance</div>
            <div className="grid grid-cols-2 border-2">
                <div className="flex justify-center items-center">
                    <Map />
                </div>
                <div>
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <label htmlFor="coordinates" className="text-lg text-white">
                                Latitude and Longitude Coordinates:
                            </label>
                            <div className="mt-2">
                                <input
                                    id="coordinates"
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="config" className="text-lg text-white">
                                {configLabel}
                            </label>
                            <div className="mt-2">
                                <input
                                    id="config"
                                    type="number"
                                    className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mb-4 text-white text-lg">
                            <label htmlFor="days" className="text-lg text-white">
                                Number of days:
                            </label>
                            <div className="mt-2">
                                <input
                                    id="days"
                                    type="number"
                                    className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
