/**
 * 简化的请求工具类
 * 基于 uni.request 封装的四种基本请求方法和文件上传
 */

import { 
  ResponseCode, 
  isSuccess, 
  needReLogin, 
  getResponseMessage 
} from './responseCode.js'

const BASE_URL = 'http://task.xcodey.cn'
const TIMEOUT = 10000

/**
 * 获取token
 * @returns {string|null}
 */
const getToken = () => {
  return uni.getStorageSync('accessToken') || null
}

/**
 * 显示错误提示
 * @param {string} message 错误信息
 */
const showError = (message) => {
  if (message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
}

/**
 * 处理重新登录
 */
const handleReLogin = () => {
  // 清除本地存储的用户信息和token
  uni.removeStorageSync('accessToken')
  uni.removeStorageSync('refreshToken')
  uni.removeStorageSync('userInfo')
  
  // 跳转到登录页面
  uni.reLaunch({
    url: '/pages/login/login'
  })
}

/**
 * 处理响应数据
 * @param {Object} response 响应对象
 * @param {Object} options 配置选项
 * @returns {any} 处理后的数据
 */
const handleResponse = (response, options = {}) => {
  const { statusCode, data } = response
  const { showError: showErrorOption = true } = options
  
  // HTTP状态码检查
  if (statusCode !== 200) {
    let errorMessage = '请求失败'
    
    switch (statusCode) {
      case 401:
        errorMessage = getResponseMessage(ResponseCode.UNAUTHORIZED)
        break
      case 403:
        errorMessage = getResponseMessage(ResponseCode.FORBIDDEN)
        break
      case 404:
        errorMessage = getResponseMessage(ResponseCode.NOT_FOUND)
        break
      case 500:
        errorMessage = getResponseMessage(ResponseCode.INTERNAL_SERVER_ERROR)
        break
      default:
        errorMessage = `请求失败，状态码：${statusCode}`
    }
    
    if (showErrorOption) {
      showError(errorMessage)
    }
    throw new Error(errorMessage)
  }
  
  // 解析响应数据
  let responseData
  try {
    responseData = typeof data === 'string' ? JSON.parse(data) : data
  } catch (error) {
    const errorMessage = '响应数据格式错误'
    if (showErrorOption) {
      showError(errorMessage)
    }
    throw new Error(errorMessage)
  }
  
  // 直接返回完整的响应数据，让调用方自己判断业务状态码
  // 这样可以让页面组件根据 response.code === 200 来判断成功与否
  return responseData
}

/**
 * 基础请求方法
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = TIMEOUT,
      showError: showErrorOption = true,
      ...otherOptions
    } = options

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

    // 默认请求头
    const defaultHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    // 自动携带token
    const token = getToken()
    if (token) {
      defaultHeader['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: fullUrl,
      method,
      data,
      header: defaultHeader,
      timeout,
      ...otherOptions,
      success: (res) => {
        try {
          const result = handleResponse(res, { showError: showErrorOption })
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        const errorMessage = err.errMsg || '网络请求失败'
        if (showErrorOption) {
          showError(errorMessage)
        }
        reject(new Error(errorMessage))
      }
    })
  })
}

/**
 * 文件上传方法
 * @param {Object} options 上传配置
 * @returns {Promise}
 */
const uploadFile = (options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      filePath,
      name = 'file',
      formData = {},
      header = {},
      timeout = TIMEOUT,
      showError: showErrorOption = true,
      ...otherOptions
    } = options

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

    // 默认请求头
    const defaultHeader = {
      ...header
    }

    // 自动携带token
    const token = getToken()
    if (token) {
      defaultHeader['Authorization'] = `Bearer ${token}`
    }

    uni.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header: defaultHeader,
      timeout,
      ...otherOptions,
      success: (res) => {
        try {
          const result = handleResponse(res, { showError: showErrorOption })
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        const errorMessage = err.errMsg || '文件上传失败'
        if (showErrorOption) {
          showError(errorMessage)
        }
        reject(new Error(errorMessage))
      }
    })
  })
}

/**
 * GET 请求
 * @param {string} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  BASE_URL
}