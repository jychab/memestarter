import {
  Connection,
  TransactionInstruction,
  PublicKey,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export async function getSimulationUnits(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: AddressLookupTableAccount[]
): Promise<number | undefined> {
  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
    ...instructions,
  ];

  const testVersionedTxn = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables)
  );

  const simulation = await connection.simulateTransaction(testVersionedTxn, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
  if (simulation.value.err) {
    return undefined;
  }
  return simulation.value.unitsConsumed;
}
export async function buildAndSendTransaction(
  connection: Connection,
  ixs: TransactionInstruction[],
  publicKey: PublicKey,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  const [microLamports, units, recentBlockhash] = await Promise.all([
    LAMPORTS_PER_SOL * 0.001,
    getSimulationUnits(connection, ixs, publicKey, []),
    connection.getLatestBlockhash(),
  ]);
  console.log(`Priority Fees: ${microLamports / LAMPORTS_PER_SOL} Sol`);
  ixs.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
  if (units) {
    // probably should add some margin of error to units
    console.log(`Compute Units: ${units}`);
    ixs.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: units * 1.1 })
    );
  }
  let tx = new VersionedTransaction(
    new TransactionMessage({
      instructions: ixs,
      recentBlockhash: recentBlockhash.blockhash,
      payerKey: publicKey,
    }).compileToV0Message()
  );
  const signedTx = await signTransaction(tx);
  const txId = await connection.sendTransaction(
    signedTx as VersionedTransaction
  );
  await connection.confirmTransaction({
    signature: txId,
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
  });
}
export async function sendTransactions(
  connection: Connection,
  txs: VersionedTransaction[],
  signAllTransactions: <T extends VersionedTransaction | Transaction>(
    transactions: T[]
  ) => Promise<T[]>
) {
  const recentBlockhash = await connection.getLatestBlockhash();
  const signedTxs = await signAllTransactions(txs);
  for (let signedTx of signedTxs) {
    const txId = await connection.sendTransaction(
      signedTx as VersionedTransaction
    );
    await connection.confirmTransaction({
      signature: txId,
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    });
  }
}
