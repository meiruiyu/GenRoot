# MemoryBridge 记忆创建流程 - Hackathon 版

## 已实现功能

✅ **完整的记忆创建工作流程：**
1. 📷 破冰问题生成（photo + prompt）
2. 🎙 极简录音界面
3. ▶ 录音预览和回放
4. 🤖 AI 处理：转写 + 翻译 + 摘要 + 实体抽取
5. 👀 结果审核（用户确认）
6. 💾 本地 localStorage 保存
7. 📚 档案库查看已保存记忆

## 用户流程

### Step 1: 进入创建页面
- 访问 `/create`
- 选择或上传一张照片，或输入简短提示（如"1990年过年"）
- 点击"生成破冰问题"

### Step 2: 进入录音
- 系统跳转到 `/record` 页面
- 显示照片 + AI 生成的破冰问题
- 点击中央大麦克风按钮开始录音
- 停止录音

### Step 3: 预览
- 显示录音时长
- 可试听录音
- 点击"AI 处理 · 继续"发送到后端处理

### Step 4: AI 处理
- 后端调用 `/api/ai/transcribe`
- 返回：转写、翻译、摘要、实体抽取、公开版本

### Step 5: 结果审核
- 展示完整的处理结果
- 显示提取的信息（人物、地点、年代、事件）
- 用户可以"返回重新录制"或"确认保存到档案"

### Step 6: 保存
- 点击"确认保存到档案"
- 记忆保存到 localStorage
- 自动跳转到成功页面

### Step 7: 查看档案
- 访问 `/archive`
- 看到已保存的记忆列表
- demo 记忆和自建记忆并列展示

## 技术架构

### Frontend 组件树
```
/create/page.tsx
  └─ CreateMemoryDemo
      └─ 破冰问题生成 + 转向 /record

/record/page.tsx
  └─ RecordingStudio (3 状态)
      ├─ Recording
      ├─ Preview
      └─ Results + Done

/archive/page.tsx
  └─ ArchiveClient
      └─ 读取本地 SavedMemory[] + demo 数据
```

### Storage
```typescript
// localStorage 中保存的结构
SavedMemory {
  id: string
  createdAt: string
  title: string
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
  audioUrl: string (blob URL，本地播放用)
}
```

### API 端点
```
POST /api/ai/transcribe
  Input: { audioBase64 }
  Output: {
    provider: "mock" | "minimax"
    transcript: string
    translation: string
    summary: string
    entities: { people, locations, years, events }
    publicSafeVersion: string
    tags: string[]
  }
```

## Hackathon Demo 流程建议

1. **打开首页** `/` - 展示产品 tagline
2. **点击"新建记忆"** → `/create`
   - 展示破冰介面
   - 可上传一张照片或输入"1990年过年"
3. **点击"生成破冰问题"**
   - AI 生成 3 个问题选项
4. **选择一个问题** → 自动进入 `/record`
   - 显示照片 + 问题
   - 点击麦克风开始录音（演示可以简短录音"这是一个关于家族的故事"）
5. **停止录音** → 预览
   - 播放音频
   - 点击"AI 处理"
6. **等待处理**（显示加载动画）
   - 后端返回转写 + 翻译 + 摘要
7. **查看结果审核页**
   - 展示转写文本、翻译、摘要、提取的实体
   - 点击"确认保存到档案"
8. **成功页** + 点击"查看档案"
   - 进入 `/archive` 看已保存的记忆

## 配置

### 环境变量
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...  # 已配置
MINIMAX_API_KEY=...  # 已配置，如果留空则使用 mock 数据
```

## 已知限制

- 音频使用 WebM 格式（浏览器直接录音）
- 本地存储使用 localStorage（容量限制 ~5-10MB）
- AI 处理目前使用 mock 实现，真正的 MiniMax 集成可在后续完成
- 未实现音频持久化到外部存储

## 后续可扩展

1. ✪ 真实 MiniMax API 集成（替换 mock 实现）
2. ✪ 将记忆发布到公共地图 `/explore`
3. ✪ 多语言支持（苗语、粤语等）
4. ✪ 音频云存储（AWS S3、云对象存储）
5. ✪ 家族树关联
6. ✪ 私密分享（加密链接）
