import fetch from "./api";

const DEFAULT_PRIORITY_FEE = 10_000;

export const fetchPriorityFees = async ()=> {
  try {
    const data = await fetch(
      `${import.meta.env.VITE_API}/priority-fees`,
      "POST",
      {},
      true,
    );

    return data.high;
  } catch (error) {
    return DEFAULT_PRIORITY_FEE;
  }
};
