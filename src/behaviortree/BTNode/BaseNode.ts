import { BehaviorTree } from "../BehaviorTree";
import { Status } from "../header";


/**
 * 基础节点
 * 每个节点只管理自己需要的状态
 */
export abstract class BaseNode {
    public readonly children: BaseNode[];
    private _id: string;
    private _isRunning: boolean;

    set id(id: string) { this._id = id; }
    get id(): string { return this._id }

    /**
     * 创建
     * @param children 子节点列表
     */
    constructor(children?: BaseNode[]) {
        this._id = ""; // 临时值，将在树构造时被正确设置
        this.children = children ? [...children] : [];
        this._isRunning = false;
    }

    /**
     * 执行节点
     * @param tree 行为树
     * @returns 状态
     */
    public _execute<T>(tree: BehaviorTree<T>): Status {
        // 首次执行时初始化
        if (!this._isRunning) {
            this._isRunning = true;
            this.initialize(tree);
        }

        // 执行核心逻辑
        const status = this.tick(tree);

        // 执行完成时清理
        if (status !== Status.RUNNING) {
            this._isRunning = false;
            this.cleanup(tree);
        }

        return status;
    }

    /**
     * 初始化节点（首次执行时调用）
     * 子类重写此方法进行状态初始化
     * @param tree 行为树
     */
    protected initialize<T>(tree: BehaviorTree<T>): void { }

    /**
     * 清理节点（执行完成时调用）
     * 子类重写此方法进行状态清理
     * @param tree 行为树
     */
    protected cleanup<T>(tree: BehaviorTree<T>): void { }

    /**
     * 执行节点逻辑
     * 子类必须实现此方法
     * @param tree 行为树
     * @returns 执行状态
     */
    public abstract tick<T>(tree: BehaviorTree<T>): Status;

    /**
     * 递归清理节点及其所有子节点的状态
     * 用于行为树中断时清理所有节点状态
     */
    public cleanupAll(): void {
        // 清理基础状态
        this._isRunning = false;

        // 递归清理所有子节点
        for (const child of this.children) {
            child.cleanupAll();
        }
    }
}