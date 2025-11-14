# ⚡ Vercel 部署配置速查

## 📋 快速配置清单

### 1️⃣ Framework Settings
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 2️⃣ Environment Variables（必须添加！）

复制粘贴以下内容到 Vercel 环境变量：

#### Variable 1:
```
VITE_SUPABASE_URL
```
```
https://imyjfikpjvmrfigabhpn.supabase.co
```

#### Variable 2:
```
VITE_SUPABASE_ANON_KEY
```
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteWpmaWtwanZtcmZpZ2FiaHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkzMDAsImV4cCI6MjA3ODQ5NTMwMH0.UsHtPruO474OVVlvXzkxr3sMuSIf_LaksjJqFDwzAk4
```

#### Variable 3:
```
VITE_SUPABASE_PROJECT_ID
```
```
imyjfikpjvmrfigabhpn
```

---

## 🎯 部署后需要做的事

### Supabase Redirect URLs

在 Supabase Dashboard 中添加（假设您的域名是 example.vercel.app）：

#### Redirect URLs:
```
https://example.vercel.app/*
```

#### Site URL:
```
https://example.vercel.app
```

**位置：** Supabase Dashboard → Authentication → URL Configuration

---

## ✅ 检查清单

部署前：
- [ ] 已上传代码到 GitHub
- [ ] Framework Preset 选择 Vite
- [ ] Output Directory 设置为 build
- [ ] 已添加 3 个环境变量
- [ ] 环境变量值正确无误

部署后：
- [ ] 已在 Supabase 添加 Redirect URLs
- [ ] 已在 Supabase 添加 Site URL
- [ ] 已测试 Google 登录
- [ ] 已测试所有核心功能

---

## 📸 环境变量添加示意

在 Vercel 部署页面：

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│ Name:  VITE_SUPABASE_URL               │
│ Value: https://imyjfikpjvmrf...        │
│        [Add]                            │
├─────────────────────────────────────────┤
│ Name:  VITE_SUPABASE_ANON_KEY          │
│ Value: eyJhbGciOiJIUzI1NiI...          │
│        [Add]                            │
├─────────────────────────────────────────┤
│ Name:  VITE_SUPABASE_PROJECT_ID        │
│ Value: imyjfikpjvmrfigabhpn            │
│        [Add]                            │
└─────────────────────────────────────────┘
```

每个变量添加后会显示在列表中。

---

## 🚨 注意事项

1. **不要泄露 ANON_KEY** - 虽然它是公开密钥，但最好不要在公开场合分享
2. **Environment Scope** - 选择 Production、Preview、Development 全部勾选
3. **大小写敏感** - 变量名必须完全一致（包括 `VITE_` 前缀）
4. **无空格** - 复制值时确保没有多余的空格

---

**快速提示：** 可以将 `.env.example` 文件作为参考，直接复制变量值！
