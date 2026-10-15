// Training contract only. Never deploy with real funds.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SharedVault {
    mapping(address => uint256) public balanceOf;
    address public curator;

    constructor() {
        curator = msg.sender;
    }

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balanceOf[msg.sender] -= amount;
    }

    function changeCurator(address next) external {
        curator = next;
    }
}
