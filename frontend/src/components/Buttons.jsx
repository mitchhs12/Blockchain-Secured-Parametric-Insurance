const Buttons = ({ onButtonClick }) => {
    return (
        <>
            <h2 className="text-4xl h-full w-full items-center pt-10 font-bold text-white text-center mb-6">
                Please Select an Insurance Package
            </h2>
            <div className="flex h-full w-full flex-wrap sm:justify-between">
                <div className="flex h-full w-full flex-wrap justify-center gap-2">
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Rainfall", "#78c4fa")}
                    >
                        Rainfall
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500  text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Temperature", "#fa8b46")}
                    >
                        Temperature
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Earthquake", "#76fa46")}
                    >
                        Earthquake
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Snowfall", "#ecf0f1")}
                    >
                        Snowfall
                    </button>
                </div>
            </div>
        </>
    );
};
export default Buttons;
