# 任务完成标准

- 任何代码改动后：`npm run compile && npm run lint` 必须通过。
- 涉及 Agent 启动的改动：用 F5 “Run Extension” 在扩展宿主中验证：
  - 右上角图标与命令 `Wanwu: Open Agent Terminal` 弹出 QuickPick
  - 五个默认 Agent 分别执行正确命令
  - 同一 Agent 再次选择只聚焦已有终端
  - 取消选择无操作
  - 修改 `wanwu.agents` 后立即生效；空列表与无效条目有提示
- 涉及 checkpoint、会话、`storageUri` 的改动必须在扩展宿主验证；纯 Node 环境拿不到 storageUri。
- 发布前：更新 `package.json` version 与 `CHANGELOG.md`，再 `npm run package` 生成 vsix。
- `npm test` 仅有模板 Sample test，不能作为功能回归依据。
- 完成后可运行 `serena memories check` 检查记忆引用是否失效。
