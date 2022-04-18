 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Company{
	struct Queue{
		mapping(uint32 => address) claims;
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

	function addClaim(address userAddress) public restricted {
		claimed.last++;
		claimed.claims[claimed.last] = userAddress;
	}

	function addVerifiedClaim(address userAddress) public restricted {
		verified.last++;
		verified.claims[verified.last] = userAddress;
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

	function firstClaim() public view returns(address){
		require(claimed.last >= claimed.first); // Queue is not empty.
		address userAddress = claimed.claims[claimed.first];
		return userAddress;
	}

	function firstVerifiedClaim() public view returns(address) {
		require(verified.last >= verified.first); // Queue is not empty.
		address userAddress = verified.claims[verified.first];
		return userAddress;
	}

	modifier restricted() {
		require(msg.sender == companyAddress);
		_;
	}
}