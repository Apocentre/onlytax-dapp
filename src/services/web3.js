import {ComputeBudgetProgram} from "@solana/web3.js";

export const setComputeUnitPrice = (microLamports) => {
  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: microLamports,
  });
}
