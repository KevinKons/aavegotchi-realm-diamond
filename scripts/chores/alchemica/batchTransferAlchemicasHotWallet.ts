import { BigNumber, BigNumberish, Signer } from "ethers";
import { ethers, network } from "hardhat";

import { AlchemicaToken, RealmFacet } from "../../../typechain";
import {
  alchemica,
  impersonate,
  maticDiamondAddress,
} from "../../helperFunctions";
// import { upgrade } from "../scripts/upgrades/upgrade-fixDiamond";

export async function setAddresses() {
  const accounts: Signer[] = await ethers.getSigners();
  const deployer = accounts[0];

  let realmFacet = (await ethers.getContractAt(
    "RealmFacet",
    maticDiamondAddress,
    deployer
  )) as RealmFacet;

  const wallet = "0x2C1a288353e136b9E4b467AADb307133ffFeaB25";

  const amounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish] = [
    ethers.utils.parseEther("500000"),
    ethers.utils.parseEther("250000"),
    ethers.utils.parseEther("125000"),
    ethers.utils.parseEther("50000"),
  ];

  const owner = "0x94cb5C277FCC64C274Bd30847f0821077B231022";

  const testing = ["hardhat"].includes(network.name);

  //Approve
  for (let i = 0; i < alchemica.length; i++) {
    const alc = alchemica[i];

    let token = (await ethers.getContractAt(
      "AlchemicaToken",
      alc
    )) as AlchemicaToken;

    if (testing) {
      token = await impersonate(owner, token, ethers, network);
    }

    const allowance = await token.allowance(owner, maticDiamondAddress);
    console.log("Allowance:", ethers.utils.formatEther(allowance));

    const bal = await token.balanceOf(wallet);
    console.log("Before balance:", ethers.utils.formatEther(bal));
  }

  console.log("Batch transferring tokens to!", wallet);

  if (testing) {
    realmFacet = await impersonate(owner, realmFacet, ethers, network);
  }
  //transfer
  await realmFacet.batchTransferAlchemica([wallet], [amounts]);

  for (let i = 0; i < alchemica.length; i++) {
    const alc = alchemica[i];

    const token = (await ethers.getContractAt(
      "AlchemicaToken",
      alc
    )) as AlchemicaToken;

    const bal = await token.balanceOf(wallet);
    console.log("After balance:", ethers.utils.formatEther(bal));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  setAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
