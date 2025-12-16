// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TsukuroSBT} from "../src/TsukuroSBT.sol";

contract TsukuroSBTDeploy is Script {
    TsukuroSBT public tsukuroSBT;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address deployer = msg.sender;
        tsukuroSBT = new TsukuroSBT(deployer);

        // Set metadata URIs
        string memory unrevealedURI =
            "https://raw.githubusercontent.com/blockchaininnovation/nft-tsukuro-2025/refs/heads/main/assets/unrevealed/";
        string memory revealedURI =
            "https://raw.githubusercontent.com/blockchaininnovation/nft-tsukuro-2025/refs/heads/main/assets/revealed/";

        tsukuroSBT.setUnrevealedBaseURI(unrevealedURI);
        tsukuroSBT.setRevealedBaseURI(revealedURI);

        console2.log("Deployed TsukuroSBT at:", address(tsukuroSBT));
        console2.log("Owner set to:", tsukuroSBT.owner());
        console2.log("Unrevealed URI set to:", unrevealedURI);
        console2.log("Revealed URI set to:", revealedURI);

        vm.stopBroadcast();
    }
}
