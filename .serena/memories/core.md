# Wanwu — 多 Agent CLI 启动器与工作区检查点扩展

包名 `wanwu`，当前 0.0.4。命令 ID 前缀 `wanwu.`，界面文案中文；项目中不再使用旧品牌命名。

## 源码地图
- `src/extension.ts` — `activate()` 注册全部 8 个 `wanwu.*` 命令；Agent 启动：`AgentConfig`、`DEFAULT_AGENTS`、`agentTerminals`、`getAgents`、`openAgentTerminal`、`launchAgent`、`openAgentSettings`；`CheckpointManager` 实现 checkpoint；`openRouterConfig` 打开或创建 `~/.claude-code-router/config.json`；顶层 `checkpointManager` 与 `conversationManager` 在 `activate` 中初始化。
- `src/ui.ts` — `UIManager` 单例：状态栏（`$(play-circle) Wanwu`，command=`wanwu.createCheckpoint`）、消息、QuickPick、恢复提示。
- `src/conversation.ts` — `ConversationManager` 单例：会话 JSON 持久化、`index.json`、导入/导出、30 天清理；数据结构 `ConversationData`。
- `src/test/` — VS Code 模板测试脚手架，仅有 Sample test。

## Agent 启动
- `wanwu.agents` 为 machine 作用域数组，默认 Claude/`claude`、Codex/`codex`、Pi/`pi`、OpenCode/`opencode`、Qoder/`qodercli`；`command` 可为完整命令行。
- QuickPick 每次读取最新配置，末尾“管理 Agent 列表…”打开 `wanwu.agents` 设置；空白/无效条目过滤；空列表提示并提供“打开设置”。
- 终端按 `${label}::${command}` 缓存在 `agentTerminals`；重复选择只 `show()`，不重发命令；终端关闭时从 Map 移除。
- 使用 `vscode.window.createTerminal({ location: { viewColumn: ViewColumn.Beside } })` 直接创建侧边终端，不再依赖命令 + 延时 + `activeTerminal`。

## Checkpoint / 会话不变量
- 备份仓库 = `{context.storageUri}/backups/.git`，`--work-tree` = 首个 workspace folder；提交者固定 `Wanwu Checkpoint <checkpoint@wanwu.local>`；与项目自身 `.git` 完全隔离。
- `CheckpointManager._commits` 仅内存保存；扩展重载后 `wanwu.restoreCheckpoint` 的列表为空，但会话文件中的 checkpoint 记录仍保留。
- 恢复执行 `git checkout <sha> -- .`：只覆盖该提交中存在的路径，不删除 checkpoint 之后新增的文件。
- 无变更也会 `--allow-empty` 提交；消息前缀 `Initial backup:` / `Before:` / `Checkpoint (no changes):`。
- 会话持久化在 `{storageUri}/conversations` + `index.json`；会话命令依赖 activate 中初始化的 `conversationManager`，缺失时会抛错。
- 创建 checkpoint 后仅更新状态栏提示；旧的文本装饰器与未注册恢复命令已删除。
- 多数命令依赖已打开 workspace；`storageUri` 为 undefined 时代码回退到空字符串，会生成错误路径。

## 相关记忆
- 依赖与语言版本 → `mem:tech_stack`
- 开发/测试/调试/打包命令 → `mem:suggested_commands`
- 代码风格与实现模式 → `mem:conventions`
- 完成定义与发布步骤 → `mem:task_completion`
