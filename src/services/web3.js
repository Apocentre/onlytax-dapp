import {ComputeBudgetProgram, TransactionMessage, VersionedTransaction} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";

export const setComputeUnitPrice = (microLamports) => {
  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: microLamports,
  });
}

export const createAtaIfNeeded = async (connection, signTransaction, mint, account) => {
  const ata = await getAssociatedTokenAddress(
    mint,
    account,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  const accountInfo = await connection.getAccountInfo(ata);

  if(!accountInfo) {
    try {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        account,
        ata,
        account,
        mint,
        TOKEN_2022_PROGRAM_ID,
      );

      let {blockhash} = await connection.getLatestBlockhash("confirmed");
      const messageV0 = new TransactionMessage({
        payerKey: account,
        recentBlockhash: blockhash,
        instructions: [ix],
      }).compileToV0Message([]);

      const tx = new VersionedTransaction(messageV0);
      const signedTX = await signTransaction(tx);
      const txid = await connection.sendTransaction(signedTX, {maxRetries: 10, skipPreflight: false});
      console.log("WithdrawWithheld ATA created: ", txid);
    } catch(error) {
      throw new Error(`Could not create WithdrawWithhedl ATA: ${error.message}`)
    }
  }
}
