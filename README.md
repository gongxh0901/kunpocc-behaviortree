# 行为树

> 一个简洁、高效的 TypeScript 行为树库。遵循"好品味"设计原则：简单数据结构，消除特殊情况，直接暴露问题。

[![npm version](https://badge.fury.io/js/kunpocc-behaviortree.svg)](https://badge.fury.io/js/kunpocc-behaviortree)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 特性

- 🎯 **简洁设计**: 零废话，直接解决问题
- 🔧 **类型安全**: 完整 TypeScript 支持
- 🚀 **高性能**: 优化的执行机制，最小开销  
- 🧠 **记忆节点**: 智能状态记忆，避免重复计算
- 📦 **零依赖**: 纯净实现，无第三方依赖
- 🔄 **状态管理**: 分层黑板系统，数据隔离清晰

## 快速开始

### 安装

```bash
npm install kunpocc-behaviortree
```

### 基础示例

```typescript
import { 
    BehaviorTree, Status, Action, Condition, 
    Sequence, Selector 
} from 'kunpocc-behaviortree';

// 定义实体
interface Enemy {
    health: number;
    hasWeapon: boolean;
    position: { x: number, y: number };
}

const enemy: Enemy = {
    health: 30,
    hasWeapon: true,
    position: { x: 100, y: 200 }
};

// 创建行为树
const tree = new BehaviorTree(enemy,
    new Selector(
        // 生命值低时逃跑
        new Sequence(
            new Condition((node) => {
                const entity = node.getEntity<Enemy>();
                return entity.health < 50;
            }),
            new Action((node) => {
                console.log("血量低，逃跑！");
                return Status.SUCCESS;
            })
        ),
        // 否则攻击
        new Action((node) => {
            console.log("发起攻击！");
            return Status.SUCCESS;
        })
    )
);

// 执行
tree.tick(); // 输出: "血量低，逃跑！"
```

## 核心概念

### 状态类型
```typescript
enum Status {
    SUCCESS,    // 成功
    FAILURE,    // 失败  
    RUNNING     // 运行中
}
```

### 节点类型
- **组合节点**: 控制子节点执行逻辑（Sequence、Selector、Parallel等）
- **装饰节点**: 修饰单个子节点（Inverter、Repeat、Limit等）  
- **叶子节点**: 执行具体逻辑（Action、Condition、Wait等）

## 节点详解

### 组合节点 (Composite)

#### Sequence - 顺序节点
按顺序执行子节点，全部成功才成功：
```typescript
new Sequence(
    checkAmmo,        // 检查弹药
    aim,              // 瞄准
    shoot             // 射击
)
// 只有全部成功才返回SUCCESS
```

#### Selector - 选择节点  
选择第一个成功的子节点：
```typescript
new Selector(
    tryMeleeAttack,   // 尝试近战
    tryRangedAttack,  // 尝试远程
    retreat           // 撤退
)
// 任一成功就返回SUCCESS
```

#### Parallel - 并行节点
同时执行所有子节点，全部成功才成功：
```typescript
new Parallel(
    moveToTarget,     // 移动到目标
    playAnimation,    // 播放动画
    updateUI          // 更新UI
)
// 任一失败返回FAILURE，有RUNNING返回RUNNING，全部SUCCESS才返回SUCCESS
```

#### ParallelAnySuccess - 并行任一成功
同时执行所有子节点，任一成功就成功：
```typescript
new ParallelAnySuccess(
    findCover,        // 寻找掩体
    callForHelp,      // 呼叫支援  
    counterAttack     // 反击
)
// 任一SUCCESS就返回SUCCESS
```

#### Memory节点 - 状态记忆
记忆节点会记住上次执行位置，避免重复执行：

```typescript
// MemSequence - 记忆顺序节点
new MemSequence(
    longTask1,        // 第一次：SUCCESS，继续下一个
    longTask2,        // 第一次：RUNNING，记住这个位置； 第二次：从longTask2开始继续执行
    longTask3
)

// MemSelector - 记忆选择节点  
new MemSelector(
    expensiveCheck1,  // 第一次：FAILURE，继续下一个
    expensiveCheck2,  // 第一次：RUNNING，记住这个位置； 第二次：从expensiveCheck2开始执行
    fallback          // 如果前面都是FAILURE才会执行到这里
)
```

#### RandomSelector - 随机选择
随机选择一个子节点执行：
```typescript
new RandomSelector(
    idleBehavior1,
    idleBehavior2, 
    idleBehavior3
)
```

### 装饰节点 (Decorator)

#### Inverter - 反转节点
反转子节点的成功/失败状态：
```typescript
new Inverter(
    new Condition((node) => {
        const enemy = node.getEntity<Enemy>();
        return enemy.isAlive;
    })
) // 敌人死亡时返回SUCCESS
```

#### Repeat - 重复节点
重复执行子节点指定次数：
```typescript
new Repeat(
    new Action((node) => {
        console.log("射击");
        return Status.SUCCESS;
    }),
    3  // 射击3次
)
```

#### RepeatUntilSuccess - 重复直到成功
```typescript
new RepeatUntilSuccess(
    new Action((node) => {
        console.log("尝试开门");
        return Math.random() > 0.5 ? Status.SUCCESS : Status.FAILURE;
    }),
    5  // 最多尝试5次
)
```

#### RepeatUntilFailure - 重复直到失败  
```typescript
new RepeatUntilFailure(
    new Action((node) => {
        console.log("收集资源");
        return Status.SUCCESS; // 持续收集直到失败
    }),
    10 // 最多收集10次
)
```

#### LimitTime - 时间限制
```typescript
new LimitTime(
    new Action((node) => {
        console.log("执行复杂计算");
        return Status.SUCCESS;
    }),
    2.0  // 最多执行2秒
)
```

#### LimitTicks - 次数限制
```typescript
new LimitTicks(
    new Action((node) => {
        console.log("尝试操作");
        return Status.SUCCESS;
    }),
    5  // 最多执行5次
)
```

### 叶子节点 (Leaf)

#### Action - 动作节点
执行自定义逻辑：
```typescript
new Action((node) => {
    // 直接获取实体
    const target = node.getEntity<Character>();
    
    // 访问黑板数据
    const ammo = node.get<number>('ammo');
    
    if (target && ammo > 0) {
        console.log("攻击目标");
        node.set('ammo', ammo - 1);
        return Status.SUCCESS;
    }
    return Status.FAILURE;
})
```

#### Condition - 条件节点
检查条件：
```typescript
new Condition((node) => {
    const player = node.getEntity<Player>();
    const health = player.health;
    return health > 50; // true->SUCCESS, false->FAILURE
})
```

#### WaitTime - 时间等待
```typescript
new WaitTime(2.5)  // 等待2.5秒
```

#### WaitTicks - 帧数等待
```typescript
new WaitTicks(60)  // 等待60帧
```

## 黑板系统

黑板系统提供分层数据存储，支持数据隔离和查找链：

```typescript
// 在节点中使用黑板
new Action((node) => {
    // 直接获取实体
    const entity = node.getEntity<Character>();
    
    // 本地数据（仅当前节点可见）
    node.set('local_count', 1);
    const count = node.get<number>('local_count');
    
    // 树级数据（整棵树可见）
    node.setRoot('tree_data', 'shared');
    const shared = node.getRoot<string>('tree_data');
    
    // 全局数据（所有树可见）
    node.setGlobal('global_config', config);
    const config = node.getGlobal<Config>('global_config');
    
    return Status.SUCCESS;
})
```

### 数据查找链
黑板数据按以下顺序查找：
1. 当前节点的本地黑板
2. 父节点的黑板
3. 递归向上查找到根节点

### Memory节点的数据隔离
Memory节点会创建独立的子黑板，确保状态隔离：
```typescript
const mem1 = new MemSequence(/* ... */);
const mem2 = new MemSequence(/* ... */);
// mem1 和 mem2 的记忆状态完全独立
```

## 完整示例

```typescript
import { 
    BehaviorTree, Status, Action, Condition,
    Sequence, Selector, MemSelector, Parallel,
    Inverter, RepeatUntilSuccess, LimitTime
} from 'kunpocc-behaviortree';

interface Character {
    health: number;
    mana: number;
    hasWeapon: boolean;
    isInCombat: boolean;
    position: { x: number, y: number };
}

const character: Character = {
    health: 80,
    mana: 50, 
    hasWeapon: true,
    isInCombat: false,
    position: { x: 0, y: 0 }
};

// 构建复杂行为树
const behaviorTree = new BehaviorTree(character,
    new Selector(
        // 战斗行为
        new Sequence(
            new Condition((node) => {
                const char = node.getEntity<Character>();
                return char.isInCombat;
            }),
            new Selector(
                // 生命值低时治疗
                new Sequence(
                    new Condition((node) => {
                        const char = node.getEntity<Character>();
                        return char.health < 30;
                    }),
                    new RepeatUntilSuccess(
                        new Action((node) => {
                            const char = node.getEntity<Character>();
                            if (char.mana >= 10) {
                                char.health += 20;
                                char.mana -= 10;
                                console.log("治疗完成");
                                return Status.SUCCESS;
                            }
                            return Status.FAILURE;
                        }),
                        3 // 最多尝试3次
                    )
                ),
                // 正常攻击
                new Sequence(
                    new Condition((node) => {
                        const char = node.getEntity<Character>();
                        return char.hasWeapon;
                    }),
                    new LimitTime(
                        new Action((node) => {
                            console.log("发起攻击");
                            return Status.SUCCESS;
                        }),
                        1.0 // 攻击最多1秒
                    )
                )
            )
        ),
        // 非战斗行为 - 巡逻
        new MemSelector(
            new Action((node) => {
                console.log("巡逻点A");
                return Status.SUCCESS;
            }),
            new Action((node) => {
                console.log("巡逻点B"); 
                return Status.SUCCESS;
            }),
            new Action((node) => {
                console.log("巡逻点C");
                return Status.SUCCESS;
            })
        )
    )
);

// 执行行为树
console.log("=== 执行行为树 ===");
behaviorTree.tick(); // 输出: "巡逻点A"

// 进入战斗状态
character.isInCombat = true;
character.health = 20; // 低血量

behaviorTree.tick(); // 输出: "治疗完成"
```

## 最佳实践

### 1. 节点设计原则
- **单一职责**: 每个节点只做一件事
- **状态明确**: 明确定义SUCCESS/FAILURE/RUNNING的含义
- **避免副作用**: 尽量避免节点间的隐式依赖

### 2. 性能优化
```typescript
// ✅ 好的做法 - 使用记忆节点避免重复计算
new MemSelector(
    expensivePathfinding,   // 复杂寻路只计算一次
    fallbackBehavior
)

// ❌ 避免 - 每次都重新计算
new Selector(
    expensivePathfinding,   // 每次tick都会重新计算
    fallbackBehavior  
)
```

### 3. 黑板使用
```typescript
// ✅ 好的做法 - 合理使用数据层级
new Action((node) => {
    // 获取实体
    const player = node.getEntity<Player>();
    
    // 临时数据用本地黑板
    node.set('temp_result', calculation());
    
    // 共享数据用树级黑板
    node.setRoot('current_target', target);
    
    // 配置数据用全局黑板
    node.setGlobal('game_config', config);
})
```

### 4. 错误处理
```typescript
// ✅ 明确的错误处理
new Action((node) => {
    try {
        const result = riskyOperation();
        return result ? Status.SUCCESS : Status.FAILURE;
    } catch (error) {
        console.error('Operation failed:', error);
        return Status.FAILURE;
    }
})
```

## 测试覆盖

本库包含全面的测试用例，覆盖：
- ✅ 17种节点类型 (100%覆盖)
- ✅ Memory节点状态管理
- ✅ 黑板数据隔离
- ✅ 边界条件处理
- ✅ 复杂嵌套场景

运行测试：
```bash
npm test
```

## API 参考

### 核心类

#### `BehaviorTree<T>`
```typescript
constructor(entity: T, root: IBTNode)
tick(): Status           // 执行一次行为树
reset(): void           // 重置所有状态
```

#### `Status`
```typescript
enum Status {
    SUCCESS = 0,
    FAILURE = 1, 
    RUNNING = 2
}
```

### 节点接口
```typescript
interface IBTNode {
    readonly children: IBTNode[];
  	// 节点黑板
    local: IBlackboard;
    tick(): Status;
    
    // 优先写入自己的黑板数据, 如果没有则写入父节点的黑板数据
    set<T>(key: string, value: T): void;
    get<T>(key: string): T;
  	// 写入树根节点的黑板数据
    setRoot<T>(key: string, value: T): void;
    getRoot<T>(key: string): T;
  	// 写入全局黑板数据
    setGlobal<T>(key: string, value: T): void;
    getGlobal<T>(key: string): T;
    
    // 实体访问
    getEntity<T>(): T;
}
```

## 许可证

ISC License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request。请确保：
1. 代码风格一致
2. 添加适当的测试
3. 更新相关文档

---

*"好的程序员关心数据结构，而不是代码。"* - 这个库遵循简洁设计原则，专注于解决实际问题。