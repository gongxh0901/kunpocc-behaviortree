import { Blackboard } from "./Blackboard";
import { BaseNode } from "./BTNode/BaseNode";

/**
 * 行为树
 * 所有节点全部添加到树中
 */
export class BehaviorTree<T> {
    /** 
     * @internal
     */
    private _root: BaseNode;
    /** 
     * @internal
     */
    private _blackboard: Blackboard;
    /** 
     * @internal
     */
    private _subject: T;

    /** 
     * 节点ID计数器，每个树实例独立管理
     * @internal
     */
    private _nodeIdCounter: number = 0;

    get root(): BaseNode { return this._root; }
    get blackboard() { return this._blackboard }
    get subject(): T { return this._subject; }

    /**
     * constructor
     * @param subject 主体
     * @param root 根节点
     */
    constructor(subject: T, root: BaseNode) {
        this._root = root;
        this._blackboard = new Blackboard();
        this._subject = subject;

        // 构造时就初始化所有节点ID，避免运行时检查
        this._initializeAllNodeIds(this._root);
    }

    /**
     * 执行行为树
     */
    public tick(): void {
        this._root._execute(this);
    }

    /**
     * 生成节点ID
     * 每个树实例独立管理节点ID，避免全局状态污染
     * @internal
     */
    private _generateNodeId(): string {
        return `${++this._nodeIdCounter}`;
    }

    /**
     * 递归初始化所有节点ID
     * 在构造时一次性完成，避免运行时检查
     * @param node 要初始化的节点
     * @internal
     */
    private _initializeAllNodeIds(node: BaseNode): void {
        // 设置当前节点ID
        node.id = this._generateNodeId();

        // 递归设置所有子节点ID
        for (const child of node.children) {
            this._initializeAllNodeIds(child);
        }
    }

    /**
     * 完全重置行为树（核武器级别的重置）
     * 清空黑板并重置所有节点状态
     */
    public reset(): void {
        this._blackboard.clear();
        // 重置所有节点的状态
        this._root.cleanupAll();
    }

    /**
     * 重置指定记忆节点的记忆状态
     * 用于精确控制记忆节点的重置，而不影响其他状态
     * @param node 记忆节点
     */
    public resetMemoryNode(node: BaseNode): void {
        // 通过黑板标记该节点需要重置记忆
        this._blackboard.set(`reset_memory`, true, node);
    }
}