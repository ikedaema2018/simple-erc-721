// IERC721TokenReceiverだけ実装したコントラクト、ERC721のコントラクトのテストにのみ使用する
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ERC721ReceiveTestContract is IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}