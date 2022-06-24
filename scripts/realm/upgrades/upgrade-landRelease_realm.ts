import { run, ethers } from "hardhat";
import {
  convertFacetAndSelectorsToString,
  DeployUpgradeTaskArgs,
  FacetsAndAddSelectors,
} from "../../../tasks/deployUpgrade";
import { AlchemicaFacet__factory } from "../../../typechain";
import { AlchemicaFacetInterface } from "../../../typechain/AlchemicaFacet";
import { maticDiamondAddress } from "../../../constants";
import {
  alchemicaTotals,
  boostMultipliers,
  greatPortalCapacity,
} from "../../setVars";

export async function upgrade() {
  const diamondUpgrader = "0x94cb5C277FCC64C274Bd30847f0821077B231022";
  const installationDiamond = "0x19f870bD94A34b3adAa9CaA439d333DA18d6812A";

  const spilloverIO = "(uint256 rate, uint256 radius)";

  const parcelCoordinates = "(uint256[] coords)";

  // const mintParcelInput =
  //   "(uint256 coordinateX, uint256 coordinateY, uint256 district, string parcelId, string parcelAdress, uint256 size, uint256[4] boost)";

  const facets: FacetsAndAddSelectors[] = [
    // {
    //   facetName: "VRFFacet",
    //   addSelectors: [
    //     "function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external",
    //     `function setConfig(${requestConfig} _requestConfig) external`,
    //     "function subscribe() external",
    //     "function topUpSubscription(uint256 amount) external",
    //   ],
    //   removeSelectors: [],
    // },
    {
      facetName: "RealmFacet",
      addSelectors: [
        "function equipInstallation(uint256 _realmId, uint256 _installationId, uint256 _x, uint256 _y, bytes _signature) external",
        "function unequipInstallation(uint256 _realmId, uint256 _installationId, uint256 _x, uint256 _y, bytes _signature) external",
        "function equipTile(uint256 _realmId, uint256 _tileId, uint256 _x, uint256 _y, bytes _signature) external",
        "function unequipTile(uint256 _realmId, uint256 _tileId, uint256 _x, uint256 _y, bytes _signature) external",
        "function checkCoordinates(uint256 _realmId, uint256 _coordinateX, uint256 _coordinateY, uint256 _installationId) public view",
        "function upgradeInstallation(uint256 _realmId, uint256 _prevInstallationId, uint256 _nextInstallationId, uint256 _coordinateX, uint256 _coordinateY) external",
        // "function getParcelCapacity(uint256 _realmId, uint256 _alchemicaType) external view returns (uint256)",
        "function getHumbleGrid(uint256 _parcelId, uint256 _gridType) external view returns (uint256[8][8] memory output_)",
        "function getReasonableGrid(uint256 _parcelId, uint256 _gridType) external view returns (uint256[16][16] memory output_)",
        "function getSpaciousVerticalGrid(uint256 _parcelId, uint256 _gridType) external view returns (uint256[32][64] memory output_)",
        "function getSpaciousHorizontalGrid(uint256 _parcelId, uint256 _gridType) external view returns (uint256[64][32] memory output_)",
        "function getPaartnerGrid(uint256 _parcelId, uint256 _gridType) external view returns (uint256[64][64] memory output_)",
        "function addUpgradeQueueLength(uint256 _realmId) external",
        "function subUpgradeQueueLength(uint256 _realmId) external",
        "function getParcelUpgradeQueueCapacity(uint256 _parcelId) external view returns (uint256)",
        "function getParcelUpgradeQueueLength(uint256 _parcelId) external view returns (uint256)",
        "function setGameActive(bool _gameActive) external",
        `function batchGetGrid(uint256[] calldata _parcelIds, uint256 _gridType) external view returns (${parcelCoordinates}[] memory)`,
        "function batchGetDistrictParcels(address _owner, uint256 _district) external view returns (uint256[] memory)",
        "function setParcelsAccessRights(uint256[] calldata _realmIds, uint256[] calldata _accessRights, uint256[] calldata _actionRights) external",
        "function getParcelsAccessRights(uint256[] calldata _parcelIds, uint256[] calldata _actionRights) external view returns (uint256[] memory output_)",
      ],
      removeSelectors: [
        "function getAlchemicaAddresses() external view returns (address[4] memory)",
        "function batchTransferTokensToGotchis(uint256[] calldata _gotchiIds, address[] calldata _tokenAddresses, uint256[][] calldata _amounts) external",
        "function batchTransferAlchemica(address[] calldata _targets, uint256[4][] calldata _amounts) external",
        "function setVars(address _aavegotchiDiamond, address[4] calldata _alchemicaAddresses) external",
      ],
    },
    {
      facetName: "AlchemicaFacet",
      addSelectors: [
        // "function startSurveying(uint256 _realmId) external",
        "function getTotalAlchemicas() external view returns (uint256[4][5] memory)",
        "function getRealmAlchemica(uint256 _realmId) external view returns (uint256[4] memory)",
        // "function progressSurveyingRound() external",
        "function setVars(uint256[4][5] calldata _alchemicas, uint256[4] calldata _boostMultipliers, uint256[4] calldata _greatPortalCapacity, address _installationsDiamond, address _vrfCoordinator, address _linkAddress, address[4] calldata _alchemicaAddresses, address _gltrAddress, bytes memory _backendPubKey, address _gameManager, address _tileDiamond, address _aavegotchiDiamond) external",
        "function getAvailableAlchemica(uint256 _realmId) public view returns (uint256[4] memory _availableAlchemica)",
        // "function claimAvailableAlchemica(uint256 _realmId, uint256[] calldata _alchemicaTypes, uint256 _gotchiId, bytes memory _signature) external",
        "function channelAlchemica(uint256 _realmId, uint256 _gotchiId, uint256 _lastChanneled, bytes memory _signature) external",
        // "function exitAlchemica(uint256[] calldata _alchemica, uint256 _gotchiId, uint256 _lastExitTime, bytes memory _signature) external",
        "function getRoundAlchemica(uint256 _realmId, uint256 _roundId) external view returns (uint256[] memory)",
        "function getRoundBaseAlchemica(uint256 _realmId, uint256 _roundId) external view returns (uint256[] memory)",
        "function getLastChanneled(uint256 _gotchiId) public view returns (uint256)",
        "function getAlchemicaAddresses() external view returns (address[4] memory)",
        "function setChannelingLimits(uint256[] calldata _altarLevel, uint256[] calldata _limits) external",
        "function batchTransferAlchemica(address[] calldata _targets, uint256[4][] calldata _amounts) external",
        // "function batchTransferAlchemicaToGotchis(uint256[] calldata _gotchiIds, uint256[4][] calldata _amounts) external",
        "function batchTransferTokensToGotchis(uint256[] calldata _gotchiIds, address[] calldata _tokenAddresses, uint256[][] calldata _amounts) external",
        `function calculateSpilloverForReservoir(uint256 _realmId, uint256 _alchemicaType) public view returns (${spilloverIO} memory spillover)`,
        // "function testingStartSurveying(uint256 _realmId) external",
        // "function testingAlchemicaFaucet(uint256 _alchemicaType, uint256 _amount) external",
        // "function batchApproveAlchemica(address _spender, uint256[4] calldata _amounts) external",
        // `function testingMintParcel(address _to, uint256[] calldata _tokenIds, ${mintParcelInput}[] memory _metadata) external`,
      ],
      removeSelectors: [],
    },
  ];

  const joined = convertFacetAndSelectorsToString(facets);

  let iface: AlchemicaFacetInterface = new ethers.utils.Interface(
    AlchemicaFacet__factory.abi
  ) as AlchemicaFacetInterface;

  //@ts-ignore
  const backendSigner = new ethers.Wallet(process.env.PROD_PK); // PK should start with '0x'

  // gotchiVerse
  const fud = "0x403E967b044d4Be25170310157cB1A4Bf10bdD0f";
  const fomo = "0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8";
  const alpha = "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2";
  const kek = "0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C";
  //@ts-ignore
  const calldata = iface.encodeFunctionData(
    //@ts-ignore
    "setVars",
    [
      //@ts-ignore
      alchemicaTotals(),
      boostMultipliers,
      greatPortalCapacity,
      installationDiamond,
      "0x0000000000000000000000000000000000000000", //vrf
      "0x0000000000000000000000000000000000000000", //link address
      [fud, fomo, alpha, kek],
      "0x3801C3B3B5c98F88a9c9005966AA96aa440B9Afc", //gltr
      ethers.utils.hexDataSlice(backendSigner.publicKey, 1),
      "0x0000000000000000000000000000000000000000", //game manager
      "0x9216c31d8146bCB3eA5a9162Dc1702e8AEDCa355", //tile diamond
      "0x86935F11C86623deC8a25696E1C19a8659CbF95d", //aavegotchi diamond
    ]
  );

  const args: DeployUpgradeTaskArgs = {
    diamondUpgrader: diamondUpgrader,
    diamondAddress: maticDiamondAddress,
    facetsAndAddSelectors: joined,
    initAddress: maticDiamondAddress,
    initCalldata: calldata,
    useLedger: true,
    useMultisig: false,
  };

  await run("deployUpgrade", args);
}

if (require.main === module) {
  upgrade()
    .then(() => process.exit(0))
    // .then(() => console.log('upgrade completed') /* process.exit(0) */)
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}