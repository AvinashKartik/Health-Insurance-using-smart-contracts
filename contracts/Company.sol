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

	function removeClaim() public restricted returns(Claim memory){
		require(claimed.last >= claimed.first); // Queue is not empty.
		Claim memory firstClaim = claimed.claims[claimed.first];
		delete claimed.claims[claimed.first];
		claimed.first++;
		return firstClaim;
	}

	function removeVerifiedClaim() public restricted returns(Claim memory){
		require(verified.last >= verified.first); // Queue is not empty.
		Claim memory firstVerifiedClaim = verified.claims[verified.first];
		delete verified.claims[verified.first];
		verified.first++;
		return firstVerifiedClaim;
	}

	modifier restricted() {
		require(msg.sender == companyAddress);
		_;
	}
}