import fetch from "./api";

export const fetchPriorityFees = async ()=> {
  try {
    const data = await fetch(
      `${import.meta.env.VITE_PRIORITY_FEE_RPC}`,
      "POST",
      {
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'qn_estimatePriorityFees',
          params: {last_n_blocks: 100},
        }
      }
    );

    return data?.result?.per_compute_unit?.high;
  } catch (error) {
    throw new Error(`Sign-in error: ${error}`);
  }
};
