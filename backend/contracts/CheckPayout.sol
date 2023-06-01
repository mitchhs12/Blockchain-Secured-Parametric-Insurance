// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "./Insurance.sol";

contract CheckPayout is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  Insurance public insuranceContract;

  mapping(bytes32 => uint256) public requestIdToPolicyIndex;
  mapping(bytes32 => address) public requestIdToSender;

  constructor(address oracle, address insuranceAddress) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    insuranceContract = Insurance(insuranceAddress);
  }

  function checkPolicy(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit,
    uint256 policyIndex
  ) public returns (bytes32) {
    Insurance.InsuranceData memory insuranceData = insuranceContract.getPolicyData(msg.sender, policyIndex);

    // Use the retrieved values as arguments in the args parameter
    string[] memory argsWithInsuranceData = new string[](args.length + 12);
    for (uint256 i = 0; i < args.length; i++) {
      argsWithInsuranceData[i] = args[i];
    }

    argsWithInsuranceData[args.length] = insuranceData.latNe;
    argsWithInsuranceData[args.length + 1] = insuranceData.longNe;
    argsWithInsuranceData[args.length + 2] = insuranceData.latSe;
    argsWithInsuranceData[args.length + 3] = insuranceData.longSe;
    argsWithInsuranceData[args.length + 4] = insuranceData.latSw;
    argsWithInsuranceData[args.length + 5] = insuranceData.longSw;
    argsWithInsuranceData[args.length + 6] = insuranceData.latNw;
    argsWithInsuranceData[args.length + 7] = insuranceData.longNw;
    argsWithInsuranceData[args.length + 8] = insuranceData.configParam;
    argsWithInsuranceData[args.length + 9] = insuranceData.startTime;
    argsWithInsuranceData[args.length + 10] = insuranceData.endTime;

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }
    if (args.length > 0) req.addArgs(args);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;

    requestIdToPolicyIndex[assignedReqID] = policyIndex;
    requestIdToSender[assignedReqID] = msg.sender;
    return assignedReqID;
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);

    uint256 policyIndex = requestIdToPolicyIndex[requestId];
    address originalSender = requestIdToSender[requestId];

    Insurance.InsuranceData memory insuranceData = insuranceContract.getPolicyData(msg.sender, policyIndex);

    // Check for payout
    uint256 payoutAmount = insuranceContract.bytesToUint256(response);
    if (payoutAmount > 0) {
      insuranceContract.payUser(payable(originalSender), payoutAmount);
      insuranceContract.endPolicy(originalSender, policyIndex); // policyIndex must be stored for the request
    } else {
      // Check for end of policy
      uint256 endTime = stringToUint256(insuranceData.endTime); // Conversion
      if (block.timestamp > endTime) {
        insuranceContract.endPolicy(originalSender, policyIndex);
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
