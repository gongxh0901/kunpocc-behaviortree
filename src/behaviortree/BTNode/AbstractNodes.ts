/**
 * @Author: Gongxh
 * @Date: 2025-09-01
 * @Description: 抽象节点基类
 */

import { IBlackboard } from "../Blackboard";
import { BTNode, IBTNode } from "./BTNode";

/**
 * 叶子节点 基类
 * 没有子节点
 */
export abstract class LeafNode extends BTNode {
    constructor() {
        super([]);
    }
}

/**
 * 修饰节点 基类
 * 有且仅有一个子节点
 */
export abstract class Decorator extends BTNode {
    constructor(child: IBTNode) {
        super([child]);
    }
}

/**
 * 组合节点 基类
 * 多个子节点
 */
export abstract class Composite extends BTNode {
    constructor(...children: IBTNode[]) {
        super(children);
    }
}

/**
 * 数值型修饰节点 基类
 * 包含最大值和当前值的通用逻辑，适用于所有需要数值计数的修饰节点
 */
export abstract class NumericDecorator extends Decorator {
    protected readonly _max: number;
    protected _value: number = 0;

    constructor(child: IBTNode, max: number = 1) {
        super(child);
        this._max = max;
    }

    protected override open(): void {
        super.open();
        this._value = 0;
    }
}

/**
 * 记忆修饰节点基类
 * 只有记忆节点才需要设置局部数据
 */
export abstract class MemoryComposite extends Composite {
    public override _initialize(global: IBlackboard, branch: IBlackboard): void {
        super._initialize(global, branch);
        this._local = branch.createChild();
    }

    protected override open(): void {
        super.open();
        this.set(`__nMemoryRunningIndex`, 0);
    }
}