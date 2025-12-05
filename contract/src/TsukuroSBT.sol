// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC5192} from "./IERC5192.sol";

contract TsukuroSBT is ERC1155, Ownable, IERC5192 {
    mapping(uint256 => bool) private _locked;
    bytes4 public constant IID_IERC5192 = 0xb45a3c0e;

    
    constructor(address initialOwner) ERC1155("http://localhost:8000/{id}.json") Ownable(initialOwner) {}

    // ===== IERC5192 =====
    function locked(uint256 tokenId) public view override returns (bool) {
        require(_exists(tokenId), "SBT: query for nonexistent token");
        return _locked[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _locked[tokenId];
    }

    // ===== Soulbound Logic =====
    function mintLocked(address to, uint256 id, uint256 amount, bytes memory data) external {
        if (msg.sender != owner()) {
            require(to == msg.sender, "SBT: only owner can set recipient");
        }
        require(amount == 1, "SBT: amount must be 1");
        
        // 修正 (重複チェック)
        require(balanceOf(to, id) == 0, "SBT: User already has this token");

        _mint(to, id, amount, data);

        _locked[id] = true;
        emit Locked(id);
    }

    // ===== ERC165 =====
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return interfaceId == IID_IERC5192 || super.supportsInterface(interfaceId);
    }

    // ===== ERC1155 =====
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory amounts)
        internal
        virtual
        override
    {
        if (from != address(0) && to != address(0)) {
            revert("SBT: token is locked");
        }

        // 修正 (Mint時スキップ)
        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (_locked[ids[i]]) {
                    revert("SBT: token is locked");
                }
            }
        }
        
        super._update(from, to, ids, amounts);
    }
}