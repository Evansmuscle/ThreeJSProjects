import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// GUI
const gui = new dat.GUI({
  // closed: true,
  width: 400,
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const bakedShadow = textureLoader.load("/textures/bakedShadow.jpg");
const simpleShadow = textureLoader.load("/textures/simpleShadow.jpg");

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

// Meshes
const planeGeometry = new THREE.PlaneBufferGeometry(5, 5);

const geometry = new THREE.SphereBufferGeometry(0.5, 80, 80);

const materialOptions: THREE.MeshStandardMaterialParameters = {
  color: 0xffffff,
  side: THREE.DoubleSide,
};
const material = new THREE.MeshStandardMaterial(materialOptions);

const mesh = new THREE.Mesh(geometry, material);
const plane = new THREE.Mesh(
  planeGeometry,
  material
  // new THREE.MeshBasicMaterial({
  //   map: bakedShadow,
  //   side: THREE.DoubleSide,
  // })
);

mesh.castShadow = true;
plane.receiveShadow = true;

plane.rotateX(Math.PI / 2);
plane.position.set(0, -0.53, 0);

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    alphaMap: simpleShadow,
    transparent: true,
  })
);

console.log(plane.position.y);

sphereShadow.rotation.set(Math.PI * -0.5, 0, 0);
sphereShadow.position.setY(plane.position.y + 0.01);

scene.add(sphereShadow);

scene.add(mesh, plane);

mesh.position.set(0, 0, 0);

/**
 * Lights
 */
// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.position.set(2, 2, -1);

// scene.add(
//   directionalLight,
//   directionalLightHelper,
//   directionalLightCameraHelper
// );

directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.radius = 30;

// Point
const pointLight = new THREE.PointLight(0xff00ff, 0.3);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);

const pointLightFolder = gui.addFolder("Point Light");
pointLightFolder.add(pointLight.position, "x").max(10).min(-10).step(0.02);
pointLightFolder.add(pointLight.position, "y").max(10).min(-10).step(0.02);
pointLightFolder.add(pointLight.position, "z").max(10).min(-10).step(0.02);

pointLight.position.set(2, 0.5, -2);

pointLight.castShadow = true;
pointLight.shadow.mapSize.width = Math.pow(2, 11);
pointLight.shadow.mapSize.height = Math.pow(2, 11);
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

scene.add(pointLight);
// scene.add(pointLightHelper, pointLightCameraHelper)

// Spot
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = Math.pow(2, 11);
spotLight.shadow.mapSize.height = Math.pow(2, 11);
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

spotLight.position.set(0, 2, 2);

// scene.add(spotLight, spotLightHelper, spotLightCameraHelper);
// scene.add(spotLight.target);

window.requestAnimationFrame(() => {
  spotLightHelper.update();
  spotLightCameraHelper.update();
  directionalLightCameraHelper.update();
  pointLightHelper.update();
  pointLightCameraHelper.update();
});

const directionalLightFolder = gui.addFolder("Directional Light");
directionalLightFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.05);

const ambientLightFolder = gui.addFolder("Ambient Light");
ambientLightFolder.add(ambientLight, "intensity").min(0).max(10).step(0.05);

// Camera
const canvas = document.createElement("canvas");

canvas.style.zIndex = "-10";

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

window.addEventListener("dblclick", (_) => {
  const doc: any = window.document;
  const fullscreenElement =
    doc.fullscreenElement || doc.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
      //@ts-ignore
    } else if (canvas.webkitRequestFullscreen) {
      //@ts-ignore
      canvas.webkitRequestFullscreen();
    }
    return;
  }

  if (doc.exitFullscreen) {
    doc.exitFullscreen();
    return;
  }

  if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
});

camera.position.set(0, 0, 3);

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

// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Animations

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update Camera Via Orbit Controls

  // Update the sphere
  mesh.position.x = Math.sin(elapsedTime);
  mesh.position.z = Math.cos(elapsedTime);
  mesh.position.y = Math.abs(Math.sin(elapsedTime * 1.5));

  // Update the shadow
  sphereShadow.position.x = mesh.position.x;
  sphereShadow.position.z = mesh.position.z;

  // Below are the same thing ==> Math.cos(x) = (1 - Math.sin(x))
  sphereShadow.material.opacity = Math.abs(Math.cos(elapsedTime * 1.5)) * 0.3;
  // sphereShadow.material.opacity = (1 - mesh.position.y) * 0.3;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
