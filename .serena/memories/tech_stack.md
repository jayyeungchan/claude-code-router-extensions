# 技术栈

- TypeScript 4.9.4；`target ES2020`、`module commonjs`、`strict true`、`rootDir src`、`outDir out`、sourceMap。
- VS Code 扩展：`engines.vscode ^1.74.0`、`@types/vscode ^1.74.0`；`activationEvents: []`，依赖 VS Code ≥1.74 对 contributed commands 的自动激活。
- 无运行时 npm 依赖；运行时依赖系统 `git`（checkpoint）和 `ccr` CLI（仅在终端里调用）。
- 开发依赖：eslint 8 + @typescript-eslint 5、mocha 10、@vscode/test-electron 2、@types/node 16。
- 构建：纯 `tsc`，无 esbuild/webpack；打包用 `npx vsce`（见 scripts）。
- 本机验证环境：Darwin + Node v26 可正常 compile/lint；项目无 `engines.node` 约束。
