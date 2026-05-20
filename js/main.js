// ================================================================
// 数字孪生校园系统 - 浙江树人学院 期中作业
// ================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ================================================================
// 1. 场景 / 相机 / 渲染器
// ================================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 45, 70);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(15, 12, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('container').appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';
document.getElementById('container').appendChild(labelRenderer.domElement);

// ================================================================
// 2. 光照
// ================================================================

scene.add(new THREE.AmbientLight(0x404060, 0.6));

const sun = new THREE.DirectionalLight(0xffeedd, 1.8);
sun.position.set(5, 12, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 65;
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);

const fill1 = new THREE.DirectionalLight(0x8888ff, 0.3);
fill1.position.set(-10, 6, -12);
scene.add(fill1);

const fill2 = new THREE.PointLight(0x4488ff, 0.2);
fill2.position.set(0, 8, 0);
scene.add(fill2);

scene.add(new THREE.HemisphereLight(0x87CEEB, 0x3a7d44, 0.4));

// ================================================================
// 3. 地面 + 网格
// ================================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x7ec850, roughness: 0.85 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(60, 30, 0x888888, 0x555555);
grid.position.y = 0.001;
scene.add(grid);

// ================================================================
// 4. 图层分组
// ================================================================

const buildingGroup = new THREE.Group();
const vegetationGroup = new THREE.Group();
const roadGroup = new THREE.Group();
scene.add(buildingGroup, vegetationGroup, roadGroup);

// ================================================================
// 5. 辅助函数
// ================================================================

const clickable = [];
function mkClick(obj, name, desc) {
    obj.userData = { name, description: desc, clickable: true };
    clickable.push(obj);
}
function lbl(text, yOff) {
    const d = document.createElement('div');
    d.textContent = text; d.className = 'object-label';
    const o = new CSS2DObject(d); o.position.y = yOff;
    return o;
}
function winZ(grp, w, d, n, h) {
    const m = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x4488bb, emissiveIntensity: 0.05 });
    for (let i = 0; i < n; i++) {
        const fy = i * h + h / 2;
        for (let wx = -w / 2 + 0.25; wx <= w / 2 - 0.25; wx += 0.35) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), m);
            a.position.set(wx, fy, d / 2 + 0.02); grp.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), m);
            b.position.set(wx, fy, -d / 2 - 0.02); grp.add(b);
        }
    }
}
const WOOD = 0xbb9966;
const BRIDGE = 0xccaa77;

// ================================================================
// 6. 升旗台 (0, 1.5)
// ================================================================

const flagG = new THREE.Group();
const fb = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 0.7 })
);
fb.position.y = 0.1; fb.castShadow = true; fb.receiveShadow = true;
flagG.add(fb);
mkClick(fb, '升旗台', '校园中心升旗台，用于举行升旗仪式和重要集会活动。');

const fp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 })
);
fp.position.y = 0.85; fp.castShadow = true;
flagG.add(fp);
flagG.add(lbl('升旗台', 1.9));
flagG.position.set(0, 0, 1.5);
buildingGroup.add(flagG);

// ================================================================
// 7. A1/A2 前排 (Z=-10)  5层×0.45=2.25  宽2.8深2.8  #b84c3c
// ================================================================

const AF = 5, AH = 0.45, AW = 2.8, AD = 2.8;
const TCOL = 0xb84c3c;

[[5.5, -10.0, '教学楼A1(东前)', '东侧前排教学楼，5层，人文社科类课程。'],
 [-5.5, -10.0, '教学楼A2(西前)', '西侧前排教学楼，5层，理工科基础课程。'],
].forEach(([x, z, lab, desc]) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: TCOL, roughness: 0.7 });
    for (let i = 0; i < AF; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(AW, AH, AD), mat);
        f.position.y = i * AH + AH / 2;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, lab, desc);
        g.add(f);
    }
    winZ(g, AW, AD, AF, AH);
    g.position.set(x, 0, z);
    g.add(lbl(lab, AF * AH + 0.5));
    buildingGroup.add(g);
});

