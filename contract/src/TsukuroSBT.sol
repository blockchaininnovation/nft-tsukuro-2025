// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC5192} from "./IERC5192.sol";

contract TsukuroSBT is ERC1155, Ownable, IERC5192 {
    using Strings for uint256;

    // ===== Enums =====
    enum Team {
        TEAM_A, // Team 0 - no serial number
        TEAM_B, // Team 1 - with serial number and variant
        TEAM_C, // Team 2 - with serial number
        TEAM_D // Team 3 - no serial number
    }

    // ===== Constants =====
    bytes4 public constant IID_IERC5192 = 0xb45a3c0e;

    // Reveal timestamp: 2026/01/01 00:00:00 JST
    uint256 public constant REVEAL_TIMESTAMP = 1767193200;

    // Token ID multiplier for team ID calculation
    uint256 private constant TEAM_ID_MULTIPLIER = 10000;

    // ===== State Variables =====
    mapping(uint256 => bool) private _locked;

    // Serial number counter for each team (team B, C only)
    mapping(uint256 => uint256) private _nextSerialNumber;

    // Track if an address has minted for a specific team
    mapping(bytes32 => bool) private _hasMintedForTeam;

    // Store Team B variant at mint time (deterministic)
    mapping(uint256 => uint256) private _teamBVariant;

    // Individual token URIs (IPFS CIDs)
    mapping(uint256 => string) private _tokenURIs;

    // Base URIs for reveal mechanism
    string private _unrevealedBaseURI;
    string private _revealedBaseURI;

    // ===== Constructor =====
    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    // ===== Reveal Functions =====
    function isRevealed() public view returns (bool) {
        return block.timestamp >= REVEAL_TIMESTAMP;
    }

    // ===== Token ID Helpers =====
    function getTeamId(uint256 tokenId) public pure returns (uint256) {
        return tokenId / TEAM_ID_MULTIPLIER;
    }

    function getSerialNumber(uint256 tokenId) public pure returns (uint256) {
        return tokenId % TEAM_ID_MULTIPLIER;
    }

    function _generateTokenId(Team team) internal returns (uint256) {
        uint256 teamId = uint256(team);

        if (team == Team.TEAM_B || team == Team.TEAM_C) {
            // Teams B and C get serial numbers
            _nextSerialNumber[teamId]++;
            return teamId * TEAM_ID_MULTIPLIER + _nextSerialNumber[teamId];
        } else {
            // Teams A and D don't have serial numbers
            return teamId * TEAM_ID_MULTIPLIER;
        }
    }

    // ===== IERC5192 =====
    function locked(uint256 tokenId) public view override returns (bool) {
        require(_exists(tokenId), "SBT: query for nonexistent token");
        return _locked[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _locked[tokenId];
    }

    // ===== Soulbound Logic =====
    function mintLocked(address to, Team team, uint256 amount, bytes memory data) external {
        if (msg.sender != owner()) {
            require(to == msg.sender, "SBT: only owner can set recipient");
        }
        require(amount == 1, "SBT: amount must be 1");

        uint256 teamId = uint256(team);
        require(teamId <= 3, "SBT: invalid team ID");

        // Check duplicate mint per team
        bytes32 key = keccak256(abi.encodePacked(to, teamId));
        require(!_hasMintedForTeam[key], "SBT: already minted for this team");
        _hasMintedForTeam[key] = true;

        // Generate token ID
        uint256 tokenId = _generateTokenId(team);

        // Store Team B variant at mint time (deterministic)
        if (team == Team.TEAM_B) {
            uint256 seed = uint256(keccak256(abi.encodePacked(tokenId, to, block.timestamp)));
            _teamBVariant[tokenId] = seed % 4; // 0-3 for 4 variants
        }

        _mint(to, tokenId, amount, data);

        _locked[tokenId] = true;
        emit Locked(tokenId);
    }

    function mintLockedWithURI(address to, Team team, uint256 amount, bytes memory data, string memory tokenURI_)
        external
        onlyOwner
    {
        require(amount == 1, "SBT: amount must be 1");

        uint256 teamId = uint256(team);
        require(teamId <= 3, "SBT: invalid team ID");

        // Check duplicate mint per team
        bytes32 key = keccak256(abi.encodePacked(to, teamId));
        require(!_hasMintedForTeam[key], "SBT: already minted for this team");
        _hasMintedForTeam[key] = true;

        // Generate token ID
        uint256 tokenId = _generateTokenId(team);

        // Store Team B variant at mint time (deterministic)
        if (team == Team.TEAM_B) {
            uint256 seed = uint256(keccak256(abi.encodePacked(tokenId, to, block.timestamp)));
            _teamBVariant[tokenId] = seed % 4; // 0-3 for 4 variants
        }

        // Set token URI
        _tokenURIs[tokenId] = tokenURI_;

        _mint(to, tokenId, amount, data);

        _locked[tokenId] = true;
        emit Locked(tokenId);
    }

    // ===== Team B Variant Function =====
    // Team B only: Returns stored variant from mint time
    function _getTeamBVariant(uint256 tokenId) internal view returns (uint256) {
        return _teamBVariant[tokenId];
    }

    // ===== URI Functions =====
    function uri(uint256 tokenId) public view override returns (string memory) {
        // If individual URI is set, return it
        if (bytes(_tokenURIs[tokenId]).length > 0) {
            return _tokenURIs[tokenId];
        }

        uint256 teamId = getTeamId(tokenId);
        Team team = Team(teamId);
        uint256 serialNumber = getSerialNumber(tokenId);

        if (isRevealed()) {
            // After reveal
            if (team == Team.TEAM_B) {
                // Team B only: Include variant number in filename
                uint256 variant = _getTeamBVariant(tokenId);
                return string(
                    abi.encodePacked(_revealedBaseURI, "1/", serialNumber.toString(), "-", variant.toString(), ".json")
                );
            } else {
                // Teams A, C, D: Standard filename
                return
                    string(abi.encodePacked(_revealedBaseURI, teamId.toString(), "/", serialNumber.toString(), ".json"));
            }
        } else {
            // Before reveal: {unrevealedBaseURI}{teamId}.json
            return string(abi.encodePacked(_unrevealedBaseURI, teamId.toString(), ".json"));
        }
    }

    function setUnrevealedBaseURI(string memory baseURI) external onlyOwner {
        _unrevealedBaseURI = baseURI;
    }

    function setRevealedBaseURI(string memory baseURI) external onlyOwner {
        _revealedBaseURI = baseURI;
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI_) external onlyOwner {
        require(_exists(tokenId), "SBT: URI set for nonexistent token");
        _tokenURIs[tokenId] = tokenURI_;
    }

    // ===== View Functions =====
    function getNextSerialNumber(Team team) external view returns (uint256) {
        uint256 teamId = uint256(team);
        return _nextSerialNumber[teamId] + 1;
    }

    function hasMintedForTeam(address account, Team team) external view returns (bool) {
        uint256 teamId = uint256(team);
        bytes32 key = keccak256(abi.encodePacked(account, teamId));
        return _hasMintedForTeam[key];
    }

    // ===== ERC165 =====
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return interfaceId == IID_IERC5192 || super.supportsInterface(interfaceId);
    }

    // ===== Transfer Restriction =====
    function _update(address from, address to, uint256[] memory ids, uint256[] memory amounts)
        internal
        virtual
        override
    {
        // Block transfers (except mint and burn)
        if (from != address(0) && to != address(0)) {
            revert("SBT: token is locked");
        }

        // Check locked status for burn
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
