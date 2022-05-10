import "./style.css";

import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Parameters
 */
const parameters = {
  sizes: {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
  },
};

const gui = new dat.GUI({
  closed: true,
  width: 500,
});

/**
 * Canvas
 */
const canvas = document.createElement("canvas");
window.document.body.appendChild(canvas);

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  parameters.sizes.aspectRatio,
  0.1,
  2000
);

camera.position.set(-20, 25, 40);
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.update();

/**
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);

directionalLight.position.set(30, 30, 30);
directionalLight.castShadow = true;

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("Light Intensity");
gui
  .add(directionalLight.position, "x")
  .min(-30)
  .max(30)
  .step(0.001)
  .name("Light Position X");
gui
  .add(directionalLight.position, "y")
  .min(0)
  .max(30)
  .step(0.001)
  .name("Light Position Y");
gui
  .add(directionalLight.position, "z")
  .min(-30)
  .max(30)
  .step(0.001)
  .name("Light Position Z");

scene.add(ambientLight, directionalLight);

/**
 * Textures
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("models/FlightHelmet/FlightHelmet.gltf", (gltf) => {
  gltf.scene.position.y = 1;
  gltf.scene.position.x = -2.5;
  gltf.scene.position.z = 2.5;
  gltf.scene.scale.set(20, 20, 20);
  gltf.scene.castShadow = true;

  gui
    .add(gltf.scene.rotation, "x")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Flight Helmet Rotation X");
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Flight Helmet Rotation Y");
  gui
    .add(gltf.scene.rotation, "z")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Flight Helmet Rotation Z");

  camera.lookAt(gltf.scene.position);

  scene.add(gltf.scene);
});

/**
 * Meshes
 */
const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.receiveShadow = true;

plane.position.set(0, 0, 0);
plane.rotation.set(-Math.PI / 2, 0, 0);

scene.add(plane);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(parameters.sizes.width, parameters.sizes.height);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.physicallyCorrectLights = true;

renderer.render(scene, camera);

/**
 * Animation
 */

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