// ================================================================
// 8. A3/A4 中排 (Z=-6)  5层×0.45=2.25  宽2.8深2.8  #b84c3c
// ================================================================

[[5.5, -6.0, '教学楼A3(东中)', '东侧中排教学楼，5层，外语与艺术类课程。'],
 [-5.5, -6.0, '教学楼A4(西中)', '西侧中排教学楼，5层，信息技术类课程。'],
].forEach(([x, z, lab, desc]) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: TCOL, roughness: 0.7 });
    for (let i = 0; i < AF; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(AW, AH, AD), mat);
        f.position.y = i * AH + AH / 2;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, lab, desc);
        g.add(f);
    }
    winZ(g, AW, AD, AF, AH);
    g.position.set(x, 0, z);
    g.add(lbl(lab, AF * AH + 0.5));
    buildingGroup.add(g);
});

// ================================================================
// 9. 3F/4F 天桥 —— A1↔A3 A2↔A4  Z中=-8  间距4.0
//     y=1.2 与 y=1.65  Box(1.2,0.2,4.0)
// ================================================================

function mkBridge(x, z, y, len, lab, desc) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.2, len),
        new THREE.MeshStandardMaterial({ color: BRIDGE, roughness: 0.8 })
    );
    m.position.y = 0.1; m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    mkClick(m, lab, desc);
    g.add(lbl(lab, 0.5));
    g.position.set(x, y, z);
    buildingGroup.add(g);
}
mkBridge(5.5, -8.0, 1.2, 4.0, '3F天桥(东)', '东侧三层天桥');
mkBridge(5.5, -8.0, 1.65, 4.0, '4F天桥(东)', '东侧四层天桥');
mkBridge(-5.5, -8.0, 1.2, 4.0, '3F天桥(西)', '西侧三层天桥');
mkBridge(-5.5, -8.0, 1.65, 4.0, '4F天桥(西)', '西侧四层天桥');

// ================================================================
// 10. 2F 台阶 —— A1/A2二楼→A3/A4三楼  TubeGeometry
//     东：(5.5,0.7,-10)→(5.5,1.2,-6)  西：(-5.5,0.7,-10)→(-5.5,1.2,-6)
// ================================================================

function mkTube(p1, p2, lab, desc, col) {
    const c = new THREE.LineCurve3(new THREE.Vector3(...p1), new THREE.Vector3(...p2));
    const geo = new THREE.TubeGeometry(c, 14, 0.15, 8, false);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col || WOOD, roughness: 0.8 }));
    m.castShadow = true; m.receiveShadow = true;
    mkClick(m, lab, desc);
    buildingGroup.add(m);
    const l = lbl(lab, 1.1);
    l.position.set((p1[0] + p2[0]) / 2, 0, (p1[2] + p2[2]) / 2);
    buildingGroup.add(l);
}
mkTube([5.5, 0.7, -10.0], [5.5, 1.2, -6.0], '台阶连廊(东)', '东侧前后排教学楼之间的斜向台阶。');
mkTube([-5.5, 0.7, -10.0], [-5.5, 1.2, -6.0], '台阶连廊(西)', '西侧前后排教学楼之间的斜向台阶。');

// ================================================================
// 11. B1/B2 后排 (Z=-2)  5层×0.45=2.25  宽3.6深2.8  #b84c3c 
// ================================================================

const BW = 3.6;  // 原3.2，再增大0.4，进一步向内侧延伸

