# Copy Trading Platform

加密货币跟单交易平台

## 🚀 在线访问

开发环境: http://localhost:5173/

生产环境: [部署后填写]

## 🛠️ 本地开发

```bash
cd frontend
npm install
npm run dev
```

## 📦 部署到 Vercel

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署
```bash
cd frontend
vercel --prod
```

### 4. 配置自定义域名（可选）
在 Vercel Dashboard 中添加自己的域名

## 🏗️ 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- GSAP 动画
- Lucide React 图标

## 📁 项目结构

```
frontend/
├── src/
│   ├── sections/     # 页面区块组件
│   ├── components/   # 可复用组件
│   ├── pages/        # 页面组件
│   ├── contexts/     # React Context
│   └── App.tsx       # 主应用
├── public/           # 静态资源
└── index.html        # 入口HTML
```

## ⚙️ 后端API

开发环境: http://localhost:8000
API文档: http://localhost:8000/docs

## 🔒 环境变量

创建 `.env.local`:
```
VITE_API_URL=https://your-api-url.com
```
