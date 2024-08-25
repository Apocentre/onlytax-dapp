export const storeJwt = (jwt) => {
  if(!jwt) {
    return new Error('JWT cannot be undefined')
  }

  localStorage.setItem("ONLYTAX::JWT", jwt);
}

export const readJwt = () => {
  return localStorage.getItem("ONLYTAX::JWT")
}
