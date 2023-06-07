// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./LinkMaticPriceFeed.sol";
import "./MaticUsdPriceFeed.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";

contract Insurance is FunctionsClient, VRFConsumerBaseV2, ConfirmedOwner {
  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);
  event UserPaid(address userAddress, uint256 payoutAmountInMatic);
  event PolicyCreated(address policyOwner, uint256 policyIndex, uint256 cost);
  event PolicyStarted(address policyOwner, uint256 policyIndex);
  event PolicyEnded(address policyOwner, uint256 policyIndex);
  event AdjustedArgs(string[] args);

  string public sourceCode;

  struct RequestStatus {
    bool fulfilled;
    bool exists;
    uint256[] randomWords;
  }

  enum PolicyStatus {
    Pending,
    Started,
    Ended
  }

  struct InsuranceQuoteData {
    address user;
    uint256 policyIndex;
    uint256 cost;
  }

  modifier onlyCheckPayout() {
    require(msg.sender == checkPayoutContract, "Caller is not the CheckPayout contract");
    _;
  }

  address public checkPayoutContract;
  uint256 public constructionTime;

  //vrf variables
  VRFCoordinatorV2Interface COORDINATOR;
  uint64 s_subscriptionId;
  uint256[] public requestIds;
  uint256 public lastRequestId;
  bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
  uint32 callbackGasLimit = 300000;
  uint16 requestConfirmations = 3;
  uint32 numWords = 1;

  // Instantiate the price feed
  LinkMaticPriceFeed public linkMaticPriceFeed;
  MaticUsdPriceFeed public maticUsdPriceFeed;

  // Functions variables
  using Functions for Functions.Request;
  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  event OCRRequest(bytes32 indexed requestId);
  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  constructor(
    address oracle,
    address linkMaticAddress,
    address maticUsdAddress,
    uint64 subscriptionId
  ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed) {
    linkMaticPriceFeed = LinkMaticPriceFeed(linkMaticAddress);
    maticUsdPriceFeed = MaticUsdPriceFeed(maticUsdAddress);
    COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
    s_subscriptionId = subscriptionId;
    constructionTime = block.timestamp;
    checkPayoutContract = msg.sender;
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
    string startTime;
    string endTime;
    string policyCreationTime;
  }

  mapping(address => mapping(uint256 => bytes32)) public policyRequestIdMapping;
  mapping(address => mapping(uint256 => PolicyStatus)) public policyStatus;
  mapping(bytes32 => InsuranceQuoteData) public insuranceQuoteData;
  mapping(address => InsuranceData[]) public insurancePoliciesMapping;
  mapping(uint256 => address) public randomnessRequesterAddress;
  mapping(uint256 => RequestStatus) public s_requests;

  function boolInsuranceData() public view returns (bool) {
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
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public payable returns (bytes32) {
    // Ensure at least 1 Matic is sent to cover the cost of the offchain computation.
    //require(msg.value >= uint256(getLatestPrice()), "Not enough Matic sent");
    require(args.length == 11, "Invalid number of arguments"); // total of 12 arguments

    InsuranceData[] storage policies = insurancePoliciesMapping[msg.sender];
    string memory policyCreationTimeString = Strings.toString(block.timestamp);

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
        startTime: args[9],
        endTime: args[10],
        policyCreationTime: policyCreationTimeString
      })
    );

    uint256 newPolicyIndex = insurancePoliciesMapping[msg.sender].length - 1;

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, sourceCode);
    string[] memory adjustedArgs = new string[](args.length + 1);
    for (uint256 i = 0; i < args.length; i++) {
      adjustedArgs[i] = args[i];
    }
    adjustedArgs[args.length] = policyCreationTimeString;
    req.addArgs(adjustedArgs);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    insuranceQuoteData[assignedReqID] = InsuranceQuoteData({user: msg.sender, policyIndex: newPolicyIndex, cost: 0});
    latestRequestId = assignedReqID;
    policyRequestIdMapping[msg.sender][newPolicyIndex] = assignedReqID;
    emit OCRRequest(assignedReqID);
    return assignedReqID;
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    InsuranceQuoteData storage quote = insuranceQuoteData[requestId];
    uint256 numResponse = bytesToUint256(response);
    quote.cost = numResponse;
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);
    emit PolicyCreated(quote.user, quote.policyIndex, quote.cost);
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

  // END VRF METHODS

  // Datafeed Method
  function getPriceLinkMatic() public view returns (int) {
    return linkMaticPriceFeed.getLatestPrice();
  }

  function getPriceMaticUsd() public view returns (int) {
    return maticUsdPriceFeed.getLatestPrice();
  }

  function helloWorld() public view returns (string memory) {
    return "Hello World!";
  }

  function getCurrentTime() public view returns (uint256) {
    return currentTime;
  }

  function startPolicy(bytes32 requestId) public payable returns (uint256) {
    InsuranceQuoteData storage quote = insuranceQuoteData[requestId];
    uint256 cost = quote.cost;
    uint256 policyIndex = quote.policyIndex;

    // Get the insurance policy and check if it's pending
    InsuranceData storage policy = insurancePoliciesMapping[msg.sender][policyIndex];
    require(policyStatus[msg.sender][policyIndex] == PolicyStatus.Pending, "Policy is not pending");

    // Check the Matic price and calculate the cost of the insurance in Matic
    uint256 priceOfMatic = uint256(getPriceMaticUsd());
    // Multiply by 10^8 to preserve decimal points as we're working with int
    uint256 amountInMatic = (cost * 10 ** 6) / priceOfMatic;
    require(msg.value >= amountInMatic, "Not enough Matic sent");

    policyStatus[msg.sender][policyIndex] = PolicyStatus.Started;
    emit PolicyStarted(msg.sender, policyIndex);
  }

  function setCheckPayoutContract(address _checkPayoutContract) external onlyOwner {
    checkPayoutContract = _checkPayoutContract;
  }

  function endPolicy(address policyOwner, uint256 policyIndex) external onlyCheckPayout {
    policyStatus[policyOwner][policyIndex] = PolicyStatus.Ended;
    emit PolicyEnded(policyOwner, policyIndex);
  }

  function payUser(address payable userAddress, uint256 payoutAmount) external onlyCheckPayout {
    uint256 priceOfMatic = uint256(getPriceMaticUsd());
    uint256 payoutAmountInMatic = (payoutAmount * 10 ** 6) / priceOfMatic;
    userAddress.transfer(payoutAmountInMatic);
    emit UserPaid(userAddress, payoutAmountInMatic);
  }

  function getPolicyData(address user, uint256 policyIndex) public view returns (InsuranceData memory) {
    return insurancePoliciesMapping[user][policyIndex];
  }

  function getAllUserPolicies(address user) public view returns (InsuranceData[] memory) {
    return insurancePoliciesMapping[user];
  }

  function getInsuranceQuoteData(bytes32 requestId) public view returns (InsuranceQuoteData memory) {
    require(insuranceQuoteData[requestId].user != address(0), "No data found for the given requestId");
    return insuranceQuoteData[requestId];
  }

  function getLastRandomWord() public view returns (uint256) {
    require(s_requests[lastRequestId].exists, "No random words have been generated yet");
    uint256 lastRandomWord = s_requests[lastRequestId].randomWords[0]; // Retrieve only the first word
    return lastRandomWord;
  }

  function getPolicyRequestId(address _address, uint256 _policyIndex) public view returns (bytes32) {
    return policyRequestIdMapping[_address][_policyIndex];
  }

  function setSourceCode(string memory _sourceCode) public onlyOwner {
    sourceCode = _sourceCode;
  }

  function getSourceCode() public view returns (string memory) {
    return sourceCode;
  }

  function bytesToUint256(bytes memory input) public pure returns (uint256 result) {
    assembly {
      result := mload(add(input, 0x20))
    }
  }
}
