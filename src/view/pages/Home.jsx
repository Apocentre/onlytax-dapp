import {useCallback, useEffect, useState} from "react";
import {VersionedTransaction} from "@solana/web3.js";
import {concatMap, firstValueFrom} from "rxjs";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {connectToWs, streamCollectTransactions} from "../../services/wsClient";
import "./Home.css"

function Home() {
  const {publicKey, signTransaction} = useWallet();
  const [token, setToken] = useState("9NxTF8W3gB1y49LBn1GTp5QqPmkdp4P8HJDiqJgJQSUB");
  const [socket, setSocket] = useState(null);
  const [txStream, setTxStream] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [progress, setProgress] = useState({
    totalCount: 0,
    processed: 0,
  });
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

  useEffect(() => {
    let subscription;

    if(txStream) {
      subscription = txStream.pipe(
        concatMap(tx => {
          progress.totalCount += 1;
          setProgress(() => progress);

          return new Promise(async (resolve, reject) => {
            try {
              const versionedTx = VersionedTransaction.deserialize(tx.data);
              let {blockhash} = await connection.getLatestBlockhash("confirmed");
              versionedTx.message.recentBlockhash = blockhash;
              
              const signedTX = await signTransaction(versionedTx);
              const txid = await connection.sendTransaction(signedTX, {maxRetries: 10, skipPreflight: false});
              resolve(txid);
            } catch(error) {
              console.log("Error: ", error);
              reject(error);
            }
          })
        })
      );


      subscription.subscribe({
        next: (txid) => {
          console.log("Transaction sent", txid);  
          progress.processed += 1;
          setProgress(() => progress);
        },
        complete: () => {
          console.log("Tx stream completed")
          setCollecting(() => false);
        },
      });
    }

    () => {
      subscription && subscription.unsubscribe()
    }
  }, [txStream])

  const handleCollect = useCallback(
    () => {
      if(connection && publicKey && socket && token) {
        setCollecting(() => true);
        const address = publicKey.toBase58();
        const stream = streamCollectTransactions(socket, token, address);
        setTxStream(stream);
      }
    },
    [connection, publicKey, token, socket]
  );

  const onTokenChange = (e) => {
    setToken(e.target.value)
  }

  const getProgressPerc = useCallback(() => {
    return progress.totalCount > 0 ? (progress.processed / progress.totalCount) * 100 : 0
  }, [progress]);

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
