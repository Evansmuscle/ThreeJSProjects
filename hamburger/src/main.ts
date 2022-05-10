import "./style.css";

import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * GUI
 */
const gui = new dat.GUI();

const parameters = {
  screen: {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
  },
};

/**
 * Canvas
 */
const canvas = document.createElement("canvas");

document.body.appendChild(canvas);

// Window Resizing
let debounceTimer: number;

window.addEventListener("resize", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    parameters.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    };

    camera.aspect = parameters.screen.aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(parameters.screen.width, parameters.screen.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, 100);
});

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  parameters.screen.aspectRatio,
  0.01,
  2000
);

camera.position.set(-30, 20, 25);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

directionalLight.castShadow = true;
directionalLight.position.set(10, 10, 10);

scene.add(ambientLight, directionalLight);

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager(
  () => console.log("loaded"),
  (url, loaded, total) => {
    console.log(url);
    console.log(loaded);
    console.log(total);
  },
  (url) => console.log(url)
);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("draco/");
dracoLoader.preload();

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("models/Hamburger/Hamburger.gltf", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.castShadow = true;
});

/**
 * Meshes
 */
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 100),
  new THREE.MeshStandardMaterial()
);

plane.rotation.x = -Math.PI / 2;
plane.position.set(0, 0, 0);

plane.receiveShadow = true;

scene.add(plane);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(parameters.screen.width, parameters.screen.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Clock
 */
// const clock = new THREE.Clock();

const tick = () => {
  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
