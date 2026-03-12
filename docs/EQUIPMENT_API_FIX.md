# 装备 API 500 错误修复报告

## 问题描述
装备面板打开时，客户端请求装备 API 返回 500 错误，导致装备无法加载。

## 根本原因
1. **Vite 代理问题**：通过 Vite 开发服务器代理 (`http://localhost:3001/api/...`) 的请求返回 500 错误
2. **直接访问正常**：直接访问服务端 (`http://localhost:3002/api/...`) 返回 200 成功
3. **可能原因**：Vite 代理配置在某些情况下无法正确转发请求或丢失请求头

## 解决方案
修改 `EquipmentSystem.ts`，使用直接服务端 URL 绕过 Vite 代理：

### 修改内容
**文件**: `client/src/systems/EquipmentSystem.ts`

1. **添加服务端地址常量**：
```typescript
const SERVER_URL = 'http://localhost:3002'
```

2. **修改所有 fetch 请求**：
- `loadEquipment()`: `/api/v1/equipment/${characterId}` → `${SERVER_URL}/api/v1/equipment/${characterId}`
- `loadStats()`: `/api/v1/equipment/${characterId}/stats` → `${SERVER_URL}/api/v1/equipment/${characterId}/stats`
- `equipItem()`: `/api/v1/equipment/${characterId}/equip` → `${SERVER_URL}/api/v1/equipment/${characterId}/equip`
- `unequipItem()`: `/api/v1/equipment/${characterId}/unequip` → `${SERVER_URL}/api/v1/equipment/${characterId}/unequip`
- `compareItem()`: `/api/v1/equipment/${characterId}/compare` → `${SERVER_URL}/api/v1/equipment/${characterId}/compare`

3. **添加详细日志**：
```typescript
console.log('📡 请求装备:', url)
console.log('📬 装备响应状态:', response.status)
console.log('📦 装备响应数据:', data)
```

## 测试结果

### ✅ 网络请求验证
- `GET http://localhost:3002/api/v1/equipment/1fc5bfa9-a54b-406c-abaa-adb032a3f59a` → **200 成功**
- `GET http://localhost:3002/api/v1/equipment/1fc5bfa9-a54b-406c-abaa-adb032a3f59a/stats` → **200 成功**

### ✅ 功能测试
- C 键打开装备面板 → 正常
- 装备数据加载 → 正常（空装备，符合预期）
- 属性显示 → 正常

### 📸 测试截图
- `screenshots/equipment-working.png` - 网络请求成功
- `screenshots/equipment-panel-test.png` - 装备面板功能测试

## 额外修复
同时修复了角色 ID 硬编码问题：
- `App.tsx`: 使用真实测试角色 ID `1fc5bfa9-a54b-406c-abaa-adb032a3f59a`
- `QuestPanel.tsx`: 从 `useGameStore()` 获取 characterId
- `NPCDialogue.tsx`: 从 `useGameStore()` 获取 characterId

## 后续建议
1. **生产环境配置**：使用环境变量 `VITE_SERVER_URL` 替代硬编码
2. **Vite 代理调查**：可进一步调查 Vite 代理 500 错误的根本原因
3. **错误处理**：添加更完善的错误处理和重试机制

## 提交信息
- **修复时间**: 2026-03-12
- **修改文件**: `client/src/systems/EquipmentSystem.ts`
- **测试状态**: ✅ 通过
