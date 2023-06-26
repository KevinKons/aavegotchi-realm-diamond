import { BigNumber } from "ethers";
import { InstallationTypeInput } from "../../types";

export const installationTypes: InstallationTypeInput[] = [
  {
    deprecated: false,
    upgradeQueueBoost: 0,
    installationType: 0,
    level: 1,
    width: 2,
    height: 4,
    alchemicaType: 0,
    alchemicaCost: [
      BigNumber.from(1),
      BigNumber.from(2),
      BigNumber.from(0),
      BigNumber.from(3),
    ],
    harvestRate: 2,
    capacity: 0,
    spillRadius: 0,
    spillRate: 0,
    craftTime: 10000,
    prerequisites: [],
    nextLevelId: 2,
    name: "rando",
    unequipType: 0,
  },
  {
    deprecated: false,
    upgradeQueueBoost: 0,
    name: "rando",
    installationType: 0,
    level: 1,
    width: 2,
    height: 4,
    alchemicaType: 0,
    alchemicaCost: [
      BigNumber.from(1),
      BigNumber.from(2),
      BigNumber.from(0),
      BigNumber.from(3),
    ],
    harvestRate: 2,
    capacity: 0,
    spillRadius: 0,
    spillRate: 0,
    craftTime: 10000,
    prerequisites: [],
    nextLevelId: 2,
    unequipType: 0,
  },

  {
    deprecated: false,
    installationType: 0,
    upgradeQueueBoost: 0,
    name: "rando",
    level: 2,
    width: 2,
    height: 4,
    alchemicaType: 0,
    alchemicaCost: [
      BigNumber.from(1),
      BigNumber.from(2),
      BigNumber.from(0),
      BigNumber.from(3),
    ],
    harvestRate: 2,
    capacity: 0,
    spillRadius: 0,
    spillRate: 0,
    craftTime: 10000,
    prerequisites: [],
    nextLevelId: 3,
    unequipType: 0,
  },
];
