# GenRoot — 家族记忆传承平台

> 在声音消逝之前，将它留住。

GenRoot 是一个 AI 驱动的平台，帮助家庭以音频形式保存跨代际故事，并可选择将其作为活态文化遗产分享到公共地图上。

**演示视频：** [在 Google Drive 上观看](https://drive.google.com/file/d/1oR3q_yE8zME4gVeoz6HbHzn_z90sKbB9/view?usp=sharing)

---

## 我们要解决什么问题

老一辈人承载着无可替代的记忆——民谣、迁徙故事、传统手艺——但年轻的家庭成员往往缺少一种自然、低门槛的方式去记录它们。GenRoot 让录制过程像一场对话，而不是一次采访。

---

## 核心功能

### 为记录家族故事的家人

- **AI 破冰问题生成** — 上传一张照片或输入文字提示（如"1990年过年"），应用自动生成 3 个情境化的引导问题，帮助打开话匣子
- **适老化录制界面** — 专为老人设计的极简 UI：一张照片、一个问题、一个大号麦克风按钮
- **实时语音转文字** — 通过 MiniMax Realtime API 实现实时转录，支持 Web Speech API 作为备用
- **完整 AI 处理流程** — 录制完成后自动执行：语音转文字、中英文翻译、2–3 句摘要、命名实体提取（人物、地点、年份、事件）
- **隐私分级控制** — 三个级别：`private`（仅自己）、`family`（家庭成员共享）、`public`（发布到文化地图，自动脱敏）
- **记忆档案馆** — 个人记忆时间线，支持音频回放和 AI 生成的元数据浏览

### 为探索文化遗产的用户

- **互动文化地图** — 基于 Mapbox 的地图，展示带地理位置的公开家族故事，按遗产类型（手艺、仪式、人物、地点）聚合
- **筛选与发现** — 按文化标签、故事类型或地区（贵州、广东、纽约等）浏览

### 家族知识问答

- **问问家人** — 基于记忆档案的对话界面。提问如"奶奶的迁徙故事意味着什么？"，获得有上下文的回答

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | Next.js 14、React 18、TypeScript |
| 样式 | Tailwind CSS、styled-components |
| 地图 | Mapbox GL JS |
| 家谱 | react-family-tree、ReactFlow |
| AI / 语音 | MiniMax API（ASR、翻译、摘要、NER） |
| 后端 | FastAPI（Python）、SQLAlchemy、SQLite |
| HTTP | Axios、httpx（异步） |

---

## 项目结构

```
genRoot/
├── frontend/                  # Next.js 14 应用
│   └── src/
│       ├── app/               # 页面与 API 路由
│       │   ├── page.tsx       # 首页
│       │   ├── create/        # 记忆触发（照片/文字 → 破冰问题）
│       │   ├── record/        # 录制工作室
│       │   ├── archive/       # 个人记忆时间线
│       │   ├── explore/       # 公开文化地图
│       │   ├── ask-family/    # 家族知识问答
│       │   ├── memories/[id]/ # 记忆详情页
│       │   └── api/ai/        # 服务端 AI 路由
│       │       ├── icebreakers/
│       │       ├── transcribe/
│       │       ├── enrich/
│       │       ├── ask/
│       │       ├── tts/
│       │       └── public-version/
│       ├── components/        # React UI 组件
│       └── lib/               # 类型定义、存储、示例数据、AI 提供者
│
├── backend/                   # FastAPI 服务
│   ├── main.py
│   ├── api/routes/            # users, family_trees, stories, photos
│   ├── models/                # SQLAlchemy ORM
│   ├── schemas/               # Pydantic 数据校验
│   └── services/              # MiniMax API 封装
│
└── uploads/                   # 音频与图片存储
```

---

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- [MiniMax API Key](https://www.minimaxi.com/)（可选，未配置时使用模拟数据）
- [Mapbox Access Token](https://mapbox.com/)（用于探索地图功能）

### 前端

```bash
cd frontend
npm install
cp .env.local.example .env.local   # 填入 API 密钥
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 环境变量

**`frontend/.env.local`**
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...
MINIMAX_API_KEY=sk-...
MINIMAX_GROUP_ID=...
```

**`backend/.env`**
```env
MINIMAX_API_KEY=sk-...
MINIMAX_API_BASE=https://api.minimax.io/v1
DATABASE_URL=sqlite:///./test.db
```

---

## 用户流程

```
首页
 └─ 创建记忆
      ├── 上传照片或输入文字提示
      └── AI 生成 3 个破冰问题
           └─ 选择问题 → 录制工作室
                ├── 录制音频（实时转录）
                └── AI 处理
                     ├── 转录文字 + 翻译
                     ├── 摘要 + 实体提取
                     └── 设置隐私 → 保存
                          ├── 档案馆（个人时间线）
                          ├── 探索（公开文化地图）
                          └── 问问家人（知识问答）
```

---

## 常用命令

```bash
# 前端
npm run dev       # 开发服务器
npm run build     # TypeScript 检查 + 生产构建
npm run start     # 生产服务器
npm run lint      # ESLint 代码检查

# 后端
uvicorn backend.main:app --reload   # 开发服务器
```

---

## 设计原则

- **适老化优先** — 录制界面刻意保持极简：大号点击区域，无冗余导航，无需复杂决策
- **默认私密** — 记忆默认仅自己可见，用户主动选择才会分享；公开版本在发布前自动脱敏
- **AI 是助手，不是守门人** — 每个 AI 生成的字段（转录、摘要、实体）在保存前均可查看和编辑

---

## 演示步骤

1. `/` — 首页
2. `/create` — 输入"1990年过年"或上传家庭照片 → 生成破冰问题
3. 选择一个问题 → `/record`
4. 录制 10–15 秒音频 → 预览 → 点击 **AI 处理**
5. 查看转录文字、翻译、摘要和提取的实体信息
6. 确认保存
7. `/archive` — 在个人时间线中查看这条记忆
8. `/explore` — 浏览公开文化地图
9. `/ask-family` — 与家族记忆档案对话
