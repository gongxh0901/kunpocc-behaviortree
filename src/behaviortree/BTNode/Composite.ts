import { Status } from "../header";
import { Composite, MemoryComposite } from "./AbstractNodes";

/**
 * 记忆选择节点 从上到下执行
 * 遇到 FAILURE 继续下一个 
 * 遇到 SUCCESS 返回 SUCCESS 下次重新开始
 * 
 * 遇到 RUNNING 返回 RUNNING 下次从该节点开始
 */
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
 * 随机选择节点
 * 随机选择一个子节点执行
 * 返回子节点状态
 */
export class RandomSelector extends Composite {
    public tick(): Status {
        if (this.children.length === 0) {
            return Status.FAILURE;
        }

        const childIndex = Math.floor(Math.random() * this.children.length);
        const status = this.children[childIndex]!._execute();
        return status;
    }
}

/**
 * 选择节点 从上到下执行
 * 返回第一个不为 FAILURE 的子节点状态
 * 否则返回 FAILURE
 */
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
 * 顺序节点 从上到下执行
 * 遇到 SUCCESS 继续下一个
 * 否则返回子节点状态
 */
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