/**
 * @Author: Gongxh
 * @Date: 2025-09-17
 * @Description: 定义一些行为节点
 */

import { sp } from "cc";
import { BT } from "./Header";

@BT.ActionNode("BTAnimation", { name: "播放动画", group: "动画", desc: "通过动画名播放动画，播放完成后返回成功" })
export class BTAnimation extends BT.LeafNode {
    @BT.prop({ type: BT.ParamType.string, description: "动画名" })
    private _name: string = "";

    @BT.prop({ type: BT.ParamType.bool, description: "是否循环" })
    private _loop: boolean = false;

    private _complete: boolean = false;

    protected open(): void {
        super.open();
        this._complete = false;

        console.log("open", this._name, this._loop);

        let skeleton = this.getEntity<sp.Skeleton>();
        skeleton.setAnimation(0, this._name, this._loop);

        if (!this._loop) {
            skeleton.setCompleteListener(() => {
                this._complete = true;
            });
        }
    }

    public tick(): BT.Status {
        if (!this._loop && this._complete) {
            return BT.Status.SUCCESS;
        }
        return BT.Status.RUNNING;
    }

    protected close(): void {
        super.close();
        console.log("close", this._name, this._loop);
    }
}

/** 条件节点 */
@BT.ConditionNode("BTConditionRandom", { name: "随机条件节点", group: "基础条件节点", desc: "随机0-1的值，大于设置值返回成功，否则返回失败" })
export class BTConditionRandom extends BT.Condition {

    @BT.prop({ type: BT.ParamType.float, description: "值", defaultValue: 0.5 })
    private _value: number = 0.5;

    public isEligible(): boolean {
        return Math.random() > this._value;
    }
}


/** 条件装饰节点 */
@BT.DecoratorNode("BTCondition", { name: "条件装饰节点", group: "基础装饰节点", desc: "随机0-1的值，大于设置值返回成功，否则返回失败" })
export class BTCondition extends BT.ConditionDecorator {

    @BT.prop({ type: BT.ParamType.float, description: "值" })
    private _value: number = 0.5;

    public isEligible(): boolean {
        return Math.random() > this._value;
    }
}