import {useEffect, useState} from "react";
import Decimal from "decimal.js";

const MICRO_LAMPORTS_PER_LAMPORT = 1_000_000;
const LAMPORTS_PER_SOL = 1_000_000_000;
const DEFAULT_PRIORITY_FEE = 10_000;

// Find how much SOL will be paid for the Tx based on the priorityFee and the computeBudget
// `priorityFee` - Priority fee in microlamports. There are 10^6 micro-lamports in one lamport.
// 50_000 micro lamport is => 50_000 / 1_000_000 = 0.05 Lamports
const feesToSol = (priorityFee, computeBudget) => {
  const lamports = new Decimal(priorityFee).div(MICRO_LAMPORTS_PER_LAMPORT);
  return lamports.times(computeBudget).div(LAMPORTS_PER_SOL).toNumber();
};

// find the priority fee in microlamports given the full tx fees based on the given compute computeBudget
// is equal to the given SOL amount
const feesFromSol = (sol, computeBudget) => {
  const lamports = new Decimal(sol).times(LAMPORTS_PER_SOL);
  const priorityFeeInLamports = lamports.div(computeBudget);

  return priorityFeeInLamports.times(MICRO_LAMPORTS_PER_LAMPORT).toNumber();
};

const AdvancedModal = ({isOpen, handleClose}) => {
  const [priorityFee, setPriorityFee] = useState();

  useEffect(() => {
    console.log("Hi from modal", isOpen)
  }, [isOpen]);

  return (
    <dialog id="advanced_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => handleClose()}
          >
            ✕
          </button>
        </form>
        <p className="py-4">Press ESC key or click on ✕ button to close</p>
      </div>
    </dialog>
  )
}

export default AdvancedModal;
