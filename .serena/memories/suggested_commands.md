# 常用命令（Darwin，项目根目录）

- 安装依赖：`npm install`
- 编译：`npm run compile`（tsc -p ./ → out/）
- 监听编译：`npm run watch`（VS Code 调试 preLaunchTask 使用）
- Lint：`npm run lint`（eslint src --ext ts）
- 自动化测试：`npm test`（pretest = compile + lint，随后 node ./out/test/runTest.js；会经 @vscode/test-electron 下载 VS Code，目前仅模板 Sample test）
- 打包：`npm run package`（npx vsce package；产物 wanwu-<version>.vsix，被 .gitignore 忽略）
- 发布：`npm run publish`（npx vsce publish，需市场凭证）
- 交互调试：VS Code “Run Extension”（F5，extensionDevelopmentPath=项目根）
- 查看 checkpoint 备份仓库（路径随 VS Code workspaceStorage 变化）：
  `git --git-dir="<storageUri>/backups/.git" --work-tree="<workspace>" log --oneline`
- 记忆完整性检查：`serena memories check`
