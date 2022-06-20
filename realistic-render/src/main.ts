import "./style.css";

import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ACESFilmicToneMapping } from "three";

/**
 * Parameters
 */
const parameters = {
  sizes: {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
  },
  envMapIntensity: 1.5,
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

camera.position.set(-25, 20, 35);
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
gui
  .add(parameters, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("Environment Map Intensity")
  .onChange((_) => {
    updateAllMaterials();
  });

scene.add(ambientLight, directionalLight);

/**
 * Textures
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Environment Maps
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMap = cubeTextureLoader.load(
  [
    "/textures/environmentMaps/0/px.jpg",
    "/textures/environmentMaps/0/nx.jpg",
    "/textures/environmentMaps/0/py.jpg",
    "/textures/environmentMaps/0/ny.jpg",
    "/textures/environmentMaps/0/pz.jpg",
    "/textures/environmentMaps/0/nz.jpg",
  ],
  (envMap) => {
    scene.background = envMap;
    envMap.encoding = THREE.sRGBEncoding;
    // scene.environment = envMap;
  },
  (progress) => {
    console.log(progress);
  },
  (error) => {
    console.log(error);
  }
);

/**
 * Update All Materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap;
      child.material.envMapIntensity = parameters.envMapIntensity;
    }
  });
};

// Flight Helmet
gltfLoader.load("/models/FlightHelmet/FlightHelmet.gltf", (gltf) => {
  gltf.scene.position.y = -7;
  gltf.scene.position.x = 0;
  gltf.scene.position.z = 0;
  gltf.scene.scale.set(20, 20, 20);
  gltf.scene.castShadow = true;

  camera.lookAt(gltf.scene.position);

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

  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(parameters.sizes.width, parameters.sizes.height);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.physicallyCorrectLights = true;

renderer.outputEncoding = THREE.sRGBEncoding;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.render(scene, camera);

gui.add(renderer, "toneMapping", {
  No: THREE.ToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

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
