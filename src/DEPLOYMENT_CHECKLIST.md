# ✅ 部署检查清单

使用此清单确保部署过程顺利完成。

---

## 📋 部署前检查

### 代码准备
- [ ] 所有代码已提交到 Git
- [ ] package.json 包含所有依赖
- [ ] 构建命令测试通过 (`npm run build`)
- [ ] 本地开发环境运行正常 (`npm run dev`)
- [ ] 所有 TypeScript 错误已修复
- [ ] 控制台没有严重警告

### 功能测试
- [ ] ✅ 用户注册功能正常
- [ ] ✅ 用户登录功能正常
- [ ] ✅ 发布帖子功能正常
- [ ] ✅ 评论功能正常
- [ ] ✅ 点赞/踩功能正常
- [ ] ✅ 头像上传功能正常
- [ ] ✅ 个人资料编辑正常
- [ ] ✅ 好友系统功能正常
- [ ] ✅ 排行榜显示正常
- [ ] ✅ 游戏库功能正常
- [ ] ✅ 搜索功能正常

### UI/UX 测试
- [ ] 黑夜模式正常
- [ ] 白天模式正常
- [ ] 简体中文显示正常
- [ ] 繁体中文显示正常
- [ ] 英文显示正常
- [ ] 移动端适配正常
- [ ] 平板适配正常
- [ ] 桌面端显示正常
- [ ] 加载动画流畅
- [ ] 错误提示友好

### 浏览器兼容性
- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] 移动 Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🔧 Supabase 配置

### 项目信息
- [ ] 记录项目 URL: `https://__________.supabase.co`
- [ ] 记录项目 ID: `__________`
- [ ] 记录 Anon Key: `eyJ__________`
- [ ] 记录 Service Role Key: `eyJ__________` (保密)

### Auth 设置
- [ ] Site URL 已配置: `https://yourgame.com`
- [ ] Redirect URLs 已添加:
  - [ ] `https://yourgame.com`
  - [ ] `https://yourgame.vercel.app`
  - [ ] `http://localhost:5173` (开发用)
- [ ] Email Auth 已启用
- [ ] Auto-confirm email 已启用 (如果没有邮件服务器)

### Storage 设置
- [ ] Bucket `make-b33c7dce-avatars` 已创建
- [ ] Bucket 设置为 Public
- [ ] 文件大小限制设置为 5MB
- [ ] 测试文件上传成功

### Edge Functions
- [ ] 确认 Edge Function 已部署
- [ ] 测试 API 调用正常
- [ ] 检查日志无错误

---

## 🚀 Vercel 部署

### 账号设置
- [ ] Vercel 账号已创建
- [ ] GitHub 账号已连接
- [ ] 项目已导入

### 构建配置
- [ ] Framework: Vite ✅
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18.x

### 环境变量
- [ ] `VITE_SUPABASE_URL` 已添加
- [ ] `VITE_SUPABASE_ANON_KEY` 已添加
- [ ] `VITE_SUPABASE_PROJECT_ID` 已添加
- [ ] 所有环境变量值正确无误

### 部署状态
- [ ] 首次部署成功
- [ ] 构建日志无错误
- [ ] 部署预览可访问
- [ ] 生产环境已部署

---

## 🌐 域名配置（可选）

### 域名购买
- [ ] 域名已购买: `__________`
- [ ] 域名注册商: __________
- [ ] 域名到期时间: __________

### DNS 配置
- [ ] A 记录已添加: `@` → `76.76.21.21`
- [ ] CNAME 记录已添加: `www` → `cname.vercel-dns.com`
- [ ] DNS 传播完成 (检查: dnschecker.org)

### Vercel 域名设置
- [ ] 域名已添加到 Vercel
- [ ] SSL 证书已生成
- [ ] HTTPS 自动重定向已启用
- [ ] 自定义域名可访问

### Supabase 域名更新
- [ ] Site URL 更新为自定义域名
- [ ] Redirect URLs 添加自定义域名

---

## 🔐 Google OAuth（可选）

