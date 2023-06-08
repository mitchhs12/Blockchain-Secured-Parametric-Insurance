// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import "./Insurance.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Check Policy Payout Contract
 * @author Mitchell Spencer
 * @notice This contract is used to check the status of user insurance policies generated in the Insurance Policy Generator Contract.
 * @dev Implements Chainlink Functions
 **/
contract CheckPayout is FunctionsClient, Ownable {
  // Type declarations
  struct PolicyData {
    Insurance.InsuranceData insuranceData;
    Insurance.InsuranceQuoteData quoteData;
  }

  // State variables
  string public sourceCode;
  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;
  Insurance public insuranceContract;
  mapping(bytes32 => uint256) public requestIdToPolicyIndex;
  mapping(bytes32 => address) public requestIdToSender;
  using Functions for Functions.Request;

  // Events
  event UsingArgs(string[] args);
  event Payout(address originalSender, uint256 policyIndex, uint256 payoutAmount);
  event PolicyEnded(address originalSender, uint256 policyIndex);
  event TimeRemaining(address originalSender, uint256 policyIndex, uint256 timeRemaining);
  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  constructor(address oracle, address insuranceAddress) FunctionsClient(oracle) {
    insuranceContract = Insurance(insuranceAddress);
  }

  /**
   * @notice MAIN CHECK POLICY PAYOUT FUNCTION
   * @param subscriptionId Funtions billing subscription ID
   * @param gasLimit The gas limit for the offchain computation
   * @param policyIndex The index of the policy to check in the user's policies array
   **/
  function checkPolicy(uint64 subscriptionId, uint32 gasLimit, uint256 policyIndex) public returns (bytes32) {
    /**
     * @notice Ensure that the user sends at least 1 MATIC to cost the cost of offchain computation
     **/
    // require(msg.value >= uint256(insuranceContract.getLatestPrice()), "Not enough MATIC to cover offchain cost")
    PolicyData memory policyData;
    policyData.insuranceData = insuranceContract.getPolicyData(msg.sender, policyIndex);
    bytes32 requestId = insuranceContract.getPolicyRequestId(msg.sender, policyIndex);
    policyData.quoteData = insuranceContract.getInsuranceQuoteData(requestId);
    uint256 cost = policyData.quoteData.cost;

    // Use the retrieved values as arguments in the args parameter
    string[] memory argsWithInsuranceData = new string[](14);

    argsWithInsuranceData[0] = policyData.insuranceData.latNe;
    argsWithInsuranceData[1] = policyData.insuranceData.longNe;
    argsWithInsuranceData[2] = policyData.insuranceData.latSe;
    argsWithInsuranceData[3] = policyData.insuranceData.longSe;
    argsWithInsuranceData[4] = policyData.insuranceData.latSw;
    argsWithInsuranceData[5] = policyData.insuranceData.longSw;
    argsWithInsuranceData[6] = policyData.insuranceData.latNw;
    argsWithInsuranceData[7] = policyData.insuranceData.longNw;
    argsWithInsuranceData[8] = policyData.insuranceData.configParam;
    argsWithInsuranceData[9] = policyData.insuranceData.startTime;
    argsWithInsuranceData[10] = policyData.insuranceData.endTime;
    argsWithInsuranceData[11] = Strings.toString(block.timestamp);
    argsWithInsuranceData[12] = policyData.insuranceData.policyCreationTime;
    argsWithInsuranceData[13] = Strings.toString(insuranceContract.getLastRandomWord());

    /**
     * @notice This commented code is used for consistency with the frontend since the offchain
     * @notice computation will return an error if the end time is within 1 day of the current time
     * @notice since the API has to record the current day's data.
     **/

    //uint startTime = uint256(abi.decode(bytes(argsWithInsuranceData[9]), (uint256)));
    //require(block.timestamp > startTime, "Current time must be greater than start time");

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, sourceCode);
    req.addArgs(argsWithInsuranceData);
    emit UsingArgs(argsWithInsuranceData);
    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;

    requestIdToPolicyIndex[assignedReqID] = policyIndex;
    requestIdToSender[assignedReqID] = msg.sender;
    return assignedReqID;
  }

  /**
   * @notice Policy could be updated and user paid upon result of offchain computation
   **/
  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);

    uint256 policyIndex = requestIdToPolicyIndex[requestId];
    address originalSender = requestIdToSender[requestId];

    Insurance.InsuranceData memory insuranceData = insuranceContract.getPolicyData(originalSender, policyIndex);

    // Check for a non-zero payout amount (if so, pay user and end policy)
    uint256 payoutAmount = insuranceContract.bytesToUint256(response);
    if (payoutAmount > 0) {
      insuranceContract.payUser(payable(originalSender), payoutAmount);
      insuranceContract.endPolicy(originalSender, policyIndex); // policyIndex must be stored for the request
      emit Payout(originalSender, policyIndex, payoutAmount);
    } else {
      // Check if we should end the policy
      uint256 endTime = stringToUint256(insuranceData.endTime); // Conversion
      if (block.timestamp > endTime) {
        insuranceContract.endPolicy(originalSender, policyIndex);
        emit PolicyEnded(originalSender, policyIndex);
      } else {
        emit TimeRemaining(originalSender, policyIndex, endTime - block.timestamp);
      }
    }
  }

  /**
   * @notice Allows the Functions oracle address to be updated
   *
   * @param oracle New oracle address
   */
  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }

  /**
   * @notice Allows the source code to be updated
   **/
  function setSourceCode(string memory _sourceCode) public onlyOwner {
    sourceCode = _sourceCode;
  }

  /**
   * @notice GETTER METHODS
   **/
  function getSourceCode() public view returns (string memory) {
    return sourceCode;
  }

  /**
   * @notice UTILITY METHODS
   **/
  function stringToUint256(string memory s) public pure returns (uint256) {
    bytes memory b = bytes(s);
    uint256 result = 0;
    for (uint i = 0; i < b.length; i++) {
      uint256 c = uint256(uint8(b[i]));
      if (c >= 48 && c <= 57) {
        result = result * 10 + (c - 48);
      }
    }
    return result;
  }
}
