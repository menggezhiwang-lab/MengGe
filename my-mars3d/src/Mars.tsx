import { useEffect } from 'react'
import "mars3d-cesium/Build/Cesium/Widgets/widgets.css";
import "mars3d/mars3d.css";
import * as mars3d from "mars3d";

function Mars() {
    useEffect(() => {
        // 你的天地图密钥

        const map = new mars3d.Map("mars3dContainer", {
            control: {
                // 1. 右上角控件组
                homeButton: true,              // 归位按钮
                sceneModePicker: true,         // 2D/3D切换
                // baseLayerPicker: true,         // 底图选择器
                fullscreenButton: true,        // 全屏按钮
                vrButton: true,                // VR按钮
                navigationHelpButton: true,    // 帮助按钮
                zoom: true,
                // 3. 左下角：比例尺
                distanceLegend: true,          // 开启比例尺
                // 如果还需要更多，可以在这里继续加
            },
            basemaps: [
                {
                    name: "天地图影像",
                    type: "wmts",
                    // 关键修改：直接拼接完整的 WMTS 请求参数
                    // 注意：这里不再依赖代理去重写路径，而是让代理只负责转发
                    url: "https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=3f83f8f81571eaaa187fded45c1997d4",
                    // 必须指定 tileMatrixSet，否则 Cesium 可能会尝试请求 GetCapabilities
                    tileMatrixSet: "w",
                    queryParameters: {},
                    show: true
                },
                {
                    name: "天地图影像注记",
                    type: "wmts",
                    url: "https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=3f83f8f81571eaaa187fded45c1997d4",
                    tileMatrixSet: "w",
                    show: true,
                    queryParameters: {},
                    opacity: 1 // 透明度，调大道路更清晰
                }
            ],
            scene: {
                center: { lat: 30.59, lng: 114.3, alt: 400000, heading: 0, pitch: -90 }, // 指定初始中心点和高度
                // 或者直接指定缩放级别
                // zoom: 4 
            }
        });

        const searchControl = new mars3d.control.Search({
            key: "3f83f8f81571eaaa187fded45c1997d4",
            autoFly: true,
            addMarker: true,
            showPopup: true,
        });
        map.addControl(searchControl);

        return () => {
            map.destroy();
        };
    }, []);

    return <div id="mars3dContainer" style={{ height: '100vh', width: '100%' }} />;
}

export default Mars