# Wanwu

Wanwu 是一个 VS Code 扩展：点击编辑器标题栏图标即可选择并启动常用的 Agent CLI，同时提供工作区 checkpoint 与会话管理。

## 功能

### Agent 启动器

- 点击编辑器标题栏的 Wanwu 图标，或执行 `Wanwu: Open Agent Terminal`
- 在 QuickPick 中选择 Agent，自动在侧边终端执行对应命令
- 内置 Claude (`claude`)、Codex (`codex`)、Pi (`pi`)、OpenCode (`opencode`)、Qoder (`qodercli`)
- 每个 Agent 使用独立终端；再次选择同一 Agent 时聚焦已有终端，不重复发送命令
- 列表可通过 `wanwu.agents` 配置，无需修改插件即可新增 Agent 或命令

### Checkpoint

- 创建前将工作区文件提交到独立 Git 备份仓库
- 支持从历史 checkpoint 恢复文件
- 备份仓库与项目自身 `.git` 完全隔离
- checkpoint 与当前会话关联，记录对应的用户消息

### 会话管理

- 新建、加载、导出、导入会话
- 会话与 checkpoint 记录持久化在扩展存储目录

### 路由配置

- `Wanwu: Open Router Config` 打开或创建 `~/.claude-code-router/config.json`

## 命令

| 命令 | ID |
| --- | --- |
| Wanwu: Open Agent Terminal | `wanwu.openAgentTerminal` |
| Wanwu: Open Router Config | `wanwu.openRouterConfig` |
| Wanwu: Create Checkpoint | `wanwu.createCheckpoint` |
| Wanwu: Restore Checkpoint | `wanwu.restoreCheckpoint` |
| Wanwu: New Conversation | `wanwu.newConversation` |
| Wanwu: Load Conversation | `wanwu.loadConversation` |
| Wanwu: Export Conversation | `wanwu.exportConversation` |
| Wanwu: Import Conversation | `wanwu.importConversation` |

## 配置 Agent 列表

默认配置如下（用户设置 `settings.json`）：

```json
{
  "wanwu.agents": [
    { "label": "Claude", "command": "claude" },
    { "label": "Codex", "command": "codex" },
    { "label": "Pi", "command": "pi" },
    { "label": "OpenCode", "command": "opencode" },
    { "label": "Qoder", "command": "qodercli" }
  ]
}
```

新增 Agent 只需追加条目：

```json
{
  "wanwu.agents": [
    { "label": "Claude", "command": "claude" },
    { "label": "Aider", "command": "aider --model gpt-4" },
    { "label": "Dev Server", "command": "npm run dev" }
  ]
}
```

- `label`：QuickPick 与终端标题中的名称
- `command`：在终端执行的完整命令行，可以是任意命令
- `wanwu.agents` 的作用域为 `machine`，只能在用户设置中配置，工作区设置不会覆盖
- QuickPick 底部的“管理 Agent 列表…”可直接打开该设置
- 空白或缺少 `label`/`command` 的条目会被自动忽略

## 使用

### 启动 Agent

1. 打开一个工作区
2. 点击编辑器标题栏的 Wanwu 图标，或从命令面板执行 `Wanwu: Open Agent Terminal`
3. 在 QuickPick 中选择 Agent
4. Wanwu 在编辑器侧边创建终端并执行对应命令

再次选择同一 Agent 会聚焦已有终端。若要启动全新会话，先关闭该终端。

### 创建与恢复 Checkpoint

1. 执行 `Wanwu: Create Checkpoint`
2. 输入本次 checkpoint 的描述
3. 状态栏显示创建进度与结果
4. 执行 `Wanwu: Restore Checkpoint`，从列表中选择要恢复的 checkpoint

### 会话管理

- `Wanwu: New Conversation`：创建新会话
- `Wanwu: Load Conversation`：加载历史会话
- `Wanwu: Export Conversation`：导出为 JSON
- `Wanwu: Import Conversation`：从 JSON 导入，自动分配新 ID

## 数据存储

### Checkpoint 备份仓库

- 位置：`{扩展存储目录}/backups/.git`
- 工作区：当前第一个 workspace folder
- 提交者：`Wanwu Checkpoint <checkpoint@wanwu.local>`
- 实现：`git --git-dir="<backup>/.git" --work-tree="<workspace>" ...`

备份仓库与项目自身的 Git 仓库完全隔离，不会修改项目的提交历史或工作区状态（恢复时除外）。

### 会话数据

- 位置：`{扩展存储目录}/conversations/`
- 索引：`{扩展存储目录}/conversations/index.json`

### 路由配置

- 路径：`~/.claude-code-router/config.json`
- 文件不存在时，`Wanwu: Open Router Config` 会自动创建目录和空 JSON 骨架

## 已知行为

- `Restore Checkpoint` 的列表来自内存：扩展重新加载后只能看到本次激活期间创建的 checkpoint；会话文件中的历史记录仍保留，但不会出现在恢复列表
- 恢复执行 `git checkout <sha> -- .`，只覆盖该 checkpoint 中存在的路径，不会删除 checkpoint 之后新增的文件
- 即使工作区没有文件变更，checkpoint 也会创建空提交，保证时间线连续
- `storageUri` 不可用时（例如未打开工作区），checkpoint 与会话命令无法正常工作

## 环境要求

- VS Code 1.74 或更高版本
- Git
- 各 Agent CLI 已安装并在终端 `PATH` 中，例如：

```bash
which claude codex pi opencode qodercli
```

## 开发

```bash
npm install
npm run compile   # 编译到 out/
npm run watch     # 监听编译
npm run lint      # ESLint
npm test          # 扩展测试（当前仅模板样例）
npm run package   # 打包 vsix
npm run publish   # 发布到市场
```

在 VS Code 中选择 “Run Extension”（F5）可启动扩展开发宿主。

## 故障排查

- **终端提示 command not found**：确认对应 CLI 已安装，且 VS Code 终端使用的 shell 能读取到其 `PATH`
- **提示请先打开一个工作区**：打开任意文件夹后重试
- **Checkpoint 创建失败**：确认 Git 已安装、扩展存储目录可写、磁盘空间充足
- **恢复后新增文件仍在**：这是当前恢复语义，需手动删除 checkpoint 之后新增的文件
- **升级后快捷键失效**：0.0.4 变更了命令 ID 命名空间，请将自定义快捷键更新为新的 `wanwu.*` 命令 ID

## 许可证

MIT License
