/**
 * 响应码字典
 * 定义所有业务响应码和对应的错误信息
 */

// 响应码枚举
export const ResponseCode = {
  // 成功
  SUCCESS: 200,
  
  // 客户端错误 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  
  // 服务器错误 5xx
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  
  // 业务错误 1xxx
  USER_NOT_FOUND: 1001,
  USER_ALREADY_EXISTS: 1002,
  INVALID_PASSWORD: 1003,
  ACCOUNT_DISABLED: 1004,
  ACCOUNT_LOCKED: 1005,
  TOKEN_EXPIRED: 1006,
  TOKEN_INVALID: 1007,
  
  // 任务相关错误 2xxx
  TASK_NOT_FOUND: 2001,
  TASK_ALREADY_TAKEN: 2002,
  TASK_NOT_AVAILABLE: 2003,
  INSUFFICIENT_BALANCE: 2004,
  
  // 文件相关错误 3xxx
  FILE_UPLOAD_ERROR: 3001,
  FILE_NOT_FOUND: 3002,
  FILE_TYPE_NOT_SUPPORTED: 3003,
  FILE_SIZE_EXCEEDED: 3004,
  
  // 短信相关错误 4xxx
  SMS_SEND_ERROR: 4001,
  SMS_CODE_EXPIRED: 4002,
  SMS_CODE_INVALID: 4003,
  SMS_SEND_TOO_FREQUENT: 4004
}

// 响应码对应的错误信息
export const ResponseMessage = {
  // 成功
  [ResponseCode.SUCCESS]: "操作成功",
  
  // 客户端错误 4xx
  [ResponseCode.BAD_REQUEST]: "请求参数错误",
  [ResponseCode.UNAUTHORIZED]: "未授权访问",
  [ResponseCode.FORBIDDEN]: "禁止访问",
  [ResponseCode.NOT_FOUND]: "资源不存在",
  [ResponseCode.METHOD_NOT_ALLOWED]: "请求方法不允许",
  [ResponseCode.CONFLICT]: "资源冲突",
  [ResponseCode.VALIDATION_ERROR]: "参数校验失败",
  
  // 服务器错误 5xx
  [ResponseCode.INTERNAL_SERVER_ERROR]: "服务器内部错误",
  [ResponseCode.SERVICE_UNAVAILABLE]: "服务不可用",
  
  // 业务错误 1xxx
  [ResponseCode.USER_NOT_FOUND]: "用户不存在",
  [ResponseCode.USER_ALREADY_EXISTS]: "用户已存在",
  [ResponseCode.INVALID_PASSWORD]: "密码错误",
  [ResponseCode.ACCOUNT_DISABLED]: "账户已禁用",
  [ResponseCode.ACCOUNT_LOCKED]: "账户已锁定",
  [ResponseCode.TOKEN_EXPIRED]: "令牌已过期",
  [ResponseCode.TOKEN_INVALID]: "令牌无效",
  
  // 任务相关错误 2xxx
  [ResponseCode.TASK_NOT_FOUND]: "任务不存在",
  [ResponseCode.TASK_ALREADY_TAKEN]: "任务已被接取",
  [ResponseCode.TASK_NOT_AVAILABLE]: "任务不可用",
  [ResponseCode.INSUFFICIENT_BALANCE]: "余额不足",
  
  // 文件相关错误 3xxx
  [ResponseCode.FILE_UPLOAD_ERROR]: "文件上传失败",
  [ResponseCode.FILE_NOT_FOUND]: "文件不存在",
  [ResponseCode.FILE_TYPE_NOT_SUPPORTED]: "文件类型不支持",
  [ResponseCode.FILE_SIZE_EXCEEDED]: "文件大小超出限制",
  
  // 短信相关错误 4xxx
  [ResponseCode.SMS_SEND_ERROR]: "短信发送失败",
  [ResponseCode.SMS_CODE_EXPIRED]: "验证码已过期",
  [ResponseCode.SMS_CODE_INVALID]: "验证码错误",
  [ResponseCode.SMS_SEND_TOO_FREQUENT]: "短信发送过于频繁"
}

// 成功响应码列表
export const SuccessCodes = [ResponseCode.SUCCESS]

// 客户端错误响应码列表
export const ClientErrorCodes = [
  ResponseCode.BAD_REQUEST,
  ResponseCode.UNAUTHORIZED,
  ResponseCode.FORBIDDEN,
  ResponseCode.NOT_FOUND,
  ResponseCode.METHOD_NOT_ALLOWED,
  ResponseCode.CONFLICT,
  ResponseCode.VALIDATION_ERROR
]

