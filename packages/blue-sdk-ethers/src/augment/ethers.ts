import { Address } from "@morpho-org/blue-sdk";
import { BytesLike, SignatureLike } from "ethers";

declare module "ethers" {
  interface Signer {
    getAddress(): Promise<Address>;
  }

  namespace ethers {
    // @ts-ignore
    const ZeroAddress: Address;
    function getAddress(add: string): Address;
    function isAddress(add: string): add is Address;
    function recoverAddress(
      digest: BytesLike,
      signature: SignatureLike,
    ): Address;
  }
}
