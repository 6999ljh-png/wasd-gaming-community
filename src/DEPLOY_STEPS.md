# 🚀 游戏社区网站 - 部署步骤

## ✅ 前置准备（已完成）

- ✅ 所有配置文件已就绪
- ✅ Supabase 项目已配置
- ✅ 项目代码已完成

---

## 📦 第一步：从 Figma Make 导出项目

1. 在 Figma Make 界面中，点击**下载/导出**按钮
2. 下载完整的项目 ZIP 文件
3. 解压到本地文件夹（例如：`wasd-gaming-community`）

---

## 🐙 第二步：上传到 GitHub

### 方法 A：使用 GitHub Desktop（推荐）

1. **打开 GitHub Desktop**
2. **File** → **Add Local Repository**
3. 选择刚才解压的项目文件夹
4. 如果提示 "not a git repository"，点击 **"Create a repository"**
5. 仓库名称：`wasd-gaming-community`
6. 点击 **"Publish repository"**
7. 取消勾选 "Keep this code private"（如果要公开）
8. 点击 **"Publish"**

### 方法 B：使用命令行

```bash
# 进入项目文件夹
cd wasd-gaming-community

# 初始化 Git
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "Initial commit - 游戏社区网站"

# 连接到 GitHub（替换成您的用户名）
git remote add origin https://github.com/你的用户名/wasd-gaming-community.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## ☁️ 第三步：在 Vercel 部署

### 3.1 导入项目

1. 访问 https://vercel.com
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 找到并选择 **wasd-gaming-community** 仓库
5. 点击 **"Import"**

### 3.2 配置项目

**Framework Preset:** 
- 选择 **Vite**

**Root Directory:**
- 保持默认 `./`

**Build Command:**
- 自动填充为 `npm run build`（无需修改）

**Output Directory:**
- 自动填充为 `build`（无需修改）

### 3.3 添加环境变量 ⭐（重要！）

点击 **"Environment Variables"** 展开，添加以下 3 个变量：

#### 变量 1:
```
Name:  VITE_SUPABASE_URL
Value: https://imyjfikpjvmrfigabhpn.supabase.co
```

#### 变量 2:
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteWpmaWtwanZtcmZpZ2FiaHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkzMDAsImV4cCI6MjA3ODQ5NTMwMH0.UsHtPruO474OVVlvXzkxr3sMuSIf_LaksjJqFDwzAk4
```

#### 变量 3:
```
Name:  VITE_SUPABASE_PROJECT_ID
Value: imyjfikpjvmrfigabhpn
```

### 3.4 开始部署

1. 确认所有配置正确
2. 点击黑色的 **"Deploy"** 按钮
3. 等待 3-5 分钟，构建完成
4. 🎉 获得网站地址！

---

## ⚙️ 第四步：配置 Supabase（部署成功后）

### 4.1 获取 Vercel 网站地址

部署成功后，Vercel 会给您一个地址，例如：
```
https://wasd-gaming-community-abc123.vercel.app
```

复制这个地址。

### 4.2 配置 Supabase 认证

1. 访问 https://supabase.com/dashboard
2. 选择项目 **imyjfikpjvmrfigabhpn**
3. 左侧菜单 → **Authentication** → **URL Configuration**

#### 添加 Redirect URL:
```
https://您的vercel域名.vercel.app/*
```
例如：`https://wasd-gaming-community-abc123.vercel.app/*`

#### 设置 Site URL:
```
https://您的vercel域名.vercel.app
```

4. 点击 **Save**

### 4.3 配置 Google OAuth（如果使用 Google 登录）

1. 在 Supabase 中：**Authentication** → **Providers**
2. 找到 **Google**，启用它
3. 按照提示配置 Google OAuth
4. 参考文档：https://supabase.com/docs/guides/auth/social-login/auth-google

---

## ✅ 第五步：测试网站

访问您的 Vercel 网站地址，测试以下功能：

- ✅ 页面正常显示（黑暗/白天模式切换）
- ✅ 语言切换（简中/繁中/英文）
- ✅ Google 登录
- ✅ 发帖功能
- ✅ 好友系统
- ✅ 排行榜
- ✅ 个人资料
- ✅ 游戏库

---

## 🆘 常见问题

### 问题 1: 构建失败 - "No Output Directory"
**解决：** 确认 `vercel.json` 中 `outputDirectory` 设置为 `build`

### 问题 2: 页面空白
**解决：** 
1. 打开浏览器控制台（F12）
2. 查看错误信息
3. 确认环境变量是否正确设置

### 问题 3: Google 登录失败
**解决：** 
1. 确认已在 Supabase 添加 Redirect URL
2. 确认已配置 Google OAuth Provider

### 问题 4: 无法连接数据库
**解决：** 
1. 检查环境变量是否正确
2. 确认 Supabase 项目未暂停

---

## 🎯 成功标志

部署成功后，您应该看到：

```
✓ Building...
✓ Uploading Build Outputs...
✓ Deployment Ready!

🎉 Your project has been deployed!
Visit: https://wasd-gaming-community-xxx.vercel.app
```

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. Supabase 项目状态

---

**部署愉快！🚀**
