// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC5192} from "./IERC5192.sol";

contract TsukuroSBT is ERC1155, Ownable, IERC5192 {
    // tokenId ごとのロック状態
    mapping(uint256 => bool) private _locked;

    // EIP-5192 の interfaceId: type(IERC5192).interfaceId でも計算可能
    bytes4 public constant IID_IERC5192 = 0xb45a3c0e;

    constructor(
        address initialOwner
    ) ERC1155("http://localhost:8000/{id}.json") Ownable(initialOwner) {}

    // ===== IERC5192 =====

    function locked(uint256 tokenId) public view override returns (bool) {
        // 存在しない tokenId の場合は revert するのが EIP-5192 の要件
        // （ここではシンプルに totalSupply 的なものは持たず、
        //  「0 でなければ存在」とみなす例）
        require(_exists(tokenId), "SBT: query for nonexistent token");
        return _locked[tokenId];
    }

    // 内部的に existence を判定するヘルパー
    function _exists(uint256 tokenId) internal view returns (bool) {
        // ERC1155 自体は totalSupply を標準提供していないので、
        // 本番では ERC1155Supply を継承するか、独自に supply 管理してください。
        // ここでは簡略化のため balanceOf(owner, tokenId) > 0 をチェック。
        // SBT 前提で「1人1枚」を想定したサンプルです。
        // 注意: 仕様/要件に合わせて適宜修正してください。
        // オーナーは任意なので、SBT 用途では mapping を追加で持つのが安全です。
        // ここでは簡易化のため owner() を使っています。
        return balanceOf(owner(), tokenId) > 0;
    }

    // ===== Soulbound 用 mint / lock ロジック =====

    /// @notice SBT をミント（ロック状態で発行）
    function mintLocked(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        // SBT 前提なので amount は 1 を想定（仕様によって調整可）
        require(amount == 1, "SBT: amount must be 1");

        _mint(to, id, amount, data);

        // ミントと同時にロック
        _locked[id] = true;
        emit Locked(id);
    }

    // ===== ERC1155 転送制御 (Soulbound 部分) =====

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        // ロックされているトークンは転送禁止
        require(!_locked[id], "SBT: token is locked");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        // バッチ内に1つでも locked があれば禁止
        for (uint256 i = 0; i < ids.length; i++) {
            require(!_locked[ids[i]], "SBT: token is locked");
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    //
    // ===== ERC165 (supportsInterface) =====

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155) returns (bool) {
        return
            interfaceId == IID_IERC5192 || super.supportsInterface(interfaceId);
    }

    // ===== ERC1155 =====
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}
