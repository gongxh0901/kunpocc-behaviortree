/**
 * @Author: Gongxh
 * @Date: 2025-09-01
 * @Description: 装饰节点 装饰节点下必须包含子节点
 */

import { Status } from "../header";
import { Decorator, NumericDecorator } from "./AbstractNodes";
import { IBTNode } from "./BTNode";

/**
 * 结果反转节点
 * 必须且只能包含一个子节点
 * 第一个Child Node节点, 返回 FAILURE, 本Node向自己的Parent Node也返回 SUCCESS
 * 第一个Child Node节点, 返回 SUCCESS, 本Node向自己的Parent Node也返回 FAILURE
 */
export class Inverter extends Decorator {
    public tick(): Status {
        const status = this.children[0]!._execute();

        if (status === Status.SUCCESS) {
            return Status.FAILURE;
        } else if (status === Status.FAILURE) {
            return Status.SUCCESS;
        }
        return status; // RUNNING 保持不变
    }
}


/**
 * 时间限制节点
 * 只能包含一个子节点
 * 规定时间内, 根据Child Node的结果, 本节点向自己的父节点也返回相同的结果
 * 超时后, 直接返回 FAILURE
 */
export class LimitTime extends NumericDecorator {
    /**
     * 时间限制节点
     * @param child 子节点 
     * @param max 最大时间 (秒) 默认1秒
     */
    constructor(child: IBTNode, max: number = 1) {
        super(child, max * 1000);
    }

    protected override open(): void {
        this._value = Date.now();
    }

    public tick(): Status {
        const currentTime = Date.now();
        if (currentTime - this._value > this._max) {
            return Status.FAILURE;
        }
        return this.children[0]!._execute();
    }
}

/**
 * 次数限制节点
 * 必须且只能包含一个子节点
 * 次数超过后, 直接返回失败; 次数未超过, 返回子节点状态
 */
export class LimitTicks extends NumericDecorator {
    public tick(): Status {
        this._value++;
        if (this._value > this._max) {
            return Status.FAILURE;
        }
        return this.children[0]!._execute();
    }
}

/**
 * 循环节点 最大次数必须大于0
 * 必须且只能包含一个子节点
 * 子节点是成功或失败，累加计数
 * 次数超过之后返回子节点状态，否则返回 RUNNING
 */
export class Repeat extends NumericDecorator {
    public tick(): Status {
        // 执行子节点
        const status = this.children[0]!._execute();
        // 如果子节点完成（成功或失败），增加计数
        if (status === Status.SUCCESS || status === Status.FAILURE) {
            this._value++;
            // 检查是否达到最大次数
            if (this._value >= this._max) {
                return status;
            }
        }
        return Status.RUNNING;
    }
}

/**
 * 重复 -- 直到失败
 * 节点含义：重复执行直到失败，但最多重试max次
 * 必须且只能包含一个子节点
 * 
 * 子节点成功 计数+1
 */
export class RepeatUntilFailure extends NumericDecorator {
    public tick(): Status {
        const status = this.children[0]!._execute();
        if (status === Status.FAILURE) {
            return Status.FAILURE;
        }
        if (status === Status.SUCCESS) {
            this._value++;
            if (this._value >= this._max) {
                // 重试次数耗尽了，但是子节点一直返回成功 就返回成功
                return Status.SUCCESS;
            }
        }
        return Status.RUNNING;
    }
}

/**
 * 重复 -- 直到成功
 * 节点含义：重复执行直到成功，但最多重试max次
 * 必须且只能包含一个子节点
 * 
 * 子节点失败, 计数+1
 */
export class RepeatUntilSuccess extends NumericDecorator {
    public tick(): Status {
        // 执行子节点
        const status = this.children[0]!._execute();
        if (status === Status.SUCCESS) {
            return Status.SUCCESS;
        }
        if (status === Status.FAILURE) {
            this._value++;
            if (this._value >= this._max) {
                // 重试次数耗尽了，但是子节点一直返回失败
                return Status.FAILURE;
            }
        }
        return Status.RUNNING;
    }
}