import { BT } from "../BT";
import { Status } from "../header";
import { Composite, MemoryComposite } from "./AbstractNodes";
import { IBTNode } from "./BTNode";
import { WeightDecorator } from "./Decorator";

/**
 * 记忆选择节点 从上到下执行
 * 遇到 FAILURE 继续下一个 
 * 遇到 SUCCESS 返回 SUCCESS 下次重新开始
 * 
 * 遇到 RUNNING 返回 RUNNING 下次从该节点开始
 */
@BT.CompositeNode({
    name: "记忆选择节点",
    group: "基础组合节点",
    description: "记住上次运行位置的选择节点，从记忆位置开始执行",
    parameters: []
})
export class MemSelector extends MemoryComposite {
    public tick(): Status {
        let index = this.get<number>(`__nMemoryRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status === Status.FAILURE) {
                continue;
            }
            if (status === Status.SUCCESS) {
                return status;
            }
            this.set(`__nMemoryRunningIndex`, i);
            return Status.RUNNING;
        }
        return Status.FAILURE;
    }
}

/**
 * 记忆顺序节点 从上到下执行
 * 遇到 SUCCESS 继续下一个
 * 遇到 FAILURE 停止迭代 返回 FAILURE 下次重新开始
 * 
 * 遇到 RUNNING 返回 RUNNING 下次从该节点开始
 */
@BT.CompositeNode({
    name: "记忆顺序节点",
    group: "基础组合节点",
    description: "记住上次运行位置的序列节点，从记忆位置开始执行",
    parameters: []
})
export class MemSequence extends MemoryComposite {
    public tick(): Status {
        let index = this.get<number>(`__nMemoryRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status === Status.SUCCESS) {
                continue;
            }
            if (status === Status.FAILURE) {
                return Status.FAILURE;
            }
            this.set(`__nMemoryRunningIndex`, i);
            return Status.RUNNING;
        }
        return Status.SUCCESS;
    }
}

/**
 * 选择节点 从上到下执行
 * 返回第一个不为 FAILURE 的子节点状态
 * 否则返回 FAILURE
 */
@BT.CompositeNode({
    name: "选择节点",
    group: "基础组合节点",
    description: "依次执行子节点，直到找到成功或运行中的节点",
    parameters: []
})
export class Selector extends Composite {
    public tick(): Status {
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status !== Status.FAILURE) {
                return status;
            }
        }
        return Status.FAILURE;
    }
}


/**
 * 随机选择节点
 * 随机选择一个子节点执行
 * 返回子节点状态
 */
@BT.CompositeNode({
    name: "随机选择节点",
    group: "基础组合节点",
    description: "随机选择一个子节点执行",
    parameters: [],
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

    public tick(): Status {
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
        const status = this.children[childIndex]!._execute();
        return status;
    }
}

/**
 * 顺序节点 从上到下执行
 * 遇到 SUCCESS 继续下一个
 * 否则返回子节点状态
 */
@BT.CompositeNode({
    name: "顺序节点",
    group: "基础组合节点",
    description: "依次执行所有子节点，全部成功才返回成功",
    parameters: []
})
export class Sequence extends Composite {
    public tick(): Status {
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status === Status.SUCCESS) {
                continue;
            }
            return status;
        }
        return Status.SUCCESS;
    }
}

/**
 * 并行节点 从上到下执行 全部执行一遍
 * 返回优先级 FAILURE > RUNNING > SUCCESS
 */
@BT.CompositeNode({
    name: "并行节点",
    group: "基础组合节点",
    description: "同时执行所有子节点，全部成功才返回成功",
    parameters: []
})
export class Parallel extends Composite {
    public tick(): Status {
        let result = Status.SUCCESS;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
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
 * 并行节点 从上到下执行 全部执行一遍
 * 返回优先级 SUCCESS > RUNNING > FAILURE
 */
@BT.CompositeNode({
    name: "并行任意成功",
    group: "基础组合节点",
    description: "同时执行所有子节点，任意一个成功即返回成功",
    parameters: []
})
export class ParallelAnySuccess extends Composite {
    public tick(): Status {
        let result = Status.FAILURE;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (result === Status.SUCCESS || status === Status.SUCCESS) {
                result = Status.SUCCESS;
            } else if (status === Status.RUNNING) {
                result = Status.RUNNING;
            }
        }
        return result;
    }
}