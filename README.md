# CHIC 時尚購物 - 會員系統後端

## 🚀 Zeabur 部署指南

### 1. 在 Zeabur 建立 MongoDB 資料庫

1. 登入 Zeabur Dashboard
2. 選擇你的專案
3. 點擊 **New Service** → **Marketplace**
4. 選擇 **MongoDB**
5. 等待建立完成，複製 **Connection URL**

### 2. 部署後端 API

1. 將 `shopping-backend` 資料夾上傳到你的 GitHub
2. 在 Zeabur 建立新服務，選擇從 GitHub 部署
3. 選擇 `shopping-backend` repository

### 3. 設定環境變數

在 Zeabur 服務的 **Variables** 設定：
- `MONGODB_URI` = 你的 MongoDB 連線字串
- `JWT_SECRET` = 你的 JWT 密鑰（用亂數產生）
- `PORT` = 3000

### 4. 等待部署完成

部署成功後，你會得到一個 URL，例如：
`https://shopping-backend.zeabur.app`

---

## 📡 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/auth/register` | 會員註冊 |
| POST | `/api/auth/login` | 會員登入 |
| GET | `/api/auth/profile` | 取得會員資料（需認證） |
| PUT | `/api/auth/profile` | 更新會員資料（需認證） |
| GET | `/api/health` | 健康檢查 |

---

## 📝 API 使用範例

### 註冊
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "123456",
  "name": "張小美",
  "phone": "0912345678"
}
```

### 登入
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "123456"
}
```

回應：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "張小美"
  }
}
```

### 取得會員資料
```
GET /api/auth/profile
Header: Authorization: Bearer <token>
```

---

## 🔒 前端串接

在前端調用 API 時：
```javascript
// 登入
const response = await fetch('https://your-api.zeabur.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// 取得會員資料
const response = await fetch('https://your-api.zeabur.app/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
