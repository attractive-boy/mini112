if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const ResponseCode = {
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
  };
  const ResponseMessage = {
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
  };
  const getResponseMessage = (code, defaultMessage = "未知错误") => {
    return ResponseMessage[code] || defaultMessage;
  };
  const BASE_URL$1 = "http://task.xcodey.cn";
  const TIMEOUT = 1e4;
  const getToken = () => {
    return uni.getStorageSync("accessToken") || null;
  };
  const showError = (message) => {
    if (message) {
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2e3
      });
    }
  };
  const handleResponse = (response, options = {}) => {
    const { statusCode, data } = response;
    const { showError: showErrorOption = true } = options;
    if (statusCode !== 200) {
      let errorMessage = "请求失败";
      switch (statusCode) {
        case 401:
          errorMessage = getResponseMessage(ResponseCode.UNAUTHORIZED);
          break;
        case 403:
          errorMessage = getResponseMessage(ResponseCode.FORBIDDEN);
          break;
        case 404:
          errorMessage = getResponseMessage(ResponseCode.NOT_FOUND);
          break;
        case 500:
          errorMessage = getResponseMessage(ResponseCode.INTERNAL_SERVER_ERROR);
          break;
        default:
          errorMessage = `请求失败，状态码：${statusCode}`;
      }
      if (showErrorOption) {
        showError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    let responseData;
    try {
      responseData = typeof data === "string" ? JSON.parse(data) : data;
    } catch (error) {
      const errorMessage = "响应数据格式错误";
      if (showErrorOption) {
        showError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    return responseData;
  };
  const request = (options = {}) => {
    return new Promise((resolve, reject) => {
      const {
        url,
        method = "GET",
        data = {},
        header = {},
        timeout = TIMEOUT,
        showError: showErrorOption = true,
        ...otherOptions
      } = options;
      const fullUrl = url.startsWith("http") ? url : `${BASE_URL$1}${url}`;
      const defaultHeader = {
        "Content-Type": "application/json",
        ...header
      };
      const token = getToken();
      if (token) {
        defaultHeader["Authorization"] = `Bearer ${token}`;
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
            const result = handleResponse(res, { showError: showErrorOption });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (err) => {
          const errorMessage = err.errMsg || "网络请求失败";
          if (showErrorOption) {
            showError(errorMessage);
          }
          reject(new Error(errorMessage));
        }
      });
    });
  };
  const get = (url, params = {}, options = {}) => {
    return request({
      url,
      method: "GET",
      data: params,
      ...options
    });
  };
  const post = (url, data = {}, options = {}) => {
    return request({
      url,
      method: "POST",
      data,
      ...options
    });
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$p = {
    data() {
      return {
        phone: "",
        password: "",
        agree: true
      };
    },
    async onLoad() {
      await this.checkLoginStatus();
    },
    computed: {
      canSubmit() {
        return this.phone.trim() && this.password.trim();
      }
    },
    methods: {
      // 检查登录状态
      async checkLoginStatus() {
        try {
          const accessToken = uni.getStorageSync("accessToken");
          const userInfo = uni.getStorageSync("userInfo");
          if (accessToken && userInfo) {
            uni.showToast({ title: "已登录", icon: "none" });
            setTimeout(() => {
              uni.switchTab({ url: "/pages/home/home" });
            }, 1e3);
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:86", "检查登录状态失败:", error);
        }
      },
      async login() {
        if (!this.canSubmit) {
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        try {
          const response = await post("/api/user/login", {
            account: this.phone.trim(),
            password: this.password.trim()
          });
          if (response && response.code === 200) {
            uni.setStorageSync("accessToken", response.data.accessToken);
            uni.setStorageSync("refreshToken", response.data.refreshToken);
            uni.setStorageSync("tokenType", response.data.tokenType);
            uni.setStorageSync("expiresIn", response.data.expiresIn);
            uni.setStorageSync("userInfo", response.data.userInfo);
            uni.showToast({ title: "登录成功", icon: "success" });
            setTimeout(() => {
              uni.switchTab({ url: "/pages/home/home" });
            }, 1500);
          } else {
            uni.showToast({ title: response.message || "登录失败", icon: "none" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:120", "登录失败:", error);
          uni.showToast({ title: error.message, icon: "none" });
        }
      },
      goToRegister() {
        uni.navigateTo({ url: "/pages/register/register" });
      },
      goToForgot() {
        uni.navigateTo({ url: "/pages/forgot/forgot" });
      },
      goToUserAgreement() {
        uni.navigateTo({ url: "/pages/user-agreement/user-agreement" });
      },
      goToPrivacyPolicy() {
        uni.navigateTo({ url: "/pages/privacy-policy/privacy-policy" });
      }
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "欢迎登录"),
          vue.createElementVNode("text", { class: "subtitle" }, "任务多，悬赏高")
        ]),
        vue.createElementVNode("view", { class: "tab-container" }, [
          vue.createElementVNode("view", { class: "tab-item active" }, [
            vue.createElementVNode("text", { class: "tab-text" }, "登录"),
            vue.createElementVNode("view", { class: "tab-underline" })
          ]),
          vue.createElementVNode("view", {
            class: "tab-item",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goToRegister && $options.goToRegister(...args))
          }, [
            vue.createElementVNode("text", { class: "tab-text" }, "注册"),
            vue.createElementVNode("view", { class: "tab-underline" })
          ])
        ]),
        vue.createElementVNode("view", { class: "form" }, [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "手机号 / 邮箱"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入手机号或邮箱",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.phone = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.phone]
              ])
            ])
          ]),
          vue.createElementVNode("view", {
            class: "form-group",
            style: { "margin-bottom": "0rpx" }
          }, [
            vue.createElementVNode("text", { class: "label" }, "密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon lock" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  type: "password",
                  placeholder: "请输入密码",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.password]
              ]),
              vue.createElementVNode("text", {
                class: "forgot-link",
                onClick: _cache[3] || (_cache[3] = (...args) => $options.goToForgot && $options.goToForgot(...args))
              }, "忘记密码？")
            ])
          ]),
          vue.createElementVNode("view", { class: "agreement-wrapper" }, [
            vue.createElementVNode(
              "checkbox-group",
              {
                class: "agreement-checkbox",
                onChange: _cache[4] || (_cache[4] = (...args) => _ctx.onAgreeChange && _ctx.onAgreeChange(...args))
              },
              [
                vue.createElementVNode("checkbox", {
                  checked: $data.agree,
                  color: "#FFCE00"
                }, null, 8, ["checked"])
              ],
              32
              /* NEED_HYDRATION */
            ),
            vue.createElementVNode("view", { class: "agreement-text-only" }, [
              vue.createElementVNode("text", { class: "agreement-text" }, "登录即表示同意"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[5] || (_cache[5] = (...args) => $options.goToUserAgreement && $options.goToUserAgreement(...args))
              }, "《用户协议》"),
              vue.createElementVNode("text", { class: "agreement-text" }, "和"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.goToPrivacyPolicy && $options.goToPrivacyPolicy(...args))
              }, "《隐私政策》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: "primary-btn btn-primary",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.login && $options.login(...args))
          }, "立即登录")
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-e4e4508d"], ["__file", "/Users/licheng/Desktop/mini112/pages/login/login.vue"]]);
  const _sfc_main$o = {
    data() {
      return {
        formData: {
          account: "",
          nickname: "",
          verificationCode: "",
          password: "",
          confirmPassword: "",
          inviteCode: ""
        },
        countdown: 0,
        timer: null,
        agree: true,
        loading: false
      };
    },
    async onLoad() {
      await this.checkLoginStatus();
    },
    computed: {
      canSubmit() {
        const { account, nickname, verificationCode, password, confirmPassword } = this.formData;
        return account && account.trim() && verificationCode && verificationCode.trim() && password && password.trim() && confirmPassword && confirmPassword.trim() && password === confirmPassword && this.validateAccount(account) && this.validatePassword(password) && // 如果填写了昵称，需要验证长度
        (!nickname || !nickname.trim() || nickname.trim().length <= 50);
      }
    },
    methods: {
      // 检查登录状态
      async checkLoginStatus() {
        try {
          const accessToken = uni.getStorageSync("accessToken");
          const userInfo = uni.getStorageSync("userInfo");
          if (accessToken && userInfo) {
            uni.showToast({ title: "您已登录，正在跳转...", icon: "success" });
            setTimeout(() => {
              uni.switchTab({ url: "/pages/home/home" });
            }, 1e3);
          }
        } catch (error) {
          formatAppLog("error", "at pages/register/register.vue:136", "检查登录状态失败:", error);
        }
      },
      goToLogin() {
        uni.navigateBack();
      },
      goToUserAgreement() {
        uni.navigateTo({ url: "/pages/user-agreement/user-agreement" });
      },
      goToPrivacyPolicy() {
        uni.navigateTo({ url: "/pages/privacy-policy/privacy-policy" });
      },
      // 验证账户格式（手机号或邮箱）
      validateAccount(account) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return phoneRegex.test(account) || emailRegex.test(account);
      },
      // 验证密码强度
      validatePassword(password) {
        return password.length >= 6 && password.length <= 20;
      },
      // 发送验证码
      async sendCode() {
        const account = this.formData.account;
        if (!account || !account.trim()) {
          uni.showToast({ title: "请输入账户", icon: "none" });
          return;
        }
        if (!this.validateAccount(account)) {
          uni.showToast({ title: "请输入正确的手机号或邮箱", icon: "none" });
          return;
        }
        if (this.countdown > 0) {
          return;
        }
        try {
          const result = await post("/api/user/send-verification-code", {
            account,
            codeType: "register"
          });
          if (result && result.code === 200) {
            uni.showToast({
              title: "验证码已发送",
              icon: "success"
            });
            this.countdown = 60;
            this.timer = setInterval(() => {
              this.countdown--;
              if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.timer = null;
              }
            }, 1e3);
          } else {
            uni.showToast({ title: result.message || "发送验证码失败", icon: "none" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/register/register.vue:207", "发送验证码失败:", error);
          uni.showToast({ title: error.message, icon: "none" });
        }
      },
      // 开始倒计时
      startCountdown() {
        this.countdown = 60;
        this.timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(this.timer);
            this.timer = null;
          }
        }, 1e3);
      },
      // 注册
      async register() {
        if (!this.canSubmit) {
          this.validateForm();
          return;
        }
        if (!this.validateForm()) {
          return;
        }
        this.loading = true;
        try {
          const requestData = {
            account: this.formData.account,
            password: this.formData.password,
            confirmPassword: this.formData.confirmPassword,
            verificationCode: this.formData.verificationCode
          };
          if (this.formData.nickname && this.formData.nickname.trim()) {
            requestData.nickname = this.formData.nickname.trim();
          }
          if (this.formData.inviteCode && this.formData.inviteCode.trim()) {
            requestData.inviteCode = this.formData.inviteCode.trim();
          }
          const result = await post("/api/user/register", requestData);
          if (result && result.code === 200) {
            uni.showToast({
              title: "注册成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            }, 1500);
          } else {
            uni.showToast({ title: result.message || "注册失败", icon: "none" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/register/register.vue:274", "注册失败:", error);
          uni.showToast({ title: error.message, icon: "none" });
        } finally {
          this.loading = false;
        }
      },
      // 表单验证
      validateForm() {
        const { account, nickname, verificationCode, password, confirmPassword } = this.formData;
        if (!account || !account.trim()) {
          uni.showToast({ title: "请输入账户", icon: "none" });
          return false;
        }
        if (!this.validateAccount(account)) {
          uni.showToast({ title: "请输入正确的手机号或邮箱", icon: "none" });
          return false;
        }
        if (nickname && nickname.trim() && nickname.trim().length > 50) {
          uni.showToast({ title: "昵称长度不能超过50个字符", icon: "none" });
          return false;
        }
        if (!verificationCode || !verificationCode.trim()) {
          uni.showToast({ title: "请输入验证码", icon: "none" });
          return false;
        }
        if (!password || !password.trim()) {
          uni.showToast({ title: "请输入密码", icon: "none" });
          return false;
        }
        if (!this.validatePassword(password)) {
          uni.showToast({ title: "密码长度需要6-20个字符", icon: "none" });
          return false;
        }
        if (!confirmPassword || !confirmPassword.trim()) {
          uni.showToast({ title: "请确认密码", icon: "none" });
          return false;
        }
        if (password !== confirmPassword) {
          uni.showToast({ title: "两次密码输入不一致", icon: "none" });
          return false;
        }
        return true;
      }
    },
    onUnload() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "欢迎注册"),
          vue.createElementVNode("text", { class: "subtitle" }, "任务多，悬赏高")
        ]),
        vue.createElementVNode("view", { class: "tab-container" }, [
          vue.createElementVNode("view", {
            class: "tab-item",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goToLogin && $options.goToLogin(...args))
          }, [
            vue.createElementVNode("text", { class: "tab-text" }, "登录"),
            vue.createElementVNode("view", { class: "tab-underline" })
          ]),
          vue.createElementVNode("view", { class: "tab-item active" }, [
            vue.createElementVNode("text", { class: "tab-text" }, "注册"),
            vue.createElementVNode("view", { class: "tab-underline" })
          ])
        ]),
        vue.createElementVNode("view", { class: "form" }, [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "账户"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入手机号或邮箱",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.formData.account = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.account]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "昵称"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon no-bg" }, "👤"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入昵称",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.nickname = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.nickname]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "验证码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入验证码",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.formData.verificationCode = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.verificationCode]
              ]),
              vue.createElementVNode("button", {
                class: "verify-btn btn-secondary",
                onClick: _cache[4] || (_cache[4] = (...args) => $options.sendCode && $options.sendCode(...args)),
                disabled: $data.countdown > 0 || !$data.formData.account
              }, vue.toDisplayString($data.countdown > 0 ? `${$data.countdown}秒后重发` : "发送验证码"), 9, ["disabled"])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "设置密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon lock" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  type: "password",
                  placeholder: "请设置登录密码",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.formData.password = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.password]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "确认密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon lock" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  type: "password",
                  placeholder: "再次输入密码",
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.formData.confirmPassword = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.confirmPassword]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "邀请码（选填）"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon no-bg" }, "🎁"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入邀请码（可选）",
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.formData.inviteCode = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.inviteCode]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "agreement-wrapper" }, [
            vue.createElementVNode(
              "checkbox-group",
              {
                class: "agreement-checkbox",
                onChange: _cache[8] || (_cache[8] = (...args) => _ctx.onAgreeChange && _ctx.onAgreeChange(...args))
              },
              [
                vue.createElementVNode("checkbox", {
                  checked: $data.agree,
                  color: "#FFCE00"
                }, null, 8, ["checked"])
              ],
              32
              /* NEED_HYDRATION */
            ),
            vue.createElementVNode("view", { class: "agreement-text-only" }, [
              vue.createElementVNode("text", { class: "agreement-text" }, "注册即表示同意"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[9] || (_cache[9] = (...args) => $options.goToUserAgreement && $options.goToUserAgreement(...args))
              }, "《用户协议》"),
              vue.createElementVNode("text", { class: "agreement-text" }, "和"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[10] || (_cache[10] = (...args) => $options.goToPrivacyPolicy && $options.goToPrivacyPolicy(...args))
              }, "《隐私政策》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: "primary-btn btn-primary",
            onClick: _cache[11] || (_cache[11] = (...args) => $options.register && $options.register(...args)),
            disabled: !$options.canSubmit || $data.loading
          }, vue.toDisplayString($data.loading ? "注册中..." : "立即注册"), 9, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-bac4a35d"], ["__file", "/Users/licheng/Desktop/mini112/pages/register/register.vue"]]);
  const _sfc_main$n = {
    data() {
      return {
        contact: "",
        code: "",
        newPassword: "",
        confirmPassword: "",
        countdown: 0,
        timer: null
      };
    },
    async onLoad() {
      await this.checkLoginStatus();
    },
    computed: {
      canSubmit() {
        return this.contact.trim() && this.code.trim() && this.newPassword.trim() && this.newPassword === this.confirmPassword;
      }
    },
    methods: {
      // 检查登录状态
      async checkLoginStatus() {
        try {
          const accessToken = uni.getStorageSync("accessToken");
          const userInfo = uni.getStorageSync("userInfo");
          if (accessToken && userInfo) {
            uni.showToast({ title: "您已登录，正在跳转...", icon: "success" });
            setTimeout(() => {
              uni.switchTab({ url: "/pages/home/home" });
            }, 1e3);
          }
        } catch (error) {
          formatAppLog("error", "at pages/forgot/forgot.vue:90", "检查登录状态失败:", error);
        }
      },
      async sendCode() {
        if (!this.contact.trim()) {
          uni.showToast({ title: "请输入手机号或邮箱", icon: "none" });
          return;
        }
        if (this.countdown > 0) {
          return;
        }
        try {
          const response = await post("/api/user/send-verification-code", {
            account: this.contact.trim(),
            codeType: "RESET_PASSWORD"
          });
          if (response && response.code === 200) {
            this.countdown = response.data.nextSendTime || 60;
            uni.showToast({ title: response.data.message || "验证码发送成功", icon: "success" });
            this.timer = setInterval(() => {
              this.countdown--;
              if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.timer = null;
              }
            }, 1e3);
          } else {
            uni.showToast({ title: response.message || "发送验证码失败", icon: "none" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/forgot/forgot.vue:124", "发送验证码失败:", error);
          uni.showToast({ title: error.message, icon: "none" });
        }
      },
      async resetPassword() {
        if (!this.canSubmit) {
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        if (this.newPassword.length < 6 || this.newPassword.length > 20) {
          uni.showToast({ title: "密码长度应为6-20位", icon: "none" });
          return;
        }
        try {
          const response = await post("/api/user/reset-password", {
            account: this.contact.trim(),
            newPassword: this.newPassword.trim(),
            confirmNewPassword: this.confirmPassword.trim(),
            verificationCode: this.code.trim()
          });
          if (response && response.code === 200) {
            uni.showToast({ title: response.data.message || "密码重置成功", icon: "success" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
            }, 1500);
          } else {
            uni.showToast({ title: response.message || "密码重置失败", icon: "none" });
          }
        } catch (error) {
          formatAppLog("error", "at pages/forgot/forgot.vue:157", "重置密码失败:", error);
          uni.showToast({ title: error.message, icon: "none" });
        }
      }
    },
    onUnload() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "忘记密码"),
          vue.createElementVNode("view", { class: "line" })
        ]),
        vue.createElementVNode("view", { class: "form" }, [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "手机号 / 邮箱"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入手机号或邮箱",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.contact = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.contact]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "验证码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon lock" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  placeholder: "请输入验证码",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.code = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.code]
              ]),
              vue.createElementVNode("button", {
                class: "verify-btn btn-secondary",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.sendCode && $options.sendCode(...args)),
                disabled: $data.countdown > 0
              }, vue.toDisplayString($data.countdown > 0 ? `${$data.countdown}秒后重发` : "发送验证码"), 9, ["disabled"])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "新密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("text", { class: "input-icon lock" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  type: "password",
                  placeholder: "请输入新密码",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.newPassword = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newPassword]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "label" }, "确认密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode(
                "text",
                {
                  class: "input-icon lock",
                  style: vue.normalizeStyle({ backgroundImage: `url(${this.$staticUrl("/static/lock.png")})` })
                },
                null,
                4
                /* STYLE */
              ),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  style: vue.normalizeStyle({ backgroundImage: `url(${this.$staticUrl("/static/lock.png")})` }),
                  type: "password",
                  placeholder: "再次输入新密码",
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.confirmPassword = $event)
                },
                null,
                4
                /* STYLE */
              ), [
                [vue.vModelText, $data.confirmPassword]
              ])
            ])
          ]),
          vue.createElementVNode("button", {
            class: "primary-btn btn-primary",
            style: { "margin-top": "80rpx" },
            disabled: !$options.canSubmit,
            onClick: _cache[5] || (_cache[5] = (...args) => $options.resetPassword && $options.resetPassword(...args))
          }, "确认修改", 8, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesForgotForgot = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-51689b0a"], ["__file", "/Users/licheng/Desktop/mini112/pages/forgot/forgot.vue"]]);
  const _imports_0$2 = "/static/banner.svg";
  const _sfc_main$m = {
    components: {},
    data() {
      return {
        banners: [],
        // 轮播图数据
        notices: [],
        // 公告数据
        selectedTag: "热门推荐",
        // 当前选中的标签
        shortcuts: [
          {
            label: "新人福利",
            path: "pages/newcomer-rewards/newcomer-rewards",
            type: "new",
            icon: "/static/1.png"
          },
          {
            label: "任务大厅",
            path: "pages/task-hall/task-hall",
            type: "task",
            icon: "/static/2.png"
          },
          {
            label: "推广奖励",
            path: "pages/invitation/invitation",
            type: "promo",
            icon: "/static/3.png"
          },
          {
            label: "每日福利",
            path: "pages/daily-rewards/daily-rewards",
            type: "daily",
            icon: "/static/4.png"
          }
        ],
        taskTags: ["热门推荐", "小程序体验", "抖音相关", "账号互助", "认证绑卡"],
        tasks: []
      };
    },
    async onLoad() {
      await this.loadBanners();
      await this.loadNotices();
      await this.loadTasks();
    },
    methods: {
      // 加载轮播图数据
      async loadBanners() {
        try {
          const response = await get("/api/banner/list");
          if (response && response.code === 200) {
            this.banners = (response.data || []).map((banner) => ({
              ...banner,
              imageUrl: this.getImageUrl(banner.imageUrl)
            }));
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:143", "加载轮播图失败:", error);
        }
      },
      // 处理图片URL
      getImageUrl(url) {
        if (!url)
          return "";
        if (url.startsWith("http"))
          return url;
        return `${BASE_URL$1}/api/file/proxy/${url}`;
      },
      onBannerClick(banner) {
        if (banner.linkUrl) {
          if (banner.linkUrl.startsWith("http")) {
            formatAppLog("log", "at pages/home/home.vue:156", "External link:", banner.linkUrl);
            return;
          }
          uni.navigateTo({ url: banner.linkUrl }).catch(() => {
            uni.switchTab({ url: banner.linkUrl });
          });
        }
      },
      // 加载公告数据
      async loadNotices() {
        try {
          const response = await get("/api/announcement/latest", { limit: 3 });
          if (response && response.code === 200) {
            this.notices = response.data || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:172", "加载公告失败:", error);
        }
      },
      // 加载任务列表
      async loadTasks(params = {}) {
        var _a;
        try {
          const defaultParams = {
            page: 1,
            size: 10,
            sortBy: "created_at",
            sortOrder: "desc",
            ...params
          };
          const response = await get("/user/tasks", defaultParams);
          if (response && response.code === 200) {
            this.tasks = ((_a = response.data) == null ? void 0 : _a.records) || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:190", "加载任务失败:", error);
        }
      },
      // 标签点击事件
      onTagClick(tag) {
        this.selectedTag = tag;
        if (tag === "热门推荐") {
          this.loadTasks();
        } else {
          this.loadTasks({ title: tag });
        }
      },
      goTo(path) {
        const tabPages = /* @__PURE__ */ new Set([
          "/pages/task-hall/task-hall",
          "/pages/cooperation/cooperation",
          "/pages/profile/profile",
          "/pages/home/home"
        ]);
        const url = path.startsWith("/") ? path : "/" + path;
        if (tabPages.has(url)) {
          uni.switchTab({ url });
        } else {
          uni.navigateTo({ url });
        }
      },
      toNotice(notice) {
        const url = notice ? `/pages/system-notice/system-notice?id=${notice.id}` : "/pages/system-notice/system-notice";
        uni.navigateTo({ url });
      },
      goTask(task) {
        uni.navigateTo({
          url: `/pages/task-detail/task-detail?id=${task.id || ""}`
        });
      },
      // 根据任务ID获取随机头像
      getRandomAvatar(taskId) {
        const avatars = ["/static/boy.png", "/static/girl.png"];
        const index = taskId % avatars.length;
        return avatars[index];
      }
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("scroll-view", {
        class: "scroll",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "hero-section" }, [
          $data.banners.length > 0 ? (vue.openBlock(), vue.createElementBlock("swiper", {
            key: 0,
            class: "banner-swiper",
            "indicator-dots": true,
            autoplay: true,
            interval: 3e3,
            duration: 500,
            circular: true
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.banners, (banner, index) => {
                return vue.openBlock(), vue.createElementBlock("swiper-item", {
                  key: banner.id
                }, [
                  vue.createElementVNode("image", {
                    class: "banner-image",
                    src: banner.imageUrl,
                    mode: "aspectFill",
                    onClick: ($event) => $options.onBannerClick(banner)
                  }, null, 8, ["src", "onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (vue.openBlock(), vue.createElementBlock("image", {
            key: 1,
            class: "hero-banner",
            src: _imports_0$2,
            mode: "widthFix"
          })),
          vue.createElementVNode("view", { class: "feature-card" }, [
            vue.createElementVNode("view", { class: "quick-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.shortcuts, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "quick-item",
                    key: item.path,
                    onClick: ($event) => $options.goTo(item.path)
                  }, [
                    vue.createElementVNode("image", {
                      class: "quick-icon-img",
                      src: item.icon,
                      mode: "aspectFit"
                    }, null, 8, ["src"]),
                    vue.createElementVNode(
                      "text",
                      { class: "quick-label" },
                      vue.toDisplayString(item.label),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            $data.notices.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "news-section"
            }, [
              vue.createElementVNode("view", { class: "news-card" }, [
                vue.createElementVNode("view", { class: "news-header" }, [
                  vue.createElementVNode("view", { class: "news-title-container" }, [
                    vue.createElementVNode("text", { class: "news-title" }, "公告")
                  ]),
                  vue.createElementVNode("swiper", {
                    class: "news-swiper",
                    vertical: true,
                    autoplay: true,
                    interval: 3e3,
                    duration: 500,
                    circular: true
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($data.notices, (notice) => {
                        return vue.openBlock(), vue.createElementBlock("swiper-item", {
                          key: notice.id,
                          onClick: ($event) => $options.toNotice(notice)
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "news-content" },
                            vue.toDisplayString(notice.title),
                            1
                            /* TEXT */
                          )
                        ], 8, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-head" }, [
            vue.createElementVNode("scroll-view", {
              class: "tags-scroll",
              "scroll-x": "true",
              "show-scrollbar": "false"
            }, [
              vue.createElementVNode("view", { class: "tags" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.taskTags, (tag) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      class: vue.normalizeClass(["tag", { active: $data.selectedTag === tag }]),
                      key: tag,
                      onClick: ($event) => $options.onTagClick(tag)
                    }, vue.toDisplayString(tag), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "task-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.tasks, (task, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "task-card",
                  key: task.id,
                  onClick: ($event) => $options.goTask(task)
                }, [
                  vue.createElementVNode("image", {
                    class: "task-avatar",
                    src: $options.getRandomAvatar(task.id),
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "task-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "task-title" },
                      vue.toDisplayString(task.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "task-desc" },
                      vue.toDisplayString(task.summary),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "task-meta" }, [
                      vue.createElementVNode("text", { class: "meta-info" }, [
                        vue.createElementVNode(
                          "text",
                          { style: { "color": "#EC3E0E" } },
                          vue.toDisplayString(task.participantCount),
                          1
                          /* TEXT */
                        ),
                        vue.createTextVNode("人已参与")
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "meta-info" },
                        "截至" + vue.toDisplayString(task.deadline),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "reward-container" }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: "task-icon",
                        style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/coin.png")})` })
                      },
                      null,
                      4
                      /* STYLE */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "task-reward" },
                      vue.toDisplayString(task.reward),
                      1
                      /* TEXT */
                    )
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-07e72d3c"], ["__file", "/Users/licheng/Desktop/mini112/pages/home/home.vue"]]);
  const _sfc_main$l = {
    components: {},
    data() {
      return {
        loading: false,
        searchKeyword: "",
        selectedTag: "全部",
        taskTags: ["全部", "小程序体验", "APP下载", "关注任务", "其他"],
        tasks: [],
        filterParams: {
          page: 1,
          size: 10,
          title: "",
          status: "",
          minReward: "",
          maxReward: "",
          sortBy: "default",
          sortOrder: "desc"
        },
        // 排序选项
        sortOptions: [
          { label: "综合排序", value: "default" },
          { label: "发布时间", value: "created_at" },
          { label: "奖励金额", value: "reward" },
          { label: "参与人数", value: "current_participants" },
          { label: "截止时间", value: "deadline" }
        ],
        // 排序方向选项
        sortOrderOptions: [
          { value: "desc", label: "降序" },
          { value: "asc", label: "升序" }
        ]
      };
    },
    onLoad() {
      this.loadTasks();
    },
    methods: {
      // 加载任务列表
      async loadTasks(params = {}) {
        try {
          this.loading = true;
          const requestParams = {
            page: this.filterParams.page,
            size: this.filterParams.size,
            sortBy: this.filterParams.sortBy,
            sortOrder: this.filterParams.sortOrder,
            ...params
          };
          if (this.filterParams.title)
            requestParams.title = this.filterParams.title;
          if (this.filterParams.status)
            requestParams.status = this.filterParams.status;
          if (this.filterParams.minReward)
            requestParams.minReward = this.filterParams.minReward;
          if (this.filterParams.maxReward)
            requestParams.maxReward = this.filterParams.maxReward;
          const response = await request({
            url: "/user/tasks",
            method: "GET",
            data: requestParams
          });
          if (response.data && response.data.records) {
            this.tasks = response.data.records.map((task) => ({
              id: task.id,
              title: task.title,
              summary: task.summary,
              reward: task.reward,
              deadline: task.deadline,
              maxParticipants: task.maxParticipants,
              participantCount: task.participantCount,
              adminUsername: task.adminUsername,
              images: task.images,
              isParticipated: task.isParticipated,
              createdAt: task.createdAt,
              // 适配TaskCard组件需要的字段
              type: "任务体验",
              platform: "小程序",
              participants: task.participantCount,
              avgTime: "2分钟",
              timeLimit: "12分钟",
              avatar: this.getRandomAvatar(task.id),
              taskImage: this.getRandomTaskImage(task.id),
              isNew: false
            }));
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-hall/task-hall.vue:243", "加载任务列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      // 标签点击事件（与首页逻辑一致）
      onTagClick(tag) {
        this.selectedTag = tag;
        if (tag === "全部") {
          this.loadTasks();
        } else {
          this.loadTasks({ title: tag });
        }
      },
      // 搜索输入处理
      onSearchInput() {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.filterParams.title = this.searchKeyword;
          this.filterParams.page = 1;
          this.loadTasks();
        }, 500);
      },
      // 搜索任务
      searchTasks() {
        this.filterParams.title = this.searchKeyword;
        this.filterParams.page = 1;
        this.loadTasks();
      },
      // 根据任务ID获取随机头像
      getRandomAvatar(taskId) {
        const avatars = ["/static/boy.png", "/static/girl.png"];
        const index = taskId % avatars.length;
        return avatars[index];
      },
      // 根据任务ID获取随机任务图片
      getRandomTaskImage(taskId) {
        const taskImages = [
          "/static/task1.jpg",
          "/static/task2.jpg",
          "/static/task3.jpg",
          "/static/task4.jpg",
          "/static/task5.jpg"
        ];
        const index = taskId % taskImages.length;
        return taskImages[index];
      },
      // 跳转任务详情
      goToTaskDetail(task) {
        uni.navigateTo({ url: `/pages/task-detail/task-detail?id=${task.id}` });
      },
      // 点击式筛选
      onFilterClick(sortType) {
        if (this.filterParams.sortBy === sortType) {
          this.filterParams.sortOrder = this.filterParams.sortOrder === "desc" ? "asc" : "desc";
        } else {
          this.filterParams.sortBy = sortType;
          this.filterParams.sortOrder = "desc";
        }
        this.loadTasks();
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "container",
        style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/taskdt.png")})` })
      },
      [
        vue.createElementVNode("view", { class: "search-section" }, [
          vue.createElementVNode(
            "view",
            {
              class: "file-icon",
              style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/file.png")})` })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode("view", { class: "search-bar" }, [
            vue.createElementVNode(
              "view",
              {
                class: "search-icon",
                style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/search.png")})` })
              },
              null,
              4
              /* STYLE */
            ),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "search-input",
                placeholder: "请输入任务关键词",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchKeyword = $event),
                onInput: _cache[1] || (_cache[1] = (...args) => $options.onSearchInput && $options.onSearchInput(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.searchKeyword]
            ])
          ]),
          vue.createElementVNode(
            "view",
            {
              class: "filter-icon",
              style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/filter.png")})` })
            },
            null,
            4
            /* STYLE */
          )
        ]),
        vue.createElementVNode("view", { class: "filter-section-container" }, [
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-head" }, [
              vue.createElementVNode("scroll-view", {
                class: "tags-scroll",
                "scroll-x": "true",
                "show-scrollbar": "false"
              }, [
                vue.createElementVNode("view", { class: "tags" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.taskTags, (tag) => {
                      return vue.openBlock(), vue.createElementBlock("text", {
                        class: vue.normalizeClass(["tag", { active: $data.selectedTag === tag }]),
                        key: tag,
                        onClick: ($event) => $options.onTagClick(tag)
                      }, vue.toDisplayString(tag), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "task-section" }, [
            $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "loading"
            }, [
              vue.createElementVNode("text", null, "加载中..")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "task-grid"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.tasks, (task) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "task-card",
                    key: task.id,
                    onClick: ($event) => $options.goToTaskDetail(task)
                  }, [
                    task.taskImage ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "task-image-container"
                    }, [
                      vue.createElementVNode("image", {
                        class: "task-image",
                        src: task.taskImage,
                        mode: "aspectFill"
                      }, null, 8, ["src"])
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "task-content" }, [
                      vue.createElementVNode("view", { class: "task-header" }, [
                        vue.createElementVNode("image", {
                          class: "task-avatar",
                          src: task.avatar
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", { class: "task-meta" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "task-title" },
                            vue.toDisplayString(task.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "task-type-container" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "task-type" },
                              vue.toDisplayString(task.type),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "task-type" },
                              vue.toDisplayString(task.platform),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        task.isNew ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "new-badge"
                        }, "新")) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode("view", { class: "task-stats" }, [
                        vue.createElementVNode("view", { class: "stat-row" }, [
                          vue.createElementVNode("text", { class: "stat-number" }, [
                            vue.createElementVNode(
                              "text",
                              { style: { "color": "#EC3E0E" } },
                              vue.toDisplayString(task.participants),
                              1
                              /* TEXT */
                            ),
                            vue.createTextVNode("人")
                          ]),
                          vue.createElementVNode(
                            "text",
                            { class: "stat-number" },
                            vue.toDisplayString(task.avgTime),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "stat-number" },
                            vue.toDisplayString(task.timeLimit),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "stat-row" }, [
                          vue.createElementVNode("text", { class: "stat-label" }, "已赚"),
                          vue.createElementVNode("text", { class: "stat-label" }, "平均用时"),
                          vue.createElementVNode("text", { class: "stat-label" }, "平均审核")
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "task-footer" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: "reward-icon-container",
                            style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/coin.png")})` })
                          },
                          null,
                          4
                          /* STYLE */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "reward-amount" },
                          vue.toDisplayString(task.reward) + "元",
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])),
            !$data.loading && $data.tasks.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "empty-state"
            }, [
              vue.createElementVNode("text", null, "暂无任务")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesTaskHallTaskHall = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-0b9a5de2"], ["__file", "/Users/licheng/Desktop/mini112/pages/task-hall/task-hall.vue"]]);
  const BASE_URL = "http://localhost:8080";
  const _sfc_main$k = {
    data() {
      return {
        taskId: null,
        taskInfo: null,
        uploadedImages: [],
        submitContent: "",
        loading: false
      };
    },
    computed: {
      canSubmit() {
        return this.submitContent.trim() && !this.loading;
      }
    },
    onLoad(options) {
      if (options.taskId) {
        this.taskId = options.taskId;
        this.loadTaskDetail();
      }
    },
    methods: {
      async loadTaskDetail() {
        var _a;
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const response = await request({
            url: `/user/tasks/${this.taskId}`,
            method: "GET"
          });
          uni.hideLoading();
          if (response.code === 200 && ((_a = response.data) == null ? void 0 : _a.taskInfo)) {
            this.taskInfo = response.data.taskInfo;
          } else {
            uni.showToast({
              title: "获取任务详情失败",
              icon: "error"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/submit-task/submit-task.vue:136", "获取任务详情失败:", error);
          uni.showToast({
            title: "获取任务详情失败",
            icon: "error"
          });
        }
      },
      goBack() {
        uni.navigateBack();
      },
      chooseImage() {
        if (this.uploadedImages.length >= 3) {
          uni.showToast({
            title: "最多只能上传3张图片",
            icon: "none"
          });
          return;
        }
        uni.chooseImage({
          count: 3 - this.uploadedImages.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.uploadImages(res.tempFilePaths);
          }
        });
      },
      async uploadImages(tempFilePaths) {
        for (let i = 0; i < tempFilePaths.length; i++) {
          const filePath = tempFilePaths[i];
          try {
            uni.showLoading({
              title: `上传中 ${i + 1}/${tempFilePaths.length}`
            });
            const uploadResult = await this.uploadSingleImage(filePath);
            if (uploadResult) {
              this.uploadedImages.push({
                url: filePath,
                // 本地预览路径
                relativePath: uploadResult.relativePath
                // 服务器路径
              });
            }
          } catch (error) {
            formatAppLog("error", "at pages/submit-task/submit-task.vue:184", "上传图片失败:", error);
            uni.showToast({
              title: "图片上传失败",
              icon: "error"
            });
          }
        }
        uni.hideLoading();
      },
      uploadSingleImage(filePath) {
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            url: `${BASE_URL}/api/file/upload?category=common`,
            filePath,
            name: "file",
            header: {
              "Authorization": uni.getStorageSync("token") || ""
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data);
                if (data.code === 200 && data.data) {
                  resolve(data.data);
                } else {
                  reject(new Error(data.message || "上传失败"));
                }
              } catch (e) {
                reject(new Error("解析响应失败"));
              }
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      },
      previewImage(index) {
        const urls = this.uploadedImages.map((img) => img.url);
        uni.previewImage({
          urls,
          current: urls[index]
        });
      },
      deleteImage(index) {
        this.uploadedImages.splice(index, 1);
      },
      async submitTask() {
        var _a;
        if (!this.canSubmit) {
          uni.showToast({
            title: "请填写任务完成说明",
            icon: "none"
          });
          return;
        }
        try {
          this.loading = true;
          uni.showLoading({
            title: "提交中..."
          });
          const submitData = {
            submitContent: this.submitContent.trim(),
            submissionImages: this.uploadedImages.map((img) => img.relativePath)
          };
          const response = await request({
            url: `/user/tasks/${this.taskId}/submit`,
            method: "POST",
            data: submitData
          });
          uni.hideLoading();
          this.loading = false;
          if (response.code === 200 && ((_a = response.data) == null ? void 0 : _a.success)) {
            uni.showToast({
              title: "提交成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/submit-success/submit-success"
              });
            }, 1500);
          } else {
            uni.showToast({
              title: response.message || "提交失败",
              icon: "error"
            });
          }
        } catch (error) {
          uni.hideLoading();
          this.loading = false;
          formatAppLog("error", "at pages/submit-task/submit-task.vue:285", "提交任务失败:", error);
          uni.showToast({
            title: "提交失败，请重试",
            icon: "error"
          });
        }
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "提交任务")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        $data.taskInfo ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "task-card"
        }, [
          vue.createElementVNode("view", { class: "task-header" }, [
            vue.createElementVNode(
              "text",
              { class: "task-name" },
              vue.toDisplayString($data.taskInfo.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "task-reward" },
              "¥" + vue.toDisplayString($data.taskInfo.reward),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "task-tags" }, [
            $data.taskInfo.fastReview ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "tag tag-fast"
            }, "快速审核")) : vue.createCommentVNode("v-if", true),
            $data.taskInfo.newUserOnly ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "tag tag-new"
            }, "新人专享")) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "task-stats" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.avgTime || "5分钟"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "人均用时")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.avgReviewTime || "30+分钟"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "平均审核")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.participantCount) + "单",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "已完成数")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.timeLimit || "1小时"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "做单限制")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "divider" }),
        vue.createElementVNode("view", { class: "upload-container" }, [
          vue.createElementVNode("view", {
            class: "upload-box",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
          }, [
            $data.uploadedImages.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "upload-placeholder"
            }, [
              vue.createElementVNode("text", { class: "upload-plus" }, "+"),
              vue.createElementVNode("text", { class: "upload-text" }, "点击上传截图（最多3张）")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "uploaded-images"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.uploadedImages, (image, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "image-item",
                    key: index
                  }, [
                    vue.createElementVNode("image", {
                      src: image.url,
                      class: "uploaded-img",
                      mode: "aspectFill",
                      onClick: vue.withModifiers(($event) => $options.previewImage(index), ["stop"])
                    }, null, 8, ["src", "onClick"]),
                    vue.createElementVNode("view", {
                      class: "delete-icon",
                      onClick: vue.withModifiers(($event) => $options.deleteImage(index), ["stop"])
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $data.uploadedImages.length < 3 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "add-more",
                onClick: _cache[1] || (_cache[1] = vue.withModifiers((...args) => $options.chooseImage && $options.chooseImage(...args), ["stop"]))
              }, [
                vue.createElementVNode("text", { class: "add-icon" }, "+")
              ])) : vue.createCommentVNode("v-if", true)
            ]))
          ])
        ]),
        vue.createElementVNode("view", { class: "shuoming" }, [
          vue.createTextVNode("补充说明"),
          vue.createElementVNode("text", { class: "required" }, "（选填）")
        ]),
        vue.createElementVNode("view", { class: "input-container" }, [
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "textarea-field",
              placeholder: "请输入任务完成说明...",
              "placeholder-style": "color: #999",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.submitContent = $event),
              maxlength: "500"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.submitContent]
          ]),
          vue.createElementVNode(
            "text",
            { class: "char-count" },
            vue.toDisplayString($data.submitContent.length) + "/500",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "submit-container" }, [
          vue.createElementVNode("button", {
            class: "submit-button",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.submitTask && $options.submitTask(...args)),
            disabled: !$options.canSubmit
          }, vue.toDisplayString($data.loading ? "提交中..." : "提交审核"), 9, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesSubmitTaskSubmitTask = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-1c6910c1"], ["__file", "/Users/licheng/Desktop/mini112/pages/submit-task/submit-task.vue"]]);
  const _sfc_main$j = {
    data() {
      return {
        isTabPage: true,
        loading: false,
        userInfo: {},
        rankingList: []
      };
    },
    onLoad() {
      this.getUserInfo();
      this.getRankingList();
    },
    methods: {
      async getUserInfo() {
        try {
          const response = await get("/api/user/info");
          if (response.success) {
            this.userInfo = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/invitation/invitation.vue:111", "获取用户信息失败:", error);
        }
      },
      async getRankingList() {
        this.loading = true;
        try {
          const response = await get("/api/invitation/ranking", {
            limit: 10,
            type: "people"
          });
          if (response.success) {
            this.rankingList = response.data.list || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/invitation/invitation.vue:125", "获取排行榜失败:", error);
          uni.showToast({
            title: "获取排行榜失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      goBack() {
        uni.navigateBack();
      },
      getRankIcon(index) {
        if (index === 0)
          return "🥇";
        if (index === 1)
          return "🥈";
        if (index === 2)
          return "🥉";
        return `${index + 1}.`;
      },
      copyCode() {
        const inviteCode = this.userInfo.inviteCode || "X8F3B92A";
        uni.setClipboardData({
          data: inviteCode,
          success: () => {
            uni.showToast({
              title: "邀请码已复制",
              icon: "success"
            });
          }
        });
      },
      showPosterTool() {
        uni.navigateTo({
          url: "/pages/promotion/promotion?type=1"
        });
      },
      showCaseTool() {
        uni.navigateTo({
          url: "/pages/promotion/promotion?type=2"
        });
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "invitation-banner" }, [
          vue.createElementVNode("text", { class: "banner-title" }, "邀请好友，轻松赚佣金！"),
          vue.createElementVNode("text", { class: "banner-subtitle" }, "好友完成任务后可以获得奖励"),
          vue.createElementVNode("view", { class: "character-section" }),
          vue.createElementVNode("view", { class: "invite-code-section" }, [
            vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center", "margin-bottom": "20rpx", "justify-content": "space-between" } }, [
              vue.createElementVNode("text", { class: "invite-label" }, "我的专属邀请码"),
              vue.createElementVNode("view", {
                class: "copy-btn",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.copyCode && $options.copyCode(...args))
              })
            ]),
            vue.createElementVNode("view", { class: "invite-code-container" }, [
              vue.createElementVNode(
                "text",
                { class: "invite-code" },
                vue.toDisplayString($data.userInfo.inviteCode || "X8F3B92A"),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "btn-container" }, [
            vue.createElementVNode("view", {
              class: "btn-item",
              onClick: _cache[2] || (_cache[2] = (...args) => _ctx.showInviteCode && _ctx.showInviteCode(...args))
            }, "生成推广海报"),
            vue.createElementVNode("view", {
              class: "btn-item share",
              onClick: _cache[3] || (_cache[3] = (...args) => _ctx.showInviteRules && _ctx.showInviteRules(...args))
            }, "一键分享")
          ])
        ]),
        vue.createElementVNode("view", { class: "ranking-section" }, [
          vue.createElementVNode("text", { class: "ranking-title" }, "邀请排行榜"),
          vue.createElementVNode("view", { class: "ranking-header" }, [
            vue.createElementVNode("text", { class: "header-rank" }, "排名"),
            vue.createElementVNode("text", { class: "header-people" }, "成功邀请人数"),
            vue.createElementVNode("text", { class: "header-reward" }, "邀请奖励")
          ]),
          !$data.loading && $data.rankingList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "ranking-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.rankingList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "ranking-item",
                  key: item.userId
                }, [
                  vue.createElementVNode("view", { class: "rank-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "rank-icon" },
                      vue.toDisplayString($options.getRankIcon(item.rank - 1)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "rank-name" },
                      vue.toDisplayString(item.nickname),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "rank-people" },
                    vue.toDisplayString(item.inviteCount) + "人",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "rank-reward" },
                    vue.toDisplayString(item.totalReward) + "元",
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "loading"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true),
          !$data.loading && $data.rankingList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "empty"
          }, [
            vue.createElementVNode("text", null, "暂无排行榜数据")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "notice-section" }, [
          vue.createElementVNode("text", { class: "notice-title" }, "【邀请须知】"),
          vue.createElementVNode("text", { class: "notice-item" }, "1.请勿通过非正规方式进行虚假邀请，一经核实将取消奖励资格"),
          vue.createElementVNode("text", { class: "notice-item" }, "2.邀请行为需符合平台规则，系统将自动记录邀请数据")
        ]),
        vue.createElementVNode("view", { class: "tools-section" }, [
          vue.createElementVNode("view", {
            class: "tool-item",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.showPosterTool && $options.showPosterTool(...args)),
            style: { "background-color": "#FFE0BF" }
          }, [
            vue.createElementVNode("view", { class: "tool-info" }, [
              vue.createElementVNode("text", { class: "tool-title" }, "推广攻略"),
              vue.createElementVNode("text", { class: "tool-desc" }, "收益玩法汇总")
            ]),
            vue.createElementVNode(
              "view",
              {
                class: "tool-icon",
                style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/4b13e081-7acc-4c49-9641-e26cf449475b@1x.png")})` })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode("view", {
            class: "tool-item",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.showCaseTool && $options.showCaseTool(...args)),
            style: { "background-color": "#CEE6FF" }
          }, [
            vue.createElementVNode("view", { class: "tool-info" }, [
              vue.createElementVNode("text", { class: "tool-title" }, "推广案例"),
              vue.createElementVNode("text", {
                class: "tool-desc",
                style: { "background": "linear-gradient(75deg, #51CEFF 0%, #038AFD 99%)" }
              }, "精准找到用户")
            ]),
            vue.createElementVNode(
              "view",
              {
                class: "tool-icon",
                style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/ae6562c7-8f74-4c1f-b9e7-48e642acd54b@1x.png")})` })
              },
              null,
              4
              /* STYLE */
            )
          ])
        ])
      ])
    ]);
  }
  const PagesInvitationInvitation = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-d9b3f790"], ["__file", "/Users/licheng/Desktop/mini112/pages/invitation/invitation.vue"]]);
  const DEFAULT_BASE = "http://119.45.254.248:19000/task/";
  const join = (base, path) => {
    if (!base)
      return path;
    const b = base.replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return `${b}/${p}`;
  };
  const getStaticBase = () => {
    const v = uni.getStorageSync("STATIC_BASE_URL");
    return v || DEFAULT_BASE;
  };
  const staticUrl = (input) => {
    const src = String(input || "");
    if (!src)
      return src;
    if (/^https?:\/\//i.test(src))
      return src;
    const base = getStaticBase();
    if (!base)
      return src;
    if (src.startsWith("/static/")) {
      return join(base, src.replace(/^\/static\//, ""));
    }
    return join(base, src);
  };
  const _sfc_main$i = {
    components: {},
    data() {
      return {
        userInfo: {
          id: null,
          phone: "",
          email: null,
          nickname: "",
          avatar: null,
          inviteCode: "",
          balance: 0,
          totalIncome: 0,
          status: 1,
          lastLoginAt: "",
          createdAt: "",
          hasPhone: false,
          hasEmail: false
        },
        incomeStats: {
          userId: null,
          totalIncome: 0,
          todayIncome: 0,
          monthIncome: 0,
          statisticsTime: ""
        },
        menus: [
          { title: "钱包管理", icon: staticUrl("/static/容器@1x.png"), url: "/pages/wallet/wallet" },
          { title: "任务记录", icon: staticUrl("/static/容器@1x1.png"), url: "/pages/task-records/task-records" },
          { title: "绑定账号管理", icon: staticUrl("/static/容器@1x2.png"), url: "/pages/account-binding/account-binding" },
          { title: "邀请好友", icon: staticUrl("/static/容器@1x3.png"), url: "/pages/invitation/invitation" },
          { title: "直邀列表", icon: staticUrl("/static/容器@1x4.png"), url: "/pages/direct-list/direct-list" },
          { title: "常见问题解答", icon: staticUrl("/static/容器@1x5.png"), url: "/pages/faq/faq" },
          { title: "关于我们", icon: staticUrl("/static/容器@1x6.png"), url: "/pages/about/about" }
        ]
      };
    },
    onShow() {
      this.loadUserInfo();
      this.loadIncomeStats();
    },
    methods: {
      // 获取用户信息
      async loadUserInfo() {
        try {
          const response = await get("/api/user/info");
          if (response.code === 200) {
            this.userInfo = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/profile.vue:107", "获取用户信息失败:", error);
        }
      },
      // 获取收入统计
      async loadIncomeStats() {
        try {
          const response = await get("/api/user/balance/income-stats");
          if (response.code === 200) {
            this.incomeStats = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/profile.vue:119", "获取收入统计失败:", error);
        }
      },
      navigate(item) {
        if (item.tab) {
          uni.switchTab({ url: item.url });
        } else {
          uni.navigateTo({ url: item.url });
        }
      },
      editProfile() {
        uni.navigateTo({ url: "/pages/edit-profile/edit-profile" });
      },
      showSettings() {
        uni.showActionSheet({
          itemList: ["设置", "帮助"],
          success: ({ tapIndex }) => {
            if (tapIndex === 0) {
              uni.navigateTo({ url: "/pages/settings/settings" });
            } else if (tapIndex === 1) {
              uni.navigateTo({ url: "/pages/help/help" });
            }
          }
        });
      },
      getAvatarUrl(avatar) {
        if (!avatar) {
          return "/static/boy.png";
        }
        if (avatar.startsWith("http")) {
          return avatar;
        }
        return `http://localhost:8080/api/file/proxy/${avatar}`;
      },
      showMore() {
        uni.navigateTo({ url: "/pages/profile-more/profile-more" });
      },
      logout() {
        uni.showModal({
          title: "退出登录",
          content: "确认退出当前账号吗？",
          success: ({ confirm }) => {
            if (confirm) {
              uni.removeStorageSync("accessToken");
              uni.removeStorageSync("refreshToken");
              uni.removeStorageSync("tokenType");
              uni.removeStorageSync("expiresIn");
              uni.removeStorageSync("userInfo");
              uni.reLaunch({ url: "/pages/login/login" });
            }
          }
        });
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-page" }, [
      vue.createElementVNode("view", { class: "header-section" }, [
        vue.createElementVNode("view", {
          class: "user-info",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.editProfile && $options.editProfile(...args))
        }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $options.getAvatarUrl($data.userInfo.avatar)
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-details" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.userInfo.nickname || "未设昵称"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-id" },
              "邀请码: " + vue.toDisplayString($data.userInfo.inviteCode || "未设置") + " / " + vue.toDisplayString($data.userInfo.hasPhone ? "已绑定" : "未绑定"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "arrow-icon" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode("view", { class: "balance-card" }, [
          vue.createElementVNode("view", { class: "balance-item" }, [
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              "¥" + vue.toDisplayString($data.userInfo.balance || "0.00"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "balance-label" }, "余额")
          ]),
          vue.createElementVNode("view", { class: "divider" }),
          vue.createElementVNode("view", { class: "balance-item" }, [
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              "¥" + vue.toDisplayString($data.incomeStats.totalIncome || "0.00"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "balance-label" }, "累计收益")
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-section" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.menus, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "menu-item",
                key: item.title,
                onClick: ($event) => $options.navigate(item)
              }, [
                vue.createElementVNode("view", { class: "menu-icon-wrapper" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "menu-icon",
                      style: vue.normalizeStyle({ backgroundImage: `url(${item.icon})` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "menu-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "menu-arrow" }, "›")
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "logout-section" }, [
          vue.createElementVNode("button", {
            class: "logout-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.logout && $options.logout(...args))
          }, "退出登录")
        ]),
        vue.createElementVNode("view", { class: "safe-area-bottom" })
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-dd383ca2"], ["__file", "/Users/licheng/Desktop/mini112/pages/profile/profile.vue"]]);
  const _imports_0$1 = "/static/wechatpay.png";
  const _imports_1 = "/static/alipay.png";
  const _sfc_main$h = {
    data() {
      return {
        showModal: false,
        withdrawAmount: "",
        selectedMethod: "alipay",
        // 默认选择支付宝
        submitting: false,
        // 添加提交状态
        // 收入统计数据
        incomeStats: {
          userId: null,
          totalIncome: 0,
          todayIncome: 0,
          monthIncome: 0,
          currentBalance: 0,
          statisticsTime: ""
        },
        // 余额变动记录
        balanceLogs: [],
        // 筛选参数
        filterParams: {
          page: 1,
          size: 10,
          type: ""
        },
        // 分页信息
        hasMore: true,
        loading: false
      };
    },
    onLoad() {
      this.getIncomeStats();
      this.getBalanceLogs();
    },
    methods: {
      // 获取收入统计
      async getIncomeStats() {
        try {
          const response = await get("/api/user/balance/income-stats");
          if (response.code === 200) {
            this.incomeStats = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/wallet/wallet.vue:170", "获取收入统计失败:", error);
        }
      },
      // 获取余额变动记录
      async getBalanceLogs(isLoadMore = false) {
        if (this.loading)
          return;
        try {
          this.loading = true;
          const params = {
            page: this.filterParams.page,
            size: this.filterParams.size
          };
          if (this.filterParams.type) {
            params.type = this.filterParams.type;
          }
          const response = await get("/api/user/balance/logs", params);
          if (response.code === 200) {
            const { records, total, current, size, pages, incomeStats } = response.data;
            if (isLoadMore) {
              this.balanceLogs = [...this.balanceLogs, ...records];
            } else {
              this.balanceLogs = records;
            }
            if (incomeStats) {
              this.incomeStats = incomeStats;
            }
            this.hasMore = current < pages;
          }
        } catch (error) {
          formatAppLog("error", "at pages/wallet/wallet.vue:210", "获取余额记录失败:", error);
        } finally {
          this.loading = false;
        }
      },
      // 设置筛选条件
      setFilter(type) {
        this.filterParams.type = type;
        this.filterParams.page = 1;
        this.getBalanceLogs();
      },
      // 加载更多
      loadMore() {
        if (this.hasMore && !this.loading) {
          this.filterParams.page++;
          this.getBalanceLogs(true);
        }
      },
      // 格式化时间
      formatTime(timeStr) {
        if (!timeStr)
          return "";
        return timeStr.replace("T", " ").split(".")[0];
      },
      // 格式化金额
      formatAmount(amount, type) {
        const formattedAmount = parseFloat(amount).toFixed(2);
        return type === "WITHDRAW" ? `-${formattedAmount}元` : `+${formattedAmount}元`;
      },
      // 获取金额样式类
      getAmountClass(type) {
        return type === "WITHDRAW" ? "expense" : "income";
      },
      goBack() {
        uni.navigateBack();
      },
      showWithdrawModal() {
        this.showModal = true;
      },
      hideWithdrawModal() {
        this.showModal = false;
        this.withdrawAmount = "";
        this.submitting = false;
      },
      selectMethod(method) {
        this.selectedMethod = method;
      },
      // 验证提现金额
      validateWithdrawAmount() {
        if (!this.withdrawAmount) {
          uni.showToast({
            title: "请输入提现金额",
            icon: "none"
          });
          return false;
        }
        const amount = parseFloat(this.withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
          uni.showToast({
            title: "请输入有效的提现金额",
            icon: "none"
          });
          return false;
        }
        if (amount < 10) {
          uni.showToast({
            title: "提现金额不能少于10.00元",
            icon: "none"
          });
          return false;
        }
        const totalIncome = parseFloat(this.incomeStats.currentBalance || 0);
        if (amount > totalIncome) {
          uni.showToast({
            title: "提现金额不能超过可用余额",
            icon: "none"
          });
          return false;
        }
        return true;
      },
      // 确认提现
      async confirmWithdraw() {
        if (!this.validateWithdrawAmount()) {
          return;
        }
        if (this.submitting) {
          return;
        }
        try {
          this.submitting = true;
          const response = await post("/api/withdrawal/apply", {
            amount: parseFloat(this.withdrawAmount),
            accountType: this.selectedMethod
          });
          if (response.success) {
            const data = response.data;
            uni.showModal({
              title: "提现申请成功",
              content: `提现金额：${data.amount}元
手续费：${data.fee}元
实际到账：${data.actualAmount}元
预计到账时间：${data.estimatedArrivalTime}`,
              showCancel: false,
              confirmText: "确定",
              success: () => {
                this.hideWithdrawModal();
                this.getIncomeStats();
                this.filterParams.page = 1;
                this.getBalanceLogs();
              }
            });
          } else {
            uni.showToast({
              title: response.message || "提现申请失败",
              icon: "none",
              duration: 3e3
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/wallet/wallet.vue:349", "提现申请失败:", error);
          uni.showToast({
            title: "网络错误，请稍后重试",
            icon: "none"
          });
        } finally {
          this.submitting = false;
        }
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode(
          "view",
          {
            class: "wallet-card",
            style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/walletcard.png")})` })
          },
          [
            vue.createElementVNode("text", { class: "wallet-title" }, "钱包余额"),
            vue.createElementVNode("view", { class: "balance-row" }, [
              vue.createElementVNode("view", { class: "balance-main" }, [
                vue.createElementVNode(
                  "text",
                  { class: "balance-amount" },
                  vue.toDisplayString($data.incomeStats.currentBalance || "0.00"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "balance-unit" }, "元")
              ]),
              vue.createElementVNode("button", {
                class: "withdraw-btn",
                onClick: _cache[0] || (_cache[0] = (...args) => $options.showWithdrawModal && $options.showWithdrawModal(...args))
              }, "立即提现")
            ]),
            vue.createElementVNode("view", { class: "balance-stats" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode("text", { class: "stat-label" }, "今日赚取"),
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($data.incomeStats.todayIncome || "0.00") + " 元",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode("text", { class: "stat-label" }, "本月赚取金额"),
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($data.incomeStats.monthIncome || "0.00") + " 元",
                  1
                  /* TEXT */
                )
              ])
            ])
          ],
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "filter-section" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["filter-item", { active: $data.filterParams.type === "" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $options.setFilter(""))
            },
            [
              vue.createElementVNode("text", { class: "filter-text" }, "全部")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["filter-item", { active: $data.filterParams.type === "TASK_REWARD" }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $options.setFilter("TASK_REWARD"))
            },
            [
              vue.createElementVNode("text", { class: "filter-text" }, "任务奖励")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["filter-item", { active: $data.filterParams.type === "INVITE_COMMISSION" }]),
              onClick: _cache[3] || (_cache[3] = ($event) => $options.setFilter("INVITE_COMMISSION"))
            },
            [
              vue.createElementVNode("text", { class: "filter-text" }, "邀请佣金")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["filter-item", { active: $data.filterParams.type === "WITHDRAW" }]),
              onClick: _cache[4] || (_cache[4] = ($event) => $options.setFilter("WITHDRAW"))
            },
            [
              vue.createElementVNode("text", { class: "filter-text" }, "提现")
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode("view", { class: "details-section" }, [
          vue.createElementVNode("text", { class: "details-title" }, "余额明细"),
          $data.balanceLogs.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "detail-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.balanceLogs, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "detail-item",
                  key: item.id
                }, [
                  vue.createElementVNode("view", { class: "detail-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "detail-title" },
                      vue.toDisplayString(item.description),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "detail-time" },
                      vue.toDisplayString($options.formatTime(item.createdAt)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["detail-amount", $options.getAmountClass(item.type)])
                    },
                    vue.toDisplayString($options.formatAmount(item.amount, item.type)),
                    3
                    /* TEXT, CLASS */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty-state"
          }, [
            vue.createElementVNode("text", { class: "empty-text" }, "暂无记录")
          ])),
          $data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "load-more",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.loadMore && $options.loadMore(...args))
          }, [
            vue.createElementVNode("text", { class: "load-more-text" }, "加载更多")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "rules-section" }, [
          vue.createElementVNode("text", { class: "rules-title" }, "提现规则："),
          vue.createElementVNode("text", { class: "rule-item" }, "1.单笔最低提现10元。"),
          vue.createElementVNode("text", { class: "rule-item" }, "2.每日最多可提现3次。"),
          vue.createElementVNode("text", { class: "rule-item" }, "3.提现手续费0.01%。"),
          vue.createElementVNode("text", { class: "rule-item" }, "4.微信/支付宝自动到账。"),
          vue.createElementVNode("text", { class: "rule-item" }, "5.72小时内到账，请等候。"),
          vue.createElementVNode("text", { class: "rule-item" }, "6.更多提现限制请咨询客服。")
        ])
      ]),
      $data.showModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "withdraw-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("text", { class: "modal-title" }, "确认提现"),
          vue.createElementVNode("view", { class: "withdraw-info" }, [
            vue.createElementVNode("text", { class: "current-balance" }, "可提现余额"),
            vue.createElementVNode(
              "text",
              { class: "balance-text" },
              vue.toDisplayString($data.incomeStats.currentBalance || "0.00") + " 元",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "form-label" }, "请输入提现金额"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "digit",
                placeholder: "请输入提现金额",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.withdrawAmount = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.withdrawAmount]
            ])
          ]),
          vue.createElementVNode("view", { class: "payment-methods" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["method-item", { active: $data.selectedMethod === "wechat" }]),
                onClick: _cache[7] || (_cache[7] = ($event) => $options.selectMethod("wechat"))
              },
              [
                vue.createElementVNode("image", {
                  class: "method-icon",
                  src: _imports_0$1,
                  mode: "aspectFit"
                }),
                vue.createElementVNode("text", { class: "method-name" }, "微信提现"),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["radio-icon", { checked: $data.selectedMethod === "wechat" }])
                  },
                  [
                    $data.selectedMethod === "wechat" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "radio-dot"
                    })) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["method-item", { active: $data.selectedMethod === "alipay" }]),
                onClick: _cache[8] || (_cache[8] = ($event) => $options.selectMethod("alipay"))
              },
              [
                vue.createElementVNode("image", {
                  class: "method-icon",
                  src: _imports_1,
                  mode: "aspectFit"
                }),
                vue.createElementVNode("text", { class: "method-name" }, "支付宝提现"),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["radio-icon", { checked: $data.selectedMethod === "alipay" }])
                  },
                  [
                    $data.selectedMethod === "alipay" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "radio-dot"
                    })) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "modal-buttons" }, [
            vue.createElementVNode("button", {
              class: "cancel-btn",
              onClick: _cache[9] || (_cache[9] = (...args) => $options.hideWithdrawModal && $options.hideWithdrawModal(...args)),
              disabled: $data.submitting
            }, "取消", 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "confirm-btn",
              onClick: _cache[10] || (_cache[10] = (...args) => $options.confirmWithdraw && $options.confirmWithdraw(...args)),
              disabled: $data.submitting
            }, vue.toDisplayString($data.submitting ? "提交中..." : "确认提现"), 9, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesWalletWallet = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-4c380209"], ["__file", "/Users/licheng/Desktop/mini112/pages/wallet/wallet.vue"]]);
  const _imports_0 = "/static/boy.png";
  const _sfc_main$g = {
    data() {
      return {
        currentTab: 0,
        tabs: [
          { name: "全部", key: "" },
          { name: "待完成", key: "ACCEPTED" },
          { name: "审核中", key: "PENDING" },
          { name: "已通过", key: "APPROVED" },
          { name: "未通过", key: "REJECTED" }
        ],
        taskList: [],
        loading: false,
        page: 1,
        size: 10,
        total: 0,
        hasMore: true
      };
    },
    onLoad() {
      this.loadTaskRecords();
    },
    onShow() {
      this.refreshData();
    },
    methods: {
      async loadTaskRecords(isRefresh = false) {
        if (this.loading)
          return;
        try {
          this.loading = true;
          if (isRefresh) {
            this.page = 1;
            this.taskList = [];
            this.hasMore = true;
          }
          const params = {
            page: this.page,
            size: this.size
          };
          const currentTabKey = this.tabs[this.currentTab].key;
          if (currentTabKey) {
            params.participantStatus = currentTabKey;
          }
          const response = await get("/user/tasks/participated", params);
          if (response.code === 200 && response.data) {
            const { records, total, current, pages } = response.data;
            if (isRefresh) {
              this.taskList = records || [];
            } else {
              this.taskList = [...this.taskList, ...records || []];
            }
            this.total = total || 0;
            this.page = current || 1;
            this.hasMore = this.page < pages;
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-records/task-records.vue:143", "获取任务记录失败:", error);
          uni.showToast({
            title: "获取任务记录失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      refreshData() {
        this.loadTaskRecords(true);
      },
      loadMore() {
        if (this.hasMore && !this.loading) {
          this.page += 1;
          this.loadTaskRecords();
        }
      },
      switchTab(index) {
        this.currentTab = index;
        this.refreshData();
      },
      formatTime(timeStr) {
        if (!timeStr)
          return "";
        return timeStr.replace(/:\d{2}$/, "");
      },
      goHall() {
        uni.switchTab({ url: "/pages/task-hall/task-hall" });
      },
      goToTaskDetail(task) {
        uni.navigateTo({
          url: `/pages/task-detail/task-detail?id=${task.taskId}`
        });
      },
      handleTaskAction(task) {
        this.goToTaskDetail(task);
      },
      getStatusClass(status) {
        const statusMap = {
          "ACCEPTED": "status-pending",
          "PENDING": "status-reviewing",
          "APPROVED": "status-completed",
          "REJECTED": "status-rejected"
        };
        return statusMap[status] || "status-default";
      },
      getStatusText(status) {
        const textMap = {
          "ACCEPTED": "待完成",
          "PENDING": "审核中",
          "APPROVED": "已通过",
          "REJECTED": "未通过"
        };
        return textMap[status] || "未知";
      },
      goToComplete(task) {
        uni.navigateTo({
          url: `/pages/submit-task/submit-task?id=${task.taskId}`
        });
      },
      viewDetails(task) {
        uni.navigateTo({
          url: `/pages/task-detail/task-detail?id=${task.taskId}`
        });
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.goBack && _ctx.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "编辑信息")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "filter-tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.tabs, (tab, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["tab-item", { active: $data.currentTab === index }]),
                key: index,
                onClick: ($event) => $options.switchTab(index)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(tab.name),
                  1
                  /* TEXT */
                ),
                $data.currentTab === index ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "tab-indicator"
                })) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "task-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.taskList, (task, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "task-item",
                key: task.taskId,
                onClick: ($event) => $options.goToTaskDetail(task)
              }, [
                vue.createElementVNode("view", { class: "task-main" }, [
                  vue.createElementVNode("image", {
                    class: "task-icon",
                    src: _imports_0
                  }),
                  vue.createElementVNode("view", { class: "task-content" }, [
                    vue.createElementVNode("view", { class: "task-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "task-name" },
                        vue.toDisplayString(task.taskTitle),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "task-amount" },
                        "+¥" + vue.toDisplayString(task.taskReward),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", {
                        class: vue.normalizeClass(["task-status-badge", $options.getStatusClass(task.participantStatus)]),
                        onClick: ($event) => $options.handleTaskAction(task)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "status-text" },
                          vue.toDisplayString($options.getStatusText(task.participantStatus)),
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"])
                    ])
                  ])
                ]),
                vue.createElementVNode("view", {
                  class: "task-actions",
                  onClick: _cache[1] || (_cache[1] = vue.withModifiers(() => {
                  }, ["stop"]))
                }, [
                  vue.createElementVNode("view", null, [
                    vue.createElementVNode(
                      "text",
                      { class: "task-desc" },
                      vue.toDisplayString(task.statusDescription),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "task-time" },
                      vue.toDisplayString($options.formatTime(task.participatedAt)),
                      1
                      /* TEXT */
                    )
                  ]),
                  task.participantStatus === "ACCEPTED" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "action-button go-complete",
                    onClick: ($event) => $options.goToComplete(task)
                  }, [
                    vue.createElementVNode("text", { class: "action-text" }, "去完成")
                  ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                  task.participantStatus === "PENDING" || task.participantStatus === "APPROVED" || task.participantStatus === "REJECTED" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "action-button view-detail",
                    onClick: ($event) => $options.viewDetails(task)
                  }, [
                    vue.createElementVNode("text", { class: "action-text" }, "查看详情")
                  ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $data.taskList.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-state"
          }, [
            vue.createElementVNode("text", { class: "empty-text" }, "暂无记录"),
            vue.createElementVNode("view", {
              class: "go-hall-button",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.goHall && $options.goHall(...args))
            }, [
              vue.createElementVNode("text", { class: "hall-text" }, "去任务大厅")
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "load-more",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.loadMore && $options.loadMore(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "load-more-text" },
              vue.toDisplayString($data.loading ? "加载中..." : "加载更多"),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesTaskRecordsTaskRecords = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-e8d2d716"], ["__file", "/Users/licheng/Desktop/mini112/pages/task-records/task-records.vue"]]);
  const _sfc_main$f = {
    data() {
      return {
        taskId: null,
        taskInfo: {
          id: null,
          title: "",
          description: "",
          reward: 0,
          status: "",
          statusDescription: "",
          deadline: "",
          requirements: "",
          images: [],
          maxParticipants: 0,
          participantCount: 0,
          adminId: null,
          createdAt: "",
          updatedAt: ""
        },
        adminInfo: {
          id: null,
          username: "",
          email: "",
          realName: "",
          avatar: ""
        },
        isParticipated: false,
        participantStatus: null,
        participatedAt: null,
        submitTime: null,
        reviewTime: null,
        reviewNote: null,
        submissionDetail: null,
        loading: false
      };
    },
    onLoad(options) {
      if (options.id) {
        this.taskId = options.id;
        this.loadTaskDetail(options.id);
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async loadTaskDetail(id) {
        try {
          this.loading = true;
          const taskResponse = await request({
            url: `/user/tasks/${id}`,
            method: "GET"
          });
          if (taskResponse.success) {
            const { taskInfo, adminInfo, isParticipated, participantStatus, participatedAt, submitTime, reviewTime, reviewNote } = taskResponse.data;
            this.taskInfo = taskInfo;
            this.adminInfo = adminInfo;
            this.isParticipated = isParticipated;
            this.participantStatus = participantStatus;
            this.participatedAt = participatedAt;
            this.submitTime = submitTime;
            this.reviewTime = reviewTime;
            this.reviewNote = reviewNote;
            if (taskInfo.images) {
              try {
                this.taskInfo.images = JSON.parse(taskInfo.images);
              } catch (e) {
                this.taskInfo.images = [];
              }
            }
            await this.checkParticipationStatus(id);
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-detail/task-detail.vue:225", "加载任务详情失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      async checkParticipationStatus(taskId) {
        try {
          const response = await request({
            url: `/user/tasks/${taskId}/participated`,
            method: "GET"
          });
          if (response.success) {
            this.isParticipated = response.data;
            if (response.data) {
              await this.getSubmissionDetail(taskId);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-detail/task-detail.vue:251", "检查参与状态失败:", error);
        }
      },
      async getSubmissionDetail(taskId) {
        try {
          const response = await request({
            url: `/user/tasks/${taskId}/submission-detail`,
            method: "GET"
          });
          if (response.success) {
            this.submissionDetail = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-detail/task-detail.vue:266", "获取提交详情失败:", error);
        }
      },
      getImageUrl(imagePath) {
        if (!imagePath)
          return "";
        return `${BASE_URL$1}/api/file/proxy/${imagePath}`;
      },
      getStatusClass(status) {
        const classMap = {
          "pending": "status-pending",
          "reviewing": "status-reviewing",
          "completed": "status-completed",
          "rejected": "status-rejected"
        };
        return classMap[status] || "status-default";
      },
      getStatusText(status) {
        const textMap = {
          "PUBLISHED": "已发布",
          "DRAFT": "草稿",
          "CLOSED": "已关闭",
          "COMPLETED": "已完成"
        };
        return textMap[status] || status;
      },
      getTimeLabel(status) {
        const labelMap = {
          "PUBLISHED": "发布时间",
          "DRAFT": "创建时间",
          "CLOSED": "关闭时间",
          "COMPLETED": "完成时间"
        };
        return labelMap[status] || "时间";
      },
      getSubmissionImages() {
        var _a;
        if (!((_a = this.submissionDetail) == null ? void 0 : _a.submissionImages))
          return [];
        try {
          return JSON.parse(this.submissionDetail.submissionImages);
        } catch (e) {
          return [];
        }
      },
      async participateTask() {
        uni.showModal({
          title: "确认参与",
          content: "确定要参与这个任务吗？",
          success: async (res) => {
            var _a;
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "参与中..."
                });
                const response = await request({
                  url: `/user/tasks/${this.taskId}/accept`,
                  method: "POST"
                });
                uni.hideLoading();
                if (response.code === 200 && ((_a = response.data) == null ? void 0 : _a.success)) {
                  uni.showToast({
                    title: "任务接取成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    uni.navigateTo({
                      url: `/pages/submit-task/submit-task?taskId=${this.taskId}`
                    });
                  }, 1500);
                } else {
                  uni.showToast({
                    title: response.message || "参与失败",
                    icon: "error"
                  });
                }
              } catch (error) {
                uni.hideLoading();
                formatAppLog("error", "at pages/task-detail/task-detail.vue:350", "参与任务失败:", error);
                uni.showToast({
                  title: "参与失败，请重试",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      submitTask() {
        uni.navigateTo({
          url: "/pages/submit-task/submit-task?taskId=" + (this.taskId || "")
        });
      },
      previewImage(current, urls) {
        uni.previewImage({
          current,
          urls
        });
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "任务详情")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "task-info-card" }, [
          vue.createElementVNode("view", { class: "task-header" }, [
            vue.createElementVNode("view", { class: "task-basic" }, [
              vue.createElementVNode(
                "text",
                { class: "task-name" },
                vue.toDisplayString($data.taskInfo.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "task-price" },
                "¥" + vue.toDisplayString($data.taskInfo.reward),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["status-badge", $options.getStatusClass($data.taskInfo.status)])
              },
              [
                vue.createElementVNode(
                  "text",
                  { class: "status-text" },
                  vue.toDisplayString($data.taskInfo.statusDescription || $options.getStatusText($data.taskInfo.status)),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "task-stats" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.avgTime || "5分钟"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "人均用时")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.avgReviewTime || "30+分钟"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "平均审核")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.participantCount) + "单",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "已完成数")
            ]),
            vue.createElementVNode("view", { class: "stat-divider" }),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.taskInfo.timeLimit || "1小时"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "做单限制")
            ])
          ]),
          vue.createElementVNode("view", { class: "divider" }),
          vue.createElementVNode("view", { class: "task-description" }, [
            vue.createElementVNode("text", { class: "desc-title" }, "任务内容："),
            vue.createElementVNode(
              "text",
              { class: "desc-text" },
              vue.toDisplayString($data.taskInfo.description),
              1
              /* TEXT */
            ),
            $data.taskInfo.requirements ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "requirements-section"
            }, [
              vue.createElementVNode("text", { class: "desc-title" }, "任务要求："),
              vue.createElementVNode(
                "text",
                { class: "desc-text" },
                vue.toDisplayString($data.taskInfo.requirements),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          $data.taskInfo.images && $data.taskInfo.images.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "task-images"
          }, [
            vue.createElementVNode("text", { class: "desc-title" }, "任务图片："),
            vue.createElementVNode("view", { class: "images-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.taskInfo.images, (image, index) => {
                  return vue.openBlock(), vue.createElementBlock("image", {
                    key: index,
                    src: $options.getImageUrl(image),
                    mode: "aspectFill",
                    class: "task-image",
                    onClick: ($event) => $options.previewImage($options.getImageUrl(image), $data.taskInfo.images.map((img) => $options.getImageUrl(img)))
                  }, null, 8, ["src", "onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $data.adminInfo.username ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "admin-info"
          }, [
            vue.createElementVNode("text", { class: "desc-title" }, "发布者："),
            vue.createElementVNode("text", { class: "desc-text" }, "系统管理员")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        !$data.isParticipated ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "action-section"
        }, [
          vue.createElementVNode("view", { class: "section-card" }, [
            vue.createElementVNode("text", { class: "section-title" }, "任务说明"),
            vue.createElementVNode("text", { class: "task-note" }, "请仔细阅读任务要求，确保能够完成后再参与任务。")
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.isParticipated && $data.submissionDetail ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "submission-section"
        }, [
          vue.createElementVNode("view", { class: "section-card" }, [
            vue.createElementVNode("text", { class: "section-title" }, "参与详情"),
            vue.createElementVNode("view", { class: "submission-info" }, [
              vue.createElementVNode(
                "text",
                { class: "info-item" },
                "参与时间：" + vue.toDisplayString($data.submissionDetail.participatedAt || "未记录"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-item" },
                "提交时间：" + vue.toDisplayString($data.submissionDetail.submitTime || "未提交"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-item" },
                "审核时间：" + vue.toDisplayString($data.submissionDetail.reviewTime || "未审核"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-item" },
                "状态：" + vue.toDisplayString($data.submissionDetail.statusDescription || "待处理"),
                1
                /* TEXT */
              )
            ]),
            $data.submissionDetail.submissionContent ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "submission-content"
            }, [
              vue.createElementVNode("text", { class: "desc-title" }, "提交内容："),
              vue.createElementVNode(
                "text",
                { class: "desc-text" },
                vue.toDisplayString($data.submissionDetail.submissionContent),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.submissionDetail.submissionImages ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "submission-images"
            }, [
              vue.createElementVNode("text", { class: "desc-title" }, "提交图片："),
              vue.createElementVNode("view", { class: "images-grid" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.getSubmissionImages(), (image, index) => {
                    return vue.openBlock(), vue.createElementBlock("image", {
                      key: index,
                      src: $options.getImageUrl(image),
                      mode: "aspectFill",
                      class: "submitted-image",
                      onClick: ($event) => $options.previewImage($options.getImageUrl(image), $options.getSubmissionImages().map((img) => $options.getImageUrl(img)))
                    }, null, 8, ["src", "onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            $data.submissionDetail.reviewComment ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "review-comment"
            }, [
              vue.createElementVNode("text", { class: "desc-title" }, "审核意见："),
              vue.createElementVNode(
                "text",
                { class: "desc-text" },
                vue.toDisplayString($data.submissionDetail.reviewComment),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      !$data.isParticipated ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "bottom-button"
      }, [
        vue.createElementVNode("view", {
          class: "submit-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.participateTask && $options.participateTask(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-text" }, "参与任务")
        ])
      ])) : $data.isParticipated && (!$data.submissionDetail || !$data.submissionDetail.submitTime) ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "bottom-button"
      }, [
        vue.createElementVNode("view", {
          class: "submit-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.submitTask && $options.submitTask(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-text" }, "提交任务")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTaskDetailTaskDetail = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-fb7e27ab"], ["__file", "/Users/licheng/Desktop/mini112/pages/task-detail/task-detail.vue"]]);
  const _sfc_main$e = {
    data() {
      return {
        selectedNotice: null,
        noticeList: [],
        loading: false,
        limit: 20
      };
    },
    onLoad() {
      this.loadNoticeList();
    },
    methods: {
      async loadNoticeList() {
        try {
          this.loading = true;
          const response = await get("/api/announcement/latest", {
            limit: this.limit
          });
          if (response.success) {
            this.noticeList = response.data || [];
          } else {
            uni.showToast({
              title: response.message || "获取公告失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/system-notice/system-notice.vue:90", "获取公告列表失败:", error);
          uni.showToast({
            title: "获取公告失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      async viewNotice(notice) {
        try {
          const response = await get(`/api/announcement/${notice.id}`);
          if (response.success) {
            this.selectedNotice = response.data;
          } else {
            uni.showToast({
              title: response.message || "获取公告详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/system-notice/system-notice.vue:114", "获取公告详情失败:", error);
          uni.showToast({
            title: "获取公告详情失败",
            icon: "none"
          });
        }
      },
      closeModal() {
        this.selectedNotice = null;
      },
      formatDate(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "notice-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.noticeList, (notice, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "notice-wrapper",
                key: notice.id
              }, [
                vue.createElementVNode("view", { class: "notice-time-container" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "notice-time" },
                    vue.toDisplayString($options.formatDate(notice.publishedAt)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", {
                  class: "notice-card",
                  onClick: ($event) => $options.viewNotice(notice)
                }, [
                  vue.createElementVNode("view", { class: "card-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "notice-title" },
                      vue.toDisplayString(notice.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "notice-preview" },
                      vue.toDisplayString(notice.summary),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "card-divider" }),
                  vue.createElementVNode("view", { class: "card-footer" }, [
                    vue.createElementVNode("text", { class: "view-more" }, "查看更多"),
                    vue.createElementVNode("text", { class: "arrow" }, "›")
                  ])
                ], 8, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        !$data.loading && $data.noticeList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无公告")
        ])) : vue.createCommentVNode("v-if", true),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $data.selectedNotice ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "notice-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($data.selectedNotice.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.closeModal && $options.closeModal(...args))
            }, "✕")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "modal-meta" }, [
              vue.createElementVNode(
                "text",
                { class: "modal-date" },
                vue.toDisplayString($options.formatDate($data.selectedNotice.publishedAt)),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "modal-type" },
                vue.toDisplayString($data.selectedNotice.typeDescription),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "modal-text" },
              vue.toDisplayString($data.selectedNotice.content),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSystemNoticeSystemNotice = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-58f68c21"], ["__file", "/Users/licheng/Desktop/mini112/pages/system-notice/system-notice.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        loading: true,
        // API返回的数据结构
        dailyTaskData: {
          queryDate: "",
          tasks: [],
          totalTasks: 0,
          completedTasks: 0,
          totalReward: 0,
          earnedReward: 0
        },
        timeData: {
          hours: "00",
          minutes: "00",
          seconds: "00"
        },
        timer: null
      };
    },
    onLoad() {
      this.loadDailyTasks();
      this.startTimer();
    },
    onUnload() {
      this.stopTimer();
    },
    methods: {
      startTimer() {
        this.updateTime();
        this.timer = setInterval(() => {
          this.updateTime();
        }, 1e3);
      },
      goBack() {
        uni.navigateBack();
      },
      stopTimer() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      updateTime() {
        const now = /* @__PURE__ */ new Date();
        this.timeData = {
          hours: String(now.getHours()).padStart(2, "0"),
          minutes: String(now.getMinutes()).padStart(2, "0"),
          seconds: String(now.getSeconds()).padStart(2, "0")
        };
      },
      // 获取每日任务列表
      async loadDailyTasks() {
        try {
          this.loading = true;
          const response = await request({
            url: "/api/daily-task/list",
            method: "GET"
          });
          if (response.code === 200 && response.data) {
            this.dailyTaskData = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/daily-rewards/daily-rewards.vue:145", "获取每日任务失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      // 每日签到
      async signIn() {
        try {
          uni.showLoading({
            title: "签到中..."
          });
          const response = await request({
            url: "/api/daily-task/sign-in",
            method: "GET"
          });
          if (response.code === 200 && response.data) {
            const { success, message, rewardAmount } = response.data;
            if (success) {
              uni.showToast({
                title: message || `签到成功！`,
                icon: "success"
              });
              await this.loadDailyTasks();
            } else {
              uni.showToast({
                title: message || "签到失败",
                icon: "error"
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/daily-rewards/daily-rewards.vue:186", "签到失败:", error);
          uni.showToast({
            title: "签到失败",
            icon: "error"
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 处理任务操作
      handleTaskAction(task) {
        if (task.taskName === "每日签到") {
          if (task.isCompleted) {
            uni.showToast({
              title: "今日已签到",
              icon: "success"
            });
          } else {
            this.signIn();
          }
        } else {
          if (task.isCompleted) {
            uni.showToast({
              title: "任务已完成",
              icon: "success"
            });
          } else {
            uni.switchTab({
              url: "/pages/task-hall/task-hall"
            });
          }
        }
      },
      // 获取按钮文本
      getButtonText(task) {
        if (task.taskName === "每日签到") {
          return task.isCompleted ? "已签到" : "立即签到";
        } else {
          return task.isCompleted ? "已完成" : "去完成";
        }
      },
      // 获取按钮样式类
      getButtonClass(task) {
        return task.isCompleted ? "completed" : "pending";
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "‹")
        ]),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createElementVNode(
        "view",
        {
          class: "bg-layer",
          style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/dayfl.png")})` })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "daily-banner" }, [
          vue.createElementVNode("view", { class: "banner-content" }, [
            vue.createElementVNode("text", { class: "banner-title" }, "每日专享"),
            vue.createElementVNode("text", { class: "banner-desc-num" }, [
              vue.createTextVNode("2.6 "),
              vue.createElementVNode("text", { class: "banner-desc-unit" }, "元")
            ]),
            vue.createElementVNode("view", { class: "time-display" }, [
              vue.createElementVNode(
                "text",
                { class: "time-block" },
                vue.toDisplayString($data.timeData.hours),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "time-separator" }, "时"),
              vue.createElementVNode(
                "text",
                { class: "time-block" },
                vue.toDisplayString($data.timeData.minutes),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "time-separator" }, "分"),
              vue.createElementVNode(
                "text",
                { class: "time-block" },
                vue.toDisplayString($data.timeData.seconds),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "time-separator" }, "秒")
            ]),
            vue.createElementVNode("view", { class: "banner-desc" }, [
              vue.createElementVNode("text", null, "完成的任务需大于0.3元")
            ])
          ])
        ]),
        !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "progress-section"
        }, [
          vue.createElementVNode("view", { class: "progress-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.dailyTaskData.tasks, (task, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "progress-item",
                  key: task.taskId
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "task-number" },
                    vue.toDisplayString(index + 1),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "task-info" }, [
                    vue.createElementVNode("view", { class: "task-content" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "task-title" },
                        vue.toDisplayString(task.taskName),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "reward-amount" },
                        "+" + vue.toDisplayString(task.rewardAmount.toFixed(2)) + "元",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "task-desc" },
                      vue.toDisplayString(task.taskDescription),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "task-reward" }, [
                    vue.createElementVNode("view", {
                      class: vue.normalizeClass(["claim-btn", $options.getButtonClass(task)]),
                      onClick: ($event) => $options.handleTaskAction(task)
                    }, vue.toDisplayString($options.getButtonText(task)), 11, ["onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesDailyRewardsDailyRewards = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-248c68df"], ["__file", "/Users/licheng/Desktop/mini112/pages/daily-rewards/daily-rewards.vue"]]);
  const _sfc_main$c = {
    components: {},
    data() {
      return {
        tasks: [],
        loading: true,
        totalReward: 0
      };
    },
    onLoad() {
      this.loadTasks();
    },
    computed: {
      // 计算总奖励金额
      totalRewardAmount() {
        return this.tasks.reduce((total, task) => total + task.rewardAmount, 0).toFixed(1);
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      // 加载任务列表
      async loadTasks() {
        try {
          this.loading = true;
          const response = await request({
            url: "/api/user/system-tasks/list",
            method: "GET"
          });
          if (response.data && response.data.tasks) {
            this.tasks = response.data.tasks.filter((task) => task.type !== "daily_signin");
            this.totalReward = this.tasks.reduce((total, task) => total + task.rewardAmount, 0).toFixed(1);
            await this.checkAllTasksStatus();
          }
        } catch (error) {
          formatAppLog("error", "at pages/newcomer-rewards/newcomer-rewards.vue:107", "加载任务列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      // 检查所有任务的完成状态
      async checkAllTasksStatus() {
        for (let task of this.tasks) {
          await this.checkTaskStatus(task);
        }
      },
      // 检查单个任务的完成状态
      async checkTaskStatus(task) {
        try {
          const response = await request({
            url: `/api/user/system-tasks/${task.id}/completion-status`,
            method: "GET"
          });
          if (response.data) {
            task.isCompleted = response.data.isCompleted;
            task.canComplete = response.data.canComplete;
            if (task.isCompleted) {
              await this.checkRewardStatus(task);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/newcomer-rewards/newcomer-rewards.vue:143", `检查任务${task.id}状态失败`, error);
        }
      },
      // 检查奖励领取状态
      async checkRewardStatus(task) {
        try {
          const response = await request({
            url: `/api/user/system-tasks/${task.id}/reward-status`,
            method: "GET"
          });
          if (response.data) {
            task.hasClaimedReward = response.data.hasClaimedReward;
            task.lastClaimedAt = response.data.lastClaimedAt;
            task.totalClaimedCount = response.data.totalClaimedCount;
            task.todayClaimedCount = response.data.todayClaimedCount;
          }
        } catch (error) {
          formatAppLog("error", "at pages/newcomer-rewards/newcomer-rewards.vue:163", `检查任务${task.id}奖励状态失败`, error);
        }
      },
      // 获取按钮文本
      getButtonText(task) {
        if (!task.isCompleted) {
          return "去完成";
        } else if (task.hasClaimedReward) {
          return "已领取";
        } else {
          return "领取奖励";
        }
      },
      // 获取按钮样式类
      getButtonClass(task) {
        if (!task.isCompleted) {
          return "pending";
        } else if (task.hasClaimedReward) {
          return "claimed";
        } else {
          return "claim-reward";
        }
      },
      // 处理任务操作
      async handleTaskAction(task) {
        if (task.hasClaimedReward) {
          uni.showToast({
            title: "奖励已领取",
            icon: "success"
          });
        } else if (task.isCompleted) {
          await this.claimReward(task);
        }
      },
      // 领取奖励
      async claimReward(task) {
        try {
          uni.showLoading({
            title: "领取中..."
          });
          const response = await request({
            url: `/api/user/system-tasks/${task.id}/claim-reward`,
            method: "POST"
          });
          if (response.data && response.data.success) {
            uni.showToast({
              title: "奖励领取成功",
              icon: "success"
            });
            await this.checkTaskStatus(task);
          }
        } catch (error) {
          formatAppLog("error", "at pages/newcomer-rewards/newcomer-rewards.vue:226", "领取奖励失败:", error);
          uni.showToast({
            title: "领取失败",
            icon: "error"
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "bg-layer" }),
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "newcomer-banner" }, [
          vue.createElementVNode("view", { class: "banner-info" }, [
            vue.createElementVNode("text", { class: "banner-title" }, "新人专享"),
            vue.createElementVNode("text", { class: "banner-amount" }, [
              vue.createTextVNode(
                vue.toDisplayString($data.totalReward) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "banner-amount-sub" }, "元红包奖励")
            ])
          ])
        ]),
        !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "task-section"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.tasks, (task, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "task-item",
                key: task.id
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "task-number" },
                  vue.toDisplayString(index + 1),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "task-info" }, [
                  vue.createElementVNode("text", { class: "task-title" }, [
                    vue.createTextVNode(
                      vue.toDisplayString(task.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "task-amount" },
                      "+" + vue.toDisplayString(task.rewardAmount) + "元",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "task-desc" },
                    vue.toDisplayString(task.description),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "task-reward" }, [
                  vue.createElementVNode("view", {
                    class: vue.normalizeClass(["reward-btn", $options.getButtonClass(task)]),
                    onClick: ($event) => task.isCompleted && !task.hasClaimedReward ? $options.claimReward(task) : null
                  }, vue.toDisplayString($options.getButtonText(task)), 11, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "daily-reward-btn" }, [
          vue.createElementVNode("view", {
            class: "daily-reward-btn-word",
            onClick: _cache[1] || (_cache[1] = (...args) => _ctx.claimDailyReward && _ctx.claimDailyReward(...args))
          }, " 每日福利 ")
        ]),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesNewcomerRewardsNewcomerRewards = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-9f2de9ba"], ["__file", "/Users/licheng/Desktop/mini112/pages/newcomer-rewards/newcomer-rewards.vue"]]);
  const _sfc_main$b = {
    components: {},
    data() {
      return {};
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "dev-icon",
          src: _ctx.$staticUrl("/static/3a582535-e694-4171-a2e7-d897d08e1536@1x.png")
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "dev-subtitle" }, "敬请期待")
      ])
    ]);
  }
  const PagesCooperationCooperation = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-8d7c12ff"], ["__file", "/Users/licheng/Desktop/mini112/pages/cooperation/cooperation.vue"]]);
  const _sfc_main$a = {
    data() {
      return {
        userInfo: {
          hasAlipay: false,
          alipayAccount: "",
          hasWechat: false,
          wechatAccount: ""
        },
        loading: false,
        showBindingModal: false,
        bindAccountInput: "",
        realNameInput: "",
        currentBindType: ""
      };
    },
    computed: {
      currentBindTypeName() {
        return this.currentBindType === "alipay" ? "支付宝" : "微信";
      }
    },
    onLoad() {
      this.loadUserInfo();
    },
    methods: {
      async loadUserInfo() {
        try {
          this.loading = true;
          const response = await get("/api/user/info");
          if (response.success) {
            const { hasAlipay, alipayAccount, hasWechat, wechatAccount } = response.data;
            this.userInfo = {
              hasAlipay,
              alipayAccount: alipayAccount || "",
              hasWechat,
              wechatAccount: wechatAccount || ""
            };
          }
        } catch (error) {
          formatAppLog("error", "at pages/account-binding/account-binding.vue:151", "获取用户信息失败:", error);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      bindAccount(type) {
        if (type === "alipay" && this.userInfo.hasAlipay || type === "wechat" && this.userInfo.hasWechat) {
          return;
        }
        this.currentBindType = type;
        this.bindAccountInput = "";
        this.realNameInput = "";
        this.showBindingModal = true;
      },
      closeModal() {
        this.showBindingModal = false;
        this.bindAccountInput = "";
        this.realNameInput = "";
      },
      async confirmBind() {
        if (!this.realNameInput.trim()) {
          uni.showToast({
            title: "请输入真实姓名",
            icon: "none"
          });
          return;
        }
        if (!this.bindAccountInput.trim()) {
          uni.showToast({
            title: "请输入账号",
            icon: "none"
          });
          return;
        }
        const success = await this.performBind(this.currentBindType, this.bindAccountInput.trim(), this.realNameInput.trim());
        if (success) {
          this.closeModal();
        }
      },
      async performBind(type, account, realName) {
        try {
          this.loading = true;
          const platformName = type === "alipay" ? "支付宝" : "微信";
          const apiUrl = type === "alipay" ? "/api/user/bind-alipay" : "/api/user/bind-wechat";
          const paramKey = type === "alipay" ? "alipayAccount" : "wechatAccount";
          const response = await post(apiUrl, {
            [paramKey]: account,
            realName
          });
          if (response.success) {
            if (type === "alipay") {
              this.userInfo.hasAlipay = true;
              this.userInfo.alipayAccount = account;
            } else {
              this.userInfo.hasWechat = true;
              this.userInfo.wechatAccount = account;
            }
            uni.showToast({
              title: `${platformName}账号绑定成功`,
              icon: "success"
            });
            return true;
          } else {
            uni.showToast({
              title: response.message || `${platformName}账号绑定失败`,
              icon: "none"
            });
            return false;
          }
        } catch (error) {
          formatAppLog("error", "at pages/account-binding/account-binding.vue:238", "绑定失败:", error);
          uni.showToast({
            title: "绑定失败，请重试",
            icon: "none"
          });
          return false;
        } finally {
          this.loading = false;
        }
      },
      async unbindAccount(type) {
        const platformName = type === "alipay" ? "支付宝" : "微信";
        uni.showModal({
          title: "解绑提示",
          content: `确定要解绑${platformName}账号吗？`,
          success: async (res) => {
            if (res.confirm) {
              await this.performUnbind(type);
            }
          }
        });
      },
      async performUnbind(type) {
        try {
          this.loading = true;
          const platformName = type === "alipay" ? "支付宝" : "微信";
          const apiUrl = type === "alipay" ? "/api/user/unbind-alipay" : "/api/user/unbind-wechat";
          const response = await post(apiUrl, {});
          if (response.success) {
            if (type === "alipay") {
              this.userInfo.hasAlipay = false;
              this.userInfo.alipayAccount = "";
            } else {
              this.userInfo.hasWechat = false;
              this.userInfo.wechatAccount = "";
            }
            uni.showToast({
              title: `${platformName}账号解绑成功`,
              icon: "success"
            });
          } else {
            uni.showToast({
              title: response.message || `${platformName}账号解绑失败`,
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/account-binding/account-binding.vue:291", "解绑失败:", error);
          uni.showToast({
            title: "解绑失败，请重试",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "container",
        style: vue.normalizeStyle({ backgroundImage: "url(" + _ctx.$staticUrl("/static/绑定账号管理.png") + ")" })
      },
      [
        vue.createElementVNode("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "hero-section" }, [
            vue.createElementVNode("view")
          ]),
          vue.createElementVNode("view", { class: "binding-options" }, [
            vue.createElementVNode("view", {
              class: "account-option",
              onClick: _cache[1] || (_cache[1] = ($event) => $options.bindAccount("alipay"))
            }, [
              vue.createElementVNode("view", { class: "option-left" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "option-icon alipay-icon",
                    style: vue.normalizeStyle({ backgroundImage: "url(" + _ctx.$staticUrl("/static/zhi.png") + ")" })
                  },
                  null,
                  4
                  /* STYLE */
                ),
                vue.createElementVNode("view", { class: "option-info" }, [
                  vue.createElementVNode("text", { class: "option-title" }, "支付宝账号"),
                  $data.userInfo.hasAlipay ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "bound-account"
                    },
                    vue.toDisplayString($data.userInfo.alipayAccount),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    class: "unbind-text"
                  }, "未绑定"))
                ])
              ]),
              $data.userInfo.hasAlipay ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "unbind-btn",
                onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => $options.unbindAccount("alipay"), ["stop"]))
              }, "解绑")) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "bind-btn"
              }, "点击绑定"))
            ]),
            vue.createElementVNode("view", {
              class: "account-option",
              onClick: _cache[3] || (_cache[3] = ($event) => $options.bindAccount("wechat"))
            }, [
              vue.createElementVNode("view", { class: "option-left" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "option-icon wechat-icon",
                    style: vue.normalizeStyle({ backgroundImage: "url(" + _ctx.$staticUrl("/static/we.png") + ")" })
                  },
                  null,
                  4
                  /* STYLE */
                ),
                vue.createElementVNode("view", { class: "option-info" }, [
                  vue.createElementVNode("text", { class: "option-title" }, "微信账号"),
                  $data.userInfo.hasWechat ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "bound-account"
                    },
                    vue.toDisplayString($data.userInfo.wechatAccount),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    class: "unbind-text"
                  }, "未绑定"))
                ])
              ]),
              $data.userInfo.hasWechat ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "unbind-btn",
                onClick: _cache[2] || (_cache[2] = vue.withModifiers(($event) => $options.unbindAccount("wechat"), ["stop"]))
              }, "解绑")) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "bind-btn"
              }, "点击绑定"))
            ])
          ]),
          vue.createElementVNode("view", { class: "footer-note" }, [
            vue.createElementVNode("text", { class: "note-text" }, " 如需更换绑定，请先解除当前账号后重新绑定。 "),
            vue.createElementVNode("text", { class: "note-text" }, " 绑定信息仅用于收益提现，不会对您的账户造成其他影响。 ")
          ])
        ]),
        $data.showBindingModal ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "modal-mask",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.closeModal && $options.closeModal(...args)),
            onTouchmove: _cache[5] || (_cache[5] = vue.withModifiers(() => {
            }, ["stop", "prevent"]))
          },
          null,
          32
          /* NEED_HYDRATION */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["bottom-modal", { "show": $data.showBindingModal }]),
            onTouchmove: _cache[10] || (_cache[10] = vue.withModifiers(() => {
            }, ["stop", "prevent"]))
          },
          [
            vue.createElementVNode("view", { class: "modal-header" }, [
              vue.createElementVNode(
                "text",
                { class: "modal-title" },
                "绑定" + vue.toDisplayString($options.currentBindTypeName) + "账号",
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", {
                class: "close-icon-box",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.closeModal && $options.closeModal(...args))
              }, [
                vue.createElementVNode("text", { class: "close-icon" }, "×")
              ])
            ]),
            vue.createElementVNode("view", { class: "modal-body" }, [
              vue.createElementVNode("view", { class: "warning-box" }, [
                vue.createElementVNode("text", { class: "warning-icon" }, "⚠️"),
                vue.createElementVNode("text", { class: "warning-text" }, "为了避免打款失败，请使用真实姓名和手机号注册的账号，成功绑定后可使用人民币取款方式")
              ]),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode("text", { class: "input-label" }, "真实姓名"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "modal-input",
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.realNameInput = $event),
                    placeholder: "请输入真实姓名",
                    "adjust-position": true
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.realNameInput]
                ])
              ]),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode(
                  "text",
                  { class: "input-label" },
                  vue.toDisplayString($options.currentBindTypeName) + "账号",
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "modal-input",
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.bindAccountInput = $event),
                  placeholder: "请输入" + $options.currentBindTypeName + "账号",
                  "adjust-position": true
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, $data.bindAccountInput]
                ])
              ]),
              vue.createElementVNode("button", {
                class: "modal-confirm-btn",
                onClick: _cache[9] || (_cache[9] = (...args) => $options.confirmBind && $options.confirmBind(...args)),
                disabled: $data.loading
              }, vue.toDisplayString($data.loading ? "绑定中..." : "立即绑定"), 9, ["disabled"])
            ])
          ],
          34
          /* CLASS, NEED_HYDRATION */
        )
      ],
      4
      /* STYLE */
    );
  }
  const PagesAccountBindingAccountBinding = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-0d403c8a"], ["__file", "/Users/licheng/Desktop/mini112/pages/account-binding/account-binding.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        userInfo: {
          nickname: "",
          avatar: ""
        }
      };
    },
    onShow() {
      this.loadUserInfo();
    },
    methods: {
      async loadUserInfo() {
        try {
          const response = await get("/api/user/info");
          if (response.code === 200) {
            this.userInfo = {
              nickname: response.data.nickname || "",
              avatar: response.data.avatar || ""
            };
          }
        } catch (error) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:62", "获取用户信息失败:", error);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        }
      },
      getAvatarUrl(avatar) {
        if (!avatar)
          return this.$staticUrl("/static/boy.png");
        return `${BASE_URL$1}/api/file/proxy/${avatar}`;
      },
      goBack() {
        uni.navigateBack();
      },
      uploadAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            this.uploadAvatarFile(tempFilePath);
          }
        });
      },
      async uploadAvatarFile(filePath) {
        try {
          uni.showLoading({
            title: "上传中..."
          });
          const uploadResult = await this.uploadSingleFile(filePath);
          if (uploadResult && uploadResult.relativePath) {
            this.userInfo.avatar = uploadResult.relativePath;
            await this.updateAvatarInfo();
          }
        } catch (error) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:103", "上传头像失败:", error);
          uni.showToast({
            title: "上传头像失败",
            icon: "error"
          });
        } finally {
          uni.hideLoading();
        }
      },
      uploadSingleFile(filePath) {
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            url: `${BASE_URL$1}/api/file/upload?category=common`,
            filePath,
            name: "file",
            header: {
              "Authorization": uni.getStorageSync("token") || ""
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data);
                if (data.code === 200 && data.data) {
                  resolve(data.data);
                } else {
                  reject(new Error(data.message || "上传失败"));
                }
              } catch (e) {
                reject(new Error("解析响应失败"));
              }
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      },
      async updateAvatarInfo() {
        try {
          const params = {
            nickname: this.userInfo.nickname,
            avatar: this.userInfo.avatar
          };
          const response = await post("/api/user/update-info", params);
          if (response.code === 200) {
            uni.showToast({
              title: "头像更新成功",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: response.message || "头像更新失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:162", "更新头像失败:", error);
          uni.showToast({
            title: "头像更新失败",
            icon: "none"
          });
        }
      },
      async saveInfo() {
        if (!this.userInfo.nickname.trim()) {
          uni.showToast({
            title: "请输入昵称",
            icon: "none"
          });
          return;
        }
        try {
          const params = {
            nickname: this.userInfo.nickname,
            avatar: this.userInfo.avatar
          };
          const response = await post("/api/user/update-info", params);
          if (response.code === 200) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: response.message || "保存失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:202", "保存用户信息失败:", error);
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "编辑信息")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "avatar-section" }, [
          vue.createElementVNode("view", {
            class: "avatar-upload",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.uploadAvatar && $options.uploadAvatar(...args))
          }, [
            vue.createElementVNode("image", {
              class: "avatar",
              src: $options.getAvatarUrl($data.userInfo.avatar)
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "upload-overlay" }, [
              vue.createElementVNode("text", { class: "upload-text" }, "更换头像")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "form-label" }, "昵称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.userInfo.nickname = $event),
                placeholder: "请输入昵称",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.userInfo.nickname]
            ])
          ]),
          vue.createElementVNode("view", { class: "text-hint" }, "2-16个字符，支持中英文、数字"),
          vue.createElementVNode("view", { style: { "height": "40vh" } }),
          vue.createElementVNode("button", {
            class: "save-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.saveInfo && $options.saveInfo(...args))
          }, "点击保存")
        ])
      ])
    ]);
  }
  const PagesEditProfileEditProfile = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-c0f45e44"], ["__file", "/Users/licheng/Desktop/mini112/pages/edit-profile/edit-profile.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {
        currentType: 1,
        // 1: 攻略, 2: 案例
        list: [],
        loading: false
      };
    },
    onLoad(options) {
      if (options.type) {
        this.currentType = parseInt(options.type);
      }
      this.loadList();
    },
    methods: {
      async loadList() {
        this.loading = true;
        try {
          const res = await get("/api/article/list", { type: this.currentType });
          if (res.code === 200) {
            this.list = res.data || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/promotion/promotion.vue:77", "加载列表失败:", error);
        } finally {
          this.loading = false;
        }
      },
      switchTab(type) {
        if (this.currentType === type)
          return;
        this.currentType = type;
        this.loadList();
      },
      goToDetail(id) {
        uni.navigateTo({
          url: `/pages/article-detail/article-detail?id=${id}`
        });
      },
      getImageUrl(url) {
        if (!url)
          return "";
        if (url.startsWith("http"))
          return url;
        return `${BASE_URL$1}/api/file/proxy/${url}`;
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentType === 1 }]),
            onClick: _cache[0] || (_cache[0] = ($event) => $options.switchTab(1))
          },
          [
            vue.createElementVNode("text", null, "推广攻略"),
            $data.currentType === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "line"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentType === 2 }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $options.switchTab(2))
          },
          [
            vue.createElementVNode("text", null, "推广案例"),
            $data.currentType === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "line"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "list-container" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "article-item",
              key: index,
              onClick: ($event) => $options.goToDetail(item.id)
            }, [
              vue.createElementVNode("view", { class: "article-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "article-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "article-time" },
                  vue.toDisplayString(item.createdAt),
                  1
                  /* TEXT */
                )
              ]),
              item.coverImage ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                src: $options.getImageUrl(item.coverImage),
                class: "article-cover",
                mode: "aspectFill"
              }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.list.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", null, "暂无相关内容")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesPromotionPromotion = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-aa33071c"], ["__file", "/Users/licheng/Desktop/mini112/pages/promotion/promotion.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        id: null,
        article: {},
        processedContent: ""
      };
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.loadArticle();
      }
    },
    methods: {
      async loadArticle() {
        try {
          const res = await get(`/api/article/detail/${this.id}`);
          if (res.code === 200) {
            this.article = res.data;
            this.processContent(res.data.content);
          }
        } catch (error) {
          formatAppLog("error", "at pages/article-detail/article-detail.vue:44", "加载文章详情失败:", error);
        }
      },
      processContent(content) {
        if (!content) {
          this.processedContent = "";
          return;
        }
        let newContent = content.replace(/<img[^>]*>/gi, (match) => {
          let newMatch = match.replace(/src="([^"]*)"/i, (srcMatch, src) => {
            if (!src.startsWith("http") && !src.startsWith("data:")) {
              return `src="${BASE_URL$1}/api/file/proxy/${src}"`;
            }
            return srcMatch;
          });
          if (!newMatch.includes("style=")) {
            newMatch = newMatch.replace("<img", '<img style="max-width:100%;height:auto;"');
          } else {
            newMatch = newMatch.replace(/style="([^"]*)"/i, (styleMatch, style) => {
              return `style="${style};max-width:100%;height:auto;"`;
            });
          }
          return newMatch;
        });
        this.processedContent = newContent;
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.article.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "meta" }, [
          vue.createElementVNode(
            "text",
            { class: "date" },
            vue.toDisplayString($data.article.createdAt),
            1
            /* TEXT */
          ),
          $data.article.type === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "type"
          }, "推广攻略")) : $data.article.type === 2 ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 1,
            class: "type"
          }, "推广案例")) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("rich-text", { nodes: $data.processedContent }, null, 8, ["nodes"])
      ])
    ]);
  }
  const PagesArticleDetailArticleDetail = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-01e2d816"], ["__file", "/Users/licheng/Desktop/mini112/pages/article-detail/article-detail.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        loading: true,
        totalInvites: 0,
        totalCommission: 0,
        invitedUsers: []
      };
    },
    onLoad() {
      this.loadInvitationStats();
    },
    methods: {
      async loadInvitationStats() {
        try {
          this.loading = true;
          const response = await get("/api/invitation/stats");
          if (response && response.code === 200) {
            const data = response.data;
            this.totalInvites = data.totalInvites || 0;
            this.totalCommission = data.totalCommission || 0;
            this.invitedUsers = data.invitedUsers || [];
          } else {
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/direct-list/direct-list.vue:79", "加载邀请统计失败:", error);
          uni.showToast({
            title: "网络错误",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      formatDate(timestamp) {
        if (!timestamp)
          return "";
        const date = new Date(timestamp);
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "stats-card" }, [
          vue.createElementVNode("view", { class: "stats-header" }, [
            vue.createElementVNode("text", { class: "stats-title" }, "已成功邀请好友总数"),
            vue.createElementVNode("text", { class: "stats-amount" }, "已获得佣金")
          ]),
          vue.createElementVNode("view", { class: "stats-numbers" }, [
            vue.createElementVNode(
              "text",
              { class: "people-count" },
              vue.toDisplayString($data.totalInvites) + " 人",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "amount-earned" },
              "¥" + vue.toDisplayString($data.totalCommission.toFixed(2)),
              1
              /* TEXT */
            )
          ])
        ]),
        !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "friend-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.invitedUsers, (friend, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "friend-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "friend-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "friend-name" },
                    vue.toDisplayString(friend.nickname || "用户" + friend.userId.slice(-4)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "friend-details" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "friend-account" },
                      "用户ID：" + vue.toDisplayString(friend.userId),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "friend-time" },
                      "邀请时间：" + vue.toDisplayString($options.formatDate(friend.createdAt)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "friend-reward" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "reward-amount" },
                    "¥" + vue.toDisplayString(friend.commission.toFixed(2)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "reward-status" }, "已获得佣金")
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $data.invitedUsers.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-state"
          }, [
            vue.createElementVNode("text", { class: "empty-text" }, "暂无邀请记录")
          ])) : vue.createCommentVNode("v-if", true)
        ])) : vue.createCommentVNode("v-if", true),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesDirectListDirectList = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-1cfa7f83"], ["__file", "/Users/licheng/Desktop/mini112/pages/direct-list/direct-list.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        list: [],
        loading: false,
        qrCodeUrl: ""
      };
    },
    onLoad() {
      this.loadFaqList();
      this.getContactInfo();
    },
    methods: {
      async loadFaqList() {
        this.loading = true;
        try {
          const res = await get("/api/faq/list");
          if (res.code === 200) {
            this.list = res.data || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/faq/faq.vue:73", "获取常见问题失败:", error);
        } finally {
          this.loading = false;
        }
      },
      async getContactInfo() {
        try {
          const res = await get("/api/contact");
          if (res.code === 200 && res.data) {
            this.qrCodeUrl = res.data.qrCodeUrl;
          }
        } catch (e) {
          formatAppLog("error", "at pages/faq/faq.vue:85", "获取联系方式失败", e);
        }
      },
      getImageUrl(url) {
        if (!url)
          return "";
        if (url.startsWith("http"))
          return url;
        return `${BASE_URL$1}/api/file/proxy/${url}`;
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "常见问题解答")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        !$data.loading && $data.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "faq-section"
        }, [
          vue.createElementVNode("text", { class: "section-title" }, "【常见问题】"),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.list, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "faq-item",
                key: index
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "question" },
                  "Q: " + vue.toDisplayString(item.question),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "answer" },
                  "A: " + vue.toDisplayString(item.answer),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        !$data.loading && $data.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", null, "暂无常见问题")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "bottom-service" }, [
        vue.createElementVNode("view", { class: "service-content" }, [
          vue.createElementVNode("image", {
            src: _ctx.$staticUrl("/static/aaaaa.svg"),
            class: "service-icon",
            mode: "aspectFit"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "service-left" }, [
            vue.createElementVNode("text", { class: "service-title" }, "平台客服"),
            vue.createElementVNode("text", { class: "service-desc" }, "添加客服微信可获取任务协助与问题处理")
          ]),
          $data.qrCodeUrl ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "service-right"
          }, [
            vue.createElementVNode("image", {
              src: $options.getImageUrl($data.qrCodeUrl),
              mode: "aspectFit",
              class: "qr-code"
            }, null, 8, ["src"])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesFaqFaq = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-c6d6aa18"], ["__file", "/Users/licheng/Desktop/mini112/pages/faq/faq.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        contactInfo: {
          workingHours: "",
          email: "",
          platformName: "",
          qrCodeUrl: ""
        }
      };
    },
    onLoad() {
      this.getContactInfo();
    },
    methods: {
      async getContactInfo() {
        try {
          const res = await get("/api/contact");
          if (res.code === 200 && res.data) {
            this.contactInfo = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/about/about.vue:65", "获取联系方式失败", e);
        }
      },
      getImageUrl(url) {
        if (!url)
          return "";
        if (url.startsWith("http"))
          return url;
        return `${BASE_URL$1}/api/file/proxy/${url}`;
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "关于我们")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "contact-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "联系方式"),
          vue.createElementVNode("view", { class: "contact-info" }, [
            vue.createElementVNode(
              "text",
              { class: "contact-item" },
              "工作时间：" + vue.toDisplayString($data.contactInfo.workingHours || "工作日周一~至周五9:00~12:00，14:00~18:00"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "contact-item" },
              "联系邮箱：" + vue.toDisplayString($data.contactInfo.email || "youzhihubang@163.com"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "contact-item" }, "请将你的用户ID及相关的问题一起发送到邮箱，我们会尽快回复你。")
          ]),
          vue.createElementVNode(
            "text",
            { class: "service-note" },
            vue.toDisplayString($data.contactInfo.platformName || "互助互帮平台"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-service" }, [
        vue.createElementVNode("view", { class: "service-content" }, [
          vue.createElementVNode("image", {
            src: _ctx.$staticUrl("/static/aaaaa.svg"),
            class: "service-icon",
            mode: "aspectFit"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "service-left" }, [
            vue.createElementVNode("text", { class: "service-title" }, "平台客服"),
            vue.createElementVNode("text", { class: "service-desc" }, "添加客服微信可获取任务协助与问题处理")
          ]),
          $data.contactInfo.qrCodeUrl ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "service-right"
          }, [
            vue.createElementVNode("image", {
              src: $options.getImageUrl($data.contactInfo.qrCodeUrl),
              mode: "aspectFit",
              class: "qr-code"
            }, null, 8, ["src"])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesAboutAbout = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-13a78ac6"], ["__file", "/Users/licheng/Desktop/mini112/pages/about/about.vue"]]);
  const _sfc_main$3 = {
    methods: {
      backToHall() {
        uni.switchTab({
          url: "/pages/task-hall/task-hall"
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.goBack && _ctx.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "‹")
          ]),
          vue.createElementVNode("text", { class: "nav-title" }, "提交任务")
        ])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode(
          "view",
          {
            class: "success-icon",
            style: vue.normalizeStyle({ backgroundImage: `url(${_ctx.$staticUrl("/static/e8ed3a5a-79fb-45a2-a27c-0d473dd37818@1x.png")})` })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { style: { "font-size": "32px", "color": "#FFBB00" } }, "提交成功!"),
        vue.createElementVNode("button", {
          class: "back-hall-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.backToHall && $options.backToHall(...args))
        }, "返回任务大厅")
      ])
    ]);
  }
  const PagesSubmitSuccessSubmitSuccess = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-e3c794bd"], ["__file", "/Users/licheng/Desktop/mini112/pages/submit-success/submit-success.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {};
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "agreement-header" }, [
          vue.createElementVNode("text", { class: "title" }, "任务平台用户协议"),
          vue.createElementVNode("text", { class: "date" }, "生效日期：2025年10月1日")
        ]),
        vue.createElementVNode("view", { class: "agreement-content" }, [
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "1. 协议的接受"),
            vue.createElementVNode("text", { class: "section-text" }, '欢迎使用任务平台！本用户协议（以下简称"协议"）是您与任务平台之间关于使用本平台服务的法律协议。通过注册、登录或使用本平台的任何服务，您表示已阅读、理解并同意受本协议的约束。')
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "2. 服务描述"),
            vue.createElementVNode("text", { class: "section-text" }, "任务平台是一个提供任务发布、接受和完成服务的在线平台。用户可以在平台上发布任务、接受任务、完成任务并获得相应报酬。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "3. 用户注册与账户"),
            vue.createElementVNode("text", { class: "section-text" }, "3.1 用户注册时必须提供真实、准确、完整的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "3.2 用户有责任维护账户信息的安全性和保密性。"),
            vue.createElementVNode("text", { class: "section-text" }, "3.3 用户不得将账户转让给他人使用。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "4. 用户行为规范"),
            vue.createElementVNode("text", { class: "section-text" }, "4.1 用户应遵守国家法律法规，不得利用平台从事违法活动。"),
            vue.createElementVNode("text", { class: "section-text" }, "4.2 用户不得发布虚假、误导性或欺诈性信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "4.3 用户应诚信完成任务，不得恶意刷单或作弊。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "5. 平台权利与义务"),
            vue.createElementVNode("text", { class: "section-text" }, "5.1 平台有权对用户行为进行监督和管理。"),
            vue.createElementVNode("text", { class: "section-text" }, "5.2 平台有权暂停或终止违规用户的服务。"),
            vue.createElementVNode("text", { class: "section-text" }, "5.3 平台将保护用户的合法权益和个人信息安全。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "6. 费用与结算"),
            vue.createElementVNode("text", { class: "section-text" }, "6.1 平台可能收取一定的服务费用。"),
            vue.createElementVNode("text", { class: "section-text" }, "6.2 任务报酬将按照平台规则进行结算。"),
            vue.createElementVNode("text", { class: "section-text" }, "6.3 用户应按时完成任务以获得相应报酬。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "7. 知识产权"),
            vue.createElementVNode("text", { class: "section-text" }, "7.1 平台的所有内容和技术均受知识产权法保护。"),
            vue.createElementVNode("text", { class: "section-text" }, "7.2 用户在平台上发布的内容应确保不侵犯他人知识产权。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "8. 免责声明"),
            vue.createElementVNode("text", { class: "section-text" }, "8.1 平台不对用户间的交易纠纷承担责任。"),
            vue.createElementVNode("text", { class: "section-text" }, "8.2 平台不保证服务的绝对稳定性和可用性。"),
            vue.createElementVNode("text", { class: "section-text" }, "8.3 用户使用平台服务的风险由用户自行承担。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "9. 协议修改"),
            vue.createElementVNode("text", { class: "section-text" }, "平台有权根据业务发展需要修改本协议。修改后的协议将在平台上公布，用户继续使用服务即视为同意修改后的协议。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "10. 联系我们"),
            vue.createElementVNode("text", { class: "section-text" }, "如您对本协议有任何疑问，请通过平台客服联系我们。")
          ])
        ])
      ])
    ]);
  }
  const PagesUserAgreementUserAgreement = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-e6ae5d36"], ["__file", "/Users/licheng/Desktop/mini112/pages/user-agreement/user-agreement.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {};
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "policy-header" }, [
          vue.createElementVNode("text", { class: "title" }, "任务平台隐私政策"),
          vue.createElementVNode("text", { class: "date" }, "生效日期：2025年10月1日")
        ]),
        vue.createElementVNode("view", { class: "policy-content" }, [
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "1. 引言"),
            vue.createElementVNode("text", { class: "section-text" }, '任务平台（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。')
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "2. 信息收集"),
            vue.createElementVNode("text", { class: "section-text" }, "2.1 账户信息：包括用户名、手机号码、邮箱地址等注册信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "2.2 身份信息：为了确保平台安全，我们可能收集身份证明文件。"),
            vue.createElementVNode("text", { class: "section-text" }, "2.3 交易信息：包括任务记录、收支明细、银行卡信息等。"),
            vue.createElementVNode("text", { class: "section-text" }, "2.4 设备信息：包括设备型号、操作系统、IP地址等技术信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "2.5 使用信息：包括访问时间、浏览记录、操作日志等。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "3. 信息使用"),
            vue.createElementVNode("text", { class: "section-text" }, "3.1 提供和改进服务：用于账户管理、任务匹配、支付结算等核心功能。"),
            vue.createElementVNode("text", { class: "section-text" }, "3.2 安全保障：用于身份验证、风险控制、反欺诈等安全措施。"),
            vue.createElementVNode("text", { class: "section-text" }, "3.3 客户服务：用于处理用户咨询、投诉和技术支持。"),
            vue.createElementVNode("text", { class: "section-text" }, "3.4 营销推广：在获得您同意的情况下，向您推送相关服务信息。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "4. 信息共享"),
            vue.createElementVNode("text", { class: "section-text" }, "4.1 我们不会向第三方出售、出租或交易您的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "4.2 在以下情况下，我们可能会共享您的信息："),
            vue.createElementVNode("text", { class: "section-text" }, "- 获得您的明确同意"),
            vue.createElementVNode("text", { class: "section-text" }, "- 法律法规要求或政府部门要求"),
            vue.createElementVNode("text", { class: "section-text" }, "- 为保护平台和用户的合法权益"),
            vue.createElementVNode("text", { class: "section-text" }, "- 与合作伙伴共享必要信息以提供服务")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "5. 信息存储"),
            vue.createElementVNode("text", { class: "section-text" }, "5.1 我们将在中华人民共和国境内存储您的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "5.2 我们采用行业标准的安全措施保护您的信息安全。"),
            vue.createElementVNode("text", { class: "section-text" }, "5.3 我们只会在必要期间内保留您的个人信息。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "6. 信息安全"),
            vue.createElementVNode("text", { class: "section-text" }, "6.1 我们采用加密技术、访问控制等多种安全措施。"),
            vue.createElementVNode("text", { class: "section-text" }, "6.2 我们定期进行安全评估和漏洞修复。"),
            vue.createElementVNode("text", { class: "section-text" }, "6.3 我们建立了数据泄露应急响应机制。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "7. 用户权利"),
            vue.createElementVNode("text", { class: "section-text" }, "7.1 访问权：您有权了解我们收集的关于您的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "7.2 更正权：您有权要求我们更正不准确的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "7.3 删除权：在特定情况下，您有权要求我们删除您的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "7.4 撤回同意：您有权撤回对个人信息处理的同意。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "8. Cookie和类似技术"),
            vue.createElementVNode("text", { class: "section-text" }, "8.1 我们使用Cookie等技术来改善用户体验。"),
            vue.createElementVNode("text", { class: "section-text" }, "8.2 您可以通过浏览器设置管理Cookie。"),
            vue.createElementVNode("text", { class: "section-text" }, "8.3 禁用Cookie可能影响部分功能的正常使用。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "9. 未成年人保护"),
            vue.createElementVNode("text", { class: "section-text" }, "9.1 我们不会主动收集未满18周岁未成年人的个人信息。"),
            vue.createElementVNode("text", { class: "section-text" }, "9.2 如发现收集了未成年人信息，我们将立即删除。"),
            vue.createElementVNode("text", { class: "section-text" }, "9.3 未成年人使用服务需获得监护人同意。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "10. 政策更新"),
            vue.createElementVNode("text", { class: "section-text" }, "我们可能会不时更新本隐私政策。重大变更将通过平台公告或其他方式通知您。继续使用服务即表示您同意更新后的政策。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "11. 联系我们"),
            vue.createElementVNode("text", { class: "section-text" }, "如您对本隐私政策有任何疑问或建议，请通过平台客服联系我们。我们将在合理时间内回复您的请求。")
          ])
        ])
      ])
    ]);
  }
  const PagesPrivacyPolicyPrivacyPolicy = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-df882951"], ["__file", "/Users/licheng/Desktop/mini112/pages/privacy-policy/privacy-policy.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/forgot/forgot", PagesForgotForgot);
  __definePage("pages/home/home", PagesHomeHome);
  __definePage("pages/task-hall/task-hall", PagesTaskHallTaskHall);
  __definePage("pages/submit-task/submit-task", PagesSubmitTaskSubmitTask);
  __definePage("pages/invitation/invitation", PagesInvitationInvitation);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/wallet/wallet", PagesWalletWallet);
  __definePage("pages/task-records/task-records", PagesTaskRecordsTaskRecords);
  __definePage("pages/task-detail/task-detail", PagesTaskDetailTaskDetail);
  __definePage("pages/system-notice/system-notice", PagesSystemNoticeSystemNotice);
  __definePage("pages/daily-rewards/daily-rewards", PagesDailyRewardsDailyRewards);
  __definePage("pages/newcomer-rewards/newcomer-rewards", PagesNewcomerRewardsNewcomerRewards);
  __definePage("pages/cooperation/cooperation", PagesCooperationCooperation);
  __definePage("pages/account-binding/account-binding", PagesAccountBindingAccountBinding);
  __definePage("pages/edit-profile/edit-profile", PagesEditProfileEditProfile);
  __definePage("pages/promotion/promotion", PagesPromotionPromotion);
  __definePage("pages/article-detail/article-detail", PagesArticleDetailArticleDetail);
  __definePage("pages/direct-list/direct-list", PagesDirectListDirectList);
  __definePage("pages/faq/faq", PagesFaqFaq);
  __definePage("pages/about/about", PagesAboutAbout);
  __definePage("pages/submit-success/submit-success", PagesSubmitSuccessSubmitSuccess);
  __definePage("pages/user-agreement/user-agreement", PagesUserAgreementUserAgreement);
  __definePage("pages/privacy-policy/privacy-policy", PagesPrivacyPolicyPrivacyPolicy);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/licheng/Desktop/mini112/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.config.globalProperties.$staticUrl = staticUrl;
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
