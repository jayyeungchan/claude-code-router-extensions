# Change Log

## [0.0.4] - 2026-10-24

### Added

- Agent 启动器：点击编辑器标题栏图标后选择 Agent，并在侧边终端启动
- `wanwu.agents` 用户级配置，默认 Claude / Codex / Pi / OpenCode / Qoder
- 每个 Agent 独立终端缓存，重复选择时聚焦已有终端

### Changed

- 命令 ID 命名空间迁移到 `wanwu.*`，命令分类与状态栏统一为 Wanwu
- 扩展 ID 变更为 `WanwuCLI.wanwu-cli`，发布者迁移至 WanwuCLI
- 移除旧的终端启动命令及其实现
- 将 checkpoint 提供类重命名为 `CheckpointManager`
- 路由配置命令改为 `wanwu.openRouterConfig`
- 侧边终端改用 `vscode.window.createTerminal` + `ViewColumn.Beside`，移除 800ms 等待

### Fixed

- 会话命令此前因 `getConversationManager` 恒抛错而不可用
- 删除无法触发的恢复装饰器与未注册命令

### Breaking

- 自定义快捷键需要更新为新的 `wanwu.*` 命令 ID

## [0.0.3]

- 新增 checkpoint 与会话管理功能

## [0.0.1]

- Initial release
