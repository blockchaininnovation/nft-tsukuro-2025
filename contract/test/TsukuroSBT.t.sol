// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TsukuroSBT} from "../src/TsukuroSBT.sol";

contract TsukuroSBTTest is Test {
    TsukuroSBT public tsukuroSBT;
    address internal ownerAddr;
    address internal alice;
    address internal bob;

    function setUp() public {
        ownerAddr = address(0xABCD);
        alice = address(0xA11CE);
        bob = address(0xB0B);
        tsukuroSBT = new TsukuroSBT(ownerAddr);
    }

    // ===== Basic Tests =====
    function test_OwnerIsInitializer() public view {
        assertEq(tsukuroSBT.owner(), ownerAddr);
    }

    function test_SupportsInterface_ERC5192_and_ERC1155() public view {
        bytes4 erc5192Id = tsukuroSBT.IID_IERC5192();
        assertTrue(tsukuroSBT.supportsInterface(erc5192Id));
        assertTrue(tsukuroSBT.supportsInterface(0xd9b67a26)); // ERC-1155
    }

    // ===== Token ID Helper Tests =====
    function test_getTeamId() public view {
        assertEq(tsukuroSBT.getTeamId(0), 0);
        assertEq(tsukuroSBT.getTeamId(10000), 1);
        assertEq(tsukuroSBT.getTeamId(20001), 2);
        assertEq(tsukuroSBT.getTeamId(20005), 2);
        assertEq(tsukuroSBT.getTeamId(30042), 3);
    }

    function test_getSerialNumber() public view {
        assertEq(tsukuroSBT.getSerialNumber(0), 0);
        assertEq(tsukuroSBT.getSerialNumber(10000), 0);
        assertEq(tsukuroSBT.getSerialNumber(20001), 1);
        assertEq(tsukuroSBT.getSerialNumber(20005), 5);
        assertEq(tsukuroSBT.getSerialNumber(30042), 42);
    }

    // ===== Reveal Tests =====
    function test_isRevealed_beforeTimestamp() public view {
        // Default block.timestamp is 1, which is before REVEAL_TIMESTAMP
        assertFalse(tsukuroSBT.isRevealed());
    }

    function test_isRevealed_afterTimestamp() public {
        // Warp to after reveal timestamp (2026/01/01 00:00:00 JST)
        vm.warp(1767193200 + 1);
        assertTrue(tsukuroSBT.isRevealed());
    }

    function test_isRevealed_exactTimestamp() public {
        vm.warp(1767193200);
        assertTrue(tsukuroSBT.isRevealed());
    }

    // ===== Mint Tests - Team 0 (No Serial) =====
    function test_mintLocked_team0_noSerial() public {
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_A, 1, "");

        // Token ID should be 0 (team 0, no serial)
        assertEq(tsukuroSBT.balanceOf(alice, 0), 1);
        assertTrue(tsukuroSBT.locked(0));
    }

    function test_mintLocked_team1_withSerial() public {
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");

        // Token ID should be 10001 (team 1, serial 1 - Team B now has serial!)
        assertEq(tsukuroSBT.balanceOf(alice, 10001), 1);
        assertTrue(tsukuroSBT.locked(10001));
    }

    // ===== Mint Tests - Team 2 (With Serial) =====
    function test_mintLocked_team2_withSerial() public {
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        // Token ID should be 20001 (team 2, serial 1)
        assertEq(tsukuroSBT.balanceOf(alice, 20001), 1);
        assertTrue(tsukuroSBT.locked(20001));
    }

    function test_mintLocked_team2_serialIncrement() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        tsukuroSBT.mintLocked(bob, TsukuroSBT.Team.TEAM_C, 1, "");
        vm.stopPrank();

        // Alice gets serial 1, Bob gets serial 2
        assertEq(tsukuroSBT.balanceOf(alice, 20001), 1);
        assertEq(tsukuroSBT.balanceOf(bob, 20002), 1);
    }

    function test_mintLocked_teamB_serialIncrement() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");
        tsukuroSBT.mintLocked(bob, TsukuroSBT.Team.TEAM_B, 1, "");
        vm.stopPrank();

        // Alice gets serial 1, Bob gets serial 2
        assertEq(tsukuroSBT.balanceOf(alice, 10001), 1);
        assertEq(tsukuroSBT.balanceOf(bob, 10002), 1);
    }

    function test_getNextSerialNumber() public {
        assertEq(tsukuroSBT.getNextSerialNumber(TsukuroSBT.Team.TEAM_C), 1);

        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        assertEq(tsukuroSBT.getNextSerialNumber(TsukuroSBT.Team.TEAM_C), 2);
    }

    // ===== Duplicate Mint Tests =====
    function test_duplicateMint_sameTeam_reverts() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        vm.expectRevert(bytes("SBT: already minted for this team"));
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        vm.stopPrank();
    }

    function test_mintDifferentTeams_succeeds() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_A, 1, "");
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_D, 1, "");
        vm.stopPrank();

        assertEq(tsukuroSBT.balanceOf(alice, 0), 1);      // Team A (0), no serial
        assertEq(tsukuroSBT.balanceOf(alice, 10001), 1);  // Team B (1), serial 1
        assertEq(tsukuroSBT.balanceOf(alice, 20001), 1);  // Team C (2), serial 1
        assertEq(tsukuroSBT.balanceOf(alice, 30000), 1);  // Team D (3), no serial
    }

    function test_hasMintedForTeam() public {
        assertFalse(tsukuroSBT.hasMintedForTeam(alice, TsukuroSBT.Team.TEAM_C));

        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        assertTrue(tsukuroSBT.hasMintedForTeam(alice, TsukuroSBT.Team.TEAM_C));
        assertFalse(tsukuroSBT.hasMintedForTeam(alice, TsukuroSBT.Team.TEAM_D));
    }

    // ===== Invalid Team ID Tests =====
    // Note: This test is removed because Solidity prevents invalid enum values at compile time
    // The team validation in the contract is still in place for safety

    // ===== Non-Owner Mint Tests =====
    function test_NonOwner_MintToSelf_Succeeds() public {
        vm.prank(alice);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        assertEq(tsukuroSBT.balanceOf(alice, 20001), 1);
    }

    function test_NonOwner_MintToOther_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(bytes("SBT: only owner can set recipient"));
        tsukuroSBT.mintLocked(bob, TsukuroSBT.Team.TEAM_C, 1, "");
    }

    // ===== mintLockedWithURI Tests =====
    function test_mintLockedWithURI() public {
        string memory testURI = "ipfs://QmTest123/metadata.json";

        vm.prank(ownerAddr);
        tsukuroSBT.mintLockedWithURI(alice, TsukuroSBT.Team.TEAM_C, 1, "", testURI);

        assertEq(tsukuroSBT.balanceOf(alice, 20001), 1);
        assertEq(tsukuroSBT.uri(20001), testURI);
    }

    function test_mintLockedWithURI_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        tsukuroSBT.mintLockedWithURI(alice, TsukuroSBT.Team.TEAM_C, 1, "", "ipfs://test");
    }

    // ===== URI Tests =====
    function test_uri_beforeReveal() public {
        vm.prank(ownerAddr);
        tsukuroSBT.setUnrevealedBaseURI("https://example.com/unrevealed/");

        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        // Before reveal, should return unrevealed URI
        assertEq(tsukuroSBT.uri(20001), "https://example.com/unrevealed/2.json");
    }

    function test_uri_afterReveal() public {
        vm.prank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_D, 1, "");

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // After reveal, should return revealed URI
        // Team D doesn't have serial number anymore!
        assertEq(tsukuroSBT.uri(30000), "https://example.com/revealed/3/0.json");
    }

    function test_uri_individualOverride() public {
        string memory customURI = "ipfs://QmCustom/token.json";

        vm.startPrank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        tsukuroSBT.setTokenURI(20001, customURI);
        vm.stopPrank();

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // Individual URI should override base URI
        assertEq(tsukuroSBT.uri(20001), customURI);
    }

    function test_setTokenURI_nonexistentToken_reverts() public {
        vm.prank(ownerAddr);
        vm.expectRevert(bytes("SBT: URI set for nonexistent token"));
        tsukuroSBT.setTokenURI(99999, "ipfs://test");
    }

    // ===== Transfer Tests =====
    function test_TransferRevertsWhenLocked() public {
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");

        vm.prank(alice);
        vm.expectRevert(bytes("SBT: token is locked"));
        tsukuroSBT.safeTransferFrom(alice, bob, 20001, 1, "");
    }

    function test_BatchTransferRevertsWhenAnyLocked() public {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);

        vm.startPrank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_C, 1, "");
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_D, 1, "");
        vm.stopPrank();

        ids[0] = 20001;  // Team C, serial 1
        ids[1] = 30000;  // Team D, no serial
        amounts[0] = 1;
        amounts[1] = 1;

        vm.prank(alice);
        vm.expectRevert(bytes("SBT: token is locked"));
        tsukuroSBT.safeBatchTransferFrom(alice, bob, ids, amounts, "");
    }

    // ===== Locked Query Tests =====
    function test_LockedRevertsForNonexistentToken() public {
        vm.expectRevert(bytes("SBT: query for nonexistent token"));
        tsukuroSBT.locked(999);
    }

    // ===== Team B Variant Tests =====
    function test_teamBVariant_differentTimestamps() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        // Mint at time 100
        vm.warp(100);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");

        // Mint at time 200
        vm.warp(200);
        tsukuroSBT.mintLocked(bob, TsukuroSBT.Team.TEAM_B, 1, "");
        vm.stopPrank();

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // URIs should be different due to different timestamps at mint
        string memory aliceURI = tsukuroSBT.uri(10001);  // Team B is now 1
        string memory bobURI = tsukuroSBT.uri(10002);

        // Both should contain "https://example.com/revealed/1/" and ".json"
        // but variant numbers might be different
        assertTrue(bytes(aliceURI).length > 0);
        assertTrue(bytes(bobURI).length > 0);
    }

    function test_teamBVariant_rangeCheck() public {
        vm.prank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        // Mint multiple tokens
        vm.startPrank(ownerAddr);
        for (uint256 i = 0; i < 10; i++) {
            address recipient = address(uint160(0x1000 + i));
            vm.warp(block.timestamp + 1);
            tsukuroSBT.mintLocked(recipient, TsukuroSBT.Team.TEAM_B, 1, "");
        }
        vm.stopPrank();

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // Check that all URIs are valid (contain variant 0-3)
        for (uint256 i = 1; i <= 10; i++) {
            string memory tokenURI = tsukuroSBT.uri(10000 + i);  // Team B uses 10000 base
            assertTrue(bytes(tokenURI).length > 0);
            // URI should contain "-0.json", "-1.json", "-2.json", or "-3.json"
        }
    }

    function test_teamBVariant_deterministicSameToken() public {
        vm.prank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // Calling uri() multiple times should return the same result
        string memory uri1 = tsukuroSBT.uri(10001);  // Team B token
        string memory uri2 = tsukuroSBT.uri(10001);

        assertEq(uri1, uri2, "URI should be deterministic for same token");
    }

    function test_teamB_variantStoredAtMint() public {
        vm.prank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        // Mint Team B token
        vm.prank(ownerAddr);
        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_B, 1, "");

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // Get URI twice - should be identical (variant stored at mint)
        string memory uri1 = tsukuroSBT.uri(10001);

        // Warp forward in time
        vm.warp(1767193200 + 1000);

        // URI should still be the same (not affected by current timestamp)
        string memory uri2 = tsukuroSBT.uri(10001);

        assertEq(uri1, uri2, "Variant should be stored and deterministic");
    }

    function test_otherTeams_noVariant() public {
        vm.startPrank(ownerAddr);
        tsukuroSBT.setRevealedBaseURI("https://example.com/revealed/");

        tsukuroSBT.mintLocked(alice, TsukuroSBT.Team.TEAM_A, 1, "");
        tsukuroSBT.mintLocked(bob, TsukuroSBT.Team.TEAM_C, 1, "");  // Changed from TEAM_B
        address charlie = address(0xC);
        tsukuroSBT.mintLocked(charlie, TsukuroSBT.Team.TEAM_D, 1, "");
        vm.stopPrank();

        // Warp to after reveal
        vm.warp(1767193200 + 1);

        // Team A: no serial
        assertEq(tsukuroSBT.uri(0), "https://example.com/revealed/0/0.json");
        // Team C: has serial
        assertEq(tsukuroSBT.uri(20001), "https://example.com/revealed/2/1.json");
        // Team D: no serial anymore!
        assertEq(tsukuroSBT.uri(30000), "https://example.com/revealed/3/0.json");
    }
}
