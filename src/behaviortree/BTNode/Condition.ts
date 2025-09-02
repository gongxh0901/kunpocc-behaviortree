import type { BehaviorTree } from "../BehaviorTree";
import { Status } from "../header";
import { BaseNode } from "./BaseNode";

/**
 * 条件节点
 * 根据条件函数返回SUCCESS或FAILURE
 */
export class Condition extends BaseNode {
    /** 执行函数 @internal */
    private readonly _func: (subject: any) => boolean;
    constructor(func: (subject: any) => boolean) {
        super();
        this._func = func;
    }

    public tick<T>(tree: BehaviorTree<T>): Status {
        return this._func?.(tree.subject) ? Status.SUCCESS : Status.FAILURE;
    }
}