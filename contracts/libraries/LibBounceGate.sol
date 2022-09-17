// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./AppStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
error NotParcelOwner();
error StartTimeError();
error OngoingEvent();
error NoOngoingEvent();
error DurationTooHigh();
error NoBounceGate();
error NoEvent();
error EventEnded();

uint256 constant GLTR_PER_MINUTE = 30;

// uint256 constant MAX_DURATION_IN_MINUTES = 4320 minutes; //72 hours

library LibBounceGate {
  event EventStarted(uint256 indexed _eventId, BounceGate eventDetails);
  event EventCancelled(uint256 indexed _eventId);
  event EventPriorityAndDurationUpdated(uint256 indexed _eventId, uint120 _newPriority, uint64 _newEndTime);

  function _createEvent(
    string calldata _title,
    uint64 _startTime,
    uint64 _durationInMinutes,
    uint256[4] calldata _alchemicaSpent,
    uint256 _realmId
  ) internal {
    AppStorage storage s = LibAppStorage.diamondStorage();
    address owner = s.parcels[_realmId].owner;

    //@todo: replace with Access Rights
    if (msg.sender != owner) revert NotParcelOwner();
    if (!s.parcels[_realmId].bounceGate.equipped) revert NoBounceGate();
    //make sure there is no ongoing event
    if (s.parcels[_realmId].bounceGate.endTime > block.timestamp) revert OngoingEvent();
    //validate event
    uint64 endTime = _validateInitialBounceGate(_startTime, _durationInMinutes);
    //calculate event priority
    uint120 priority = _calculatePriorityAndSettleAlchemica(_alchemicaSpent);
    //update storage
    BounceGate storage p = s.parcels[_realmId].bounceGate;
    p.title = _title;
    p.startTime = _startTime;
    p.endTime = endTime;
    p.priority = priority;
    emit EventStarted(_realmId, p);
  }

  function _updateEvent(
    uint256 _realmId,
    uint256[4] calldata _alchemicaSpent,
    uint40 _durationExtensionInMinutes
  ) internal {
    AppStorage storage s = LibAppStorage.diamondStorage();
    BounceGate storage p = s.parcels[_realmId].bounceGate;
    address parcelOwner = s.parcels[_realmId].owner;

    //@todo: replace with access rights
    if (msg.sender != parcelOwner) revert NotParcelOwner();
    if (p.startTime == 0) revert NoEvent();
    if (p.endTime < block.timestamp) revert EventEnded();
    if (_durationExtensionInMinutes > 0) {
      // uint256 currentDurationInMinutes = p.endTime - p.startTime;
      // if (currentDurationInMinutes + _durationExtensionInMinutes > MAX_DURATION_IN_MINUTES) revert DurationTooHigh();
      uint256 gltr = _getGltrAmount(_durationExtensionInMinutes);
      require(IERC20(s.gltrAddress).transferFrom(msg.sender, address(this), gltr));
      //update storage
      p.endTime += (_durationExtensionInMinutes * 60);
    }
    uint256 addedPriority = _calculatePriorityAndSettleAlchemica(_alchemicaSpent);
    //update storage
    uint120 newPriority = _getUpdatedPriority(_realmId) + uint120(addedPriority);
    p.priority = newPriority;
    emit EventPriorityAndDurationUpdated(_realmId, newPriority, p.endTime);
  }

  function _cancelEvent(uint256 _realmId) internal {
    AppStorage storage s = LibAppStorage.diamondStorage();
    BounceGate storage p = s.parcels[_realmId].bounceGate;
    address parcelOwner = s.parcels[_realmId].owner;
    if (msg.sender != parcelOwner) revert NotParcelOwner();
    if (p.endTime <= uint64(block.timestamp)) revert NoOngoingEvent();

    //Cancel event
    //p.startTime = uint64(block.timestamp);
    p.endTime = uint64(block.timestamp);

    emit EventCancelled(_realmId);
  }

  function _getUpdatedPriority(uint256 _realmId) internal view returns (uint120 _currentPriority) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    BounceGate storage p = s.parcels[_realmId].bounceGate;
    //only for started events
    if (p.startTime <= block.timestamp) {
      if (p.endTime <= uint64(block.timestamp)) {
        _currentPriority = 0;
      } else {
        //priority decreases by 1 point every minute
        uint256 elapsedMinutes = ((uint64(block.timestamp) - p.startTime) + 1) / 60;
        uint256 remainder = (uint64(block.timestamp) - p.startTime) % 60;
        //round up elapsedMinute(to cover for <60 seconds)
        if (remainder > 0 && elapsedMinutes > 0) {
          elapsedMinutes -= 1;
        }

        if (elapsedMinutes > 0 && elapsedMinutes < p.priority) {
          _currentPriority = p.priority - uint120(elapsedMinutes);
        } else {
          //no significant usage yet..so piority doesn't change
          _currentPriority = p.priority;
        }
      }
    }
    if (p.startTime > block.timestamp) {
      _currentPriority = p.priority;
    }
  }

  function _validateInitialBounceGate(uint64 _startTime, uint256 _durationInMinutes) private returns (uint64 endTime_) {
    if (_startTime < block.timestamp) revert StartTimeError();
    //check for Duration
    // if (_durationInMinutes > MAX_DURATION_IN_MINUTES) revert DurationTooHigh();
    AppStorage storage s = LibAppStorage.diamondStorage();
    //calculate gltr needed for duration
    uint256 total = _getGltrAmount(_durationInMinutes);
    require(IERC20(s.gltrAddress).transferFrom(msg.sender, address(this), total));
    endTime_ = uint64(_startTime + (_durationInMinutes * 60));
  }

  function _getGltrAmount(uint256 _durationInMinutes) private pure returns (uint256 gltr_) {
    gltr_ = GLTR_PER_MINUTE * _durationInMinutes * 1e18;
  }

  function _calculatePriorityAndSettleAlchemica(uint256[4] calldata _alchemicaSpent) internal returns (uint120 _startingPriority) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    for (uint256 i = 0; i < 4; i++) {
      uint256 amount = _alchemicaSpent[i] / 1e18;
      //each amount must be greater than or equal to 1
      if (amount > 0) {
        _startingPriority += uint120(amount * _getAlchemicaRankings()[i]);
        require(IERC20(s.alchemicaAddresses[i]).transferFrom(msg.sender, address(this), amount));
      }
    }
  }

  function _getAlchemicaRankings() private pure returns (uint256[4] memory rankings_) {
    rankings_ = [uint256(1), 2, 4, 10];
  }
}
