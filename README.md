# Qoder Clone for Obsidian

仿 Qoder 的 AI 聊天助手 Obsidian 插件（Qoder Clone）：侧边栏对话面板、流式输出、多会话管理、BYOK（自带 API Key，兼容 OpenAI / 阿里云百炼 DashScope 接口）。

界面与交互设计参照开源项目 [Continue](https://github.com/continuedev/continue)（Apache 2.0），代码为独立实现。

## 功能特性

- **登录系统**：支持 9 个服务商（阿里云百炼 DashScope、OpenAI、DeepSeek、Moonshot Kimi、智谱 GLM、硅基流动、Ollama 本地、OpenRouter、Groq），登录时真实校验 API Key，登录态持久化，支持退出登录
- **聊天面板**：仿 Qoder 界面 —— 欢迎页、推荐提问、模型下拉切换、底部输入盒、状态栏
- **流式输出**：逐字流式回复，生成中可随时停止
- **多会话管理**：会话历史列表（标题/消息数/时间），支持切换、重命名、导出为 Markdown、删除
- **@ 上下文引用**：输入 `@` 搜索并引用库内笔记作为上下文
- **划词提问**：编辑器选中文本 → 选区稳定后自动引用到聊天输入框（也可用右键菜单或命令「划词提问」），直接输入问题发送
- **拖拽附加文件**：把库内笔记或外部文本文件拖到输入盒，自动附加为对话上下文
- **笔记上下文**：提问时自动附带当前打开笔记的内容（可开关、可设截断长度）
- **代码块操作**：回复中的代码块支持一键复制、插入当前笔记
- **Inline Chat**：编辑器选中文本 → 输入改写指令 → Diff 预览（绿加/红删）→ 接受后应用
- **Rules 规则**：库根目录 `.qoder-rules/*.md` 中的规则自动注入对话，支持 frontmatter `alwaysApply: false` 关闭单条
- **Agent 文件修改**：开启 Agent 模式后，AI 可输出文件编辑指令（创建/覆写/局部替换），以 Diff 审批卡片展示，用户确认后才会真正修改库内文件

## 安装

### 手动安装

将本仓库的 `main.js`、`manifest.json`、`styles.css`、`versions.json` 复制到：

```
<你的库>/.obsidian/plugins/obsidian-qoder-chat/
```

然后在 Obsidian 中：设置 → 第三方插件 → 关闭安全模式 → 启用 Qoder Clone。

### 从源码构建

```bash
npm install
npm run build
```

## 使用

1. 点击左侧边栏机器人图标打开面板，首次使用进入登录页
2. 在登录页下拉选择服务商（自动填充 Base URL 与默认模型），输入对应 API Key，点击登录；Ollama 本地服务无需密钥
3. 登录后即可对话；输入 `@` 引用库内笔记；在输入框上方切换模型
4. Inline Chat：选中笔记文本 → 命令面板执行「Inline Chat：AI 改写选中文本」
5. Agent 文件修改：点击输入框旁「Agent」按钮开启 → 直接要求 AI 修改/创建笔记 → 回复中以审批卡片展示修改内容 → 点击「应用」或「拒绝」
6. 划词提问：编辑器选中文本 → 选区稳定后自动引用到输入框（或右键菜单/命令面板「划词提问」）→ 直接输入问题发送
7. 拖拽附加：把库内笔记（文件树）或外部文本文件拖到输入盒，自动附加为上下文

### Rules 示例

在库根目录创建 `.qoder-rules/style.md`：

```markdown
---
alwaysApply: true
---
回答必须使用中文，语气简洁专业。
```

## 安全说明

- API Key 仅保存在本机 Obsidian 插件数据中，不会上传到任何第三方
- 本插件不依赖任何云端服务，除你配置的大模型 API 外无其他网络请求

## 许可证

MIT。界面与交互模式参照 Continue（Apache 2.0, © Continue Dev, Inc.）。
