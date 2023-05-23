// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./insurances/Rain.sol";
import "./insurances/Drought.sol";
import "./insurances/Earthquake.sol";
import "./insurances/Snow.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Insurance is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  AggregatorV3Interface internal priceFeed;

  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    priceFeed = AggregatorV3Interface(
      "0x12162c3E810393dEC01362aBf156D7ecf6159528" //Polygon Mumbai LINK/MATIC pricefeed
    );
  }

  enum InsuranceType {
    Rain,
    Drought,
    Earthquake,
    Snow
  }

  struct InsuranceData {
    uint256 latNw;
    uint256 longNw;
    uint256 latNe;
    uint256 longNe;
    uint256 latSe;
    uint256 longSe;
    uint256 latSw;
    uint256 longSw;
    uint256 configParam;
    InsuranceType insuranceType;
    uint256 numDays;
    uint256 startDay;
  }

  mapping(address => InsuranceData) public insuranceMapping;

  function getLatestPrice() public view returns (int) {
    (
      ,
      /* uint80 roundID */ int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
      ,
      ,

    ) = priceFeed.latestRoundData();
    return price;
  }

  function estimateInsurance(
    string calldata source,
    bytes calldata secrets,
    uint256 latNw,
    uint256 longNw,
    uint256 latNe,
    uint256 longNe,
    uint256 latSe,
    uint256 longSe,
    uint256 latSw,
    uint256 longSw,
    uint256 configParam,
    uint256 insuranceType,
    uint256 numDays,
    uint256 startDay
  ) public payable {
    // Ensure at least 1 Matic is sent
    require(msg.value >= 1 ether, "Not enough Matic sent");
    InsuranceData storage newInsuranceData = InsuranceData({
      latNw: latNw,
      longNw: longNw,
      latNe: latNe,
      longNe: longNe,
      latSe: latSe,
      longSe: longSe,
      latSw: latSw,
      longSw: longSw,
      configParam: configParam,
      insuranceType: insuranceType,
      numDays: numDays,
      startDay: startDay
    });
    Functrions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }
    if (args.Length > 0) req.addArgs(args);
    // Calls Chainlink DON for insurance cost
    insuranceMapping[msg.sender] = newInsuranceData;
  }

  function checkInsuranceData() public payable returns (uint256) {
    require(
      InsuranceData.latNw != 0 &&
        InsuranceData.longNw != 0 &&
        InsuranceData.latNe != 0 &&
        InsuranceData.longNe != 0 &&
        InsuranceData.latSe != 0 &&
        InsuranceData.longSe != 0 &&
        InsuranceData.latSw != 0 &&
        InsuranceData.longSw != 0 &&
        InsuranceData.configParam != 0 &&
        InsuranceData.insuranceType != 0 &&
        InsuranceData.numDays != 0 &&
        InsuranceData.startDay != 0,
      "User data not found or incomplete"
    );

    return 1;
  }
}
