import { deployContract } from "ethereum-waffle";
import { Signer, BigNumberish } from "ethers";

import TestTokenArtifact from "./../../artifacts/contracts/token/TestToken.sol/TestToken.json";
import { TestToken } from "@typechain/TestToken";

export const deployTestToken = (
  deployerSign: Signer,
  name: string,
  symbol: string,
  cap: number
): Promise<TestToken> => {
  return deployContract(deployerSign, TestTokenArtifact, [
    name,
    symbol,
    cap,
  ]) as Promise<any>;
  // Promise any nog aanpassen veranderd in nieuwe typechain versie
};
