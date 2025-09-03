import { Status } from "../header";
import { LeafNode } from "./AbstractNodes";
import { IBTNode } from "./BTNode";

/**
 * 条件节点
 * 根据条件函数返回SUCCESS或FAILURE
 */
export class Condition extends LeafNode {
    /** 执行函数 @internal */
    private readonly _func: (node: IBTNode) => boolean;
    constructor(func: (node: IBTNode) => boolean) {
        super();
        this._func = func;
    }

    public tick(): Status {
        return this._func?.(this) ? Status.SUCCESS : Status.FAILURE;
    }
}