### Google Cloud 设置
- [ ] Google Cloud 项目已创建
- [ ] OAuth 2.0 Client ID 已创建
- [ ] Client ID 已记录: `__________`
- [ ] Client Secret 已记录: `__________`

### 授权配置
- [ ] Authorized JavaScript origins:
  - [ ] `https://yourgame.com`
  - [ ] `https://yourgame.vercel.app`
- [ ] Authorized redirect URIs:
  - [ ] `https://项目ID.supabase.co/auth/v1/callback`

### Supabase OAuth 配置
- [ ] Google Provider 已启用
- [ ] Client ID 已填入
- [ ] Client Secret 已填入
- [ ] 测试 Google 登录成功

---

## 🧪 部署后测试

### 功能验证
- [ ] 访问生产网站 URL
- [ ] 注册新测试账号
- [ ] 登录成功
- [ ] 发布测试帖子
- [ ] 上传测试头像
- [ ] 编辑个人资料
- [ ] 添加测试好友
- [ ] 查看排行榜
- [ ] 切换语言
- [ ] 切换主题
- [ ] Google 登录测试 (如果启用)

### 性能检查
- [ ] 首屏加载 < 3秒
- [ ] 页面交互流畅
- [ ] 图片加载正常
- [ ] 无明显卡顿
- [ ] PageSpeed Insights 分数 > 80

### 错误检查
- [ ] 浏览器控制台无严重错误
- [ ] Network 请求正常
- [ ] Supabase 日志无错误
- [ ] Vercel 日志无错误

---

## 📊 监控和分析

### 分析工具
- [ ] Vercel Analytics 已启用
- [ ] Google Analytics 已配置 (可选)
- [ ] Sentry 错误监控已配置 (可选)

### 监控设置
- [ ] 设置 Uptime 监控 (可选)
- [ ] 配置错误提醒 (可选)
- [ ] 设置性能基线

---

## 📢 上线准备

### 内容准备
- [ ] 创建几个示例帖子
- [ ] 准备欢迎公告
- [ ] 编写用户指南
- [ ] 准备 FAQ

### 社交媒体
- [ ] 创建社交媒体账号
- [ ] 准备推广文案
- [ ] 设计分享图片
- [ ] 准备发布计划

### 用户支持
- [ ] 设置反馈渠道 (邮箱/Discord)
- [ ] 准备常见问题解答
- [ ] 制定社区规则

---

## 🎯 发布后 24 小时

### 监控重点
- [ ] 检查用户注册情况
- [ ] 监控错误日志
- [ ] 查看性能指标
- [ ] 收集用户反馈

### 快速响应
- [ ] 修复严重 bug
- [ ] 回复用户问题
- [ ] 优化性能瓶颈
- [ ] 更新 FAQ

---

## 📝 发布后 1 周

### 数据分析
- [ ] 注册用户数: __________
- [ ] 活跃用户数: __________
- [ ] 发布帖子数: __________
- [ ] 平均停留时间: __________
- [ ] 跳出率: __________

### 问题总结
- [ ] 记录所有 bug
- [ ] 整理用户反馈
- [ ] 分析使用模式
- [ ] 规划改进计划

### 优化方向
- [ ] 性能优化
- [ ] UI/UX 改进
- [ ] 新功能开发
- [ ] 内容运营

---

## ✅ 完成标记

**部署完成日期：** __________  
**部署负责人：** __________  
**生产 URL：** __________  
**初始用户数：** __________

---

## 🎉 恭喜部署成功！

现在您的游戏社区网站已经：
- ✅ 成功部署到生产环境
- ✅ 可以被全球用户访问
- ✅ 拥有稳定的后端服务
- ✅ 具备完整的功能

**下一步：开始运营和推广！** 🚀

---

## 📚 相关文档

- [详细部署指南](./DEPLOYMENT_GUIDE.md)
- [快速开始指南](./QUICK_START.md)
- [环境变量示例](./.env.example)
- [Vercel 配置](./vercel.json)

---

**保存此清单以备后续检查和审计使用。**
