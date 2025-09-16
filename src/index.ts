
/** 行为树 */
export { BehaviorTree } from "./behaviortree/BehaviorTree";
export { Blackboard } from "./behaviortree/Blackboard";
export { } from "./behaviortree/BT";
export * from "./behaviortree/BTNode/AbstractNodes";
export * from "./behaviortree/BTNode/Action";
export { IBTNode } from "./behaviortree/BTNode/BTNode";
export * from "./behaviortree/BTNode/Composite";
export * from "./behaviortree/BTNode/Decorator";
export { createBehaviorTree } from "./behaviortree/Factory";

// 导出装饰器内容
import { BT } from "./behaviortree/BT";
export const { ActionNode, ConditionNode, CompositeNode, DecoratorNode, prop } = BT;