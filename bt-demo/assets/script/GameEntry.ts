import { _decorator, Component, Node } from 'cc';
import * as BT from "kunpocc-behaviortree";
const { ccclass, property, menu } = _decorator;
@ccclass("GameEntry")
@menu("kunpo/GameEntry")
export class GameEntry extends Component {
    @property(Node)
    private stage: Node = null;

    @property(Node)
    private touchNode: Node = null;

    start(): void {
        BT
    }

    protected update(dt: number): void {

    }
}