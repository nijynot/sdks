import type { PartialApiToken } from "@morpho-org/blue-api-sdk";
import {
  AccrualPosition,
  type Address,
  type MarketId,
} from "@morpho-org/blue-sdk";
import { getPreSeizableCollateral } from "./helpers";

export class PreLiquidationPosition extends AccrualPosition {
  public collateralAsset: PartialApiToken;
  public loanAsset: PartialApiToken;

  public preLiquidation?: PreLiquidation;

  public preSeizableCollateral?: bigint;

  constructor(
    position: AccrualPosition,
    collateralAsset: PartialApiToken,
    loanAsset: PartialApiToken,
    preLiquidation?: PreLiquidation,
  ) {
    super(position, position.market);

    this.collateralAsset = collateralAsset;
    this.loanAsset = loanAsset;
    this.preLiquidation = preLiquidation;
    this.preSeizableCollateral = preLiquidation
      ? getPreSeizableCollateral(position, preLiquidation)
      : undefined;
  }
}

export type PreLiquidationParams = {
  preLltv: bigint;
  preLCF1: bigint;
  preLCF2: bigint;
  preLIF1: bigint;
  preLIF2: bigint;
  preLiquidationOracle: Address;
};

export type PreLiquidation = {
  marketId: MarketId;
  address: Address;
  preLiquidationParams: PreLiquidationParams;
};
