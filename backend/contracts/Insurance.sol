// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./PriceConsumerV3.sol";
import "./VRFv2Consumer.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface RandomnessReceiver {
  function receiveRandomness(uint256 requestId, uint256[] calldata randomWords) external;
}

contract Insurance is FunctionsClient, ConfirmedOwner {
  // Instantiate the price feed
  PriceConsumerV3 public priceFeed;
  VRFv2Consumer public randomFeed;

  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;
  int256 public globalDayNumber;
  uint256 public constructionTime;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  constructor(
    address oracle,
    address linkMaticPrice,
    address randomness
  ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    priceFeed = PriceConsumerV3(linkMaticPrice);
    randomFeed = VRFv2Consumer(randomness);
    constructionTime = block.timestamp;
    globalDayNumber = 0;
  }

  uint256 public currentTime = block.timestamp;

  struct InsuranceData {
    string latNe; //0
    string longNe;
    string latSe;
    string longSe;
    string latSw;
    string longSw;
    string latNw;
    string longNw;
    string configParam;
    string currentTime;
    string startTime;
    string endTime;
    uint256[] randomPoints;
  }

  modifier hasPendingPolicy(address user) {
    InsuranceData[] storage policies = insuranceDataMapping[user];
    require(policies.length > 0, "No insurance data found for the user");

    InsuranceData storage latestPolicy = policies[policies.length - 1];
    uint256[] storage randomPoints = latestPolicy.randomPoints;
    for (uint256 i = 0; i < randomPoints.length; i++) {
      require(randomPoints[i] == 0, "Non-zero random points found");
    }
    _;
  }

  mapping(address => InsuranceData[]) public insuranceDataMapping;

  function estimateInsurance(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public payable returns (bytes32) {
    // Ensure at least 1 Matic is sent
    //require(msg.value >= uint256(getLatestPrice()), "Not enough Matic sent");
    require(args.length == 12, "Invalid number of arguments"); // total of 13 arguments including the globalDayNumber

    console.log("Got the latest price!");

    InsuranceData[] storage policies = insuranceDataMapping[msg.sender];
    InsuranceData storage newInsuranceData;
    if (policies.length == 0) {
      policies.push(
        InsuranceData({
          latNe: args[0],
          longNe: args[1],
          latSe: args[2],
          longSe: args[3],
          latSw: args[4],
          longSw: args[5],
          latNw: args[6],
          longNw: args[7],
          configParam: args[8],
          currentTime: args[9],
          startTime: args[10],
          endTime: args[11],
          randomPoints: new uint256[](3)
        })
      );
      newInsuranceData = policies[policies.length - 1];
    }

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }
    if (args.length > 0) req.addArgs(args);
    string memory constructionTimeString = Strings.toString(constructionTime);
    string[] memory argsWithConstructionTime = new string[](args.length + 1);
    for (uint256 i = 0; i < args.length; i++) {
      argsWithConstructionTime[i] = args[i];
    }
    argsWithConstructionTime[args.length] = constructionTimeString;
    console.log(argsWithConstructionTime[12]);
    req.addArgs(argsWithConstructionTime);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;
    return assignedReqID;
  }

  function checkInsuranceData() public view returns (bool) {
    InsuranceData[] storage insuranceData = insuranceDataMapping[msg.sender];
    require(insuranceData.length > 0, "No insurance data found");

    for (uint256 i = 0; i < insuranceData.length; i++) {
      InsuranceData memory data = insuranceData[i];

      if (
        bytes(data.latNw).length != 0 &&
        bytes(data.longNw).length != 0 &&
        bytes(data.latNe).length != 0 &&
        bytes(data.longNe).length != 0 &&
        bytes(data.latSe).length != 0 &&
        bytes(data.longSe).length != 0 &&
        bytes(data.latSw).length != 0 &&
        bytes(data.longSw).length != 0 &&
        bytes(data.configParam).length != 0
      ) {
        return true;
      }
    }

    return false;
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);
  }

  function getRandomWords() public hasPendingPolicy(msg.sender) returns (bytes memory) {
    randomFeed.requestRandomWords();
  }

  function receiveRandomness(uint256 requestId, uint256[] memory randomWords) external {
    require(msg.sender == address(randomFeed), "Only VRFv2Consumer can call this function");
    require(randomWords.length == 3, "Unexpected number of random numbers");

    // Update the latest insurance data for the sender with random points
    InsuranceData[] storage policies = insuranceDataMapping[msg.sender];
    require(policies.length > 0, "No insurance data found for the request sender");

    InsuranceData storage latestPolicy = policies[policies.length - 1];
    for (uint i = 0; i < 3; i++) {
      latestPolicy.randomPoints[i] = randomWords[i];
    }
  }

  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }

  function helloWorld() public view returns (string memory) {
    console.log("Test");
    return "Hello World!";
  }

  function getLatestPrice() public view returns (int) {
    return priceFeed.getLatestPrice();
  }

  function getCurrentTime() public view returns (uint256) {
    return currentTime;
  }
}
