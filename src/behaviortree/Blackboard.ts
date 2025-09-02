/**
 * @Author: Gongxh
 * @Date: 2025-09-02
 * @Description: 行为树共享数据
 * 
 * 专门用于存储和管理行为树执行过程中的共享数据
 * 使用 Symbol 作为键实现高性能且安全的键值存储
 */

// 为了避免循环依赖，我们定义一个最小接口
interface IBlackboardNode {
    readonly id: string;
}

export class Blackboard {
    private readonly _data = new Map<IBlackboardNode, Map<string, any>>();

    public clear(): void {
        this._data.clear();
    }

    /**
     * 设置数据
     * @param key 键名
     * @param value 值
     * @param node 节点实例（用于生成唯一 Symbol）
     */
    public set<T>(key: string, value: T, node: IBlackboardNode): void {
        let map = this._data.get(node);
        if (!map) {
            map = new Map();
            this._data.set(node, map);
        }
        map.set(key, value);
    }

    /**
     * 获取数据
     * @param key 键名
     * @param node 节点实例
     * @returns 值
     */
    public get<T>(key: string, node: IBlackboardNode): T | undefined {
        return this._data.get(node)?.get(key) as T;
    }

    /**
     * 检查是否存在指定键
     * @param key 键名
     * @param node 节点实例
     * @returns 是否存在
     */
    public has(key: string, node: IBlackboardNode): boolean {
        return this._data.has(node) ? this._data.get(node)?.has(key) || false : false;
    }

    /**
     * 删除指定键的数据
     * @param key 键名
     * @param node 节点实例
     * @returns 是否删除成功
     */
    public delete(key: string, node: IBlackboardNode): boolean {
        if (this.has(key, node)) {
            this._data.get(node)?.delete(key);
            return true;
        }
        return false;
    }
}