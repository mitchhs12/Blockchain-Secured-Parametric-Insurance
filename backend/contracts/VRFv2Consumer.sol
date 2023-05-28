// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface IRandomnessReceiver {
  function receiveRandomness(uint256 requestId, uint256[] memory randomWords) external;
}

contract VRFv2Consumer is VRFConsumerBaseV2, ConfirmedOwner {
  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);

  struct RequestStatus {
    bool fulfilled;
    bool exists;
    uint256[] randomWords;
  }
  mapping(uint256 => RequestStatus) public s_requests;
  VRFCoordinatorV2Interface COORDINATOR;

  uint64 s_subscriptionId;
  uint256[] public requestIds;
  uint256 public lastRequestId;
  address public allowedContract;
  bool public isAllowedContractSet = false;
  bytes32 keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
  uint32 callbackGasLimit = 100000;
  uint16 requestConfirmations = 3;
  uint32 numWords = 3;

  constructor(
    uint64 subscriptionId
  ) VRFConsumerBaseV2(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255) ConfirmedOwner(msg.sender) {
    COORDINATOR = VRFCoordinatorV2Interface(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255);
    s_subscriptionId = subscriptionId;
  }

  function requestRandomWords() external onlyOwner returns (uint256 requestId) {
    require(msg.sender == allowedContract, "Not the allowed contract");
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
    emit RequestSent(requestId, numWords);
    return requestId;
  }

  function setAllowedContract(address _allowedContract) external onlyOwner {
    require(!isAllowedContractSet, "Allowed contract is already set");
    allowedContract = _allowedContract;
    isAllowedContractSet = true;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
    require(s_requests[_requestId].exists, "request not found");
    s_requests[_requestId].fulfilled = true;
    s_requests[_requestId].randomWords = _randomWords;
    emit RequestFulfilled(_requestId, _randomWords);

    // Send the randomness to the Insurance contract
    IRandomnessReceiver(allowedContract).receiveRandomness(_requestId, _randomWords);
  }

  function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
    require(s_requests[_requestId].exists, "request not found");
    RequestStatus memory request = s_requests[_requestId];
    return (request.fulfilled, request.randomWords);
  }
}
