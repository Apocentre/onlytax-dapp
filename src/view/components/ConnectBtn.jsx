import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {useWallet} from '@solana/wallet-adapter-react';
import {signin} from "../../services/auth";
import {readJwt} from "../../services/jwt";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

const getUiAddress = (address) => {
  const head = address.slice(0, 4);
  const tail = address.slice(-4);

  return `${head}..${tail}`
}

const ConnecteBtnState = ({address}) => {
  const {disconnect} = useWallet();

  const handleDisconnect = useCallback(async () => {
    localStorage.removeItem('ONLYTAX::JWT');
    await disconnect();
  }, [disconnect]);

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-outline m-1">{address && getUiAddress(address)}</div>
      <ul tabIndex={0} className="dropdown-content menu btn-primary z-[1] w-52 p-2 shadow">
        <li onClick={handleDisconnect}><a>Disconnect</a></li>
      </ul>
    </div>
  )
}

const ConnectBtn = () => {
  const {
    publicKey,
    signMessage,
    connecting,
    connected,
  } = useWallet();
  const [address, setAddress] = useState(null);
  const [signMessageError, setSignMessageError] = useState(false);

  const generateSignatureMessage = useCallback((timestamp) => {
    return `Onlytax Auth:${timestamp}`;
  }, []);

  const signAndSendMessage = useCallback(
    async (message, address, timestamp) => {
      try {
        const sig = await signMessage?.(message);

        if (!sig) {
          throw new Error('Failed to sign message');
        }

        const hexSig = Buffer.from(sig).toString('hex');
        const authHeader = `${timestamp}:${address}:${hexSig}`;
        await signin(authHeader);
      } catch(error) {
        console.error('Error in signAndSend:', error);
        setSignMessageError(true);
      }
    },
    [signMessage]
  );

  const signAndSend = useCallback(
    async () => {
      if (!publicKey || readJwt()) {
        return;
      }

      try {        
        const now = Date.now();
        const message = new TextEncoder().encode(
          generateSignatureMessage(now)
        );

        await signAndSendMessage(message, address, now);
      } catch(error) {
        console.error('Error in signAndSend:', error);
      }
    },
    [publicKey, generateSignatureMessage, signAndSendMessage]
  );

  useEffect(() => {
    if (publicKey) {
      const address = publicKey.toBase58();
      setAddress(address);

      signAndSend();
    }
  }, [publicKey]);

  return (
    connected
      ? (
        <ConnecteBtnState address={address}/>
      )
      : (
        <WalletMultiButton>
          {connecting ? 'CONNECTING' : 'CONNECT WALLET'}
        </WalletMultiButton>
      )
  );
}

export default ConnectBtn;
