import {useEffect} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useSocket} from "../context/socketContext"

export const useWeb3 = () => {
  const {connection} = useConnection();
  const {wallet} = useWallet();
  const {updateWithheldAuthority} = useSocket();
  const key = wallet?.adapter?.publicKey?.toString();

  useEffect(() => {
    const initWeb3 = async () => {
      if (wallet && connection) {
        updateWithheldAuthority(wallet.adapter.publicKey);
      }
    };

    initWeb3().catch(console.error);
  }, [key, connection, wallet]);
};

