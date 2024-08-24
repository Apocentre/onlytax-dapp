import {useCallback, useEffect, useState} from "react";
import {VersionedTransaction} from "@solana/web3.js";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {connectToWs, streamCollectTransactions} from "../../services/wsClient";
import "./Home.css"

function Home() {
  const {publicKey, signTransaction} = useWallet();
  const [token, setToken] = useState("9NxTF8W3gB1y49LBn1GTp5QqPmkdp4P8HJDiqJgJQSUB");
  const [socket, setSocket] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [streamEnded, setStreamEnded] = useState(true);
  const [progress, setProgress] = useState({
    totalCount: 0,
    processed: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const {connection} = useConnection();

  useEffect(() => {
    const socket = connectToWs(
      (s) => setSocket(s),
      () => setSocket(null),
    );

    () => {
      socket.disconnect();
    }
  }, []);

  // sign and send transactions
  useEffect(() => {
    const run = async () => {
      console.log("transaction: ", transactions.length)
      const {data} = transactions.shift();

      console.log("Processing tx:", data);
      console.log("Progress:", progress);

      const tx = VersionedTransaction.deserialize(data);
      let {blockhash} = await connection.getLatestBlockhash("confirmed");
      tx.message.recentBlockhash = blockhash;
      const signedTX = await signTransaction(tx);

      const txid = await connection.sendTransaction(signedTX, {maxRetries: 10, skipPreflight: false});
      console.log("Transaction sent", txid);
      
      progress.processed += 1;
      setTransactions(() => transactions);
      setProgress(() => progress);
      localStorage.setItem(`${publicKey.toBase58()}::transactions`, transactions);
    }

    if(streamEnded && transactions.length === 0) {
      setStreamEnded(() => false);
      setCollecting(() => false);
    }

    if(connection && transactions.length > 0) {
      run()
      .catch(error => console.log("error processing transactions: ", error))
    }
  }, [transactions])

  const handleNewCollectTx = useCallback((newCollectTx) => {
    if(!newCollectTx.data) {
      console.log("Received all transactions")
      setStreamEnded(() => true);
      return
    }

    setTransactions((txs) => [...txs, newCollectTx]);
    localStorage.setItem(`${publicKey.toBase58()}::transactions`, transactions);
    progress.totalCount += 1;
    setProgress(progress);
  }, [publicKey, token, socket])

  const handleCollect = useCallback(
    () => {
      if(publicKey && socket && token) {
        setCollecting(() => true);
        setStreamEnded(() => false);
        const address = publicKey.toBase58();
        const cleanUp = streamCollectTransactions(socket, token, address, handleNewCollectTx);

        return () => cleanUp()
      }
    },
    [publicKey, token, socket]
  );

  const onTokenChange = (e) => {
    setToken(e.target.value)
  }

  const getProgressPerc = useCallback(() => {
    return progress.totalCount > 0 ? (progress.processed / progress.totalCount) * 100 : 0
  }, [progress, transactions]);

  return (
    <div className="sm:h-3/6">
      <div className="flex flex-col gap-4 card h-50">
        <div>
        </div>
        <div>
          <input
            disabled={collecting}
            type="text"
            placeholder="Enter token address"
            className="input input-bordered md:w-2/6 w-5/6"
            onChange={onTokenChange}
            value={token}
          />
        </div>
        <div>
          <button
            disabled={collecting}
            className="btn btn-primary md:w-2/6 w-5/6 text-secondary-content"
            onClick={handleCollect}
          >
            {
              collecting 
              ? <span className="loading loading-spinner"></span>
              : <span>Collect</span>
            }
          </button>
        </div>
        {/* <div>Collecting...</div> */}
        {
          collecting
          ? (
            <div className="flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-700 md:w-2/6 w-5/6 justify-self-center">
                <div
                  className="bg-green-700 text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
                  style={{width: `${getProgressPerc()}%`}}
                >
                  {getProgressPerc()}%
                </div>
              </div>
            </div>
          )
          : null
        }
      </div>
    </div>
  )
}

export default Home
