import * as vscode from 'vscode';

let ccrTerminal: vscode.Terminal | undefined;
// 新增：编辑器区域的终端
let editorTerminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Claude Code Router 扩展已激活!');

	// 注册 start ccr 命令
	const startCcrCommand = vscode.commands.registerCommand('ccr.start', () => {
		startCcrTerminal();
	});

	// 注册 ccr code 命令
	const ccrCodeCommand = vscode.commands.registerCommand('ccr.code', () => {
		executeCcrCode();
	});

	// 新增：注册在编辑器侧边打开终端的命令
	const openTerminalEditorSideCommand = vscode.commands.registerCommand('ccr.openTerminalEditorSide', () => {
		openTerminalEditorSide();
	});

	context.subscriptions.push(
		startCcrCommand, 
		ccrCodeCommand, 
		openTerminalEditorSideCommand
	);

	// 监听终端关闭事件
	vscode.window.onDidCloseTerminal((terminal) => {
		if (terminal === ccrTerminal) {
			ccrTerminal = undefined;
		}
		if (terminal === editorTerminal) {
			editorTerminal = undefined;
		}
	});
}

// 新增：在编辑器侧边打开终端并执行 ccr code
function openTerminalEditorSide() {
	// 获取当前工作区的根目录
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('请先打开一个工作区');
		return;
	}

	// 如果编辑器终端已存在，显示它并执行 ccr code；否则创建新的
	if (editorTerminal) {
		editorTerminal.show();
		setTimeout(() => {
			if (editorTerminal) {
				editorTerminal.sendText('ccr code');
			}
		}, 300);
		vscode.window.showInformationMessage('编辑器终端已显示，正在执行 ccr code...');
		return;
	}

	// 创建终端，配置为在编辑器侧边显示
	editorTerminal = vscode.window.createTerminal({
		name: 'CCR 编辑器终端',
		cwd: workspaceFolder.uri.fsPath,
		message: '🚀 Claude Code Router - 编辑器终端已启动\n正在自动执行 ccr code...\n',
		// 设置终端位置为编辑器侧边
		location: vscode.TerminalLocation.Editor
	});

	// 显示终端
	editorTerminal.show();
	
	// 发送欢迎信息并自动执行 ccr code
	setTimeout(() => {
		if (editorTerminal) {
			editorTerminal.sendText('echo "🚀 CCR 编辑器侧边终端已启动！"');
			editorTerminal.sendText('echo "📍 当前目录: $(pwd)"');
			editorTerminal.sendText('echo "⚡ 正在自动启动 ccr code..."');
			editorTerminal.sendText('');
			// 自动执行 ccr code 命令
			editorTerminal.sendText('ccr code');
		}
	}, 800);

	vscode.window.showInformationMessage('CCR 编辑器终端已在侧边打开，正在自动执行 ccr code...');
}

function startCcrTerminal() {
	// 获取当前工作区的根目录
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('请先打开一个工作区');
		return;
	}

	// 如果终端已存在，显示它；否则创建新的终端
	if (ccrTerminal) {
		ccrTerminal.show();
		vscode.window.showInformationMessage('CCR 终端已打开');
	} else {
		ccrTerminal = vscode.window.createTerminal({
			name: 'CCR Terminal',
			cwd: workspaceFolder.uri.fsPath,
			message: 'Claude Code Router 终端已启动\n输入 "ccr code" 开始使用'
		});
		ccrTerminal.show();
		vscode.window.showInformationMessage('CCR 终端已创建并打开');
	}
}

function executeCcrCode() {
	// 确保终端存在
	if (!ccrTerminal) {
		startCcrTerminal();
		// 等待终端创建完成后执行命令
		setTimeout(() => {
			if (ccrTerminal) {
				ccrTerminal.sendText('ccr code');
			}
		}, 500);
	} else {
		ccrTerminal.show();
		ccrTerminal.sendText('ccr code');
	}
	
	vscode.window.showInformationMessage('已执行 CCR Code 命令');
}



export function deactivate() {
	if (ccrTerminal) {
		ccrTerminal.dispose();
	}
	if (editorTerminal) {
		editorTerminal.dispose();
	}
}