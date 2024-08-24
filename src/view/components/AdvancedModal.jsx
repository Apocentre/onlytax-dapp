import {useEffect, useState} from "react";
import Decimal from "decimal.js";
import {fetchPriorityFees} from "../../services/fees";

const MICRO_LAMPORTS_PER_LAMPORT = 1_000_000;
const LAMPORTS_PER_SOL = 1_000_000_000;
const DEFAULT_PRIORITY_FEE = 10_000;

// Find how much SOL will be paid for the Tx based on the priorityFee and the computeBudget
// `priorityFee` - Priority fee in microlamports. There are 10^6 micro-lamports in one lamport.
// 50_000 micro lamport is => 50_000 / 1_000_000 = 0.05 Lamports
const feesToSol = (priorityFee, computeBudget=200_000) => {
  const lamports = new Decimal(priorityFee).div(MICRO_LAMPORTS_PER_LAMPORT);
  return lamports.times(computeBudget).div(LAMPORTS_PER_SOL).toNumber();
};

// find the priority fee in microlamports given the full tx fees based on the given compute computeBudget
// is equal to the given SOL amount
const feesFromSol = (sol, computeBudget=200_000) => {
  const lamports = new Decimal(sol).times(LAMPORTS_PER_SOL);
  const priorityFeeInLamports = lamports.div(computeBudget);

  return priorityFeeInLamports.times(MICRO_LAMPORTS_PER_LAMPORT).toNumber();
};

const AdvancedModal = ({isOpen, handleClose}) => {
  const [solFee, setSolFee] = useState();
  const [priorityFee, setPriorityFee] = useState();

  useEffect(() => {
    const fetch  = async () => {
      if(isOpen) {
        const priorityFee = await fetchPriorityFees();
        setPriorityFee(priorityFee);
        setSolFee(feesToSol(priorityFee));
      }
    }

    fetch()
    .catch(error => console.log(error));

  }, [isOpen]);

  const handlePriorityFee = (e) => {
    const value = e.target.value;
    setSolFee(value !== '' ? value : 0);
  };

  return (
    <dialog id="advanced_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Advanced Settings</h3>
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => handleClose()}
          >
            ✕
          </button>
        </form>
        <div className="m-4 flex flex-col gap-2">
          <div className="text-left">
            Private Key
            <div className="dropdown">
              <div
                tabIndex={0}
                className="card compact dropdown-content bg-base-100 z-[100] w-64 shadow">
                <div tabIndex={0} className="card-body">
                  <p>We never share your private key. It will be removed from the application when you refresh or close the browser!</p>
                  <p>For more infomation read the <a className="link link-accent">docs</a></p>
                </div>
              </div>
              <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-xs text-error">
                <svg
                  tabIndex={0}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 stroke-current">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70">
              <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd" />
            </svg>
            <input type="password" className="grow" value={""} />
            <span className="badge badge-neutral">Optional</span>
          </label>    
          <div className="text-left">
            Priority Fee
            <div className="dropdown dropdown-top">
              <div
                tabIndex={0}
                className="card compact dropdown-content bg-base-100 z-[100] w-64 shadow">
                <div tabIndex={0} className="card-body">
                  <p>Priortity fees allows your transaction to be processed faster. This number is the total fees that you will pay for your transactions</p>
                  <p>For more infomation read the <a className="link link-accent">docs</a></p>
                </div>
              </div>
              <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-xs text-success">
                <svg
                  tabIndex={0}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 stroke-current">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <input
            type="number"
            placeholder="Total Transaction Fees"
            value={solFee}
            onChange={handlePriorityFee}
            className="input input-bordered w-full" />
        </div>
      </div>
    </dialog>
  )
}

export default AdvancedModal;
