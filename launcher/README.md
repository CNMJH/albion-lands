# Hulu Lands Smart Launcher v2.0

**Release Date:** 2024-03-12  
**Version:** 2.0.0  
**Status:** Production Ready

---

## 🎯 What's New in v2.0

### Major Improvements

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Context Detection | ❌ | ✅ Auto-detect run location |
| Admin Check | ❌ | ✅ Prompt for elevation |
| Network Check | ❌ | ✅ Ping test before git |
| Port Check | ❌ | ✅ Check + auto-kill |
| Disk Space | ❌ | ✅ Minimum space check |
| Retry Logic | ❌ | ✅ 3 retries on failure |
| Process Kill | 1 method | ✅ 2 methods + verify |
| Service Health | ❌ | ✅ Verify ports after start |
| Interactive Menu | ❌ | ✅ User choices |
| Offline Mode | ❌ | ✅ Skip git if offline |
| Logging | Basic | ✅ Detailed with timestamps |
| Error Recovery | ❌ | ✅ Auto-fix common issues |

---

## 🧠 Smart Features

### 1. Context Detection

**Automatically detects where you're running from:**

```
Scenario 1: Project root (albion-lands/)
  → Use current directory

Scenario 2: Parent directory
  → Enter albion-lands/

Scenario 3: Project subdirectory
  → Navigate to root

Scenario 4: No project found
  → Offer to clone from GitHub
```

### 2. Permission Management

```
Running as admin?
  ├─ Yes → Full functionality
  └─ No  → Warn + offer to restart as admin
           - Can still continue with limited features
```

### 3. System Requirements Check

```
✓ Git installed?
✓ Node.js installed? (v18+)
✓ npm installed?
✓ Disk space sufficient? (500MB+)
```

### 4. Network Intelligence

```
Can reach github.com?
  ├─ Yes → Normal git pull
  └─ No  → Offer options:
           1. Continue with local code (offline mode)
           2. Run network diagnostics
           3. Exit
```

### 5. Port Management

```
Port 3001/3002 in use?
  ├─ Yes → Offer to:
  │        1. Kill process automatically
  │        2. Use different port
  │        3. Exit
  └─ No  → Continue
```

### 6. Process Cleanup (Multi-Method)

```
Method 1: taskkill /IM node.exe
  ↓
Wait 2 seconds
  ↓
Method 2: Kill by PID from tasklist
  ↓
Wait 3 seconds for port release
  ↓
Verify ports are free
```

### 7. Dependency Installation with Retry

```
npm install failed?
  ├─ Retry 1 → Wait 2s → Try again
  ├─ Retry 2 → Wait 2s → Try again
  └─ Retry 3 → Give up + show error
```

### 8. Service Health Check

```
After starting server:
  ↓
Wait 5 seconds
  ↓
Check if port 3002 is listening
  ↓
Warn if not started properly

After starting client:
  ↓
Wait 10 seconds
  ↓
Check if port 3001 is listening
  ↓
Warn if not started properly
```

### 9. Interactive Menu

```
What would you like to do?
  1) Clone project from GitHub
  2) Browse to project directory
  3) Exit
Enter choice (1-3): _
```

### 10. Comprehensive Logging

```
logs/
├── launcher-20240312-143052.log  ← Launcher run log
├── server-20240312-143052.log    ← Server output
└── client-20240312-143052.log    ← Client output
```

---

## 📊 Complete Flow Chart

```
Start
  ↓
Detect Context (root/subdir/new)
  ↓
Check Admin Rights → Offer elevation if needed
  ↓
Check Requirements (Git, Node, npm, Disk)
  ↓
Check Network → Offline mode if needed
  ↓
Check Config (.env) → Create if missing
  ↓
Check Ports → Kill processes if needed
  ↓
Cleanup Old Processes (2 methods)
  ↓
Git Pull (with 3 retries)
  ↓
Install Dependencies (with 3 retries)
  ├─ Server dependencies
  └─ Client dependencies
  ↓
Start Server
  ↓
Wait 5s + Verify port 3002
  ↓
Start Client
  ↓
Wait 10s + Verify port 3001
  ↓
Open Browser
  ↓
Show Summary + Create Shortcut?
  ↓
End
```

