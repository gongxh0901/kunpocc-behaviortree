import { IBlackboard } from "../Blackboard";
import { BT } from "../BT";
import { Status } from "../header";
import { BTNode, IBTNode } from "./BTNode";
import { WeightDecorator } from "./Decorator";

/**
 * 组合节点基类
 * 有多个子节点
 */
export abstract class Composite extends BTNode {
    constructor(...children: IBTNode[]) {
        super(children);
    }
}

/**
 * 记忆选择节点 从上到下执行
 * 遇到 FAILURE 继续下一个 
 * 遇到 SUCCESS 返回 SUCCESS 下次重新开始
 * 
 * 遇到 RUNNING 返回 RUNNING 下次从该节点开始
 */
@BT.ClassComposite("Selector", { name: "选择节点", group: "基础组合节点", desc: "选择节点" })
export class Selector extends Composite {
    public override _initialize(global: IBlackboard, branch: IBlackboard): void {
        super._initialize(global, branch);
        this._local = branch.createChild();
    }

    protected override open(): void {
        super.open();
        this.set(`__nRunningIndex`, 0);
    }

    public tick(dt: number): Status {
        let index = this.get<number>(`__nRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute(dt);
            if (status === Status.FAILURE) {
                continue;
            }
            if (status === Status.SUCCESS) {
                return status;
            }
            this.set(`__nRunningIndex`, i);
            return Status.RUNNING;
        }
        return Status.FAILURE;
    }
}

/**
 * 顺序节点 从上到下执行
 * 遇到 SUCCESS 继续下一个
 * 遇到 FAILURE 停止迭代 返回 FAILURE 下次重新开始
 * 
 * 遇到 RUNNING 返回 RUNNING 下次从该节点开始
 */
@BT.ClassComposite("Sequence", { name: "顺序节点", group: "基础组合节点", desc: "顺序节点" })
export class Sequence extends Composite {
    public override _initialize(global: IBlackboard, branch: IBlackboard): void {
        super._initialize(global, branch);
        this._local = branch.createChild();
    }

    protected override open(): void {
        super.open();
        this.set(`__nRunningIndex`, 0);
    }

    public tick(dt: number): Status {
        let index = this.get<number>(`__nRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute(dt);
            if (status === Status.SUCCESS) {
                continue;
            }
            if (status === Status.FAILURE) {
                return Status.FAILURE;
            }
            this.set(`__nRunningIndex`, i);
            return Status.RUNNING;
        }
        return Status.SUCCESS;
    }
}

/**
 * 并行节点 从上到下执行 全部执行一遍
 * 返回优先级 FAILURE > RUNNING > SUCCESS
 */
@BT.ClassComposite("Parallel", { name: "并行节点", group: "基础组合节点", desc: "同时执行所有子节点，全部成功才返回成功" })
export class Parallel extends Composite {
    public tick(dt: number): Status {
        let result = Status.SUCCESS;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute(dt);
            if (result === Status.FAILURE || status === Status.FAILURE) {
                result = Status.FAILURE;
            } else if (status === Status.RUNNING) {
                result = Status.RUNNING;
            }
        }
        return result;
    }
}


/**
 * 随机选择节点
 * 随机选择一个子节点执行
 * 返回子节点状态
 */
@BT.ClassComposite("RandomSelector", {
    name: "随机选择节点",
    group: "基础组合节点",
    desc: "随机选择一个子节点执行",
})
export class RandomSelector extends Composite {
    private _totalWeight: number = 0;
    private _weights: number[] = [];

    constructor(...children: IBTNode[]) {
        super(...children);
        this._totalWeight = 0;
        this._weights = [];

        for (const child of children) {
            const weight = this.getChildWeight(child);
            this._totalWeight += weight;
            this._weights.push(this._totalWeight);
        }
    }

    private getChildWeight(child: IBTNode): number {
        return (child instanceof WeightDecorator) ? (child.weight) : 1;
    }

    public tick(dt: number): Status {
        if (this.children.length === 0) {
            return Status.FAILURE;
        }

        // 基于权重的随机选择
        const randomValue = Math.random() * this._totalWeight;

        // 使用二分查找找到对应的子节点索引（O(log n)复杂度）
        let left = 0;
        let right = this._weights.length - 1;
        let childIndex = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this._weights[mid]! > randomValue) {
                childIndex = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        const status = this.children[childIndex]!._execute(dt);
        return status;
    }
}

/**
 * 并行节点 从上到下执行 全部执行一遍
 * 返回优先级 SUCCESS > RUNNING > FAILURE
 */
@BT.ClassComposite("ParallelAnySuccess", {
    name: "并行任意成功",
    group: "基础组合节点",
    desc: "同时执行所有子节点，任意一个成功即返回成功",
})
export class ParallelAnySuccess extends Composite {
    public tick(dt: number): Status {
        let result = Status.FAILURE;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute(dt);
            if (result === Status.SUCCESS || status === Status.SUCCESS) {
                result = Status.SUCCESS;
            } else if (status === Status.RUNNING) {
                result = Status.RUNNING;
            }
        }
        return result;
    }
}