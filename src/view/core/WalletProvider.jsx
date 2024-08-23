import React, {useMemo} from "react";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import {
  LedgerWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  WalletConnectWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function AppWalletProvider({children}) {
  const network = WalletAdapterNetwork.Devnet;
  const RPC = import.meta.env.VITE_RPC;

  const endpoint = useMemo(() => RPC, [RPC]);
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Devnet,
        options: {
          relayUrl: "wss://relay.walletconnect.org",
          projectId: "",
          metadata: {
            name: "onlytax.fun",
            description: "Onlytax",
            url: "http://localhost:3001/",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        },
      }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
