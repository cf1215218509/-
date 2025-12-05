import React from 'react';

// Escape backticks and template literals for inclusion in JS string
const PARTICLE_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js 手势交互粒子系统</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: #000; font-family: 'Segoe UI', sans-serif; }
        #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1; }
        
        /* 摄像头预览（隐藏或小窗，这里为了美观默认隐藏，只保留功能） */
        #video-input { position: absolute; bottom: 10px; right: 10px; width: 160px; height: 120px; transform: scaleX(-1); border-radius: 8px; opacity: 0.5; z-index: 2; pointer-events: none; }

        /* 加载/启动 遮罩层 */
        #overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex; flex-direction: column;
            justify-content: center; align-items: center; z-index: 10; color: white;
            transition: opacity 0.5s;
        }
        #start-btn {
            padding: 15px 40px; font-size: 24px; background: linear-gradient(45deg, #ff00cc, #3333ff);
            border: none; border-radius: 30px; color: white; cursor: pointer;
            box-shadow: 0 0 20px rgba(255, 0, 204, 0.5); transition: transform 0.2s;
        }
        #start-btn:hover { transform: scale(1.05); }
        .loading-text { margin-top: 20px; font-size: 14px; color: #888; }
        
        /* 全屏按钮 */
        #fs-btn {
            position: absolute; bottom: 20px; left: 20px; z-index: 5;
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3);
            color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
