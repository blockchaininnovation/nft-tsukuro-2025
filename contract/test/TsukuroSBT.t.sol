// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TsukuroSBT} from "../src/TsukuroSBT.sol";

contract TsukuroSBTTest is Test {
    TsukuroSBT public tsukuroSBT;
    address internal ownerAddr;

    function setUp() public {
        // Use an EOA-like address as contract owner to avoid ERC1155 receiver checks
        ownerAddr = address(0xABCD);
        tsukuroSBT = new TsukuroSBT(ownerAddr);
    }

    function test_OwnerIsInitializer() public view {
        assertEq(tsukuroSBT.owner(), ownerAddr);
    }

    function test_MintLocked_ToOwner_AllowsLockedQuery() public {
        uint256 id = 1;
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(ownerAddr, id, 1, "");
        assertEq(tsukuroSBT.balanceOf(ownerAddr, id), 1);
        assertTrue(tsukuroSBT.locked(id));
    }

    function test_NonOwner_MintToSelf_SucceedsAndLocked() public {
        address alice = address(0xA11CE);
        uint256 id = 101;
        vm.prank(alice);
        tsukuroSBT.mintLocked(alice, id, 1, "");
        assertEq(tsukuroSBT.balanceOf(alice, id), 1);
        assertTrue(tsukuroSBT.locked(id));
    }

    function test_NonOwner_MintToOther_Reverts() public {
        address alice = address(0xA11CE);
        address bob = address(0xB0B);
        uint256 id = 102;
        vm.startPrank(alice);
        vm.expectRevert(bytes("SBT: only owner can set recipient"));
        tsukuroSBT.mintLocked(bob, id, 1, "");
        vm.stopPrank();
    }

    function test_TransferRevertsWhenLocked() public {
        address alice = address(0xA11CE);
        address bob = address(0xB0B);
        uint256 id = 2;
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, id, 1, "");

        vm.startPrank(alice);
        vm.expectRevert(bytes("SBT: token is locked"));
        tsukuroSBT.safeTransferFrom(alice, bob, id, 1, "");
        vm.stopPrank();
    }

    function test_BatchTransferRevertsWhenAnyLocked() public {
        address alice = address(0xA11CE);
        address bob = address(0xB0B);
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        ids[0] = 10;
        ids[1] = 11;
        amounts[0] = 1;
        amounts[1] = 1;

        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, ids[0], 1, "");
        tsukuroSBT.mintLocked(alice, ids[1], 1, "");
        vm.stopPrank();

        vm.startPrank(alice);
        vm.expectRevert(bytes("SBT: token is locked"));
        tsukuroSBT.safeBatchTransferFrom(alice, bob, ids, amounts, "");
        vm.stopPrank();
    }

    function test_SupportsInterface_ERC5192_and_ERC1155() public view {
        // ERC-5192
        bytes4 erc5192Id = tsukuroSBT.IID_IERC5192();
        assertTrue(tsukuroSBT.supportsInterface(erc5192Id));

        // ERC-1155 interfaceId per EIP: 0xd9b67a26
        assertTrue(tsukuroSBT.supportsInterface(0xd9b67a26));
    }

    function test_LockedRevertsForNonexistentToken() public {
        // No token with id 999 has been minted to owner(), so _exists returns false
        vm.expectRevert(bytes("SBT: query for nonexistent token"));
        tsukuroSBT.locked(999);
    }
}