[[5.5, -2.0, '教学楼B1(东)', '东侧后排教学楼,5层,专业教室。'],
 [-5.5, -2.0, '教学楼B2(西)', '西侧后排教学楼,5层,专业教室。'],
].forEach(([x, z, lab, desc]) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: TCOL, roughness: 0.7 });
    for (let i = 0; i < AF; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(BW, AH, AD), mat);
        f.position.y = i * AH + AH / 2;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, lab, desc);
        g.add(f);
    }
    // 窗户适配新宽度
    const wm = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x4488bb, emissiveIntensity: 0.05 });
    for (let i = 0; i < AF; i++) {
        const fy = i * AH + AH / 2;
        for (let wx = -BW / 2 + 0.25; wx <= BW / 2 - 0.25; wx += 0.4) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), wm);
            a.position.set(wx, fy, AD / 2 + 0.02); g.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), wm);
            b.position.set(wx, fy, -AD / 2 - 0.02); g.add(b);
        }
    }
    g.position.set(x, 0, z);
    g.add(lbl(lab, AF * AH + 0.5));
    buildingGroup.add(g);
});

// ================================================================
// 12. 2F 连廊 —— B1/B2二楼→A3/A4三楼  TubeGeometry
//     东：(5.5,0.85,-2)→(5.5,1.25,-6)  西：(-5.5,0.85,-2)→(-5.5,1.25,-6)
// ================================================================

mkTube([5.5, 0.85, -2.0], [5.5, 1.25, -6.0], '校园连廊(东)', '连接B1与A3的空中走廊。');
mkTube([-5.5, 0.85, -2.0], [-5.5, 1.25, -6.0], '校园连廊(西)', '连接B2与A4的空中走廊。');

// ================================================================
// 13. 图信大楼
// ================================================================

(function() {
    const libMat = new THREE.MeshStandardMaterial({ color: 0xddaa66, roughness: 0.65 });
    const infoMat = new THREE.MeshStandardMaterial({ color: 0xccaa77, roughness: 0.65 });
    const wm = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x4488bb, emissiveIntensity: 0.05 });

    // 图书馆 2层
    const libG = new THREE.Group();
    for (let i = 0; i < 2; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 6.0), libMat);
        f.position.y = i * 0.8 + 0.4;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, '图书馆', '校园图书馆（底部2层），藏书丰富，设有自习区、电子阅览室和学术报告厅。');
        libG.add(f);
    }
    for (let i = 0; i < 2; i++) {
        const fy = i * 0.8 + 0.4;
        for (let wx = -3.3; wx <= 3.3; wx += 0.5) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.04), wm);
            a.position.set(wx, fy, 3.02); libG.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.04), wm);
            b.position.set(wx, fy, -3.02); libG.add(b);
        }
    }
    libG.position.set(0, 0, 7.8);  // 原 5.2 → 后移2.6
    libG.add(lbl('图书馆', 1.2));
    buildingGroup.add(libG);

    // 图信楼 10层
    const infoG = new THREE.Group();
    for (let i = 0; i < 10; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.64, 4.5), infoMat);
        f.position.y = 1.6 + i * 0.64 + 0.32;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, '图信楼', '图书馆信息综合楼（上部10层），设有网络中心和档案馆。');
        infoG.add(f);
    }
    for (let i = 0; i < 10; i++) {
        const fy = 1.6 + i * 0.64 + 0.32;
        for (let wx = -2.0; wx <= 2.0; wx += 0.4) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), wm);
            a.position.set(wx, fy, 2.27); infoG.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), wm);
            b.position.set(wx, fy, -2.27); infoG.add(b);
        }
    }
    infoG.position.set(0, 0, 8.55);  // 原 5.95 → 后移2.6
    infoG.add(lbl('图信楼', 7.8));
    buildingGroup.add(infoG);
})();

// ================================================================
// 14. 实验楼
// ================================================================

