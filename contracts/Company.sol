 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Company{
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
	
	address public companyAddress;
	Queue public claimed;
	Queue public verified;

	constructor() {
		companyAddress = msg.sender;
		claimed.first = 1;
		claimed.last = 0;
		verified.first = 1;
		verified.last = 0;
	}

	function addClaim(string calldata patientName, string calldata reasonForHospitalization, uint32 amountPayable) public restricted {
		claimed.last++;
		claimed.claims[claimed.last] = Claim({ patientName : patientName, reasonForHospitalization : reasonForHospitalization, amountPayable : amountPayable });
	}

	function addVerifiedClaim(string calldata patientName, string calldata reasonForHospitalization, uint32 amountPayable) public restricted {
		verified.last++;
		verified.claims[verified.last] = Claim({ patientName : patientName, reasonForHospitalization : reasonForHospitalization, amountPayable : amountPayable });
	}

	function removeClaim() public restricted (){
		require(claimed.last >= claimed.first); // Queue is not empty.
		delete claimed.claims[claimed.first];
		claimed.first++;
	}

	function removeVerifiedClaim() public restricted (){
		require(verified.last >= verified.first); // Queue is not empty.
		delete verified.claims[verified.first];
		verified.first++;
	}

	function firstClaim() public view returns(Claim memory){
		require(claimed.last >= claimed.first); // Queue is not empty.
		Claim memory claim = claimed.claims[claimed.first];
		return claim;
	}

	function firstVerifiedClaim() public view returns(Claim memory) {
		require(verified.last >= verified.first); // Queue is not empty.
		Claim memory verifiedClaim = verified.claims[verified.first];
		return verifiedClaim;
	}

	modifier restricted() {
		require(msg.sender == companyAddress);
		_;
	}
}