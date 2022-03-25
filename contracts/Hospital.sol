 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Hospital {
	struct Queue{
		mapping(uint32 => address) claims;
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
	
	function addClaim(address userAddress) public restricted {
		claimed.last++;
		claimed.claims[claimed.last] = userAddress;
	}
   
	function removeClaim() public restricted (){
		require(claimed.last >= claimed.first); // Queue is not empty.
		delete claimed.claims[claimed.first];
		claimed.first++;
	}

	function firstClaim() public view returns(address){
		require(claimed.last >= claimed.first); // Queue is not empty.
		address userAddress = claimed.claims[claimed.first];
		return userAddress;
	}

	modifier restricted() {
		require(msg.sender == hospitalAddress);
		_;
	}
}