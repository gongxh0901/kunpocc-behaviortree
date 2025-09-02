/**
 * @Author: Gongxh
 * @Date: 2025-09-01
 * @Description: 装饰节点 装饰节点下必须包含子节点
 */

import type { BehaviorTree } from "../BehaviorTree";
import { Status } from "../header";
import { Decorator, NumericDecorator } from "./AbstractNodes";
import { BaseNode } from "./BaseNode";

/**
 * 结果反转节点
 * 必须且只能包含一个子节点
 * 第一个Child Node节点, 返回 FAILURE, 本Node向自己的Parent Node也返回 SUCCESS
 * 第一个Child Node节点, 返回 SUCCESS, 本Node向自己的Parent Node也返回 FAILURE
 */
export class Inverter extends Decorator {
    public tick<T>(tree: BehaviorTree<T>): Status {
        const status = this.children[0]!._execute(tree);

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
    constructor(child: BaseNode, max: number = 1) {
        super(child, max * 1000);
    }

    protected override initialize<T>(tree: BehaviorTree<T>): void {
        super.initialize(tree);
        this._value = Date.now();
    }

    public tick<T>(tree: BehaviorTree<T>): Status {
        const currentTime = Date.now();

        if (currentTime - this._value > this._max) {
            return Status.FAILURE;
        }

        return this.children[0]!._execute(tree);
    }
}

/**
 * 次数限制节点
 * 必须且只能包含一个子节点
 * 次数限制内, 返回子节点的状态, 次数达到后, 直接返回失败
 */
export class LimitTimes extends NumericDecorator {
    public tick<T>(tree: BehaviorTree<T>): Status {
        if (this._value >= this._max) {
            return Status.FAILURE;
        }
        const status = this.children[0]!._execute(tree);
        if (status !== Status.RUNNING) {
            this._value++;
            if (this._value < this._max) {
                return Status.RUNNING;
            }
        }
        return status;
    }
}

/**
 * 循环节点 最大次数必须大于0
 * 必须且只能包含一个子节点
 * 子节点是成功或失败，累加计数
 * 次数超过之后返回子节点状态，否则返回 RUNNING
 */
export class Repeat extends NumericDecorator {
    public tick<T>(tree: BehaviorTree<T>): Status {
        // 执行子节点
        const status = this.children[0]!._execute(tree);
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
    public tick<T>(tree: BehaviorTree<T>): Status {
        const status = this.children[0]!._execute(tree);
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
    public tick<T>(tree: BehaviorTree<T>): Status {
        // 执行子节点
        const status = this.children[0]!._execute(tree);
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