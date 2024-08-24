import fetch from "./api";

export const signin = async (authHeader)=> {
  try {
    const data = await fetch(
      `${import.meta.env.VITE_API}/accounts`,
      "POST",
      {
        headers: {
          'X-Onlytax-Auth': authHeader,
        },
      }
    );

    return data;
  } catch (error) {
    throw new Error(`Sign-in error: ${error}`);
  }
};
