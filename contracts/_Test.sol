// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
import "./_External.sol";

contract Test {
    function invoke() public {
        console.log("Hello, World!");

        address a = msg.sender;
        console.log(a.code.length);
        console.log(a);
    }

    function _try() public {
        try new External().invoke() returns (string memory ext) {
            require(1 == 2);
        } catch (bytes memory err) {
            console.logBytes(err);
            console.log('eeeerror');
        }
    }
}
