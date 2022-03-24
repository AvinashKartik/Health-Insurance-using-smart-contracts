// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract User {
    struct insurance {
        bool isActive;
        address companyAddress;
        uint16 deductible;
        uint8 coinsurance;
    }

    address public userAddress;
    insurance public insuranceDetails;

    constructor() {
        userAddress = msg.sender;
    }

    function buyInsurance(address companyAddress, uint16 deductible, uint8 coinsurance) public restricted {
        insuranceDetails = insurance({ isActive : true, companyAddress : companyAddress, deductible : deductible, coinsurance : coinsurance });
    }
    
    function resetInsurance() public restricted {
        insuranceDetails.isActive = false;
    }
    
    modifier restricted() {
        require(msg.sender == userAddress);
        _;
    }

}