(function() {
    const g = new THREE.Group();
    const LAB_F = 6, LAB_H = 0.6;
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a6e4b, roughness: 0.7 });
    for (let i = 0; i < LAB_F; i++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(5.5, LAB_H, 5.5), mat);
        f.position.y = i * LAB_H + LAB_H / 2;
        f.castShadow = true; f.receiveShadow = true;
        mkClick(f, '实验楼', '综合实验大楼，6层，配备各类科学实验设备。');
        g.add(f);
    }
    const wm = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x4488bb, emissiveIntensity: 0.05 });
    for (let i = 0; i < LAB_F; i++) {
        const fy = i * LAB_H + LAB_H / 2;
        for (let wx = -2.5; wx <= 2.5; wx += 0.45) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.04), wm);
            a.position.set(wx, fy, 2.77); g.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.04), wm);
            b.position.set(wx, fy, -2.77); g.add(b);
        }
    }
    g.position.set(-6.0, 0, 15.0);  // X轴再左移2个单位，从-4到-6
    g.add(lbl('实验楼', 4.0));
    buildingGroup.add(g);
})();

// ================================================================
// 15. 道路系统
//     横向: Z=-8(14×1.5), Z=-4(14×1.5), Z=-0.5(14×1.5)
//           Z=2.8(12×1.5), Z=8.0(10×1.5)
//     纵向: X=-6,0,6  长度Z:-11→12 (总长23)
// ================================================================

const rMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
function rd(w, d, x, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), rMat);
    m.position.set(x, 0, z);
    m.receiveShadow = true;
    mkClick(m, '校园道路', '连接各功能区域的校园道路系统。');
    roadGroup.add(m);
}

rd(14, 1.5, 0, -8.0);    // A1/A2 ↔ A3/A4
rd(14, 1.5, 0, -4.0);    // A3/A4 ↔ B1/B2
rd(14, 1.5, 0, -0.5);    // B1/B2 ↔ 升旗台
rd(12, 1.5, 0, 2.8);     // 升旗台 ↔ 图信大楼
rd(10, 1.5, 0, 11.5);     // 图信大楼 ↔ 实验楼
rd(1.0, 23, -6, 0.5);    // 左侧纵向
rd(1.0, 23, 0, 0.5);     // 中轴纵向
rd(1.0, 23, 6, 0.5);     // 右侧纵向

const rl = lbl('校园主干道', 0.5);
rl.position.set(0, 0, -8.0);
roadGroup.add(rl);

// ================================================================
// 16. 植被 —— 至少30棵树 + 灌木
// ================================================================

function tree(cx, cz, sc) {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * sc, 0.18 * sc, 0.7 * sc, 6),
        new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 })
    );
    tr.position.y = 0.35 * sc; tr.castShadow = true; tr.receiveShadow = true;
    g.add(tr);
    const cn = new THREE.Mesh(
        new THREE.ConeGeometry(0.7 * sc, 1.0 * sc, 8),
        new THREE.MeshStandardMaterial({ color: 0x2d6a27, roughness: 0.8 })
    );
    cn.position.y = 1.15 * sc; cn.castShadow = true; cn.receiveShadow = true;
    g.add(cn);
    mkClick(cn, '树木', '校园绿化乔木，为师生提供优美的学习生活环境。');
    g.position.set(cx, 0, cz);
    g.rotation.y = Math.random() * Math.PI * 2;
    return g;
}

const treed = [
    // A1/A2 周围 (X向外扩展)
    [-8.0, -10.0], [8.0, -10.0], [-5.5, -10.0], [5.5, -10.0],
    // A3/A4 周围
    [-8.0, -6.0], [8.0, -6.0], [-5.5, -6.0], [5.5, -6.0],
    // B1/B2 周围
    [-8.0, -2.0], [8.0, -2.0],
    // 旗台周围
    [-2.5, 1.5], [2.5, 1.5],
    // 图信大楼周围 (X向外扩展，Z适应后移)
    [-5.5, 7.8], [5.5, 7.8], [-5.0, 8.5], [5.0, 8.5],
    // 实验楼周围 (X向外扩展，Z适应后移)
    [-10.5, 15.0], [-1.5, 15.0], [-10.5, 13.5], [-1.5, 13.5], 
    // 新增外侧树木
    [-9.0, -9.0], [9.0, -9.0], [-9.0, -5.0], [9.0, -5.0], [-9.0, -1.0], [9.0, -1.0],
];
treed.forEach(([x, z]) => vegetationGroup.add(tree(x, z, 0.8 + Math.random() * 0.4)));