---

## 🎮 Usage Scenarios

### Scenario 1: First Time User

```
1. Download launcher.bat
2. Double-click
3. Choose "Clone project from GitHub"
4. Wait for automatic setup
5. Game opens in browser
6. Choose "Create desktop shortcut"
```

### Scenario 2: Daily Use

```
1. Double-click desktop shortcut
2. Auto-updates code
3. Auto-starts services
4. Game opens in browser
```

### Scenario 3: Network Issues

```
1. Run launcher
2. Network check fails
3. Choose "Continue with local code"
4. Works offline with last downloaded version
```

### Scenario 4: Port Conflicts

```
1. Run launcher
2. Port 3001 in use
3. Choose "Kill process"
4. Launcher kills conflicting process
5. Continues normally
```

### Scenario 5: Permission Issues

```
1. Run launcher
2. Not running as admin
3. Choose "Restart as administrator"
4. UAC prompt appears
5. Continue with full privileges
```

### Scenario 6: Dependency Failures

```
1. Run launcher
2. npm install fails
3. Auto-retry (up to 3 times)
4. If still fails, show error + help
```

---

## 🔧 Configuration

### Environment Variables

Create `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3002
HOST=localhost

# Database
DATABASE_URL=sqlite:./dev.db

# Client URL
CLIENT_URL=http://localhost:3001

# JWT Secret
JWT_SECRET=your-secret-key-here
```

### Launcher Configuration

Edit top of `launcher.bat`:

```batch
set "SERVER_PORT=3002"
set "CLIENT_PORT=3001"
set "MAX_RETRIES=3"
set "MIN_DISK_SPACE_MB=500"
```

---

## 📁 Directory Structure

```
albion-lands/
├── launcher.bat              # Smart Launcher v2.0
├── create-shortcut.bat       # Desktop shortcut creator
├── launcher/
│   ├── README.md            # This file
│   ├── FEATURES.md          # Detailed features
│   └── TROUBLESHOOTING.md   # Common issues
├── logs/                     # Auto-created log directory
│   ├── launcher-*.log
│   ├── server-*.log
│   └── client-*.log
├── server/
│   ├── .env                 # Server configuration
│   ├── .env.example
│   └── ...
└── client/
    └── ...
```

---

## 🐛 Error Handling

### Git Failures

| Error | Action |
|-------|--------|
| Network unreachable | Offer offline mode |
| Repository not found | Show clone URL |
| Permission denied | Suggest SSH keys |
| Merge conflicts | Backup + force pull |

### npm Failures

| Error | Action |
|-------|--------|
| Registry timeout | Retry with --prefer-offline |
| EACCES permission | Suggest running as admin |
| ENOSPC no space | Show disk space warning |
| Network timeout | Retry up to 3 times |

### Port Conflicts

| Port | Action |
|------|--------|
| 3001 (Client) | Auto-kill + verify |
| 3002 (Server) | Auto-kill + verify |
| Other | Show process info + options |

### Process Kill Failures

| Method | Fallback |
|--------|----------|
| taskkill /IM | taskkill /PID |
| taskkill /PID | Show manual instructions |
| Both fail | Show Task Manager instructions |

---

## 📊 Logging System

### Log Levels

```
[INFO]  - General information
[OK]    - Successful operations
[WARN]  - Warnings (non-fatal)
[ERROR] - Errors (may be recoverable)
```

### Log Locations

| Log Type | Location | Content |
|----------|----------|---------|
| Launcher | `logs/launcher-*.log` | All launcher operations |
| Server | `logs/server-*.log` | Server console output |
| Client | `logs/client-*.log` | Client console output |

### Log Retention

Logs are timestamped and never auto-deleted. Clean up manually:

```powershell
# Delete logs older than 7 days
Get-ChildItem logs\*.log | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item
```

---

## 🎯 Advanced Features

### Offline Mode

When network is unavailable:

```
1. Skip git pull
2. Use local code
3. Check dependencies
4. Start services normally
```

### Auto-Elevation

