import { ReactSVG } from "react-svg";

const Content = () => {
    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-white">Please Select an Insurance Package</h2>
            <div className="flex flex-wrap justify-center mt-6">
                <button className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto">
                    Rain
                </button>
                <button className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto">
                    Drought
                </button>
                <button className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto">
                    Earthquake
                </button>
                <button className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto">
                    Snow
                </button>
            </div>
            <div>
                <ReactSVG src="@/assets/map.svg" />
            </div>
        </div>
    );
};

export default Content;