function shrub(cx, cz, sc) {
    const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 * sc, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a7d44, roughness: 0.8 })
    );
    m.position.set(cx, 0.2 * sc, cz);
    m.castShadow = true; m.receiveShadow = true;
    mkClick(m, '灌木', '校园绿化灌木，用于美化环境。');
    return m;
}
[
    // 旗台周围灌木 (X向外)
    [-1.5, 1.5, 0.8], [1.5, 1.5, 0.8], [-2.2, 1.8, 0.7], [2.2, 1.8, 0.7],
    // A1/A2 周围灌木 (X向外)
    [-7.0, -10.0, 0.8], [-4.5, -10.0, 0.8], [4.5, -10.0, 0.8], [7.0, -10.0, 0.8],
    [-8.0, -9.5, 0.7], [8.0, -9.5, 0.7],
    // A3/A4 周围灌木
    [-7.0, -6.0, 0.8], [-4.5, -6.0, 0.8], [4.5, -6.0, 0.8], [7.0, -6.0, 0.8],
    [-8.0, -5.5, 0.7], [8.0, -5.5, 0.7],
    // B1/B2 周围灌木
    [-7.0, -2.0, 0.8], [-4.5, -2.0, 0.8], [4.5, -2.0, 0.8], [7.0, -2.0, 0.8],
    [-8.0, -1.5, 0.7], [8.0, -1.5, 0.7],
    // 道路两侧灌木 (X向外)
    [-7.5, -8.0, 0.7], [7.5, -8.0, 0.7],
    [-7.5, -4.0, 0.7], [7.5, -4.0, 0.7],
    [-7.5, -0.5, 0.7], [7.5, -0.5, 0.7],
    // 图信大楼周围灌木 (Z适应后移)
    [-5.5, 7.8, 0.8], [5.5, 7.8, 0.8], [-6.0, 8.5, 0.7], [6.0, 8.5, 0.7],
    // 实验楼周围灌木 (Z适应后移)
    [-10, 15.0, 0.8], [-2, 15.0, 0.8], [-10, 13.8, 0.7], [-2, 13.8, 0.7],
    // 外侧灌木
    [-8.5, -7.0, 0.6], [8.5, -7.0, 0.6], [-8.5, -3.0, 0.6], [8.5, -3.0, 0.6],
    [-7.0, 4.5, 0.7], [7.0, 4.5, 0.7], [-6.5, 11.0, 0.7], [6.5, 11.0, 0.7],
].forEach(([x, z, s]) => vegetationGroup.add(shrub(x, z, s)));
// ================================================================
// 17. OrbitControls
// ================================================================

const ctrl = new OrbitControls(camera, renderer.domElement);
ctrl.target.set(0, 2.0, 0);
ctrl.enableDamping = true;
ctrl.dampingFactor = 0.08;
ctrl.minDistance = 3;
ctrl.maxDistance = 60;
ctrl.maxPolarAngle = Math.PI / 2.1;
ctrl.update();

// ================================================================
// 18. 点击交互
// ================================================================

const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
const card = document.getElementById('info-card');
const cTitle = document.getElementById('info-title');
const cDesc = document.getElementById('info-desc');
let tm = null;

function showInfo(name, desc) {
    if (tm) clearTimeout(tm);
    cTitle.textContent = name; cDesc.textContent = desc;
    card.classList.add('visible');
    tm = setTimeout(() => card.classList.remove('visible'), 4000);
}