When admin rights needed:

```
1. Detect non-admin
2. Warn about limitations
3. Offer to restart as admin
4. Relaunch with elevation
5. Continue with full access
```

### Health Checks

After starting services:

```
1. Wait for initialization
2. Check if ports are listening
3. Warn if services failed
4. Show troubleshooting tips
```

---

## 📝 Command Line Options

Currently interactive only. Future versions may support:

```batch
launcher.bat --no-git      # Skip git pull
launcher.bat --no-browser  # Don't open browser
launcher.bat --admin       # Force admin mode
launcher.bat --help        # Show help
```

---

## 🔍 Troubleshooting

### Issue: "Not recognized as internal command"

**Cause:** Encoding issue with Chinese characters

**Solution:** 
- Use v2.0+ (all English)
- Or run: `chcp 65001` before running

### Issue: "Port already in use"

**Solution:**
1. Choose "Kill process" in launcher
2. Or manually: `Get-Process node | Stop-Process -Force`
3. Or restart computer

### Issue: "npm install fails"

**Solution:**
1. Check internet connection
2. Run as administrator
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and retry

### Issue: "Git pull fails"

**Solution:**
1. Check internet connection
2. Try: `ping github.com`
3. Use offline mode (option 1)
4. Check firewall/proxy settings

### Issue: "Services won't start"

**Solution:**
1. Check logs in `logs/` folder
2. Verify Node.js version (18+)
3. Check .env configuration
4. Run manually to see errors:
   ```
   cd server
   npm run dev
   ```

---

## 📈 Performance

### Startup Times

| Scenario | Time |
|----------|------|
| Cold start (first run) | 3-5 minutes |
| Warm start (dependencies installed) | 30-60 seconds |
| Hot start (no updates) | 20-30 seconds |

### Resource Usage

| Component | Memory | CPU |
|-----------|--------|-----|
| Launcher | ~10 MB | <1% |
| Server | ~200 MB | 1-5% |
| Client | ~150 MB | 1-3% |

---

## 🎉 Success Indicators

### Expected Output

```
========================================
       Hulu Lands Smart Launcher
              v2.0
========================================

[INFO] Checking environment...
  OK - Git found: git version 2.39.5
  OK - Node.js found: v18.20.4
  OK - npm found: 9.2.0

[INFO] Pulling latest code...
  OK - Code updated successfully

[INFO] Checking dependencies...
  OK - Server dependencies installed
  OK - Client dependencies installed

[INFO] Starting game services...
  OK - Server started on port 3002
  OK - Client started on port 3001
  OK - Browser opened

========================================
         Launch Complete!
========================================

Game Information:
  Client URL: http://localhost:3001
  Server Port: 3002
```

### Browser Should Show

- ✅ Login page loads
- ✅ No console errors
- ✅ WebSocket connects
- ✅ Can create character

---

## 🚀 Future Enhancements

Planned for v3.0:

- [ ] Auto-update notification
- [ ] Version rollback
- [ ] Backup before update
- [ ] Performance monitoring
- [ ] Resource usage dashboard
- [ ] One-click repair
- [ ] Multiple profile support
- [ ] Plugin system
- [ ] Custom themes
- [ ] Mobile companion app

---

## 📞 Support

### Documentation

| Document | Path |
|----------|------|
| Quick Start | `launcher/QUICK_START.md` |
| Features | `launcher/FEATURES.md` |
| Troubleshooting | `launcher/TROUBLESHOOTING.md` |
| This File | `launcher/README.md` |

### GitHub

- **Repository:** https://github.com/CNMJH/albion-lands
- **Issues:** https://github.com/CNMJH/albion-lands/issues
- **Releases:** https://github.com/CNMJH/albion-lands/releases

### Provide Information

When reporting issues, include:

1. **Launcher log:** `logs/launcher-*.log`
2. **Server log:** `logs/server-*.log`
3. **Client log:** `logs/client-*.log`
4. **Error screenshot:** F12 Console
5. **System info:** Windows version, Node.js version

---

## 📄 License

Part of Hulu Lands project.

---

**Last Updated:** 2024-03-12  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
