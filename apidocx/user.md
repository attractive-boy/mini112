---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

* <a href="http://127.0.0.1:8080">开发环境: http://127.0.0.1:8080</a>

# Authentication

# 用户管理

## POST 用户登录

POST /api/user/login

用户登录
用户登录
支持手机号或邮箱登录

> Body 请求参数

```json
{
  "account": "onewayx@qq.com",
  "password": "test123"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[LoginRequest](#schemaloginrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "accessToken": "",
  "refreshToken": "",
  "tokenType": "",
  "expiresIn": 0,
  "userInfo": {
    "id": 0,
    "phone": "",
    "email": "",
    "nickname": "",
    "avatar": "",
    "inviteCode": "",
    "balance": 0,
    "totalIncome": 0,
    "status": 0,
    "lastLoginAt": "",
    "createdAt": "",
    "hasPhone": false,
    "hasEmail": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultLoginResponse](#schemaresultloginresponse)|

## POST 用户注册

POST /api/user/register

用户注册
用户注册
支持手机号或邮箱注册，需要验证码

> Body 请求参数

```json
{
  "account": "onewayx@qq.com",
  "password": "test123",
  "confirmPassword": "test123",
  "nickname": "一方",
  "verificationCode": "791377"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[RegisterRequest](#schemaregisterrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "userId": 0,
  "message": "",
  "needCompleteInfo": false
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultRegisterResponse](#schemaresultregisterresponse)|

## POST 重置密码

POST /api/user/reset-password

重置密码
重置密码
通过验证码重置密码

> Body 请求参数

```json
{
  "account": "string",
  "newPassword": "string",
  "confirmNewPassword": "string",
  "verificationCode": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[ResetPasswordRequest](#schemaresetpasswordrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultResetPasswordResponse](#schemaresultresetpasswordresponse)|

## POST 绑定手机号

POST /api/user/bind-phone

绑定手机号
绑定手机号
为用户绑定手机号，需要验证码

> Body 请求参数

```json
{
  "userId": 0,
  "phone": "string",
  "verificationCode": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[BindPhoneRequest](#schemabindphonerequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": "",
  "account": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultBindResponse](#schemaresultbindresponse)|

## POST 绑定邮箱

POST /api/user/bind-email

绑定邮箱
绑定邮箱
为用户绑定邮箱，需要验证码

> Body 请求参数

```json
{
  "userId": 0,
  "email": "user@example.com",
  "verificationCode": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[BindEmailRequest](#schemabindemailrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": "",
  "account": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultBindResponse](#schemaresultbindresponse)|

## POST 修改密码

POST /api/user/change-password

修改密码
修改密码
修改用户密码，需要原密码验证

> Body 请求参数

```json
{
  "userId": 0,
  "oldPassword": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[ChangePasswordRequest](#schemachangepasswordrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultChangePasswordResponse](#schemaresultchangepasswordresponse)|

## POST 更新用户信息

POST /api/user/update-info

更新用户信息
更新用户信息
更新用户昵称、头像等信息

> Body 请求参数

```json
{
  "userId": 99,
  "nickname": "jzVO&p!POtx5u^yz%P2h*NS$AwG",
  "avatar": "hIN7mX0[47JRCD8OYqSqDTtOTiKFfn750tgNt7cyiXRgOW6Y5nN)x9jcd3Azb$r(q#g#ZnS1ujp*&3PA3#H(ERNDDLGeAVPD[QzQH#m)N8%hRsrPT0IYEMZ4uN$08F9XS*ECiAa3$Nmv(JDi$zE93hOP$jxkUt$YRO*o@YM1%L$OUEtu%KQm#)7s7d5[AD*[q%LiuNhr80IclxzT@%qdxvEF&4gr4N]CZFilmAH1%Ol2i4dYD3WAcU4cG0hgRn%10pxx9K4sJuQ^BQ^M8Zi1W#B2SRM)H[feEn&hpN!5)qFQ%uVuH!&oEwsDFi"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[UpdateUserInfoRequest](#schemaupdateuserinforequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": "",
  "userInfo": {
    "id": 0,
    "phone": "",
    "email": "",
    "nickname": "",
    "avatar": "",
    "inviteCode": "",
    "balance": 0,
    "totalIncome": 0,
    "status": 0,
    "lastLoginAt": "",
    "createdAt": "",
    "hasPhone": false,
    "hasEmail": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultUpdateUserInfoResponse](#schemaresultupdateuserinforesponse)|

## GET 获取用户信息

GET /api/user/info/{userId}

获取用户信息
获取用户信息
根据用户ID获取用户详细信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|userId|path|integer| 是 |none|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "phone": "",
  "email": "",
  "nickname": "",
  "avatar": "",
  "inviteCode": "",
  "balance": 0,
  "totalIncome": 0,
  "status": 0,
  "lastLoginAt": "",
  "createdAt": "",
  "hasPhone": false,
  "hasEmail": false
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultUserInfo](#schemaresultuserinfo)|

## POST 发送验证码

POST /api/user/send-verification-code

发送验证码（统一接口）
发送验证码
统一的验证码发送接口，支持邮箱和短信

> Body 请求参数

```json
{
  "account": "onewayx@qq.com",
  "codeType": "register"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[SendVerificationCodeRequest](#schemasendverificationcoderequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "success": false,
  "message": "",
  "expireTime": 0,
  "nextSendTime": 0
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultSendVerificationCodeResponse](#schemaresultsendverificationcoderesponse)|

## POST 验证验证码

POST /api/user/verify-code

验证验证码（可选的独立接口）
验证验证码
独立的验证码验证接口

> Body 请求参数

```json
{
  "account": "string",
  "code": "string",
  "codeType": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|[VerifyCodeRequest](#schemaverifycoderequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "success": false,
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[ResultOperationResponse](#schemaresultoperationresponse)|

# 数据模型

<h2 id="tocS_UserInfo">UserInfo</h2>

<a id="schemauserinfo"></a>
<a id="schema_UserInfo"></a>
<a id="tocSuserinfo"></a>
<a id="tocsuserinfo"></a>

```json
{
  "id": 0,
  "phone": "string",
  "email": "string",
  "nickname": "string",
  "avatar": "string",
  "inviteCode": "string",
  "balance": 0,
  "totalIncome": 0,
  "status": 0,
  "lastLoginAt": "string",
  "createdAt": "string",
  "hasPhone": true,
  "hasEmail": true
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer(int64)|false|none||用户ID|
|phone|string|false|none||手机号（脱敏）|
|email|string|false|none||邮箱（脱敏）|
|nickname|string|false|none||昵称|
|avatar|string|false|none||头像|
|inviteCode|string|false|none||邀请码|
|balance|number|false|none||余额|
|totalIncome|number|false|none||总收入|
|status|integer|false|none||状态|
|lastLoginAt|string|false|none||最后登录时间|
|createdAt|string|false|none||创建时间|
|hasPhone|boolean|false|none||是否绑定手机号|
|hasEmail|boolean|false|none||是否绑定邮箱|

<h2 id="tocS_LoginResponse">LoginResponse</h2>

<a id="schemaloginresponse"></a>
<a id="schema_LoginResponse"></a>
<a id="tocSloginresponse"></a>
<a id="tocsloginresponse"></a>

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "Bearer",
  "expiresIn": 0,
  "userInfo": {
    "id": 0,
    "phone": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "inviteCode": "string",
    "balance": 0,
    "totalIncome": 0,
    "status": 0,
    "lastLoginAt": "string",
    "createdAt": "string",
    "hasPhone": true,
    "hasEmail": true
  }
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|accessToken|string|false|none||访问令牌|
|refreshToken|string|false|none||刷新令牌|
|tokenType|string|false|none||令牌类型|
|expiresIn|integer(int64)|false|none||过期时间（秒）|
|userInfo|[UserInfo](#schemauserinfo)|false|none||用户信息|

<h2 id="tocS_LoginRequest">LoginRequest</h2>

<a id="schemaloginrequest"></a>
<a id="schema_LoginRequest"></a>
<a id="tocSloginrequest"></a>
<a id="tocsloginrequest"></a>

```json
{
  "account": "string",
  "password": "string",
  "rememberMe": false
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|account|string|true|none||账户（手机号或邮箱）|
|password|string|true|none||密码|
|rememberMe|boolean|false|none||记住我|

<h2 id="tocS_RegisterResponse">RegisterResponse</h2>

<a id="schemaregisterresponse"></a>
<a id="schema_RegisterResponse"></a>
<a id="tocSregisterresponse"></a>
<a id="tocsregisterresponse"></a>

```json
{
  "userId": 0,
  "message": "string",
  "needCompleteInfo": false
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userId|integer(int64)|false|none||用户ID|
|message|string|false|none||注册成功消息|
|needCompleteInfo|boolean|false|none||是否需要完善信息|

<h2 id="tocS_RegisterRequest">RegisterRequest</h2>

<a id="schemaregisterrequest"></a>
<a id="schema_RegisterRequest"></a>
<a id="tocSregisterrequest"></a>
<a id="tocsregisterrequest"></a>

```json
{
  "account": "string",
  "password": "string",
  "confirmPassword": "string",
  "verificationCode": "string",
  "nickname": "string",
  "inviteCode": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|account|string|true|none||账户（手机号或邮箱）|
|password|string|true|none||密码|
|confirmPassword|string|true|none||确认密码|
|verificationCode|string|true|none||验证码|
|nickname|string|false|none||昵称（可选）|
|inviteCode|string|false|none||邀请码（可选）|

<h2 id="tocS_ResetPasswordResponse">ResetPasswordResponse</h2>

<a id="schemaresetpasswordresponse"></a>
<a id="schema_ResetPasswordResponse"></a>
<a id="tocSresetpasswordresponse"></a>
<a id="tocsresetpasswordresponse"></a>

```json
{
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|message|string|false|none||重置成功消息|

<h2 id="tocS_BindResponse">BindResponse</h2>

<a id="schemabindresponse"></a>
<a id="schema_BindResponse"></a>
<a id="tocSbindresponse"></a>
<a id="tocsbindresponse"></a>

```json
{
  "message": "string",
  "account": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|message|string|false|none||绑定成功消息|
|account|string|false|none||绑定的账户信息（脱敏）|

<h2 id="tocS_BindPhoneRequest">BindPhoneRequest</h2>

<a id="schemabindphonerequest"></a>
<a id="schema_BindPhoneRequest"></a>
<a id="tocSbindphonerequest"></a>
<a id="tocsbindphonerequest"></a>

```json
{
  "userId": 0,
  "phone": "string",
  "verificationCode": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userId|integer(int64)|true|none||用户ID|
|phone|string|true|none||手机号|
|verificationCode|string|true|none||验证码|

<h2 id="tocS_BindEmailRequest">BindEmailRequest</h2>

<a id="schemabindemailrequest"></a>
<a id="schema_BindEmailRequest"></a>
<a id="tocSbindemailrequest"></a>
<a id="tocsbindemailrequest"></a>

```json
{
  "userId": 0,
  "email": "user@example.com",
  "verificationCode": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userId|integer(int64)|true|none||用户ID|
|email|string(email)|true|none||邮箱|
|verificationCode|string|true|none||验证码|

<h2 id="tocS_ChangePasswordResponse">ChangePasswordResponse</h2>

<a id="schemachangepasswordresponse"></a>
<a id="schema_ChangePasswordResponse"></a>
<a id="tocSchangepasswordresponse"></a>
<a id="tocschangepasswordresponse"></a>

```json
{
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|message|string|false|none||修改成功消息|

<h2 id="tocS_ChangePasswordRequest">ChangePasswordRequest</h2>

<a id="schemachangepasswordrequest"></a>
<a id="schema_ChangePasswordRequest"></a>
<a id="tocSchangepasswordrequest"></a>
<a id="tocschangepasswordrequest"></a>

```json
{
  "userId": 0,
  "oldPassword": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userId|integer(int64)|true|none||用户ID|
|oldPassword|string|true|none||原密码|
|newPassword|string|true|none||新密码|
|confirmNewPassword|string|true|none||确认新密码|

<h2 id="tocS_UpdateUserInfoResponse">UpdateUserInfoResponse</h2>

<a id="schemaupdateuserinforesponse"></a>
<a id="schema_UpdateUserInfoResponse"></a>
<a id="tocSupdateuserinforesponse"></a>
<a id="tocsupdateuserinforesponse"></a>

```json
{
  "message": "string",
  "userInfo": {
    "id": 0,
    "phone": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "inviteCode": "string",
    "balance": 0,
    "totalIncome": 0,
    "status": 0,
    "lastLoginAt": "string",
    "createdAt": "string",
    "hasPhone": true,
    "hasEmail": true
  }
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|message|string|false|none||更新成功消息|
|userInfo|[UserInfo](#schemauserinfo)|false|none||更新后的用户信息|

<h2 id="tocS_UpdateUserInfoRequest">UpdateUserInfoRequest</h2>

<a id="schemaupdateuserinforequest"></a>
<a id="schema_UpdateUserInfoRequest"></a>
<a id="tocSupdateuserinforequest"></a>
<a id="tocsupdateuserinforequest"></a>

```json
{
  "userId": 0,
  "nickname": "string",
  "avatar": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|userId|integer(int64)|true|none||用户ID|
|nickname|string|false|none||昵称|
|avatar|string|false|none||头像URL|

<h2 id="tocS_SendVerificationCodeResponse">SendVerificationCodeResponse</h2>

<a id="schemasendverificationcoderesponse"></a>
<a id="schema_SendVerificationCodeResponse"></a>
<a id="tocSsendverificationcoderesponse"></a>
<a id="tocssendverificationcoderesponse"></a>

```json
{
  "success": true,
  "message": "string",
  "expireTime": 0,
  "nextSendTime": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|success|boolean|false|none||操作是否成功|
|message|string|false|none||响应消息|
|expireTime|integer|false|none||验证码过期时间（秒）|
|nextSendTime|integer|false|none||下次可发送时间（秒）|

<h2 id="tocS_SendVerificationCodeRequest">SendVerificationCodeRequest</h2>

<a id="schemasendverificationcoderequest"></a>
<a id="schema_SendVerificationCodeRequest"></a>
<a id="tocSsendverificationcoderequest"></a>
<a id="tocssendverificationcoderequest"></a>

```json
{
  "account": "string",
  "codeType": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|account|string|true|none||账户（手机号或邮箱）|
|codeType|string|true|none||验证码类型<br />REGISTER - 注册<br />LOGIN - 登录<br />RESET_PASSWORD - 重置密码<br />BIND_PHONE - 绑定手机号<br />BIND_EMAIL - 绑定邮箱|

<h2 id="tocS_VerifyCodeRequest">VerifyCodeRequest</h2>

<a id="schemaverifycoderequest"></a>
<a id="schema_VerifyCodeRequest"></a>
<a id="tocSverifycoderequest"></a>
<a id="tocsverifycoderequest"></a>

```json
{
  "account": "string",
  "code": "string",
  "codeType": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|account|string|true|none||账户（手机号或邮箱）|
|code|string|true|none||验证码|
|codeType|string|true|none||验证码类型|

<h2 id="tocS_ResultLoginResponse">ResultLoginResponse</h2>

<a id="schemaresultloginresponse"></a>
<a id="schema_ResultLoginResponse"></a>
<a id="tocSresultloginresponse"></a>
<a id="tocsresultloginresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 0,
    "userInfo": {
      "id": 0,
      "phone": "string",
      "email": "string",
      "nickname": "string",
      "avatar": "string",
      "inviteCode": "string",
      "balance": 0,
      "totalIncome": 0,
      "status": 0,
      "lastLoginAt": "string",
      "createdAt": "string",
      "hasPhone": true,
      "hasEmail": true
    }
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[LoginResponse](#schemaloginresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultRegisterResponse">ResultRegisterResponse</h2>

<a id="schemaresultregisterresponse"></a>
<a id="schema_ResultRegisterResponse"></a>
<a id="tocSresultregisterresponse"></a>
<a id="tocsresultregisterresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "userId": 0,
    "message": "string",
    "needCompleteInfo": false
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[RegisterResponse](#schemaregisterresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultResetPasswordResponse">ResultResetPasswordResponse</h2>

<a id="schemaresultresetpasswordresponse"></a>
<a id="schema_ResultResetPasswordResponse"></a>
<a id="tocSresultresetpasswordresponse"></a>
<a id="tocsresultresetpasswordresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "message": "string"
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[ResetPasswordResponse](#schemaresetpasswordresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResetPasswordRequest">ResetPasswordRequest</h2>

<a id="schemaresetpasswordrequest"></a>
<a id="schema_ResetPasswordRequest"></a>
<a id="tocSresetpasswordrequest"></a>
<a id="tocsresetpasswordrequest"></a>

```json
{
  "account": "string",
  "newPassword": "string",
  "confirmNewPassword": "string",
  "verificationCode": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|account|string|true|none||账户（手机号或邮箱）|
|newPassword|string|true|none||新密码|
|confirmNewPassword|string|true|none||确认新密码|
|verificationCode|string|true|none||验证码|

<h2 id="tocS_ResultBindResponse">ResultBindResponse</h2>

<a id="schemaresultbindresponse"></a>
<a id="schema_ResultBindResponse"></a>
<a id="tocSresultbindresponse"></a>
<a id="tocsresultbindresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "message": "string",
    "account": "string"
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[BindResponse](#schemabindresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultChangePasswordResponse">ResultChangePasswordResponse</h2>

<a id="schemaresultchangepasswordresponse"></a>
<a id="schema_ResultChangePasswordResponse"></a>
<a id="tocSresultchangepasswordresponse"></a>
<a id="tocsresultchangepasswordresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "message": "string"
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[ChangePasswordResponse](#schemachangepasswordresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultUpdateUserInfoResponse">ResultUpdateUserInfoResponse</h2>

<a id="schemaresultupdateuserinforesponse"></a>
<a id="schema_ResultUpdateUserInfoResponse"></a>
<a id="tocSresultupdateuserinforesponse"></a>
<a id="tocsresultupdateuserinforesponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "message": "string",
    "userInfo": {
      "id": 0,
      "phone": "string",
      "email": "string",
      "nickname": "string",
      "avatar": "string",
      "inviteCode": "string",
      "balance": 0,
      "totalIncome": 0,
      "status": 0,
      "lastLoginAt": "string",
      "createdAt": "string",
      "hasPhone": true,
      "hasEmail": true
    }
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[UpdateUserInfoResponse](#schemaupdateuserinforesponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultUserInfo">ResultUserInfo</h2>

<a id="schemaresultuserinfo"></a>
<a id="schema_ResultUserInfo"></a>
<a id="tocSresultuserinfo"></a>
<a id="tocsresultuserinfo"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "id": 0,
    "phone": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "inviteCode": "string",
    "balance": 0,
    "totalIncome": 0,
    "status": 0,
    "lastLoginAt": "string",
    "createdAt": "string",
    "hasPhone": true,
    "hasEmail": true
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[UserInfo](#schemauserinfo)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_ResultSendVerificationCodeResponse">ResultSendVerificationCodeResponse</h2>

<a id="schemaresultsendverificationcoderesponse"></a>
<a id="schema_ResultSendVerificationCodeResponse"></a>
<a id="tocSresultsendverificationcoderesponse"></a>
<a id="tocsresultsendverificationcoderesponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "success": true,
    "message": "string",
    "expireTime": 0,
    "nextSendTime": 0
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[SendVerificationCodeResponse](#schemasendverificationcoderesponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

<h2 id="tocS_OperationResponse">OperationResponse</h2>

<a id="schemaoperationresponse"></a>
<a id="schema_OperationResponse"></a>
<a id="tocSoperationresponse"></a>
<a id="tocsoperationresponse"></a>

```json
{
  "success": true,
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|success|boolean|false|none||操作是否成功|
|message|string|false|none||响应消息|

<h2 id="tocS_ResultOperationResponse">ResultOperationResponse</h2>

<a id="schemaresultoperationresponse"></a>
<a id="schema_ResultOperationResponse"></a>
<a id="tocSresultoperationresponse"></a>
<a id="tocsresultoperationresponse"></a>

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "success": true,
    "message": "string"
  },
  "timestamp": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||响应状态码|
|message|string|false|none||响应消息|
|data|[OperationResponse](#schemaoperationresponse)|false|none||响应数据|
|timestamp|integer(int64)|false|none||时间戳|

