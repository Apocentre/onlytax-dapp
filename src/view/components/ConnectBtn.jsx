import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {signin} from "../../services/auth";

const ConnecteBtnState = () => {
  const {disconnect} = useWallet();

  const handleDisconnect = useCallback(async () => {
    localStorage.removeItem('ONLYTAX::JWT');
    await disconnect();
  }, [disconnect]);

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1" onClick={handleDisconnect}>Disconnect</div>
      <ul tabIndex={0} className="dropdown-content menu btn-primary z-[1] w-52 p-2 shadow">
        <li><a>Disconnect</a></li>
      </ul>
    </div>
  )
}

const ConnectBtn = () => {
  const {
    publicKey,
    signMessage,
    connecting,
    disconnecting,
    connected,
  } = useWallet();
  const {connection} = useConnection();
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
        const {jwt} = await signin(authHeader);
        localStorage.setItem("ONLYTAX::JWT", jwt);
      } catch(error) {
        console.error('Error in signAndSend:', error);
        setSignMessageError(true);
      }
    },
    [signMessage]
  );

  const signAndSend = useCallback(
    async () => {
      if (!publicKey || localStorage.getItem("ONLYTAX::JWT")) {
        return;
      }

      try {
        const address = publicKey.toBase58();
        setAddress(address);
        
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
      signAndSend();
    }
  }, [publicKey, signAndSend]);

  return (
    connected
      ? (
        <ConnecteBtnState />
      )
      : (
        <button className="btn btn-accent">Connect</button>
      )
  );
}

export default ConnectBtn;
