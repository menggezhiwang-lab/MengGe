import OriginalStats from 'three/addons/libs/stats.module.js';

export default class Stats extends OriginalStats {
    constructor() {
        super();

        // 删除多余面板
        const dom = this.dom as HTMLDivElement;
        while (dom.children.length > 1) {
            const child = dom.lastChild;
            if (child) {
                dom.removeChild(child);
            }
        }
    }
}