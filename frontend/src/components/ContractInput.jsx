import { estimate_area } from "../utils/estimate_area";
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { estimateTemperature } from "../insurance_estimators/temperature.jsx";
import { estimateRainfall } from "../insurance_estimators/rainfall.jsx";
import { estimateSnowfall } from "../insurance_estimators/snowfall.jsx";
import { estimateEarthquake } from "../insurance_estimators/earthquake.jsx";
import { format, set, differenceInDays } from "date-fns";
import { startPolicy } from "../contract_functions/startPolicy.js";
import { useAccount, useContract, useProvider, useSigner, useBalance, useContractEvent } from "wagmi";
import { abi as insuranceAbi } from "../../../backend/build/artifacts/contracts/Insurance.sol/Insurance.json";
import { ethers } from "ethers";

const ContractInput = ({ configLabel, units, rectangleBounds }) => {
    const { isConnected, address } = useAccount();
    const [coordinatesSelected, setCoordinatesSelected] = useState(false);
    const [aboveOrBelow, setAboveOrBelow] = useState("above");
    const [inputValue, setInputValue] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [center, setCenter] = useState("");
    const [area, setArea] = useState("");
    const [totalCost, setTotalCost] = useState("");
    const [averageDaily, setAverageDaily] = useState("");
    const [payouts, setPayouts] = useState("");
    const [isEstimating, setIsEstimating] = useState(false);
    const [contractSuccess, setContractSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValueFinal, setInputValueFinal] = useState("");
    const [config, setConfig] = useState(null);
    const [policyStarted, setPolicyStarted] = useState(false);
    const [amountInMatic, setAmountInMatic] = useState(null);
    const [maticBalance, setMaticBalance] = useState(null);

    const { data: signer } = useSigner();
    const provider = useProvider({ chainId: 80001 });

    const balanceQuery = useBalance({ address: address, chainId: 80001 });
    console.log(maticBalance, amountInMatic);
    useEffect(() => {
        if (balanceQuery.isError) {
            console.error("Error loading balance: ", balanceQuery.error);
        } else if (balanceQuery.data) {
            console.log("Balance: ", balanceQuery.data?.formatted, balanceQuery.data?.symbol);
            setMaticBalance(balanceQuery.data?.formatted);
        }
    }, [balanceQuery.isError, balanceQuery.data]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const defaultInputs = [["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"], 1316, 300000];

    const args =
        rectangleBounds && rectangleBounds.length === 4
            ? [
                  rectangleBounds[0].lat.toString(),
                  rectangleBounds[0].lng.toString(),
                  rectangleBounds[1].lat.toString(),
                  rectangleBounds[1].lng.toString(),
                  rectangleBounds[2].lat.toString(),
                  rectangleBounds[2].lng.toString(),
                  rectangleBounds[3].lat.toString(),
                  rectangleBounds[3].lng.toString(),
                  inputValue.toString(),
                  Math.floor(fromDate.getTime() / 1000).toString(),
                  Math.floor(toDate.getTime() / 1000).toString(),
              ]
            : defaultInputs;

    const contract = useContract({
        address: "0xF27b1e62aB5F7080aDc6a47D3BBe9E176a5E4c9c",
        abi: insuranceAbi,
        signerOrProvider: signer || provider,
    });

    const getCost = async () => {
        const result = await contract.getAllUserPolicies(address);
        const requestId = await contract.policyRequestIdMapping(address, result.length - 1);
        const { user, policyIndex, cost } = await contract.insuranceQuoteData(requestId);
        return { cost, requestId };
    };

    useEffect(() => {
        if (!contractSuccess) {
            return;
        }
        const fetchCostAndCalculate = async () => {
            const { cost } = await getCost();
            const priceOfMatic = await contract.getPriceMaticUsd();
            const amount = Math.round((cost * 10 ** 8) / priceOfMatic);
            setAmountInMatic(amount);
            //setAmountInMatic(0.01); //used to verify that the user can pay for the policy
        };

        fetchCostAndCalculate();
    }, []);

    const startPolicy = async () => {
        setIsLoading(true);
        try {
            const options = { value: ethers.utils.parseUnits(amountInMatic.toString(), "ether") };
            console.log(options);
            const txReceipt = await contract.startPolicy(requestId, options);
            await txReceipt.wait();
        } catch (error) {
            console.log("Failed to start policy: ", error);
        }
        setIsLoading(false);
    };

    useContractEvent({
        address: "0x0A99be0fA440C8931C3826F1A25EB92836cc9766",
        abi: insuranceAbi,
        eventName: "PolicyCreated",
        listener(log) {
            console.log("PolicyCreated event detected!", log);
            setIsLoading(false);
            setContractSuccess(true);
        },
    });

    useContractEvent({
        address: "0x0A99be0fA440C8931C3826F1A25EB92836cc9766",
        abi: insuranceAbi,
        eventName: "PolicyStarted",
        listener(log) {
            console.log("PolicyStarted event detected!", log);
            setIsLoading(false);
            setPolicyStarted(true);
        },
    });

    const estimateInsurance = async () => {
        setIsLoading(true);
        console.log(args);
        const options = { gasLimit: 2100000 };
        try {
            await contract.estimateInsurance(args, 1316, 300000, options);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    const handleDropdownChange = (e) => {
        setAboveOrBelow(e.target.value);
    };

    const Spinner = () => (
        <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    useEffect(() => {
        if (rectangleBounds) {
            const latSum = rectangleBounds.reduce((sum, corner) => sum + corner.lat, 0);
            const lngSum = rectangleBounds.reduce((sum, corner) => sum + corner.lng, 0);
            const centerLat = latSum / 4;
            const centerLng = lngSum / 4;
            setCenter({ lat: centerLat, lng: centerLng });
            console.log(center);
            setCoordinatesSelected(true);

            const latitudes = rectangleBounds.map((corner) => corner.lat);
            const longitudes = rectangleBounds.map((corner) => corner.lng);
            console.log(latitudes);
            console.log(longitudes);
            const latNe = rectangleBounds[0].lat;
            const longNe = rectangleBounds[0].lng;
            const latSw = rectangleBounds[2].lat;
            const longSw = rectangleBounds[2].lng;
            const estimatedArea = estimate_area([latNe, latSw], [longNe, longSw]);
            setArea(estimatedArea);
            console.log(`The area of the region is approximately ${area} square kilometers.`);
        }
    }, [rectangleBounds]);

    const renderButtonOrMessage = () => {
        if (coordinatesSelected && inputValue && fromDate && toDate && isComplete) {
            return (
                <>
                    {isEstimating ? ( // Check if loading state is true
                        <div className="flex items-center justify-center">
                            <>
                                <Spinner />
                                Estimating...
                            </>
                        </div>
                    ) : (
                        <button
                            className="w-auto sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 flex items-center justify-center text-center"
                            onClick={onButtonClick}
                        >
                            Estimate Cost
                        </button>
                    )}
                </>
            );
        } else if (!coordinatesSelected) {
            return "Please select an area";
        } else if (area < 0.1) {
            return "Please select a larger area";
        } else if (!inputValue) {
            return "Please type in a quantity";
        } else if (!fromDate) {
            return "Please select a start date";
        } else if (!toDate) {
            return "Please select an end date";
        } else if (differenceInDays(new Date(toDate), new Date(fromDate)) > 365) {
            return "Please select a date range less than 1 year";
        } else {
            return "Please fill out the form";
        }
    };

    const onButtonClick = () => {
        setIsEstimating(true);
        setContractSuccess(false);
        const dateRange = { from: new Date(fromDate), to: new Date(toDate) };
        let averageDailyEstimate, totalEstimate;

        switch (configLabel) {
            case "Snowfall":
                ({ dailyPrice: averageDailyEstimate, average: totalEstimate } = estimateSnowfall(
                    rectangleBounds,
                    area,
                    dateRange,
                    aboveOrBelow,
                    inputValue,
                    center
                ));
                break;
            case "Earthquake":
                ({ dailyPrice: averageDailyEstimate, average: totalEstimate } = estimateEarthquake(
                    rectangleBounds,
                    area,
                    dateRange,
                    aboveOrBelow,
                    inputValue,
                    center
                ));
                break;
            case "Rainfall":
                let currentUnixTiem = Date.now() / 1000;
                console.log("Current Unix Timestamp:", currentUnixTiem);
                console.log(dateRange.from);
                let startUnixTime = Date.parse(dateRange.from) / 1000;
                console.log("Start Unix Timestamp:", startUnixTime);
                console.log(dateRange.to);
                let endUnixTime = Date.parse(dateRange.to) / 1000;
                console.log("End Unix Timestamp:", endUnixTime);

                estimateRainfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center).then(
                    ({ sum: totalEstimate, average: averageDailyEstimate, payouts: payouts }) => {
                        console.log(totalEstimate, averageDailyEstimate);
                        setTotalCost(totalEstimate);
                        setAverageDaily(averageDailyEstimate);
                        setPayouts(payouts);
                        setIsEstimating(false);
                    }
                );
                break;
            case "Temperature":
                ({ dailyPrice: averageDailyEstimate, average: totalEstimate } = estimateTemperature(
                    rectangleBounds,
                    area,
                    dateRange,
                    aboveOrBelow,
                    inputValue,
                    center
                ));
                break;
            default:
                console.error("Invalid configLabel provided!");
        }
        setInputValueFinal(inputValue);
    };

    return (
        <div className=" text-white font-bold p-4 text-l">
            Please select your area with the tool in the top right corner of the map.
            <div className="mt-8 mb-8 flex">
                <div className="w-9/12">
                    <input
                        id="coordinates"
                        type="text"
                        className="w-full border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Your Area's Center Coordinates (Lat, Long)"
                        value={center ? `${center.lat}, ${center.lng}` : ""}
                        readOnly
                        style={{ color: "black" }}
                    />
                </div>
                <div className="ml-6 w-3/12">
                    <input
                        id="size"
                        type="text"
                        className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Area (km²)"
                        value={
                            area
                                ? Math.abs(area) >= 1
                                    ? `${area.toFixed(0)}km²`
                                    : `${area.toFixed(Math.abs(Math.floor(Math.log10(Math.abs(area)))) + 4)}km²`
                                : ""
                        }
                        readOnly
                        style={{ color: "black" }}
                    />
                </div>
            </div>
            <div className="flex">
                <select
                    id="config"
                    className="w-6/12 mr-2 text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={aboveOrBelow}
                    onChange={handleDropdownChange}
                >
                    <option value="above">Insure for {configLabel} above</option>
                    {configLabel !== "Rainfall" ? <option value="below">Insure for {configLabel} below</option> : ""}
                </select>
                <input
                    type="number"
                    className="w-4/12 ml-4 text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder={configLabel}
                    min="1"
                    step="0.1"
                    value={inputValue}
                    onChange={handleChange}
                />
                <span className="ml-2 text-gray-400 self-end">{units}</span>
            </div>
            <div className="flex mt-4 justify-center flex-col sm:flex-row sm:justify-between">
                <div className="w-auto flex justify-center sm:justify-start">
                    <Calendar fromDate={setFromDate} toDate={setToDate} completed={setIsComplete} />
                </div>
                <div className="w-auto flex sm:justify-start flex-col text-right items-center sm:items-end mt-6 mb-6 sm:pr-6">
                    From:
                    <br />
                    {fromDate ? <span>{format(fromDate, "PPP")}</span> : <br />}
                    <br />
                    <br />
                    To:
                    <br />
                    {toDate ? <span>{format(toDate, "PPP")}</span> : <br />}
                    <br />
                    <br />
                    {renderButtonOrMessage()}
                </div>
            </div>
            <div className="flex flex-col justify-center items-center my-4 space-y-4">
                {!isEstimating && payouts && averageDaily && totalCost && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-800 text-white px-4 py-2 rounded-lg text-center text-lg">
                            Daily Cost Estimate:
                            <br /> ${averageDaily.toFixed(2)} per day
                        </div>
                        <div className="bg-green-800 text-white px-4 py-2 rounded-lg text-center text-lg">
                            Total Cost Estimate:
                            <br /> ${totalCost.toFixed(2)}
                        </div>
                        <div className="bg-gray-500 text-white px-4 py-2 rounded-lg text-center text-lg">
                            Winter Payout for:
                            <br /> {Number(inputValueFinal) + 1} {units}: ${payouts["Winter"].toFixed(2)}
                        </div>
                        <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-center text-lg">
                            Summer Payout for:
                            <br /> {Number(inputValueFinal) + 1} {units}: ${payouts["Summer"].toFixed(2)}
                        </div>
                    </div>
                )}
                {!isEstimating && averageDaily > 1000000 && (
                    <div className="text-red-500 px-4 py-2 rounded-lg text-center text-xl mt-4">
                        <div>WARNING! Your insurance is expensive!</div>
                        <div> Consider changing area, {units}, and / or dates.</div>
                    </div>
                )}
                {!contractSuccess && !isEstimating && totalCost && !policyStarted && (
                    <div className="text-white px-4 py-2 rounded-lg text-center">
                        <button
                            className="w-auto sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 items-center justify-center"
                            onClick={() => estimateInsurance()}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Spinner />
                                    Processing...
                                </div>
                            ) : (
                                "Generate Insurance\nContract On-chain"
                            )}
                        </button>
                    </div>
                )}
                {contractSuccess && !isEstimating && !policyStarted && (
                    <div className="text-white px-4 py-2 rounded-lg text-center">
                        {Math.round(maticBalance) < amountInMatic ? (
                            <>
                                <div className="flex items-center justify-center">
                                    You will need at least {amountInMatic} MATIC to pay and start the insurance.
                                </div>
                                <div>You currently have {Math.round(maticBalance)} MATIC.</div>
                            </>
                        ) : (
                            <button
                                className="w-auto sm:w-auto bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 items-center justify-center"
                                onClick={startPolicy}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <Spinner />
                                        Processing...
                                    </div>
                                ) : (
                                    "Pay and\nStart"
                                )}
                            </button>
                        )}
                    </div>
                )}

                {policyStarted && (
                    <div className="text-white px-4 py-2 rounded-lg text-center">
                        <div className="flex items-center justify-center">Policy Started Successfully 👍</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractInput;
