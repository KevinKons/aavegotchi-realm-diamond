// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {LibERC998} from "../libraries/LibERC998.sol";
import {LibERC1155} from "../libraries/LibERC1155.sol";
import {LibERC20} from "../libraries/LibERC20.sol";
import {LibAppStorageInstallation, InstallationAppStorage} from "../libraries/AppStorageInstallation.sol";

library LibInstallation {
  function _equipInstallation(
    address _owner,
    uint256 _realmId,
    uint256 _installationId
  ) internal {
    InstallationAppStorage storage s = LibAppStorageInstallation.diamondStorage();
    LibERC1155.removeFromOwner(_owner, _installationId, 1);
    LibERC1155.addToOwner(s.realmDiamond, _installationId, 1);
    emit LibERC1155.TransferSingle(address(this), _owner, s.realmDiamond, _installationId, 1);
    LibERC998.addToParent(s.realmDiamond, _realmId, _installationId, 1);
    emit LibERC1155.TransferToParent(s.realmDiamond, _realmId, _installationId, 1);
  }

  function _unequipInstallation(uint256 _realmId, uint256 _installationId) internal {
    InstallationAppStorage storage s = LibAppStorageInstallation.diamondStorage();
    LibERC998.removeFromParent(s.realmDiamond, _realmId, _installationId, 1);
    emit LibERC1155.TransferFromParent(s.realmDiamond, _realmId, _installationId, 1);
    LibERC1155._burn(s.realmDiamond, _installationId, 1);
  }
}