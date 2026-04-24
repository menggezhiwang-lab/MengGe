import { _decorator, Component, Node, Vec3, KeyCode, EventKeyboard, input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewScript')
export class NewScript extends Component {
    speed = 220;
    keyMap: Record<number, boolean> = {};

    onLoad() {
        // 这是 Cocos 3.8+ 唯一正确写法
        input.on(EventKeyboard.EventCode.KEY_DOWN, this.onKeyDown, this);
        input.on(EventKeyboard.EventCode.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        this.keyMap[event.keyCode] = true;
    }

    onKeyUp(event: EventKeyboard) {
        this.keyMap[event.keyCode] = false;
    }

    update(dt: number) {
        console.log(23);
        let x = 0, y = 0;

        if (this.keyMap[KeyCode.KEY_A]) x--;
        if (this.keyMap[KeyCode.KEY_D]) x++;
        if (this.keyMap[KeyCode.KEY_W]) y++;
        if (this.keyMap[KeyCode.KEY_S]) y--;

        const dir = new Vec3(x, y, 0).normalize();
        this.node.setPosition(this.node.position.add(dir.multiplyScalar(this.speed * dt)));
    }
}