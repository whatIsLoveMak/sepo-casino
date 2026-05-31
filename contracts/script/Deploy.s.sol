// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CasinoDice.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Deploy with 0.1 ETH initial bankroll
        CasinoDice casino = new CasinoDice{value: 0.1 ether}();
        console.log("CasinoDice deployed at:", address(casino));

        vm.stopBroadcast();
    }
}
