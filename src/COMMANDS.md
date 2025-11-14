# 📋 部署命令速查表

**直接复制粘贴这些命令，快速完成部署！**

---

## 🚀 上传代码到 GitHub

### 第一次上传

```bash
# 1. 初始化 Git
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit - 游戏社区网站上线"

# 4. 添加远程仓库（记得替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/game-community.git

# 5. 推送
git branch -M main
git push -u origin main
```

### 后续更新

```bash
# 添加修改的文件
git add .

# 提交更改
git commit -m "更新说明（描述您的修改）"

# 推送到 GitHub
git push
```

**推送后，Vercel 会自动重新部署！** ⚡

---

## 🔧 Vercel 环境变量

**在 Vercel 部署时添加这些环境变量：**

### 变量 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://imyjfikpjvmrfigabhpn.supabase.co
```

### 变量 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteWpmaWtwanZtcmZpZ2FiaHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkzMDAsImV4cCI6MjA3ODQ5NTMwMH0.UsHtPruO474OVVlvXzkxr3sMuSIf_LaksjJqFDwzAk4
```

### 变量 3: VITE_SUPABASE_PROJECT_ID
```
Name: VITE_SUPABASE_PROJECT_ID
Value: imyjfikpjvmrfigabhpn
```

---

## 📊 本地开发命令

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

---

## 🔍 常用检查命令

### 检查 Git 状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
```

### 查看远程仓库
```bash
git remote -v
```

### 检查当前分支
```bash
git branch
```

---

## 🌐 DNS 配置（域名购买后）

### Namecheap DNS 设置

**A Record:**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**CNAME Record:**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### Cloudflare DNS 设置

**A Record:**
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: Proxied (橙色云朵)
TTL: Auto
```

**CNAME Record:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (橙色云朵)
TTL: Auto
```

---

## 🔐 Supabase URL 配置

### Site URL
```
https://yourgame.com
```
或
```
https://game-community-xxxxx.vercel.app
```

### Redirect URLs
```
https://yourgame.com
https://yourgame.com/*
https://game-community-xxxxx.vercel.app
https://game-community-xxxxx.vercel.app/*
http://localhost:5173
```

---

## 🔑 Google OAuth 配置

### Authorized JavaScript origins
```
https://yourgame.com
https://game-community-xxxxx.vercel.app
http://localhost:5173
```

### Authorized redirect URIs
```
https://imyjfikpjvmrfigabhpn.supabase.co/auth/v1/callback
```

---

## 🧪 测试命令

### 测试网站性能
```bash
# 使用 Lighthouse（需要安装 Chrome）
npx lighthouse https://yourgame.com --view
```

### 检查 DNS 传播
访问网站：
```
https://dnschecker.org
```
输入您的域名进行检查

### 检查 SSL 证书
```bash
# macOS/Linux
openssl s_client -connect yourgame.com:443 -servername yourgame.com

# 或访问：
https://www.ssllabs.com/ssltest/
```

---

## 📦 包管理命令

### 更新所有依赖
```bash
npm update
```

### 检查过时的包
```bash
npm outdated
```

### 安装特定包
```bash
npm install package-name
```

### 卸载包
```bash
npm uninstall package-name
```

---

## 🔄 版本控制技巧

### 撤销最后一次提交（保留修改）
```bash
git reset --soft HEAD~1
```

### 查看文件修改
```bash
git diff
```

### 暂存特定文件
```bash
git add 文件名
```

### 创建新分支
```bash
git checkout -b feature/new-feature
```

### 合并分支
```bash
git checkout main
git merge feature/new-feature
```

---

## 🚨 紧急修复流程

### 发现严重 Bug 需要紧急回滚

```bash
# 1. 查看提交历史
git log --oneline

# 2. 回滚到上一个稳定版本（替换 commit-hash）
git revert commit-hash

# 3. 推送
git push
```

Vercel 会自动部署回滚版本

---

## 📊 性能监控命令

### 检查网站加载时间
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://yourgame.com
```

### 创建 curl-format.txt（首次使用）
```bash
cat > curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

---

## 🎯 快速部署检查清单

复制这个清单，完成一项删除一项：

```
[ ] git init
[ ] git add .
[ ] git commit -m "Initial commit"
[ ] GitHub 创建仓库
[ ] git remote add origin
[ ] git push
[ ] Vercel 导入项目
[ ] 添加环境变量（3个）
[ ] 点击 Deploy
[ ] 等待部署完成
[ ] 记录 Vercel URL
[ ] Supabase 更新 Site URL
[ ] Supabase 添加 Redirect URLs
[ ] 测试注册登录
[ ] 测试发帖
[ ] 测试头像上传
[ ] 完成！🎉
```

---

## 💾 备份命令

### 备份整个项目
```bash
# 创建压缩包
tar -czf game-community-backup-$(date +%Y%m%d).tar.gz .

# 或使用 zip
zip -r game-community-backup-$(date +%Y%m%d).zip . -x "node_modules/*" -x ".git/*"
```

### 推送到备份分支
```bash
git checkout -b backup/$(date +%Y%m%d)
git push origin backup/$(date +%Y%m%d)
git checkout main
```

---

## 🔧 故障排除命令

### 清除 Git 缓存
```bash
git rm -r --cached .
git add .
git commit -m "清除缓存"
```

### 强制推送（谨慎使用！）
```bash
git push -f origin main
```

### 重新克隆仓库
```bash
cd ..
git clone https://github.com/YOUR_USERNAME/game-community.git game-community-new
cd game-community-new
npm install
```

---

## 📝 有用的别名（可选）

添加到 `~/.bashrc` 或 `~/.zshrc`：

```bash
# Git 快捷命令
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'

# 项目命令
alias dev='npm run dev'
alias build='npm run build'
alias deploy='git add . && git commit -m "update" && git push'
```

使用方法：
```bash
# 快速部署更新
deploy
```

---

## 🎉 一键部署脚本（高级）

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "🚀 开始部署..."

# 添加所有文件
git add .

# 提交
read -p "提交信息: " message
git commit -m "$message"

# 推送
git push

echo "✅ 部署完成！Vercel 正在自动构建..."
echo "📊 查看部署状态：https://vercel.com"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📚 相关资源链接

### 文档
- Vercel CLI: https://vercel.com/docs/cli
- Git 文档: https://git-scm.com/doc
- npm 文档: https://docs.npmjs.com

### 工具
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub: https://github.com

### 检查工具
- DNS Checker: https://dnschecker.org
- SSL Test: https://www.ssllabs.com/ssltest/
- PageSpeed: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com

---

**保存此文件以便快速查找命令！** 📋✨
