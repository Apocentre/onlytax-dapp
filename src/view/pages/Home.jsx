import {useCallback, useEffect, useState} from "react";
import {VersionedTransaction} from "@solana/web3.js";
import {concatMap} from "rxjs";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {connectToWs, streamCollectTransactions} from "../../services/wsClient";
import AdvancedModal from "../components/AdvancedModal";
import "./Home.css"

function Home() {
  const {publicKey, signTransaction} = useWallet();
  const [token, setToken] = useState("9NxTF8W3gB1y49LBn1GTp5QqPmkdp4P8HJDiqJgJQSUB");
  const [socket, setSocket] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [userPriorityFee, setUserPriorityFee] = useState();
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

  const cleanUp = () => {
    setCollecting(false);
    setTxCount(0);
    setProcessed(0);
  }

  const handleCollect = useCallback((txStream) => {
    let subscription;

    if(txStream) {
      const observer = txStream.pipe(
        concatMap(msg => {
          setTxCount(msg.count);

          return new Promise(async (resolve, reject) => {
            try {
              const versionedTx = VersionedTransaction.deserialize(msg.tx);
              let {blockhash} = await connection.getLatestBlockhash("confirmed");
              versionedTx.message.recentBlockhash = blockhash;
              
              const signedTX = await signTransaction(versionedTx);
              const txid = await connection.sendTransaction(signedTX, {maxRetries: 10, skipPreflight: false});
              resolve(txid);
            } catch(error) {
              reject(error);
            }
          })
        })
      );

      subscription = observer.subscribe({
        next(txid) {
          setProcessed((v) => v + 1);
          console.log(`[${processed}] Transaction sent`, txid);
        },
        error(err) {
          console.log("Stream error: ", err);
          cleanUp();
          subscription.unsubscribe();
        },
        complete() {
          console.log("Tx stream completed")
          cleanUp();
          subscription.unsubscribe();
        },
      });
    }
  }, [connection, signTransaction])

  const startCollecting = useCallback(
    () => {
      if(connection && publicKey && socket && token) {
        setCollecting(true);
        const address = publicKey.toBase58();
        const txStream = streamCollectTransactions(socket, token, address);
        handleCollect(txStream);
      }
    },
    [connection, publicKey, token, socket]
  );

  const onTokenChange = (e) => {
    setToken(e.target.value)
  }

  const getProgressPerc = useCallback(() => {
    const value = txCount > 0 ? (processed / txCount) * 100 : 0;

    return value.toFixed(0);
  }, [txCount, processed]);

  return (
    <div className="sm:h-3/6">
      <AdvancedModal
        isOpen={advancedModalOpen}
        setUserPriorityFee={setUserPriorityFee}
        handleClose={() => setAdvancedModalOpen(false)}
      />
      <div className="flex flex-col gap-4 card h-50">
        <div className="flex flex-col gap-1 items-center">
          <input
            disabled={collecting}
            type="text"
            placeholder="Enter token address"
            className="input input-bordered md:w-2/6 w-5/6"
            onChange={onTokenChange}
            value={token}
          />
          <div
            className="md:w-2/6 w-5/6 text-left text-xs font-medium pl-1 underline cursor-pointer"
            onClick={() => {
              document.getElementById("advanced_modal").showModal();
              setAdvancedModalOpen(true);
            }}
          >
            Advanced
          </div>
        </div>
        <div>
          <button
            disabled={collecting}
            className="btn btn-primary md:w-2/6 w-5/6 text-secondary-content"
            onClick={startCollecting}
          >
            {
              collecting 
              ? <span className="loading loading-spinner"></span>
              : <span>Collect</span>
            }
          </button>
        </div>
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
