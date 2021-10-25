// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../interfaces/IERC721TokenReceiver.sol";
import {LibAppStorage, AppStorage} from "./AppStorage.sol";
import "./LibMeta.sol";

library LibERC721 {
  /// @dev This emits when ownership of any NFT changes by any mechanism.
  ///  This event emits when NFTs are created (`from` == 0) and destroyed
  ///  (`to` == 0). Exception: during contract creation, any number of NFTs
  ///  may be created and assigned without emitting Transfer. At the time of
  ///  any transfer, the approved address for that NFT (if any) is reset to none.
  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

  /// @dev This emits when the approved address for an NFT is changed or
  ///  reaffirmed. The zero address indicates there is no approved address.
  ///  When a Transfer event emits, this also indicates that the approved
  ///  address for that NFT (if any) is reset to none.
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

  /// @dev This emits when an operator is enabled or disabled for an owner.
  ///  The operator can manage all NFTs of the owner.
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;

  event MintParcel(address indexed _owner, uint256 indexed _tokenId);

  function checkOnERC721Received(
    address _operator,
    address _from,
    address _to,
    uint256 _tokenId,
    bytes memory _data
  ) internal {
    uint256 size;
    assembly {
      size := extcodesize(_to)
    }
    if (size > 0) {
      require(
        ERC721_RECEIVED == IERC721TokenReceiver(_to).onERC721Received(_operator, _from, _tokenId, _data),
        "LibERC721: Transfer rejected/failed by _to"
      );
    }
  }

  // This function is used by transfer functions
  function transferFrom(
    address _sender,
    address _from,
    address _to,
    uint256 _tokenId
  ) internal {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(_to != address(0), "ER721: Can't transfer to 0 address");
    address owner = s.parcels[_tokenId].owner;
    require(owner != address(0), "ERC721: Invalid tokenId or can't be transferred");
    require(_sender == owner || s.operators[owner][_sender] || s.approved[_tokenId] == _sender, "LibERC721: Not owner or approved to transfer");
    require(_from == owner, "ERC721: _from is not owner, transfer failed");
    s.parcels[_tokenId].owner = _to;

    //Update indexes and arrays

    //Get the index of the tokenID to transfer
    uint256 index = s.ownerTokenIdIndexes[_from][_tokenId];

    //Get the length of owner array
    uint256 length = s.ownerTokenIds[_from].length;

    //Move the last element of the ownerIds array to replace the tokenId to be transferred
    s.ownerTokenIdIndexes[_from][length - 1] = index;
    s.ownerTokenIds[_from][index] = s.ownerTokenIds[_from][length - 1];

    //pop from array
    s.ownerTokenIds[_from].pop();

    //update index of new token
    s.ownerTokenIdIndexes[_to][_tokenId] = s.ownerTokenIds[_to].length;
    s.ownerTokenIds[_to].push(_tokenId);

    if (s.approved[_tokenId] != address(0)) {
      delete s.approved[_tokenId];
      emit LibERC721.Approval(owner, address(0), _tokenId);
    }

    //todo: Add in hooks for AavegotchiDiamond marketplace

    emit LibERC721.Transfer(_from, _to, _tokenId);
  }

  function tokenIdsOfOwner(address _owner) internal view returns (uint256[] memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.ownerTokenIds[_owner];
    /*
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256 len = s.tokenIds.length;
    tokenIds_ = new uint256[](len);
    uint256 count;
    for (uint256 i; i < len; ) {
      uint256 tokenId = s.tokenIds[i];
      if (s.parcels[tokenId].owner == _owner) {
        tokenIds_[count] = tokenId;
        unchecked {
          count++;
        }
      }
      unchecked {
        i++;
      }
    }
    assembly {
      mstore(tokenIds_, count)
    }
    */
  }

  function safeMint(address _to, uint32 _tokenId) internal {
    AppStorage storage s = LibAppStorage.diamondStorage();

    require(s.parcels[_tokenId].owner == address(0), "ERC721: tokenId already minted");
    s.parcels[_tokenId].owner = _to;
    s.tokenIdIndexes[_tokenId] = s.tokenIds.length;
    s.tokenIds.push(_tokenId);
    s.ownerTokenIdIndexes[_to][_tokenId] = s.ownerTokenIds[_to].length;
    s.ownerTokenIds[_to].push(_tokenId);
    // s.parcelBalance[_to]++;
    emit MintParcel(_to, _tokenId);
    emit LibERC721.Transfer(address(0), _to, _tokenId);
  }
}
