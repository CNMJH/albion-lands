# 🎮 快速邀请玩家指南

**5 分钟让朋友加入游戏！**

---

## 🚀 三种方案，任选其一

### 方案一：最快（局域网，10 分钟）✅ 推荐新手

**适合**: 和朋友在同一 WiFi/局域网

**步骤**:
1. 获取你的 IP 地址
   ```bash
   # Windows
   ipconfig
   # 找到 IPv4 地址，如：192.168.1.100
   
   # Linux/Mac
   ifconfig
   # 找到 inet 地址，如：192.168.1.100
   ```

2. 修改 `server/.env`:
   ```bash
   HOST=0.0.0.0
   ```

3. 修改 `client/.env`:
   ```bash
   VITE_SERVER_URL=http://192.168.1.100:3002
   VITE_WS_URL=ws://192.168.1.100:3002/ws
   ```

4. 重启游戏:
   ```bash
   ./launcher.bat  # Windows
   ```

5. 分享地址给朋友:
   ```
   🎮 快来玩呼噜大陆！
   
   游戏地址：http://192.168.1.100:3001
   （记得替换成你的 IP）
   
   注册方式：
   1. 打开地址
   2. 点击"注册账号"
   3. 填写邮箱和密码
   4. 登录游戏
   
   我们都在同一 WiFi 下才能玩哦！
   ```

---

### 方案二：最方便（Vercel + Railway，30 分钟）✅ 推荐测试

**适合**: 朋友不在同一局域网，想快速测试

**步骤**:

#### 1. 推送代码到 GitHub
```bash
cd /home/tenbox/albion-lands
git push origin main
```

#### 2. 部署服务端到 Railway
1. 访问 https://railway.app
2. New Project → Deploy from GitHub
3. 选择 `albion-lands`
4. Root: `server`
5. 添加 PostgreSQL 数据库
6. 复制 `DATABASE_URL` 到环境变量

#### 3. 部署客户端到 Vercel
1. 访问 https://vercel.com
2. Add New → Import Git Repository
3. 选择 `albion-lands`
4. Root: `client`
5. 添加环境变量:
   ```
   VITE_SERVER_URL=https://your-server.railway.app
   VITE_WS_URL=wss://your-server.railway.app/ws
   ```

#### 4. 分享地址
```
🎮 呼噜大陆测试服开放！

游戏地址：https://your-project.vercel.app

注册方式：
1. 打开地址
2. 点击"注册账号"
3. 填写邮箱和密码
4. 登录游戏

24 小时在线，随时来玩！🎉
```

---

### 方案三：最专业（云服务器，2 小时）✅ 推荐正式运营

**适合**: 长期运营，完全控制

**步骤**: 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#方案二自建服务器)

---

## 📝 玩家注册流程

### 第一步：打开游戏
```
https://your-game-url.com
```

### 第二步：注册账号
1. 点击"注册账号"按钮
2. 填写信息：
   - 邮箱：`player@example.com`
   - 密码：`password123`
   - 确认密码：`password123`
3. 点击"注册"

### 第三步：创建角色
1. 输入角色名：`勇敢的冒险者`
2. 选择外观
3. 点击"创建角色"

### 第四步：开始游戏
```
✅ 成功进入游戏世界！
```

---

## 🎁 测试账号（开发环境）

**已预创建的账号，可以直接登录**:

```
账号 1:
邮箱：test1@example.com
密码：password123
角色：测试玩家 1

账号 2:
邮箱：test2@example.com
密码：password123
角色：测试玩家 2

账号 3:
邮箱：test3@example.com
密码：password123
角色：测试玩家 3
```

---

## 💬 分享模板

### 微信群/QQ 群

```
🎮【呼噜大陆】游戏测试邀请 🎮

朋友们，我做了个 2D MMORPG 游戏，
类似阿尔比恩，现在开放测试啦！

🌐 游戏地址：https://your-url.com
👥 支持多人在线
⚔️ 可以 PVP/PVE
💰 自由交易系统
🎯 任务系统

注册超简单：
1. 打开地址
2. 点"注册账号"
3. 填邮箱密码
4. 创建角色

快来一起玩！我在线等！😄

游戏指南：docs/GAME_GUIDE.md
```

---

### 朋友圈/动态

```
🎉 我自己做的游戏开服啦！

2D MMORPG《呼噜大陆》
✅ 多人在线
✅ 自由交易
✅ PVP/PVE
✅ 任务系统

🌐 地址：https://your-url.com

注册就能玩，欢迎来提建议！🙏

#独立游戏 #游戏开发 #MMORPG
```

---

### Discord/论坛

```markdown
# 🎮 呼噜大陆 - 2D MMORPG 开放测试

**游戏类型**: 2D MMORPG  
**特色**: 
- ⚔️ 自由 PVP/PVE
- 💰 玩家驱动经济
- 👥 社交系统
- 🎯 任务系统

**立即游玩**: https://your-url.com

**GitHub**: https://github.com/CNMJH/albion-lands

欢迎加入测试！🎉
```

---

## ❓ 常见问题

### Q: 朋友说打不开游戏？

**A**: 检查：
1. 服务器是否在运行
2. 防火墙是否开放端口
3. URL 是否正确（http/https）

---

### Q: 注册后无法登录？

**A**: 
1. 检查邮箱密码是否正确
2. 查看浏览器控制台（F12）是否有错误
3. 重启服务器试试

---

### Q: 游戏很卡？

**A**:
1. 检查网络连接
2. 减少同屏玩家数量
3. 降低浏览器硬件加速

---

### Q: 如何查看有多少人在线？

**A**:
```bash
# 查看服务端日志
pm2 logs hulu-server

# 或查看 GM 工具
http://your-server:3002/gm/
```

---

## 🎯 下一步

**玩家多了之后**:

1. **升级服务器**（如果卡）
   - 升级到 4GB 内存
   - 使用 PostgreSQL 替代 SQLite

2. **添加更多游戏内容**
   - 新地图
   - 新怪物
   - 新任务

3. **建立社区**
   - QQ 群/Discord
   - 问题反馈渠道
   - 更新公告

---

**🎊 祝游戏大热，玩家爆满！**
