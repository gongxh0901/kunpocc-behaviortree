/**
 * @Author: Gongxh
 * @Date: 2025-09-17
 * @Description: 条件节点基类
 */

import { Status } from "../header";
import { LeafNode } from "./AbstractNodes";

export abstract class Condition extends LeafNode {
    /**
     * 判断是否满足条件
     * @returns 是否满足条件
     */
    protected abstract isEligible(): boolean;

    public tick(): Status {
        return this.isEligible() ? Status.SUCCESS : Status.FAILURE;
    }
}
