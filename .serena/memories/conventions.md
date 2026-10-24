# 代码约定

- 命令 ID 一律 `wanwu.` 前缀；UI 文案中文；不要重新引入旧品牌命名。
- Agent 列表由 `wanwu.agents` 配置驱动；代码中的 `DEFAULT_AGENTS` 仅作为缺省回退，新增 Agent 不应修改代码。
- 缩进：`src/ui.ts`、`src/conversation.ts` 统一 4 空格；`src/extension.ts` 顶层函数/activate 用 Tab、类成员用 4 空格——按所在区块跟随，勿整文件重排。
- 单引号、语句分号、`import * as vscode from 'vscode'` 命名空间导入。
- 私有方法/字段用 `_camelCase`；管理器单例使用 static `instance` + `getInstance(...)`，并提供 `dispose()`。
- 子进程：方法内 `const { exec } = require('child_process')`，以 `new Promise((resolve,reject)=>exec(cmd, cb))` 包装；倾向拼接 shell 命令字符串（存在转义/注入风险，修改时保持谨慎）。
- 错误处理：try/catch 后用 `vscode.window.showErrorMessage` 输出中文提示；exec 回调参数常标 `any`，尽管 tsconfig 为 strict。
- 状态提示集中在 UIManager（状态栏/消息/QuickPick）；业务类不直接操作状态栏。
- 终端实例集中在 `agentTerminals` Map，通过 `onDidCloseTerminal` 清理；不要在多个位置各自缓存终端。
- 功能代码没有自动化测试；不要假设已有覆盖。
