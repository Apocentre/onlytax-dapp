import {useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import Web3 from "@apocentre/solana-web3";

export const useWeb3 = () => {
  const [web3, setWeb3] = useState(undefined);
  const {connection} = useConnection();
  const {wallet} = useWallet();
  const key = wallet?.adapter?.publicKey?.toString();

  useEffect(() => {
    const initWeb3 = async () => {
      if (wallet && connection) {
        const _web3 = Web3();
        await _web3.init(connection, wallet.adapter, {});
        setWeb3(_web3);
      }
    };

    initWeb3().catch(console.error);
  }, [key, connection, wallet]);

  return web3;
};

