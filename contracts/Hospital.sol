 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Hospital {
	struct Claim{
		string patientName;
		string reasonForHospitalization;
		uint32 amountPayable;
	}
	struct Queue{
		mapping(uint32 => Claim) claims;
		uint32 first;
		uint32 last;
	}
	
	address public hospitalAddress;
	Queue public claimed;

	constructor() {
		hospitalAddress = msg.sender;
		claimed.first = 1;
		claimed.last = 0;
	}
	
	function addClaim(string calldata patientName, string calldata reasonForHospitalization, uint32 amountPayable) public restricted {
		claimed.last++;
		claimed.claims[claimed.last] = Claim({ patientName : patientName, reasonForHospitalization : reasonForHospitalization, amountPayable : amountPayable });
	}
   
	function removeClaim() public restricted (){
		require(claimed.last >= claimed.first); // Queue is not empty.
		delete claimed.claims[claimed.first];
		claimed.first++;
	}

	function firstClaim() public view returns(Claim memory){
		require(claimed.last >= claimed.first); // Queue is not empty.
		Claim memory claim = claimed.claims[claimed.first];
		return claim;
	}

	modifier restricted() {
		require(msg.sender == hospitalAddress);
		_;
	}
}