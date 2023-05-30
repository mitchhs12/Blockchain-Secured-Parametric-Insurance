// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./PriceConsumerV3.sol";
import "./VRFv2Consumer.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Insurance is FunctionsClient, VRFConsumerBaseV2, ConfirmedOwner {
  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);

  struct RequestStatus {
    bool fulfilled;
    bool exists;
    uint256[] randomWords;
  }

  struct InsuranceQuoteData {
    address user;
    uint256 policyIndex;
    bytes response;
  }

  mapping(uint256 => RequestStatus) public s_requests;
  VRFCoordinatorV2Interface COORDINATOR;

  //vrf variables
  uint64 s_subscriptionId;
  uint256[] public requestIds;
  uint256 public lastRequestId;
  bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
  uint32 callbackGasLimit = 300000;
  uint16 requestConfirmations = 3;
  uint32 numWords = 3;

  // Instantiate the price feed
  PriceConsumerV3 public priceFeed;

  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;
  int256 public globalDayNumber;
  uint256 public constructionTime;

  event OCRRequest(bytes32 indexed requestId);
  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  constructor(
    address oracle,
    address linkMaticPrice,
    uint64 subscriptionId
  ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed) {
    priceFeed = PriceConsumerV3(linkMaticPrice);
    COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
    s_subscriptionId = subscriptionId;
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
  }

  mapping(bytes32 => InsuranceQuoteData) public responseData;
  mapping(bytes32 => address) public functionsRequesterAddresses;
  mapping(address => InsuranceData[]) public insurancePoliciesMapping;
  mapping(uint256 => address) public randomnessRequesterAddress;

  function checkInsuranceData() public view returns (bool) {
    InsuranceData[] storage insuranceData = insurancePoliciesMapping[msg.sender];
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

  // START FUNCTIONS METHODS
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

    InsuranceData[] storage policies = insurancePoliciesMapping[msg.sender];
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
          endTime: args[11]
        })
      );
      newInsuranceData = policies[policies.length - 1];
    }
    uint256 newPolicyIndex = insurancePoliciesMapping[msg.sender].length - 1;

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
    responseData[assignedReqID] = InsuranceQuoteData({user: msg.sender, policyIndex: newPolicyIndex, response: ""});
    latestRequestId = assignedReqID;
    functionsRequesterAddresses[assignedReqID] = msg.sender;
    emit OCRRequest(assignedReqID);
    return assignedReqID;
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    InsuranceQuoteData storage quote = responseData[requestId];
    quote.response = response;
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);
  }

  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }

  function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
    require(s_requests[_requestId].exists, "request not found");
    RequestStatus memory request = s_requests[_requestId];
    return (request.fulfilled, request.randomWords);
  }

  // END FUNCTIONS METHODS

  // START VRF METHODS
  // Assumes the subscription is funded sufficiently.
  function requestRandomWords() public onlyOwner returns (uint256 requestId) {
    // Will revert if subscription is not set and funded.
    requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
    s_requests[requestId] = RequestStatus({randomWords: new uint256[](0), exists: true, fulfilled: false});
    requestIds.push(requestId);
    lastRequestId = requestId;
    randomnessRequesterAddress[requestId] = msg.sender;
    emit RequestSent(requestId, numWords);
    return requestId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
    require(s_requests[_requestId].exists, "request not found");
    s_requests[_requestId].fulfilled = true;
    s_requests[_requestId].randomWords = _randomWords;
    emit RequestFulfilled(_requestId, _randomWords);
  }

  function getLastRandomWords(uint256 _requestId) public view returns (uint256[] memory) {
    require(s_requests[lastRequestId].exists, "No random words have been generated yet");

    uint256[] memory lastRandomWords = new uint256[](3);
    for (uint i = 0; i < 3; i++) {
      lastRandomWords[i] = s_requests[lastRequestId].randomWords[i];
    }

    return lastRandomWords;
  }

  // END VRF METHODS

  // Datafeed Method
  function getLatestPrice() public view returns (int) {
    return priceFeed.getLatestPrice();
  }

  function helloWorld() public view returns (string memory) {
    console.log("Test");
    return "Hello World!";
  }

  function getCurrentTime() public view returns (uint256) {
    return currentTime;
  }

  function startPolicy() public returns (uint256) {
    require(insurancePoliciesMapping[msg.sender].length > 0, "No insurance data found");
    InsuranceData storage insuranceData = insurancePoliciesMapping[msg.sender][0];
    insuranceData.startTime = Strings.toString(currentTime);
    return currentTime;
  }
}
