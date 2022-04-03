import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { Network } from "hardhat/types";
import {
  AlchemicaToken,
  DiamondLoupeFacet,
  OwnershipFacet,
} from "../typechain";

export const gasPrice = 100000000000;

export async function impersonate(
  address: string,
  contract: any,
  ethers: any,
  network: Network
) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  let signer = await ethers.getSigner(address);
  contract = contract.connect(signer);
  return contract;
}

export async function resetChain(hre: any) {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.MATIC_URL,
        },
      },
    ],
  });
}

export function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc: string[], val: string) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  return selectors;
}

export function getSighashes(selectors: string[], ethers: any): string[] {
  if (selectors.length === 0) return [];
  const sighashes: string[] = [];
  selectors.forEach((selector) => {
    if (selector !== "") sighashes.push(getSelector(selector, ethers));
  });
  return sighashes;
}

export function getSelector(func: string, ethers: any) {
  const abiInterface = new ethers.utils.Interface([func]);
  return abiInterface.getSighash(ethers.utils.Fragment.from(func));
}

export const kovanDiamondAddress = "0xa37D0c085121B6b7190A34514Ca28fC15Bb4dc22";
export const maticDiamondAddress = "0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11";
export const maticAavegotchiDiamondAddress =
  "0x86935F11C86623deC8a25696E1C19a8659CbF95d";
export const aavegotchiDAOAddress =
  "0xb208f8BB431f580CC4b216826AFfB128cd1431aB";
export const pixelcraftAddress = "0xD4151c984e6CF33E04FFAAF06c3374B2926Ecc64";

export const alchemica = [
  "0x403E967b044d4Be25170310157cB1A4Bf10bdD0f", //fud
  "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8", //fomo
  "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", //alpha
  "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C", //kek
];

export const ecosystemVesting = "0x7e07313B4FF259743C0c84eA3d5e741D2b0d07c3";
export const gameplayVesting = "0x3fB6C2A83d2FfFe94e0b912b612fB100047cc176";

export async function diamondOwner(address: string, ethers: any) {
  return await (await ethers.getContractAt("OwnershipFacet", address)).owner();
}

export async function getFunctionsForFacet(facetAddress: string, ethers: any) {
  const Loupe = (await ethers.getContractAt(
    "DiamondLoupeFacet",
    maticDiamondAddress
  )) as DiamondLoupeFacet;
  const functions = await Loupe.facetFunctionSelectors(facetAddress);
  return functions;
}

export async function getDiamondSigner(
  ethers: any,
  network: any,
  override?: string,
  useLedger?: boolean
) {
  //Instantiate the Signer
  let signer: Signer;
  const owner = await (
    (await ethers.getContractAt(
      "OwnershipFacet",
      maticDiamondAddress
    )) as OwnershipFacet
  ).owner();
  const testing = ["hardhat", "localhost"].includes(network.name);

  if (testing) {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [override ? override : owner],
    });
    return await ethers.getSigner(override ? override : owner);
  } else if (network.name === "matic") {
    return (await ethers.getSigners())[0];
  } else {
    throw Error("Incorrect network selected");
  }
}

export async function mineBlocks(ethers: any, count: number) {
  //convert to hex and handle invalid leading 0 problem
  const number = ethers.utils.hexlify(count).replace("0x0", "0x");
  await ethers.provider.send("hardhat_mine", [number]);
}

export async function faucetRealAlchemica(
  receiver: string,
  ethers: any,
  network: Network
) {
  for (let i = 0; i < alchemica.length; i++) {
    const alchemicaToken = alchemica[i];
    let token = (await ethers.getContractAt(
      "AlchemicaToken",
      alchemicaToken
    )) as AlchemicaToken;
    token = await impersonate(await token.owner(), token, ethers, network);
    await token.mint(receiver, ethers.utils.parseEther("10000"));
  }
}

export async function approveRealAlchemica(
  address: string,
  installationAddress: string,
  ethers: any,
  network: Network
) {
  for (let i = 0; i < alchemica.length; i++) {
    const alchemicaToken = alchemica[i];
    let token = (await ethers.getContractAt(
      "AlchemicaToken",
      alchemicaToken
    )) as AlchemicaToken;
    token = await impersonate(address, token, ethers, network);
    await token.approve(
      installationAddress,
      ethers.utils.parseUnits("1000000000")
    );
  }
}
