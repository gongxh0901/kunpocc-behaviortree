import { globalBlackboard, IBlackboard } from "../Blackboard";
import { Status } from "../header";

export interface IBTNode {
    readonly children: IBTNode[];
    /** 本节点的的黑板引用 */
    local: IBlackboard;
    /**
     * 初始化节点
     * @param root 树根节点的黑板
     * @param parent 父节点的黑板
     */
    _initialize(root: IBlackboard, parent: IBlackboard): void;

    _execute(): Status;
    tick(): Status;
    cleanupAll(): void;

    /**
     * 优先写入自己的黑板数据, 如果没有则写入父节点的黑板数据
     */
    set<T>(key: string, value: T): void;
    get<T>(key: string): T;

    /**
     * 写入树根节点的黑板数据
     */
    setRoot<T>(key: string, value: T): void;
    getRoot<T>(key: string): T;

    /**
     * 写入全局黑板数据
     */
    setGlobal<T>(key: string, value: T): void;
    getGlobal<T>(key: string): T;

    /** 获取关联的实体 */
    getEntity<T>(): T;
}


/**
 * 基础节点
 * 每个节点只管理自己需要的状态
 */
export abstract class BTNode implements IBTNode {
    public readonly children: IBTNode[];

    /** 树根节点的黑板引用 */
    protected _root!: IBlackboard;
    /** 本节点的的黑板引用 可能等于 _parent */
    protected _local!: IBlackboard;

    private _isRunning: boolean;
    /**
     * 创建
     * @param children 子节点列表
     */
    constructor(children?: IBTNode[]) {
        this.children = children ? [...children] : [];
        this._isRunning = false;
    }

    /**
     * 打开节点
     * @param tree 行为树
     * 
     * @internal
     */
    public _initialize(root: IBlackboard, parent: IBlackboard): void {
        this._root = root;
        // 在需要的节点中重写，创建新的local
        this._local = parent;
    }

    /**
     * 执行节点
     * @internal
     */
    public _execute(): Status {
        // 首次执行时初始化
        if (!this._isRunning) {
            this._isRunning = true;
            this.open();
        }

        // 执行核心逻辑
        const status = this.tick();

        // 执行完成时清理
        if (status !== Status.RUNNING) {
            this._isRunning = false;
            this.close();
        }

        return status;
    }

    /**
     * 初始化节点（首次执行时调用）
     * 子类重写此方法进行状态初始化
     */
    protected open(): void { }

    /**
     * 执行节点逻辑
     * 子类必须实现此方法
     * @returns 执行状态
     */
    public abstract tick(): Status;

    /**
     * 清理节点（执行完成时调用）
     * 子类重写此方法进行状态清理
     */
    protected close(): void { }

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

    public getEntity<T>(): T {
        return this._local.getEntity();
    }

    /**
     * 设置获取全局黑板数据
     */
    public set<T>(key: string, value: T): void {
        this._local.set(key, value);
    }

    public get<T>(key: string): T {
        return this._local.get(key);
    }

    /**
     * 设置获取树根节点的黑板数据
     */
    public setRoot<T>(key: string, value: T): void {
        this._root.set(key, value);
    }

    public getRoot<T>(key: string): T {
        return this._root.get(key);
    }

    /** 
     * 设置全局黑板数据 
     */
    public setGlobal<T>(key: string, value: T): void {
        globalBlackboard.set(key, value);
    }

    public getGlobal<T>(key: string): T {
        return globalBlackboard.get(key);
    }

    public get local(): IBlackboard {
        return this._local;
    }
}