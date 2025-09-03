import { Status } from "../header";
import { LeafNode } from "./AbstractNodes";
import { IBTNode } from "./BTNode";

export class Action extends LeafNode {
    protected _func: (node: IBTNode) => Status;
    constructor(func: (node: IBTNode) => Status) {
        super();
        this._func = func;
    }

    public tick(): Status {
        return this._func?.(this) ?? Status.SUCCESS;
    }
}

/**
 * 次数等待节点(无子节点)
 * 次数内，返回RUNNING
 * 超次，返回SUCCESS
 */
export class WaitTicks extends LeafNode {
    private _max: number;
    private _value: number;

    constructor(maxTicks: number = 0) {
        super();
        this._max = maxTicks;
        this._value = 0;
    }

    protected override open(): void {
        super.open();
        this._value = 0;
    }

    public tick(): Status {
        if (++this._value >= this._max) {
            return Status.SUCCESS;
        }
        return Status.RUNNING;
    }
}

/**
 * 时间等待节点 时间(秒) 
 * 时间到后返回SUCCESS，否则返回RUNNING
 */
export class WaitTime extends LeafNode {
    private _max: number;
    private _value: number = 0;
    constructor(duration: number = 0) {
        super();
        this._max = duration * 1000;
    }

    protected override open(): void {
        super.open();
        this._value = new Date().getTime();
    }

    public tick(): Status {
        const currTime = new Date().getTime();
        if (currTime - this._value >= this._max) {
            return Status.SUCCESS;
        }
        return Status.RUNNING;
    }
}