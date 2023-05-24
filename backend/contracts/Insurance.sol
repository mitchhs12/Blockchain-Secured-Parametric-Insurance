// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./insurances/Rain.sol";
import "./insurances/Drought.sol";
import "./insurances/Earthquake.sol";
import "./insurances/Snow.sol";
import {getLatestPrice} from "./LinkMaticPrice.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Insurance is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

  struct InsuranceData {
    string latNw;
    string longNw;
    string latNe;
    string longNe;
    string latSe;
    string longSe;
    string latSw;
    string longSw;
    string insuranceType;
    string configParam;
    string numDays;
    string startDay;
  }

  mapping(address => InsuranceData[]) public insuranceDataMapping;

  function estimateInsurance(
    string calldata source,
    bytes calldata secrets,
    uint64 subscriptionId,
    uint32 gasLimit,
    string[] calldata args
  ) public payable returns (bytes32) {
    // Ensure at least 1 Matic is sent
    require(msg.value >= 1 ether, "Not enough Matic sent");
    require(args.length == 12, "Invalid number of arguments");

    InsuranceData[] storage policies = insuranceDataMapping[msg.sender];
    InsuranceData storage newInsuranceData = policies[policies.length - 1];

    newInsuranceData.latNw = args[0];
    newInsuranceData.longNw = args[1];
    newInsuranceData.latNe = args[2];
    newInsuranceData.longNe = args[3];
    newInsuranceData.latSe = args[4];
    newInsuranceData.longSe = args[5];
    newInsuranceData.latSw = args[6];
    newInsuranceData.longSw = args[7];
    newInsuranceData.configParam = args[8];
    newInsuranceData.insuranceType = args[9];
    newInsuranceData.numDays = args[10];
    newInsuranceData.startDay = args[11];

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }
    if (args.length > 0) req.addArgs(args);

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
        bytes(data.configParam).length != 0 &&
        bytes(data.insuranceType).length != 0 &&
        bytes(data.numDays).length != 0 &&
        bytes(data.startDay).length != 0
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * @notice Callback that is invoked once the DON has resolved the request or hit an error
   *
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);
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
}
