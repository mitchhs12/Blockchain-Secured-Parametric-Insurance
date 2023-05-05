// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./insurances/Rain.sol";
import "./insurances/Drought.sol";
import "./insurances/Earthquake.sol";
import "./insurances/Snow.sol";

contract InsuranceContract {
  enum InsuranceType {
    Rain, // 0
    Drought, // 1
    Earthquake, // 2
    Snow // 3
  }

  struct InsurancePolicy {
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
  }

  mapping(address => InsurancePolicy[]) public userPolicies;

  function purchaseInsurance(
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
    uint256 numDays
  ) public payable {
    // Calculate insurance cost
    uint256 cost = estimateInsuranceCost(configParam, insuranceType, numDays);
    require(msg.value >= cost, "Insufficient funds");

    // Create and append new insurance policy to user mapping
    InsurancePolicy memory newPolicy = InsurancePolicy(
      latNw,
      longNw,
      latNe,
      longNe,
      latSe,
      longSe,
      latSw,
      longSw,
      configParam,
      insuranceType,
      numDays
    );
    userPolicies[msg.sender].push(newPolicy);

    // Send any excess funds back to user
    if (msg.value > cost) {
      payable(msg.sender).transfer(msg.value - cost);
    }
  }
}
