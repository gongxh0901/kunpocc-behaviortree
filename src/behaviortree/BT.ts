/**
 * 行为树装饰器和元数据管理
 * 用于编辑器显示和配置节点信息
 */

export namespace BT {
    /**
     * 参数类型枚举
     */
    export enum ParamType {
        int = "number",
        float = "float",
        string = "string",
        bool = "boolean"
    }

    /**
     * 节点类型枚举
     */
    export enum Type {
        /** 行为节点 */
        Action = "action",
        /** 条件节点 */
        Condition = "condition",
        /** 组合节点 */
        Composite = "composite",
        /** 装饰节点 */
        Decorator = "decorator"
    }

    /**
     * 参数描述接口
     */
    export interface ParameterInfo {
        /** 参数类型 */
        type: ParamType;
        /** 参数名称 */
        name: string;
        /** 参数描述 */
        description?: string;
        /** 默认值 */
        defaultValue?: any;
        /** 是否必需 */
        required?: boolean;
    }

    /**
     * 节点元数据接口
     */
    export interface NodeMetadata {
        /** 节点名称 */
        name: string;
        /** 节点分组 */
        group: string;
        /** 节点类型 */
        type: Type;
        /** 节点描述 */
        description: string;
        /** 参数列表 */
        parameters: ParameterInfo[];
        /** 最大子节点数量：0=不允许子节点，1=最多一个子节点，-1=无限制 */
        maxChildren: number;
    }

    /**
     * 节点元数据存储
     */
    const NODE_METADATA_MAP = new Map<string, NodeMetadata>();

    /**
     * 行为节点装饰器
     */
    export function ActionNode(metadata: Omit<NodeMetadata, "type" | "maxChildren">) {
        return function <T extends new (...args: any[]) => any>(constructor: T) {
            const fullMetadata: NodeMetadata = {
                ...metadata,
                type: Type.Action,
                maxChildren: 0,
            };
            NODE_METADATA_MAP.set(constructor.name, fullMetadata);
            return constructor;
        };
    }

    /**
     * 条件节点装饰器
     */
    export function ConditionNode(metadata: Omit<NodeMetadata, "type" | "maxChildren">) {
        return function <T extends new (...args: any[]) => any>(constructor: T) {
            const fullMetadata: NodeMetadata = {
                ...metadata,
                type: Type.Condition,
                maxChildren: 0,
            };
            NODE_METADATA_MAP.set(constructor.name, fullMetadata);
            return constructor;
        };
    }

    /**
     * 组合节点装饰器
     */
    export function CompositeNode(metadata: Omit<NodeMetadata, "type" | "maxChildren">) {
        return function <T extends new (...args: any[]) => any>(constructor: T) {
            const fullMetadata: NodeMetadata = {
                ...metadata,
                type: Type.Composite,
                maxChildren: -1
            };
            NODE_METADATA_MAP.set(constructor.name, fullMetadata);
            return constructor;
        };
    }

    /**
     * 装饰节点装饰器
     */
    export function DecoratorNode(metadata: Omit<NodeMetadata, "type" | "maxChildren">) {
        return function <T extends new (...args: any[]) => any>(constructor: T) {
            const fullMetadata: NodeMetadata = {
                ...metadata,
                type: Type.Decorator,
                maxChildren: 1
            };
            NODE_METADATA_MAP.set(constructor.name, fullMetadata);
            return constructor;
        };
    }

    /**
     * 获取节点元数据
     */
    export function getNodeMetadata(nodeName: string): NodeMetadata | undefined {
        return NODE_METADATA_MAP.get(nodeName);
    }

    /**
     * 获取所有节点元数据
     */
    export function getAllNodeMetadata(): Map<string, NodeMetadata> {
        return new Map(NODE_METADATA_MAP);
    }

    /**
     * 判断节点是否允许子节点
     */
    export function canHaveChildren(metadata: NodeMetadata): boolean {
        return metadata.maxChildren !== 0;
    }

    /**
     * 判断节点是否可以添加更多子节点
     */
    export function canAddMoreChildren(metadata: NodeMetadata, currentChildCount: number): boolean {
        return metadata.maxChildren === -1 || currentChildCount < metadata.maxChildren;
    }
}

let _global = globalThis || window || global;
(_global as any)["getKunpoBTNodeMaps"] = function () {
    return BT.getAllNodeMetadata();
};