</head>
<body>

    <div id="overlay">
        <h1>交互式 3D 粒子流</h1>
        <p>请允许摄像头权限以使用手势控制</p>
        <button id="start-btn">开启体验</button>
        <div class="loading-text">准备模型数据中...</div>
    </div>

    <div id="canvas-container"></div>
    <video id="video-input" playsinline></video>
    <button id="fs-btn">⛶ 全屏模式</button>

    <script>
        // --- 1. 初始化设置 ---
        const PARTICLE_COUNT = 15000;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // --- 2. 粒子系统核心 ---
        // 存储不同形状的目标位置数据
        const shapes = {
            heart: [],
            flower: [],
            saturn: [],
            buddha: [], // 用复杂的数学结构模拟
            fireworks: []
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        
        // 初始化位置（默认随机）
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // 材质
        const material = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xff0066,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // --- 3. 形状生成算法 (数学参数方程) ---
        
        function generateShapes() {
            // A. 爱心
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                // 更加饱满的3D爱心公式
                let t = Math.random() * Math.PI * 2;
                let u = Math.random() * Math.PI;
                // 这里的公式是近似心形曲面
                let x = 16 * Math.pow(Math.sin(t), 3) * Math.sin(u);
                let y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * Math.sin(u);
                let z = 6 * Math.cos(u); 
                shapes.heart.push(x * 0.5, y * 0.5, z * 0.5);
            }

            // B. 土星 (球体 + 环)
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                if (i < PARTICLE_COUNT * 0.7) {
                    // 球体
                    const r = 8;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    shapes.saturn.push(
                        r * Math.sin(phi) * Math.cos(theta),
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi)
                    );
                } else {
                    // 光环
                    const r = 12 + Math.random() * 6;
                    const theta = Math.random() * Math.PI * 2;
                    shapes.saturn.push(
                        r * Math.cos(theta),
                        r * Math.sin(theta) * 0.2, // 压扁
                        r * Math.sin(theta)
                    );
                }
            }

            // C. 花朵 (斐波那契螺旋 / 玫瑰线)
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const theta = i * 2.39996; // 黄金角
                const r = 0.15 * Math.sqrt(i);
                // 加上正弦波动模拟花瓣高度
                const z = Math.sin(theta * 5) * (r * 0.2); 
                shapes.flower.push(
                    r * Math.cos(theta),
                    r * Math.sin(theta),
                    z * 5 - 5 // 向下移动一点
                );
            }

            // D. 抽象佛像/打坐姿态 (利用叠加球体模拟)
            // 头部 + 身体 + 盘腿
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                let x, y, z;
                let dice = Math.random();
                if (dice < 0.2) { // 头
                    const r = 2.5;
                    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
                    x = r * Math.sin(p) * Math.cos(t);
                    y = r * Math.sin(p) * Math.sin(t) + 6;
                    z = r * Math.cos(p);
                } else if (dice < 0.6) { // 躯干 (椭圆)
                    const r = 4.5;
                    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
                    x = r * Math.sin(p) * Math.cos(t) * 0.8;
                    y = r * Math.sin(p) * Math.sin(t) * 1.2;
                    z = r * Math.cos(p) * 0.6;
                } else { // 腿部底座 (扁椭圆)
                    const r = 7;
                    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
                    x = r * Math.sin(p) * Math.cos(t);
                    y = r * Math.sin(p) * Math.sin(t) * 0.3 - 4;
                    z = r * Math.cos(p) * 0.8;
                }
                shapes.buddha.push(x, y, z);
            }

            // E. 烟花 (初始状态是球，动画逻辑在 render 中处理)
            shapes.fireworks = shapes.saturn; // 初始占位，逻辑特殊处理
        }
        generateShapes();

        // --- 4. 状态管理与 UI ---
        const params = {
            model: 'heart',
            color: '#ff0066',
            particleSize: 0.15,
            handControl: true,
            autoRotate: true,
            interactionStrength: 1.0 // 手势影响力度
        };

        // 目标状态数组
        let currentTargetArr = shapes.heart;
        
        // UI 面板
        const gui = new lil.GUI({ title: '控制面板' });
        gui.add(params, 'model', ['heart', 'flower', 'saturn', 'buddha', 'fireworks']).name('模型选择').onChange(val => {
            if (val === 'fireworks') {
                // 烟花特殊处理：每次切换重置位置到中心
                const attrs = geometry.attributes.position.array;
                for(let i=0; i<attrs.length; i++) attrs[i] = (Math.random()-0.5);
                geometry.attributes.position.needsUpdate = true;
                currentTargetArr = shapes.saturn; // 只是目标形状，动画逻辑不同
            } else {
                currentTargetArr = shapes[val];
            }
        });
        gui.addColor(params, 'color').name('粒子颜色').onChange(c => material.color.set(c));
        gui.add(params, 'particleSize', 0.05, 0.5).name('粒子大小').onChange(s => material.size = s);
        gui.add(params, 'handControl').name('启用手势');
        gui.add(params, 'interactionStrength', 0.1, 3.0).name('手势灵敏度');

        // --- 5. MediaPipe 手势识别 ---
        const videoElement = document.getElementById('video-input');
        let handFactor = 0; // 0 = 闭合/无手, 1 = 张开
        let targetHandFactor = 0; // 用于平滑过渡

        const hands = new Hands({locateFile: (file) => {
            return \`https://cdn.jsdelivr.net/npm/@mediapipe/hands/\${file}\`;
        }});

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                // 获取大拇指指尖(4)和食指指尖(8)
                const thumb = landmarks[4];
                const index = landmarks[8];
                
                // 计算距离 (简单欧几里得距离)
                const distance = Math.sqrt(
                    Math.pow(thumb.x - index.x, 2) + 
                    Math.pow(thumb.y - index.y, 2)
                );

                // 映射距离到 0~1 之间 (根据经验，手捏合距离约0.02，张开约0.2以上)
                // 我们放大这个系数让效果更明显
                let rawFactor = (distance - 0.05) * 5; 
                targetHandFactor = Math.max(0, Math.min(rawFactor, 2.0)); // 限制在 0 到 2 倍之间
            } else {
                targetHandFactor = 0; // 没检测到手，默认常态
            }
        });

        // 启动摄像头逻辑
        async function startCamera() {
            const cameraUtils = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({image: videoElement});
                },
                width: 320,
                height: 240
            });
            await cameraUtils.start();
            document.getElementById('overlay').style.opacity = 0;
            setTimeout(() => document.getElementById('overlay').style.display = 'none', 500);
        }

        // --- 6. 动画循环 ---
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // 平滑手势数据
            handFactor += (targetHandFactor - handFactor) * 0.1;

            const positionsArr = geometry.attributes.position.array;

            // 基础缩放：如果有手势，根据手势缩放；如果没有，保持原样(1)
            let scale = params.handControl ? (1 + handFactor * params.interactionStrength) : 1;
            
            // 如果是烟花模式，逻辑不同
            if (params.model === 'fireworks') {
                scale = 1; // 烟花不缩放，而是扩散
                // 模拟爆炸扩散
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const idx = i * 3;
                    // 给每个点一个向外的速度向量（基于当前位置）
                    // 加上手势控制作为“时间”或“扩散度”
                    const explosion = 1 + (Math.sin(time) + 1) * (1 + handFactor * 2); 
                    
                    // 简单的球形脉冲动画
                    const tx = shapes.saturn[idx] * explosion;
                    const ty = shapes.saturn[idx+1] * explosion;
                    const tz = shapes.saturn[idx+2] * explosion;
                    
                    positionsArr[idx] += (tx - positionsArr[idx]) * 0.1;
                    positionsArr[idx+1] += (ty - positionsArr[idx+1]) * 0.1;
                    positionsArr[idx+2] += (tz - positionsArr[idx+2]) * 0.1;
                }
            } else {
                // 常规模型变换 (Morphing)
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const idx = i * 3;
                    
                    // 获取目标形状的基础坐标
                    let tx = currentTargetArr[idx];
                    let ty = currentTargetArr[idx+1];
                    let tz = currentTargetArr[idx+2];

                    // 应用手势缩放
                    tx *= scale;
                    ty *= scale;
                    tz *= scale;

                    // 增加一点随机噪点，让它看起来像粒子在“呼吸”
                    tx += Math.sin(time * 2 + i) * 0.05;
                    ty += Math.cos(time * 2 + i) * 0.05;

                    // 线性插值移动粒子 (Lerp) - 速度 0.05
                    positionsArr[idx] += (tx - positionsArr[idx]) * 0.08;
                    positionsArr[idx+1] += (ty - positionsArr[idx+1]) * 0.08;
                    positionsArr[idx+2] += (tz - positionsArr[idx+2]) * 0.08;
                }
            }

            geometry.attributes.position.needsUpdate = true;

            // 整体旋转
            if (params.autoRotate) {
                particles.rotation.y += 0.002;
                particles.rotation.x = Math.sin(time * 0.2) * 0.1;
            }

            renderer.render(scene, camera);
        }

        // --- 7. 事件监听 ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('start-btn').innerText = "启动中...";
            startCamera().then(() => {
                animate();
            });
        });
        
        document.getElementById('fs-btn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

    </script>
</body>
</html>
`;

interface GestureParticlesProps {
  onBack: () => void;
}

const GestureParticles: React.FC<GestureParticlesProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-[60] px-4 py-2 bg-gray-800/80 text-white rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors backdrop-blur-sm shadow-lg flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>返回实验室</span>
      </button>
      <iframe 
        srcDoc={PARTICLE_HTML}
        className="w-full h-full border-0"
        allow="camera; microphone; fullscreen; accelerometer; gyroscope; magnetometer"
        title="Gesture Particles"
      />
    </div>
  );
};

export default GestureParticles;
