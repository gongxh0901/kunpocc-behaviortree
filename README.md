# 行为树

> 一个简洁、高效的 TypeScript 行为树库。遵循"好品味"设计原则：简单数据结构，消除特殊情况，直接暴露问题。

[![npm version](https://badge.fury.io/js/kunpocc-behaviortree.svg)](https://badge.fury.io/js/kunpocc-behaviortree)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 特性

- 🎯 **简洁设计**: 零废话，直接解决问题
- 🔧 **类型安全**: 完整 TypeScript 支持
- 🚀 **高性能**: 优化的执行机制，最小开销  
- 📦 **零依赖**: 纯净实现，无第三方依赖
- 🔄 **状态管理**: 分层黑板系统，数据隔离清晰

## 快速开始

#### 安装

```bash
npm install kunpocc-behaviortree
```

#### 内置demo

项目根目录下的 `bt-demo`文件夹

demo是基于`cocos creator3.8.6`制作的



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
- **组合节点**: 包含多个子节点  (Composite)
- **装饰节点**: 有且只有一个子节点（Decorator） 
- **叶子节点**: 不能包含子节点 (LeafNode)
- **条件节点**: 特殊的叶子节点 (Condition)



## 装饰器

> **自行实现的节点，通过装饰器把数据暴露给行为树编辑器**

##### ClassAction - 行为节点装饰器

##### ClassCondition - 条件节点装饰器

##### ClassComposite - 组合节点装饰器

##### ClassDecorator - 装饰节点装饰器

##### prop - 属性装饰器



## 内置节点

### 组合节点 (Composite)

##### Selector - 选择节点  
* 选择第一个成功的子节点

##### Sequence - 顺序节点
* 按顺序执行子节点，执行过程中子节点返回非SUCCESS，则返回子节点状态，全部成功返回SUCCESS

##### Parallel - 并行节点
* 执行所有子节点，全部成功才成功
* 并不是真正的并行，也有执行顺序

##### RandomSelector - 随机选择节点
* 随机选择一个子节点执行

##### ParallelAnySuccess - 并行任一成功
* 同时执行所有子节点，任一成功就成功



### 装饰节点 (Decorator)

##### ConditionDecorator - 条件装饰节点

* 子类需实现

  ```typescript
  /**
   * 判断是否满足条件
   * @returns 是否满足条件
   */
  protected abstract isEligible(): boolean;
  ```

##### Inverter - 反转节点
* 反转子节点的成功/失败状态

##### LimitTime - 时间限制

* 规定时间内,  向父节点返回子节点的结果，超时后返回失败

##### LimitTicks - 次数限制

* 执行次数(子节点非RUNNNG状态)内，向父节点返回子节点的结果，超过次数后返回失败

##### Repeat - 重复节点
* 重复执行指定次数

##### RepeatUntilSuccess - 重复直到成功

* 设置最大重试次数

##### RepeatUntilFailure - 重复直到失败  

* 设置最大重试次数

##### WeightDecorator - 权重装饰节点

* 用于随机选择节点的子节点的按权重随机



### 叶子节点 (LeafNode)

##### LeafNode - 叶子节点基类

##### WaitTicks - 次数等待节点

##### WaitTime - 时间等待节点

### 条件节点 (Condition)

##### Condition - 条件节点基类

* 特殊的叶子节点，子类需实现

  ```typescript
  /**
   * 判断是否满足条件
   * @returns 是否满足条件
   */
  protected abstract isEligible(): boolean;
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



## 许可证

ISC License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request。请确保：
1. 代码风格一致
2. 添加适当的测试
3. 更新相关文档

---

*"好的程序员关心数据结构，而不是代码。"* - 这个库遵循简洁设计原则，专注于解决实际问题。