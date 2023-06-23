// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract External {
    function invoke() public returns (string memory exte) {
        console.log(unicode'resttt疲れた');
        require(1 != 1, unicode'popopoぽぽぽ');
        return "abcde";
    }
}
