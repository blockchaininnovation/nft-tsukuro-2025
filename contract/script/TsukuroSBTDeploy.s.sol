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

        console2.log("Deployed TsukuroSBT at:", address(tsukuroSBT));
        console2.log("Owner set to:", tsukuroSBT.owner());

        vm.stopBroadcast();
    }
}
