/**
 * @Author: Gongxh
 * @Date: 2025-09-01
 * @Description: 抽象节点基类
 */

import { BehaviorTree } from "../BehaviorTree";
import { BaseNode } from "./BaseNode";

/**
 * 可以包含多个节点的集合装饰器基类
 */
export abstract class Composite extends BaseNode {
    constructor(...children: BaseNode[]) {
        super(children);
    }
}

/**
 * 修饰节点基类
 * 只能包含一个子节点
 */
export abstract class Decorator extends BaseNode {
    constructor(child: BaseNode) {
        super([child]);
    }
}

/**
 * 数值型装饰节点基类
 * 包含最大值和当前值的通用逻辑，适用于所有需要数值计数的装饰节点
 */
export abstract class NumericDecorator extends Decorator {
    protected readonly _max: number;
    protected _value: number = 0;

    constructor(child: BaseNode, max: number = 1) {
        super(child);
        this._max = max;
    }

    protected override initialize<T>(tree: BehaviorTree<T>): void {
        super.initialize(tree);
        this._value = 0;
    }
}

/**
 * 记忆装饰节点基类
 */
export abstract class MemoryComposite extends Composite {
    protected runningIndex = 0;

    protected override initialize<T>(tree: BehaviorTree<T>): void {
        super.initialize(tree);
        // 检查是否需要重置记忆
        const shouldReset = tree.blackboard.get(`reset_memory`, this);
        if (shouldReset) {
            this.runningIndex = 0;
            tree.blackboard.delete(`reset_memory`, this);
        }
    }

    /**
     * 重置记忆状态，下次执行时将从第一个子节点开始
     */
    public resetMemory(): void {
        this.runningIndex = 0;
    }
}