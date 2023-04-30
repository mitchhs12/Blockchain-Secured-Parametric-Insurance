const Buttons = ({ onButtonClick }) => {
    return (
        <>
            <h2 className="text-4xl font-bold text-white text-center mb-6">Please Select an Insurance Package</h2>
            <div className="flex flex-wrap justify-center">
                <div className="flex flex-wrap justify-center">
                    <div className="flex justify-center">
                        <div className="flex justify-center">
                            <div class="flex flex-wrap justify-center">
                                <div class="flex flex-wrap justify-center sm:justify-between">
                                    <div class="flex flex-wrap justify-center gap-2">
                                        <button
                                            class="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                                            onClick={() => onButtonClick("Rain", "#0000fa")}
                                        >
                                            Rain
                                        </button>
                                        <button
                                            class="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                                            onClick={() => onButtonClick("Drought", "#FFFF00")}
                                        >
                                            Drought
                                        </button>
                                        <button
                                            class="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                                            onClick={() => onButtonClick("Earthquake", "#ed7b02")}
                                        >
                                            Earthquake
                                        </button>
                                        <button
                                            class="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                                            onClick={() => onButtonClick("Snow", "#ecf0f1")}
                                        >
                                            Snow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Buttons;