// 服务器错误响应码列表
export const ServerErrorCodes = [
  ResponseCode.INTERNAL_SERVER_ERROR,
  ResponseCode.SERVICE_UNAVAILABLE
]

// 业务错误响应码列表
export const BusinessErrorCodes = [
  // 用户相关错误
  ResponseCode.USER_NOT_FOUND,
  ResponseCode.USER_ALREADY_EXISTS,
  ResponseCode.INVALID_PASSWORD,
  ResponseCode.ACCOUNT_DISABLED,
  ResponseCode.ACCOUNT_LOCKED,
  ResponseCode.TOKEN_EXPIRED,
  ResponseCode.TOKEN_INVALID,
  
  // 任务相关错误
  ResponseCode.TASK_NOT_FOUND,
  ResponseCode.TASK_ALREADY_TAKEN,
  ResponseCode.TASK_NOT_AVAILABLE,
  ResponseCode.INSUFFICIENT_BALANCE,
  
  // 文件相关错误
  ResponseCode.FILE_UPLOAD_ERROR,
  ResponseCode.FILE_NOT_FOUND,
  ResponseCode.FILE_TYPE_NOT_SUPPORTED,
  ResponseCode.FILE_SIZE_EXCEEDED,
  
  // 短信相关错误
  ResponseCode.SMS_SEND_ERROR,
  ResponseCode.SMS_CODE_EXPIRED,
  ResponseCode.SMS_CODE_INVALID,
  ResponseCode.SMS_SEND_TOO_FREQUENT
]

/**
 * 工具方法
 */

/**
 * 判断是否为成功响应码
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isSuccess = (code) => {
  return SuccessCodes.includes(code)
}

/**
 * 判断是否为客户端错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isClientError = (code) => {
  return ClientErrorCodes.includes(code)
}

/**
 * 判断是否为服务器错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isServerError = (code) => {
  return ServerErrorCodes.includes(code)
}

/**
 * 判断是否为业务错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isBusinessError = (code) => {
  return BusinessErrorCodes.includes(code)
}

/**
 * 获取响应码对应的错误信息
 * @param {number} code 响应码
 * @param {string} defaultMessage 默认错误信息
 * @returns {string}
 */
export const getResponseMessage = (code, defaultMessage = '未知错误') => {
  return ResponseMessage[code] || defaultMessage
}

/**
 * 判断是否需要重新登录
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const needReLogin = (code) => {
  return [
    ResponseCode.UNAUTHORIZED,
    ResponseCode.TOKEN_EXPIRED,
    ResponseCode.TOKEN_INVALID
  ].includes(code)
}

/**
 * 判断是否为用户相关错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isUserError = (code) => {
  return [
    ResponseCode.USER_NOT_FOUND,
    ResponseCode.USER_ALREADY_EXISTS,
    ResponseCode.INVALID_PASSWORD,
    ResponseCode.ACCOUNT_DISABLED,
    ResponseCode.ACCOUNT_LOCKED,
    ResponseCode.TOKEN_EXPIRED,
    ResponseCode.TOKEN_INVALID
  ].includes(code)
}

/**
 * 判断是否为任务相关错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isTaskError = (code) => {
  return [
    ResponseCode.TASK_NOT_FOUND,
    ResponseCode.TASK_ALREADY_TAKEN,
    ResponseCode.TASK_NOT_AVAILABLE,
    ResponseCode.INSUFFICIENT_BALANCE
  ].includes(code)
}

/**
 * 判断是否为文件相关错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isFileError = (code) => {
  return [
    ResponseCode.FILE_UPLOAD_ERROR,
    ResponseCode.FILE_NOT_FOUND,
    ResponseCode.FILE_TYPE_NOT_SUPPORTED,
    ResponseCode.FILE_SIZE_EXCEEDED
  ].includes(code)
}

/**
 * 判断是否为短信相关错误
 * @param {number} code 响应码
 * @returns {boolean}
 */
export const isSmsError = (code) => {
  return [
    ResponseCode.SMS_SEND_ERROR,
    ResponseCode.SMS_CODE_EXPIRED,
    ResponseCode.SMS_CODE_INVALID,
    ResponseCode.SMS_SEND_TOO_FREQUENT
  ].includes(code)
}