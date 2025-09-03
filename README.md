# 行为树

一个轻量级、高性能的 TypeScript 行为树库，专为游戏AI和决策系统设计。

## 特性

- 🚀 **高性能**: 优化的节点执行机制，最小化运行时开销
- 🎯 **类型安全**: 完整的 TypeScript 支持，严格的类型检查
- 🧩 **模块化**: 清晰的节点类型体系，易于扩展
- 🔄 **记忆节点**: 支持记忆型组合节点，优化复杂决策流程
- 📦 **零依赖**: 不依赖任何第三方库
- 🎮 **游戏优化**: 专为游戏场景优化的黑板系统和状态管理

## 安装

```bash
npm install kunpocc-behaviortree
```

## 快速开始

```typescript
import { 
    BehaviorTree, 
    Action, 
    Condition, 
    Sequence, 
    Selector,
    Status 
} from 'kunpocc-behaviortree';

// 定义AI角色
interface Character {
    health: number;
    hasWeapon: boolean;
}

const character: Character = {
    health: 80,
    hasWeapon: true
};

// 创建条件节点
const isHealthLow = new Condition((char: Character) => char.health < 30);
const hasWeapon = new Condition((char: Character) => char.hasWeapon);

// 创建行动节点
const flee = new Action(() => {
    console.log("逃跑！");
    return Status.SUCCESS;
});

const attack = new Action(() => {
    console.log("攻击！");
    return Status.SUCCESS;
});

// 构建行为树：生命值低时逃跑，否则攻击
const tree = new BehaviorTree(character, 
    new Selector(
        new Sequence(isHealthLow, flee),
        new Sequence(hasWeapon, attack)
    )
);

// 执行行为树
tree.tick(); // 输出: "攻击！"
```

#### 基本概念

1. 节点状态
```typescript
enum Status {
    SUCCESS,  // 成功
    FAILURE,  // 失败
    RUNNING   // 运行中
}
```

2. 节点类型
- **动作节点 (Action)**：执行具体行为的叶子节点
- **组合节点 (Composite)**：控制子节点执行顺序的节点
- **条件节点 (Condition)**：判断条件的节点
- **装饰节点 (Decorator)**：修饰其他节点行为的节点

#### 常用节点

1. 组合节点

   ```typescript
   // 顺序节点：按顺序执行所有子节点，直到遇到失败或运行中的节点
   new Sequence(childNode1, childNode2, childNode3);
   
   // 选择节点：选择第一个成功或运行中的子节点
   new Selector(childNode1, childNode2, childNode3);
   
   // 并行节点：同时执行所有子节点，全部成功才成功
   new Parallel(childNode1, childNode2, childNode3);
   
   // 并行任一成功节点：同时执行所有子节点，任一成功即成功
   new ParallelAnySuccess(childNode1, childNode2, childNode3);
   
   // 记忆顺序节点：记住上次执行的位置
   new MemSequence(childNode1, childNode2, childNode3);
   
   // 记忆选择节点：记住上次执行的位置
   new MemSelector(childNode1, childNode2, childNode3);
   
   // 随机选择节点：随机选择一个子节点执行
   new RandomSelector(childNode1, childNode2, childNode3);
   ```

2. 动作节点

   ```typescript
   // 行动节点 - 返回指定状态
   new Action(() => {
       console.log("执行动作");
       return Status.SUCCESS;  // 或 Status.FAILURE, Status.RUNNING
   });
   
   // 条件节点 - 检查条件返回成功或失败
   new Condition((subject) => {
       return subject.health > 50; // 返回 true 表示成功，false 表示失败
   });
   
   // 等待节点
   new WaitTime(2);  // 等待2秒
   new WaitTicks(5);  // 等待5个tick
   ```

3. 装饰节点

   ```typescript
   // 反转节点 - 反转子节点的成功/失败状态
   new Inverter(childNode);
   
   // 重复节点 - 重复执行子节点指定次数
   new Repeat(childNode, 3);
   
   // 重复直到失败 - 重复执行直到子节点失败
   new RepeatUntilFailure(childNode, 5);
   
   // 重复直到成功 - 重复执行直到子节点成功
   new RepeatUntilSuccess(childNode, 5);
   
   // 时间限制节点 - 限制子节点执行时间
   new LimitTime(childNode, 5); // 5秒
   
   // 次数限制节点 - 限制子节点执行次数
   new LimitTimes(childNode, 3);
   ```

4. 使用黑板共享数据

   ```typescript
   // 在节点中使用黑板
   class CustomAction extends BTNode {
       tick: Status {
           // 获取数据 - 使用节点实例作为命名空间
           const data = tree.blackboard.get<string>("key", this);
           
           // 设置数据 - 使用节点实例作为命名空间
           tree.blackboard.set("key", "value", this);
           
           return Status.SUCCESS;
       }
   }
   ```

   
#### 注意事项

1. 节点状态说明：
   - `SUCCESS`：节点执行成功
   - `FAILURE`：节点执行失败
   - `RUNNING`：节点正在执行中
2. 组合节点特性：
   - `Sequence`：所有子节点返回 SUCCESS 才返回 SUCCESS
   - `Selector`：任一子节点返回 SUCCESS 就返回 SUCCESS
   - `Parallel`：并行执行所有子节点
   - `MemSequence/MemSelector`：会记住上次执行位置
3. 性能优化：
   - 使用黑板共享数据，避免重复计算
   - 合理使用记忆节点，减少重复执行
   - 控制行为树的深度，避免过于复杂