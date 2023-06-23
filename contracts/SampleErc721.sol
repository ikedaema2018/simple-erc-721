// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./ERC721Receiver.sol";

contract SampleErc721 is IERC721, ERC721Receiver {
    mapping(address => uint256) ownerToBalance;
    mapping(uint256 => address) tokenIdToOwner;
    mapping(uint256 => address) tokenIdToApproved;
    mapping(address => mapping(address => bool)) operatorApprovals;

    error ERC721InvalidReceiver(address receiver);

    constructor() {
        ownerToBalance[msg.sender] = 2;
        tokenIdToOwner[0] = msg.sender;
        tokenIdToOwner[1] = msg.sender;
    }

    function balanceOf(
        address owner
    ) public view override returns (uint256 balance) {
        return ownerToBalance[owner];
    }

    function ownerOf(
        uint256 tokenId
    ) public view override returns (address owner) {
        return tokenIdToOwner[tokenId];
    }

    // @TODO implement IERC721Receiver.onERC721Received + require
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        require(
            from == tokenIdToOwner[tokenId] || tokenIdToApproved[tokenId] == to,
            "You are not the owner of this token"
        );
        require(
            to != address(0) || from != address(0),
            "You cannot transfer to the zero address"
        );

        delete (tokenIdToApproved[tokenId]);
        tokenIdToOwner[tokenId] = to;
        ownerToBalance[from] -= 1;
        ownerToBalance[to] += 1;

        emit Transfer(from, to, tokenId);
    }

    // @TODO implement IERC721Receiver.onERC721Received + require
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual {
        require(
            from == tokenIdToOwner[tokenId] || tokenIdToApproved[tokenId] == to,
            "You are not the owner of this token"
        );
        require(
            to != address(0) || from != address(0),
            "You cannot transfer to the zero address"
        );

        delete (tokenIdToApproved[tokenId]);
        tokenIdToOwner[tokenId] = to;
        ownerToBalance[from] -= 1;
        ownerToBalance[to] += 1;

        emit Transfer(from, to, tokenId);

        if (!checkOnERC721Received(from, to, tokenId, data)) {
            revert ERC721InvalidReceiver(to);
        }
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(
            from == tokenIdToOwner[tokenId] || tokenIdToApproved[tokenId] == to || isApprovedForAll(tokenIdToOwner[tokenId], msg.sender),
            "You are not the owner of this token"
        );

        delete (tokenIdToApproved[tokenId]);
        tokenIdToOwner[tokenId] = to;
        ownerToBalance[from] -= 1;
        ownerToBalance[to] += 1;

        emit Transfer(from, to, tokenId);
    }

    // ownerかapproveされているユーザーのみ呼び出せる 
    function approve(address to, uint256 tokenId) public {
        require(
            msg.sender == tokenIdToOwner[tokenId] || isApprovedForAll(tokenIdToOwner[tokenId], msg.sender) || tokenIdToApproved[tokenId] == msg.sender,
            "You are not the owner or approved of this token"
        );
        require(to != address(0), "You cannot approve the zero address");
        tokenIdToApproved[tokenId] = to;

        emit Approval(tokenIdToOwner[tokenId], to, tokenId);
    }

    // @TODO 0がセットされているときに0が返されるか確認
    function getApproved(
        uint256 tokenId
    ) public view override returns (address operator) {
        require(tokenIdToOwner[tokenId] != address(0), "This token does not exist");
        return tokenIdToApproved[tokenId];
    }

    // @TODO 0アドレスを拒否するのは正しい？
    function setApprovalForAll(address operator, bool _approved) public {
        require(operator != address(0), "You cannot approve the zero address");
        operatorApprovals[msg.sender][operator] = _approved;

        emit ApprovalForAll(msg.sender, operator, _approved);
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public pure returns (bool) {
        // @TODO この数字の意味がわからない
        return interfaceId == 0x80ac58cd;
    }

    function checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == ERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert ERC721InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }
}
