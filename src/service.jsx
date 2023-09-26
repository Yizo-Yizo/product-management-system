import axios from 'axios'
import { setupInterceptorsTo } from './interceptor'
import { BaseUrl } from './environment'

const axiosInstance = setupInterceptorsTo(axios.create())

// const defaultOptions = {
//   headers: {
//     'Content-Type': 'multipart/form-data'
//   }
// }

export const apiGet = async (path) =>
  axiosInstance.get(`${BaseUrl}${path}`)

export const apiPost = async (path, data) => {

  // const requestOptions = {
  //   ...defaultOptions,
  //   ...options,
  // };

  console.log('data')
  data.forEach(element => {
    console.log(element)
  });

  return axiosInstance.post(`${BaseUrl}${path}`, data)
}
  

export const apiPut = async (path, data) =>
  axiosInstance.post(`${BaseUrl}${path}`, data)

export const apiDelete = async (path) => {

  // const requestOptions = {
  //   ...defaultOptions,
  //   ...options,
  // };

  return axiosInstance.delete(`${BaseUrl}${path}`)
}
  