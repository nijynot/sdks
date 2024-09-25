import { VaultUser } from "@morpho-org/blue-sdk";
import { ReadContractErrorType } from "viem";
import { Config, ResolvedRegister, useConfig } from "wagmi";
import { UseQueryReturnType, structuralSharing, useQuery } from "wagmi/query";
import {
  FetchVaultUserParameters,
  FetchVaultUserQueryKey,
  fetchVaultUserQueryOptions,
} from "../queries/fetchVaultUser.js";
import { ConfigParameter, QueryParameter } from "../types/properties.js";
import { useChainId } from "./useChainId.js";

export type UseVaultUserParameters<
  config extends Config = Config,
  selectData = VaultUser,
> = FetchVaultUserParameters &
  ConfigParameter<config> &
  QueryParameter<
    VaultUser,
    ReadContractErrorType,
    selectData,
    FetchVaultUserQueryKey
  >;

export type UseVaultUserReturnType<selectData = VaultUser> = UseQueryReturnType<
  selectData,
  ReadContractErrorType
>;

export function useVaultUser<
  config extends Config = ResolvedRegister["config"],
  selectData = VaultUser,
>({
  query = {},
  ...parameters
}: UseVaultUserParameters<
  config,
  selectData
>): UseVaultUserReturnType<selectData> {
  const config = useConfig(parameters);
  const chainId = useChainId(parameters);

  const options = fetchVaultUserQueryOptions<config>(config, {
    ...parameters,
    chainId,
  });

  return useQuery({
    ...query,
    ...options,
    enabled:
      parameters.vault != null && parameters.user != null && query.enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
    staleTime:
      query.staleTime ?? parameters.blockNumber != null ? Infinity : undefined,
  });
}
