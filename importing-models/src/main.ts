import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

/**
 * GUI
 */
const gui = new dat.GUI();

interface GUIParams {
  animationType: 0 | 1 | 2;
}

const params: GUIParams = {
  animationType: 0,
};

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer: THREE.AnimationMixer | null = null;
let animations: THREE.AnimationClip[] | null = null;
let playingAnimation: THREE.AnimationAction | null = null;

gltfLoader.load(
  "models/Fox/glTF/Fox.gltf",
  (gltf) => {
    mixer = new THREE.AnimationMixer(gltf.scene);
    animations = gltf.animations;
    playingAnimation = mixer.clipAction(animations[params.animationType]);

    playingAnimation.play();

    while (gltf.scene.children.length) {
      const filtered = gltf.scene.children[0].children.filter((obj) => {
        obj.scale.set(0.025, 0.025, 0.025);
        obj.castShadow = true;
        return obj.type === "Mesh" || "SkinnedMesh" || "Bone";
      });
      gltf.scene.children[0].children = filtered;

      scene.add(gltf.scene.children[0]);
    }

    // Duck
    // const filtered = gltf.scene.children[0]?.children.filter((obj) => {
    //   obj.castShadow = true;
    //   return obj.type === "Mesh";
    // });
    // gltf.scene.children[0].children = filtered;

    // scene.add(gltf.scene.children[0]);
  },
  (progress) => {
    console.log(progress);
  },
  (err) => {
    console.log(err);
  }
);

gui
  .add(params, "animationType")
  .min(0)
  .max(2)
  .step(1)
  .onFinishChange((animationType: 0 | 1 | 2) => {
    if (mixer && animations && playingAnimation) {
      playingAnimation.stop();
      playingAnimation = mixer.clipAction(animations[animationType]) || null;
      playingAnimation ? playingAnimation.play() : null;
    }
  });

/**
 * Lights
 */
const light = new THREE.DirectionalLight(0xffffff, 0.5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

const lightHelper = new THREE.DirectionalLightHelper(light);

light.castShadow = true;
light.position.set(25, 25, 50);

scene.add(light, ambientLight);
scene.add(lightHelper);

/**
 * Objects
 */
const material = new THREE.MeshStandardMaterial({
  metalness: 0.4,
  roughness: 0.3,
  side: THREE.DoubleSide,
});
const planeGeometry = new THREE.PlaneBufferGeometry(40, 40);

const floor = new THREE.Mesh(planeGeometry, material);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;

scene.add(floor);

// Camera

const canvas = document.createElement("canvas");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

window.addEventListener("resize", (_) => {
  // Update Sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// window.addEventListener("dblclick", (_) => {
//   const doc: any = window.document;
//   const fullscreenElement =
//     doc.fullscreenElement || doc.webkitFullscreenElement;

//   if (!fullscreenElement) {
//     if (canvas.requestFullscreen) {
//       canvas.requestFullscreen();
//       //@ts-ignore
//     } else if (canvas.webkitRequestFullscreen) {
//       //@ts-ignore
//       canvas.webkitRequestFullscreen();
//     }
//     return;
//   }

//   if (doc.exitFullscreen) {
//     doc.exitFullscreen();
//     return;
//   }

//   if (doc.webkitExitFullscreen) {
//     doc.webkitExitFullscreen();
//   }
// });

camera.position.set(-30, 20, 25);

scene.add(camera);

// Controls

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer

document.body.appendChild(canvas);

const rendererOptions: THREE.WebGLRendererParameters = {
  canvas,
};

const renderer = new THREE.WebGLRenderer(rendererOptions);

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Animations

const clock = new THREE.Clock();

let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;

  previousTime = elapsedTime;

  // Update The Animation Mixer For Animations To Work
  mixer?.update(deltaTime);

  // Update Camera Via Orbit Controls

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
