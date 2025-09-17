import { BT } from "../BT";
import { Status } from "../header";
import { LeafNode } from "./AbstractNodes";

/**
 * 次数等待节点(无子节点)
 * 次数内，返回RUNNING
 * 超次，返回SUCCESS
 */
@BT.ActionNode("WaitTicks", {
    name: "等待次数",
    group: "基础行为节点",
    desc: "等待指定次数后返回成功",
})
export class WaitTicks extends LeafNode {
    @BT.prop({ type: BT.ParamType.int, description: "最大等待次数", defaultValue: 0, step: 1 })
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
@BT.ActionNode("WaitTime", {
    name: "等待时间",
    group: "基础行为节点",
    desc: "等待指定时间(秒)后返回成功",
})
export class WaitTime extends LeafNode {
    @BT.prop({ type: BT.ParamType.float, description: "等待时间(秒)", defaultValue: 0, step: 0.01 })
    private _max: number;
    private _value: number = 0;
    constructor(duration: number = 0) {
        super();
        this._max = duration;
    }

    protected override open(): void {
        super.open();
        this._value = new Date().getTime();
    }

    public tick(): Status {
        const currTime = new Date().getTime();
        if (currTime - this._value >= this._max * 1000) {
            return Status.SUCCESS;
        }
        return Status.RUNNING;
    }
}