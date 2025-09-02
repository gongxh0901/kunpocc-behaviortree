import type { BehaviorTree } from "../BehaviorTree";
import { Status } from "../header";
import { BaseNode } from "./BaseNode";

export class Action extends BaseNode {
    protected _func: (subject?: any) => Status;
    constructor(func: (subject?: any) => Status) {
        super();
        this._func = func;
    }

    public tick<T>(tree: BehaviorTree<T>): Status {
        return this._func?.(tree.subject) ?? Status.SUCCESS;
    }
}

/**
 * 次数等待节点(无子节点)
 * 次数内，返回RUNNING
 * 超次，返回SUCCESS
 */
export class WaitTicks extends BaseNode {
    private _max: number;
    private _value: number;

    constructor(maxTicks: number = 0) {
        super();
        this._max = maxTicks;
        this._value = 0;
    }

    protected override initialize<T>(tree: BehaviorTree<T>): void {
        super.initialize(tree);
        this._value = 0;
    }

    public tick<T>(tree: BehaviorTree<T>): Status {
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
export class WaitTime extends BaseNode {
    private _max: number;
    private _value: number = 0;
    constructor(duration: number = 0) {
        super();
        this._max = duration * 1000;
    }

    protected override initialize<T>(tree: BehaviorTree<T>): void {
        super.initialize(tree);
        this._value = new Date().getTime();
    }

    public tick<T>(tree: BehaviorTree<T>): Status {
        const currTime = new Date().getTime();
        if (currTime - this._value >= this._max) {
            return Status.SUCCESS;
        }
        return Status.RUNNING;
    }
}