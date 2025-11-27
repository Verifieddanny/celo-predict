// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CeloPredict} from "../src/CeloPredict.sol";

contract CeloPredictScript is Script {
    CeloPredict public celoPredict;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        celoPredict = new CeloPredict();

        vm.stopBroadcast();
    }
}
