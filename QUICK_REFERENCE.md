# 🎯 MemoryBridge - 快速参考卡

## 核心功能流程

```
📍 /create
   ↓ 输入提示 + 照片
🤖 生成破冰问题
   ↓ 选择问题
🎙️  /record
   ↓ 录音 10-15s
▶️  预览回放
   ↓ 确认
⚙️  /api/ai/transcribe
   ↓ 处理 AI
📋 结果审核
   ↓ 确认
💾 localStorage 保存
   ↓ 成功
📚 /archive
   ↓ 查看记忆
```

## API 端点

### 已有
- `POST /api/ai/icebreakers` - 生成破冰问题
- `POST /api/ai/enrich` - 富化文本数据

### 新增
- `POST /api/ai/transcribe` ✨
  - Input: `{ audioBase64 }`
  - Output: 转写 + 翻译 + 摘要 + 实体 + 公开版本

## 数据结构

```typescript
// 保存的记忆
SavedMemory {
  id: string
  createdAt: string
  title: string
  memberName: string
  location: string
  language: string
  audioUrl: string
  duration: string
  transcript: string
  translation: string
  summary: string
  tags: string[]
  entities: {
    people: string[]
    locations: string[]
    years: string[]
    events: string[]
  }
  publicSafeVersion: string
  provider: "mock" | "minimax"
}
```

## 文件位置

### 关键组件
- `src/components/RecordingStudio.tsx` - 录音 + 结果审核
- `src/components/ArchiveClient.tsx` - 档案库展示
- `src/app/api/ai/transcribe/route.ts` - AI 处理

### 存储函数
- `src/lib/storage.ts`
  - `readAllMemories()` - 读取全部
  - `saveMemory(memory)` - 保存
  - `deleteMemory(id)` - 删除

## 快速测试

```bash
# 启动
cd frontend && npm run dev

# 浏览器打开
http://localhost:3000

# 演示路径
/create → 输入 "1990年过年" → 生成问题 
→ 选择问题 → 录音 10s → 结果 → 保存 → 查看档案
```

## 状态机（RecordingStudio）

```
idle
  ↓ startRecording()
recording (波形动画)
  ↓ stopRecording()
preview (可试听)
  ↓ submitRecording()
processing (加载中)
  ↓ API 返回
results (展示结果)
  ↓ saveToArchive()
done (成功页)
```

## localStorage 键值

```javascript
// 保存位置
localStorage["memory-roots:memories"]

// 例如
[
  {
    id: "mem_1712761234567",
    title: "奶奶的故事",
    summary: "...",
    transcript: "这是一个关于家族的故事",
    // ... 其他字段
  }
]
```

## 模拟数据来源

```typescript
// src/lib/demo-data.ts
demoArchive.memories[]      // 4 个 demo 记忆
demoArchive.members[]       // Yang Family 4 位成员
demoArchive.publicStories[] // 公共地图数据
```

## 环境变量

```bash
# .env 已配置
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...
MINIMAX_API_KEY=sk-api-... # 可选，无则使用 mock

# 激活真实 API
export AI_PROVIDER=minimax  # 或 mock
```

## 性能指标

| 指标 | 值 |
|------|-----|
| 首屏加载 | 788ms |
| 转录处理 | 3-5s (mock) |
| 本地保存 | < 10ms |
| localStorage 容量 | ~5-10MB |

## 常见问题排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 无法录音 | 浏览器权限 | 允许麦克风访问 |
| 音频播放失败 | 浏览器不支持 WebM | 使用 Chrome/Firefox |
| 保存失败 | 存储满 | 清空 localStorage |
| AI 处理慢 | Mock 生成延迟 | 等待或切换到真实 API |

## 代码改动亮点

### RecordingStudio 重写
- ✅ 5 状态清晰分离
- ✅ 预览流程完整
- ✅ 错误恢复路径
- ✅ 结果审核 UI

### 存储系统扩展
- ✅ SavedMemory 类型定义
- ✅ 本地记忆持久化
- ✅ 读写函数完整
- ✅ 删除支持

### 档案库更新
- ✅ 已保存记忆展示
- ✅ Demo + 自建合并
- ✅ 音频播放器集成
- ✅ 统计信息展示

## 下一步扩展

```javascript
// 短期 (1-2 小时)
- 真实 MiniMax 集成
- 错误处理完善
- 加载状态优化

// 中期 (1-2 天)
- 发布到公共地图
- 家族树关联
- 搜索功能

// 长期 (1-2 周)
- 云存储
- 用户认证
- 导出功能
- 社交分享
```

## 演示脚本 (3 分钟版本)

```
1. "这是 MemoryBridge - 记录家族声音的应用" (10s)
2. 点 /create，输入 "1990年过年" (10s)
3. 生成破冰问题，选择一个 (5s)
4. 进入录音，说段故事 (15s)
5. 预览音频 (5s)
6. AI 处理结果审核 (10s)
7. 保存成功，查看档案 (10s)
8. "完整的从录音到保存的闭环" (5s)

总计: 70 秒
```

## 关键指令速查

```bash
# 开发
npm run dev                    # 启动服务
npm run build                  # 编译打包
npm run lint                   # 检查代码

# 调试
localStorage.clear()          # 清空存储
console.log(readAllMemories()) # 查看记忆

# 部署
npm run build                  # Production 编译
npm start                      # 启动生产服务
```

---

**项目状态: ✅ Hackathon 就绪**  
**最后更新: 2026-04-11**  
**维护者: MemoryBridge Team**
