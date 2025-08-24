import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// 会话数据接口
export interface ConversationData {
    id: string;
    title: string;
    messages: Array<{
        role: string;
        content: string;
        timestamp: number;
        checkpoint?: string;
    }>;
    checkpoints: Array<{
        sha: string;
        message: string;
        timestamp: number;
        userMessage: string;
    }>;
    timestamp: number;
    lastUpdated: number;
}

// 会话管理器
export class ConversationManager {
    private static instance: ConversationManager;
    private _context: vscode.ExtensionContext;
    private _conversationsDir: string;
    private _currentConversation: ConversationData | null = null;
    private _conversationIndex: Array<{ id: string; title: string; timestamp: number; lastUpdated: number }> = [];

    private constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._conversationsDir = path.join(context.storageUri?.fsPath || '', 'conversations');
        this._initializeConversationsDir();
        this._loadConversationIndex();
    }

    public static getInstance(context: vscode.ExtensionContext): ConversationManager {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager(context);
        }
        return ConversationManager.instance;
    }

    // 初始化会话目录
    private _initializeConversationsDir(): void {
        if (!fs.existsSync(this._conversationsDir)) {
            fs.mkdirSync(this._conversationsDir, { recursive: true });
        }
    }

    // 加载会话索引
    private _loadConversationIndex(): void {
        const indexPath = path.join(this._conversationsDir, 'index.json');
        if (fs.existsSync(indexPath)) {
            try {
                const indexData = fs.readFileSync(indexPath, 'utf8');
                this._conversationIndex = JSON.parse(indexData);
            } catch (error) {
                console.error('Failed to load conversation index:', error);
                this._conversationIndex = [];
            }
        }
    }

    // 保存会话索引
    private _saveConversationIndex(): void {
        const indexPath = path.join(this._conversationsDir, 'index.json');
        try {
            fs.writeFileSync(indexPath, JSON.stringify(this._conversationIndex, null, 2));
        } catch (error) {
            console.error('Failed to save conversation index:', error);
        }
    }

    // 创建新会话
    public createConversation(title: string): ConversationData {
        const conversation: ConversationData = {
            id: this._generateId(),
            title,
            messages: [],
            checkpoints: [],
            timestamp: Date.now(),
            lastUpdated: Date.now()
        };

        this._currentConversation = conversation;
        this._conversationIndex.push({
            id: conversation.id,
            title: conversation.title,
            timestamp: conversation.timestamp,
            lastUpdated: conversation.lastUpdated
        });

        this._saveConversationIndex();
        this._saveConversation(conversation);
        
        return conversation;
    }

    // 加载会话
    public loadConversation(id: string): ConversationData | null {
        const conversationPath = path.join(this._conversationsDir, `${id}.json`);
        if (fs.existsSync(conversationPath)) {
            try {
                const conversationData = fs.readFileSync(conversationPath, 'utf8');
                const conversation: ConversationData = JSON.parse(conversationData);
                this._currentConversation = conversation;
                return conversation;
            } catch (error) {
                console.error('Failed to load conversation:', error);
                return null;
            }
        }
        return null;
    }

    // 保存当前会话
    public saveConversation(): void {
        if (this._currentConversation) {
            this._currentConversation.lastUpdated = Date.now();
            this._saveConversation(this._currentConversation);
            
            // 更新索引
            const indexItem = this._conversationIndex.find(item => item.id === this._currentConversation?.id);
            if (indexItem) {
                indexItem.lastUpdated = this._currentConversation.lastUpdated;
                this._saveConversationIndex();
            }
        }
    }

    // 保存会话数据
    private _saveConversation(conversation: ConversationData): void {
        const conversationPath = path.join(this._conversationsDir, `${conversation.id}.json`);
        try {
            fs.writeFileSync(conversationPath, JSON.stringify(conversation, null, 2));
        } catch (error) {
            console.error('Failed to save conversation:', error);
        }
    }

    // 添加消息到当前会话
    public addMessage(role: string, content: string, checkpoint?: string): void {
        if (this._currentConversation) {
            this._currentConversation.messages.push({
                role,
                content,
                timestamp: Date.now(),
                checkpoint
            });
            this.saveConversation();
        }
    }

    // 添加 checkpoint 到当前会话
    public addCheckpoint(sha: string, message: string, userMessage: string): void {
        if (this._currentConversation) {
            this._currentConversation.checkpoints.push({
                sha,
                message,
                timestamp: Date.now(),
                userMessage
            });
            this.saveConversation();
        }
    }

    // 获取当前会话
    public getCurrentConversation(): ConversationData | null {
        return this._currentConversation;
    }

    // 获取所有会话列表
    public getConversations(): Array<{ id: string; title: string; timestamp: number; lastUpdated: number }> {
        return this._conversationIndex.sort((a, b) => b.lastUpdated - a.lastUpdated);
    }

    // 删除会话
    public deleteConversation(id: string): boolean {
        const conversationPath = path.join(this._conversationsDir, `${id}.json`);
        try {
            if (fs.existsSync(conversationPath)) {
                fs.unlinkSync(conversationPath);
            }
            
            this._conversationIndex = this._conversationIndex.filter(item => item.id !== id);
            this._saveConversationIndex();
            
            if (this._currentConversation?.id === id) {
                this._currentConversation = null;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            return false;
        }
    }

    // 导出会话
    public exportConversation(id: string): string | null {
        const conversation = this.loadConversation(id);
        if (conversation) {
            try {
                return JSON.stringify(conversation, null, 2);
            } catch (error) {
                console.error('Failed to export conversation:', error);
                return null;
            }
        }
        return null;
    }

    // 导入会话
    public importConversation(conversationData: string): boolean {
        try {
            const conversation: ConversationData = JSON.parse(conversationData);
            conversation.id = this._generateId(); // 生成新的 ID
            conversation.timestamp = Date.now();
            conversation.lastUpdated = Date.now();
            
            this._currentConversation = conversation;
            this._conversationIndex.push({
                id: conversation.id,
                title: conversation.title,
                timestamp: conversation.timestamp,
                lastUpdated: conversation.lastUpdated
            });
            
            this._saveConversationIndex();
            this._saveConversation(conversation);
            
            return true;
        } catch (error) {
            console.error('Failed to import conversation:', error);
            return false;
        }
    }

    // 获取会话统计
    public getConversationStats(): { total: number; totalMessages: number; totalCheckpoints: number } {
        const total = this._conversationIndex.length;
        let totalMessages = 0;
        let totalCheckpoints = 0;

        this._conversationIndex.forEach(item => {
            const conversation = this.loadConversation(item.id);
            if (conversation) {
                totalMessages += conversation.messages.length;
                totalCheckpoints += conversation.checkpoints.length;
            }
        });

        return { total, totalMessages, totalCheckpoints };
    }

    // 清理旧会话（30天前的）
    public cleanupOldConversations(): number {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const oldConversations = this._conversationIndex.filter(item => item.lastUpdated < thirtyDaysAgo);
        
        let cleanedCount = 0;
        oldConversations.forEach(item => {
            if (this.deleteConversation(item.id)) {
                cleanedCount++;
            }
        });

        return cleanedCount;
    }

    // 生成唯一 ID
    private _generateId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 设置当前会话
    public setCurrentConversation(conversation: ConversationData): void {
        this._currentConversation = conversation;
    }

    // 清理资源
    public dispose(): void {
        if (this._currentConversation) {
            this.saveConversation();
        }
    }
}