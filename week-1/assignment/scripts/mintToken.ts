/**
 * This script demonstrates how to build and send a complex transaction
 * that includes multiple instructions to the Solana blockchain
 */

import {
  Keypair,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { payer, testWallet, connection, STATIC_PUBLICKEY } from "../lib/vars";
import {
  buildTransaction,
  explorerURL,
  extractSignatureFromFailedTransaction,
  printConsoleSeparator,
} from "../lib/helpers";
import {
  createInitializeMint2Instruction,
  getOrCreateAssociatedTokenAccount,
  MINT_SIZE,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

(async () => {
  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());

  const tokenConfig = {
    decimals: 6,
    name: "Neko Cat",
    symbol: "NC",
    uri: "https://github.com/anhuong541/solana-bootcamp-summer-2024/blob/main/assets/sbs-token.json",
  };

  const mintKeypair = Keypair.generate();

  console.log("Mint address:", mintKeypair.publicKey.toBase58());

  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
    space: MINT_SIZE,
    // store enough lamports needed for our `space` to be rent exempt
    lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
    // tokens are owned by the "token program"
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize that account as a Mint
  const initializeMintInstruction = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    tokenConfig.decimals,
    payer.publicKey,
    payer.publicKey
  );

  const tokenMint = mintKeypair.publicKey;

  console.log("==== Local PublicKeys loaded ====");
  console.log("Token's mint address:", tokenMint.toBase58());
  console.log(explorerURL({ address: tokenMint.toBase58() }));

  // create ata
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  ).then((ata) => ata.address);

  console.log("Token account address:", tokenAccount.toBase58());

  const amountOfTokensToMint = 100_000_000; // 1 * 10**6

  // mint some token to the "ata"
  console.log("Minting some tokens to the ata...");
  const mintSig = await mintTo(
    connection,
    payer,
    tokenMint,
    tokenAccount,
    payer,
    amountOfTokensToMint
  );
})();
