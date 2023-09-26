import { BaseUrl } from './environment'

const onRequest = (config) => {
  const userToken = localStorage.getItem(
    'react-demo-token'
  )
 
  config = {
    ...config,
    BaseUrl
  }

  if (!config.url?.includes('login')) {
    const newConfig = {
      ...config,
      headers: {
        'token': userToken
      }
    }
    return newConfig
  }
  return config
}

const onRequestError = (error) => {
  console.log(error)
  return error
}

const onResponse = (response) => {
  return response
}

const onResponseError = (error) => {
  console.log(error)
  return error
}

export const setupInterceptorsTo = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    onRequest,
    onRequestError
  )
  axiosInstance.interceptors.response.use(
    onResponse,
    onResponseError
  )
  return axiosInstance
}