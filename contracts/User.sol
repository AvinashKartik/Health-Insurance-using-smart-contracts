// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract User {
    struct insurance {
        bool isActive;
        address companyAddress;
        uint16 deductible;
        uint8 coinsurance;
    }
    struct Claim{
		string patientName;
		string reasonForHospitalization;
		uint32 amountPayable;
	}

    address public userAddress;
    insurance public insuranceDetails;
    Claim public insuranceClaim;
    bool public claimed;

    constructor() {
        userAddress = msg.sender;
        claimed = false;
    }

    function buyInsurance(address companyAddress, uint16 deductible, uint8 coinsurance) public restricted {
        insuranceDetails = insurance({ isActive : true, companyAddress : companyAddress, deductible : deductible, coinsurance : coinsurance });
    }
    
    function resetInsurance() public restricted {
        insuranceDetails.isActive = false;
    }

    function addClaim(string calldata patientName, string calldata reasonForHospitalization, uint32 amountPayable) public restricted {
        require(insuranceDetails.isActive = true);
		require(claimed == false);
		insuranceClaim = Claim({ patientName : patientName, reasonForHospitalization : reasonForHospitalization, amountPayable : amountPayable });
        claimed = true;
    }

    function removeClaim() public restricted {
        require(claimed == true);
        claimed = false;
    }

    function getClaim() public view returns(Claim memory) {
        require(claimed == true);
        return insuranceClaim;
    }
    
    modifier restricted() {
        require(msg.sender == userAddress);
        _;
    }

}