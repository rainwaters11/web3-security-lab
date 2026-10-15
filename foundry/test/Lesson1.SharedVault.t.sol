// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SharedVault} from "../src/SharedVault.sol";

contract UserActor {
    SharedVault internal immutable vault;

    constructor(SharedVault _vault) payable {
        vault = _vault;
    }

    function depositToVault(uint256 amount) external {
        vault.deposit{value: amount}();
    }

    function withdrawFromVault(uint256 amount) external {
        vault.withdraw(amount);
    }

    receive() external payable {}
}

contract ReenterOnceAttacker {
    SharedVault internal immutable vault;
    bool internal entered;

    constructor(SharedVault _vault) payable {
        vault = _vault;
    }

    function depositIntoVault() external {
        vault.deposit{value: 1 ether}();
    }

    function attackSingleReentry() external {
        vault.withdraw(1 ether);
    }

    function maxConfiguredReentries() external pure returns (uint256) {
        return 1;
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            vault.withdraw(1 ether);
        }
    }
}

contract Lesson1SharedVaultTest {
    SharedVault internal vault;
    ReenterOnceAttacker internal alice;
    UserActor internal bob;

    function setUp() public {
        vault = new SharedVault();
        alice = new ReenterOnceAttacker{value: 1 ether}(vault);
        bob = new UserActor{value: 2 ether}(vault);

        alice.depositIntoVault();
        bob.depositToVault(2 ether);

        require(address(vault).balance == 3 ether, "setup vault ETH mismatch");
        require(vault.balanceOf(address(alice)) == 1 ether, "setup alice mismatch");
        require(vault.balanceOf(address(bob)) == 2 ether, "setup bob mismatch");
        require(alice.maxConfiguredReentries() == 1, "attacker must reenter exactly once");
    }

    function test_NormalWithdrawal_WithinBalance_Succeeds() public {
        bob.withdrawFromVault(1 ether);

        require(vault.balanceOf(address(bob)) == 1 ether, "bob recorded balance should decrement");
        require(vault.balanceOf(address(alice)) == 1 ether, "alice recorded balance should stay unchanged");
        require(address(vault).balance == 2 ether, "vault ETH should decrease by 1 ETH");
    }

    function test_ExcessWithdrawal_RevertsAndStateUnchanged() public {
        bool sawInsufficient = false;

        try bob.withdrawFromVault(3 ether) {
            revert("excess withdrawal should revert");
        } catch Error(string memory reason) {
            sawInsufficient = keccak256(bytes(reason)) == keccak256(bytes("Insufficient balance"));
        } catch {
            revert("expected Insufficient balance error");
        }

        require(sawInsufficient, "expected Insufficient balance revert reason");
        require(vault.balanceOf(address(alice)) == 1 ether, "alice recorded balance should remain 1 ETH");
        require(vault.balanceOf(address(bob)) == 2 ether, "bob recorded balance should remain 2 ETH");
        require(address(vault).balance == 3 ether, "vault ETH should remain 3 ETH");
    }

    function test_ReentrantWithdrawal_AttemptRevertsAndStateRestored() public {
        bool sawArithmeticPanic = false;

        try alice.attackSingleReentry() {
            revert("single-reentry theft attempt should panic");
        } catch Panic(uint256 code) {
            sawArithmeticPanic = (code == 0x11);
        } catch {
            revert("expected Panic(0x11)");
        }

        require(sawArithmeticPanic, "expected arithmetic panic 0x11");
        require(vault.balanceOf(address(alice)) == 1 ether, "alice recorded balance should remain 1 ETH");
        require(vault.balanceOf(address(bob)) == 2 ether, "bob recorded balance should remain 2 ETH");
        require(address(vault).balance == 3 ether, "vault ETH should remain 3 ETH");
    }
}
