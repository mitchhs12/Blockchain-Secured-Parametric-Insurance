const ContractInput = ({ configLabel }) => {
    return (
        <div className="border-2 text-white font-bold">
            Please draw a square on the map to select the area of interest.
            <div className="mt-6 mb-6 flex flex-row items-center">
                <div>
                    <input
                        id="coordinates"
                        type="text"
                        className="w-80 border-gray-300 rounded-lg py-2 sm:px-2 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Coordinates (Latitudes, Longitude)"
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>
                    <input
                        id="config"
                        type="number"
                        className="w-80 border-gray-300 rounded-lg py-2 sm:px-2 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder={configLabel}
                        min="1"
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>
                    <input
                        id="days"
                        type="number"
                        className="w-50 border-gray-300 rounded-lg px-4 py-2 sm:px-2 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Number of Days"
                        min="1"
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>Total Land Area Selected</div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>Cost of Insurance</div>
            </div>
        </div>
    );
};

export default ContractInput;
