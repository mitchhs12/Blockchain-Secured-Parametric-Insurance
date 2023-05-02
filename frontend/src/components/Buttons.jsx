const Buttons = ({ onButtonClick }) => {
    return (
        <>
            <h2 className="text-4xl font-bold text-white text-center mb-6">Please Select an Insurance Package</h2>
            <div className="flex flex-wrap justify-center sm:justify-between">
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Rain", "#78c4fa")}
                    >
                        Rain
                    </button>
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Drought", "#fa8b46")}
                    >
                        Drought
                    </button>
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Earthquake", "#76fa46")}
                    >
                        Earthquake
                    </button>
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Snow", "#ecf0f1")}
                    >
                        Snow
                    </button>
                </div>
            </div>
        </>
    );
};
export default Buttons;