function hPtr(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.x = ((cx - r.left) / r.width) * 2 - 1;
    ptr.y = -((cy - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(clickable, false);
    if (hits.length) {
        let o = hits[0].object;
        while (o && !o.userData?.clickable) o = o.parent;
        if (o && o.userData?.clickable) showInfo(o.userData.name, o.userData.description);
    }
}
renderer.domElement.addEventListener('click', e => hPtr(e.clientX, e.clientY));
renderer.domElement.addEventListener('touchend', e => {
    if (e.changedTouches.length === 1) hPtr(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});

// ================================================================
// 19. UI 事件
// ================================================================

document.querySelectorAll('.layer-btn').forEach(b => {
    b.addEventListener('click', () => {
        const m = { building: buildingGroup, vegetation: vegetationGroup, road: roadGroup };
        const g = m[b.dataset.layer];
        if (g) { g.visible = !g.visible; b.classList.toggle('active'); }
    });
});
document.getElementById('view-perspective').addEventListener('click', () => {
    camera.position.set(15, 12, 20); ctrl.target.set(0, 2.0, 0); ctrl.update();
});
document.getElementById('view-birdseye').addEventListener('click', () => {
    camera.position.set(0, 25, 0.01); ctrl.target.set(0, 0, 0); ctrl.update();
});
document.getElementById('view-reset').addEventListener('click', () => {
    camera.position.set(15, 12, 20); ctrl.target.set(0, 2.0, 0); ctrl.update();
});

// ================================================================
// 20. 漂浮粒子
// ================================================================

const pc = 400;
const pa = new Float32Array(pc * 3);
for (let i = 0; i < pc * 3; i++) {
    pa[i] = (Math.random() - 0.5) * 60;
    if (i % 3 === 1) pa[i] = Math.random() * 22;
}
const pg = new THREE.BufferGeometry();
pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
const ps = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.3 }));
scene.add(ps);

// ================================================================
// 21. 动画循环
// ================================================================

function animate() {
    requestAnimationFrame(animate);
    const p = ps.geometry.attributes.position.array;
    for (let i = 1; i < p.length; i += 3) { p[i] += 0.003; if (p[i] > 22) p[i] = 0; }
    ps.geometry.attributes.position.needsUpdate = true;
    ctrl.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();

// ================================================================
// 22. 窗口自适应
// ================================================================

window.addEventListener('resize', () => {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
});
const gltfLoader = new GLTFLoader();

// 加载喷泉模型
// 图书馆原位置 Z=5.2，后移后 Z=7.8，左侧为 X 负方向
// 道路横向位置：左侧纵向道路在 X=-6 处
// 喷泉放置于图书馆左侧，超过道路，所以 X 坐标设为 -7.5 左右
let fountainModel = null;

gltfLoader.load(
    '/models/penquan.glb',  // 模型文件路径
    (gltf) => {
        fountainModel = gltf.scene;
        
        // 设置喷泉位置：图书馆左侧，超过道路
        // 图书馆位置 (0, 0, 7.8)，左侧 X 负方向
        // 道路在 X=-6，喷泉放在 X=-7.5 超过道路
        fountainModel.position.set(-7.5, 0, 8.5);
        
        // 调整缩放（根据实际模型大小调整）
        fountainModel.scale.set(0.8, 0.8, 0.8);
        
        // 可选：调整旋转
        fountainModel.rotation.y = 0;
        
        // 启用阴影
        fountainModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // 添加文字标签
        const fountainLabel = lbl('喷泉', 1.5);
        fountainLabel.position.set(-7.5, 1.2, 8.5);
        buildingGroup.add(fountainLabel);
        
        // 添加到建筑组或单独分组
        buildingGroup.add(fountainModel);
        
        console.log('喷泉模型加载成功');
    },
    (xhr) => {
        // 加载进度
        console.log(`喷泉模型加载进度: ${(xhr.loaded / xhr.total * 100)}%`);
    },
    (error) => {
        console.error('喷泉模型加载失败:', error);
        // 加载失败时的备用：创建简易几何体喷泉
        createFallbackFountain();
    }
);
