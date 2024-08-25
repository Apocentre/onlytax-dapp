import fetch from "./api";
import {storeJwt} from "./jwt";

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

    storeJwt(data.jwt);
  } catch (error) {
    throw new Error(`Sign-in error: ${error}`);
  }
};
