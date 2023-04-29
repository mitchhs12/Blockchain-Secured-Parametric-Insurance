const Content = () => {
    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-white">Please Select an Insurance Package</h2>
            <div className="flex justify-center mt-6">
                <button className="w-32 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto">
                    Rain
                </button>
                <button className="w-32 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto">
                    Drought
                </button>
                <button className="w-32 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto">
                    Earthquake
                </button>
                <button className="w-32 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto">
                    Snow
                </button>
            </div>
        </div>
    );
};

export default Content;
