// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC5192.sol";

contract TsukuroSBT is ERC1155, Ownable, IERC5192 {
    mapping(uint256 => bool) private _locked;
    bytes4 public constant IID_IERC5192 = 0xb45a3c0e;

    constructor() ERC1155("ipfs://YOUR_BASE_CID_HERE/{id}.json") Ownable(msg.sender) {}

    // ===== IERC5192 Implementation =====
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

        require(balanceOf(to, id) == 0, "SBT: User already has this token");

        _mint(to, id, amount, data);

        _locked[id] = true;
        emit Locked(id);
    }

    // ===== ERC165 =====
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return interfaceId == IID_IERC5192 || super.supportsInterface(interfaceId);
    }

    // ===== ERC1155 Overrides =====
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory amounts)
        internal
        virtual
        override
    {
        // 転送禁止ロジック
        if (from != address(0) && to != address(0)) {
            revert("SBT: token is locked");
        }

        // ロックチェック (Mint時以外のみ実行)
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