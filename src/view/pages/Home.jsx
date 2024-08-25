import {useCallback, useEffect, useState} from "react";
import {VersionedTransaction, Message, Keypair} from "@solana/web3.js";
import {concatMap} from "rxjs";
import bs58 from "bs58";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {readJwt} from "../../services/jwt";
import {connectToWs, streamCollectTransactions} from "../../services/wsClient";
import {setComputeUnitPrice} from "../../services/web3";
import AdvancedModal from "../components/AdvancedModal";
import "./Home.css"

function Home() {
  const {publicKey, signTransaction} = useWallet();
  const [token, setToken] = useState("Ex7QKTHsGHMkVtYg8tgi48Wyw1XrH8hM4dp6B8SGenVz");
  const [socket, setSocket] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [userPriorityFee, setUserPriorityFee] = useState();
  const [authorityKey, setAuthorityKey] = useState();
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

  const handleCollect = (txStream) => {
    let subscription;

    if(txStream) {
      const observer = txStream.pipe(
        concatMap(msg => {
          setTxCount(msg.batch_count);

          return new Promise(async (resolve, reject) => {
            try {
              const versionedTx = VersionedTransaction.deserialize(msg.tx);
              let {blockhash} = await connection.getLatestBlockhash("confirmed");
              versionedTx.message.recentBlockhash = blockhash;

              if(userPriorityFee) {
                // a super dirty trick to transform the `TransactionInstruction` returned from setComputeUnitPrice
                // into a CompileInstruction which is needed but the message.instructions
                const tmpMessage = Message.compile({
                  instructions: [setComputeUnitPrice(userPriorityFee)],
                  payerKey: publicKey,
                });

                // replace the existing priorityFee ix data with the new ones
                versionedTx.message.instructions[0].data = tmpMessage.instructions[0].data;
                versionedTx.message.compiledInstructions[0].data = bs58.decode(tmpMessage.instructions[0].data);
              }

              if(!authorityKey) {
                // sign using the wallet extention
                const signedTX = await signTransaction(versionedTx);
                const txid = await connection.sendTransaction(signedTX, {maxRetries: 10, skipPreflight: false});

                socket.emit("save-collect-tx", {
                  access_token: readJwt(),
                  withdraw_withheld_authority: publicKey.toBase58(),
                  token,
                  batch_size: msg.batch_size,
                  tx_signature: txid,
                });

                resolve(txid);
              } else {
                // sign using the user provided private key
                const wallet = Keypair.fromSecretKey(Buffer.from(bs58.decode(authorityKey)));
                versionedTx.sign([wallet]);
                const txid = await connection.sendTransaction(versionedTx, {maxRetries: 10, skipPreflight: false});

                socket.emit("save-collect-tx", {
                  access_token: readJwt(),
                  withdraw_withheld_authority: wallet.publicKey.toBase58(),
                  token,
                  batch_size: msg.batch_size,
                  tx_signature: txid,
                });

                resolve(txid);
              }
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
  }

  const startCollecting = () => {
    if(connection && publicKey && socket && token) {
      setCollecting(true);
      const address = publicKey.toBase58();
      const txStream = streamCollectTransactions(socket, token, address);
      handleCollect(txStream);
    }
  }

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
        setAuthorityKey={setAuthorityKey}
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
