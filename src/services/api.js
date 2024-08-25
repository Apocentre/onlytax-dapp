import {readJwt} from "./jwt.js";

export class HttpError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export default async (
  url,
  method = 'GET',
  {
    body = {},
    headers
  } = {},
  auth=false,
  skipParse,
  fileUpload
) => {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      ...headers
    }
  }

  if(auth) {
    const jwt = readJwt();
    if(!jwt) {
      return HttpError('Please sign-in first')
    }
    options.headers['Authorization'] = `bearer ${jwt}`
  }

  if(!fileUpload) {
    options.headers['Content-Type'] = 'application/json'
  }

  // dissalow body inclusion for methods that don't support it
  if(method !== 'GET' && method !== 'DELETE' && options.headers['Content-Type'] === 'application/json') {
    options.body = skipParse ? body : JSON.stringify(body)
  } else if(fileUpload) {
    options.body = body
  }

  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type')

  if(response.status === 401) {
    throw new HttpError('Unauthorized', response.status)
  }

  if(response.status >= 400) {
    const text = await response.text() || ''
    throw new HttpError(text, response.status)
  }

  // including the deleted resource is usefull for any further actions
  if(response.status === 204) return {result: body}

  if(contentType && contentType.indexOf('application/json') !== -1) {
    return await response.json()
  }

  return await response.text()
}
