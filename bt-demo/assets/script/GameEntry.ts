import { _decorator, Component, JsonAsset, sp } from 'cc';
import { BT } from './Header';
const { ccclass, property, menu } = _decorator;
@ccclass("GameEntry")
@menu("kunpo/GameEntry")
export class GameEntry extends Component {
    @property(sp.Skeleton)
    private skeleton: sp.Skeleton = null;

    @property(JsonAsset)
    private btConfig: JsonAsset = null;

    private _tree: BT.BehaviorTree<sp.Skeleton> = null;
    start(): void {
        console.log("btConfig", this.btConfig);
        let btTree1: BT.INodeConfig[] = this.btConfig.json["bt-tree1"]
        this._tree = BT.createBehaviorTree(btTree1, this.skeleton);
    }

    protected update(dt: number): void {
        this._tree.tick(dt);
    }
}