import { Status } from "../header";
import { Composite, MemoryComposite } from "./AbstractNodes";

/**
 * 记忆选择节点
 * 选择不为 FAILURE 的节点，记住上次运行的子节点位置
 * 任意一个Child Node返回不为 FAILURE, 本Node向自己的Parent Node也返回Child Node状态
 */
export class MemSelector extends MemoryComposite {
    public tick(): Status {
        let index = this.get<number>(`__nMemoryRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status !== Status.FAILURE) {
                if (status === Status.RUNNING) {
                    this.set(`__nMemoryRunningIndex`, i);
                }
                return status;
            }
        }
        return Status.FAILURE;
    }
}

/**
 * 记忆顺序节点
 * 如果上次执行到 RUNNING 的节点, 下次进入节点后, 直接从 RUNNING 节点开始
 * 遇到 SUCCESS 或者 FAILURE 停止迭代
 * 任意一个Child Node返回不为 SUCCESS, 本Node向自己的Parent Node也返回Child Node状态
 * 所有节点都返回 SUCCESS, 本节点才返回 SUCCESS
 */
export class MemSequence extends MemoryComposite {
    public tick(): Status {
        let index = this.get<number>(`__nMemoryRunningIndex`);
        for (let i = index; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status !== Status.SUCCESS) {
                if (status === Status.RUNNING) {
                    this.set(`__nMemoryRunningIndex`, i);
                }
                return status;
            }
        }
        return Status.SUCCESS;
    }
}

/**
 * 随机选择节点
 * 从Child Node中随机选择一个执行
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
 * 选择节点，选择不为 FAILURE 的节点
 * 当执行本Node时，它将从begin到end迭代执行自己的Child Node：
 * 如遇到一个Child Node执行后返回 SUCCESS 或者 RUNNING，那停止迭代，本Node向自己的Parent Node也返回 SUCCESS 或 RUNNING
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
 * 顺序节点
 * 当执行本类型Node时，它将从begin到end迭代执行自己的Child Node：
 * 遇到 FAILURE 或 RUNNING, 那停止迭代，返回FAILURE 或 RUNNING
 * 所有节点都返回 SUCCESS, 本节点才返回 SUCCESS
 */
export class Sequence extends Composite {
    public tick(): Status {
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (status !== Status.SUCCESS) {
                return status;
            }
        }
        return Status.SUCCESS;
    }
}

/**
 * 并行节点 每次进入全部执行一遍
 * 它将从begin到end迭代执行自己的Child Node：
 * 1. 任意子节点返回 FAILURE, 返回 FAILURE
 * 2. 否则 任意子节点返回 RUNNING, 返回 RUNNING
 * 3. 全部成功, 才返回 SUCCESS
 */
export class Parallel extends Composite {
    public tick(): Status {
        let result = Status.SUCCESS;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (result === Status.FAILURE || status === Status.FAILURE) {
                result = Status.FAILURE;
                continue;
            }
            if (status === Status.RUNNING) {
                result = Status.RUNNING;
                continue;
            }
        }
        return result;
    }
}

/**
 * 并行节点 每次进入全部重新执行一遍
 * 它将从begin到end迭代执行自己的Child Node：
 * 1. 任意子节点返回 SUCCESS, 返回 SUCCESS 
 * 2. 否则, 任意子节点返回 FAILURE, 返回 FAILURE
 * 否则返回 RUNNING
 */
export class ParallelAnySuccess extends Composite {
    public tick(): Status {
        let result = Status.RUNNING;
        for (let i = 0; i < this.children.length; i++) {
            let status = this.children[i]!._execute();
            if (result === Status.SUCCESS || status === Status.SUCCESS) {
                result = Status.SUCCESS;
                continue;
            }
            if (status === Status.FAILURE) {
                result = Status.FAILURE;
                continue;
            }
        }
        return result;
    }
}