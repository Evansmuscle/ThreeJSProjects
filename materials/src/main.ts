import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// GUI
const gui = new dat.GUI();

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

// Objects
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeLoader = new THREE.CubeTextureLoader();

const baseColor = await textureLoader.loadAsync("/assets/door/basecolor.jpg");
const ambientOcclusion = await textureLoader.loadAsync(
  "/assets/door/ambientOcclusion.jpg"
);
const height = await textureLoader.loadAsync("/assets/door/height.png");
const metallic = await textureLoader.loadAsync("/assets/door/metallic.jpg");
const normal = await textureLoader.loadAsync("/assets/door/normal.jpg");
const opacity = await textureLoader.loadAsync("/assets/door/opacity.jpg");
const roughness = await textureLoader.loadAsync("/assets/door/roughness.jpg");

const gradient = await textureLoader.loadAsync("/assets/gradients/3.jpg");

const matcap = await textureLoader.loadAsync("/assets/matcaps/5.png");

const environmentMap = await cubeLoader.load([
  "/assets/environmentMaps/1/px.jpg",
  "/assets/environmentMaps/1/nx.jpg",
  "/assets/environmentMaps/1/py.jpg",
  "/assets/environmentMaps/1/ny.jpg",
  "/assets/environmentMaps/1/pz.jpg",
  "/assets/environmentMaps/1/nz.jpg",
]);

// gradient.minFilter = THREE.NearestFilter;
// gradient.magFilter = THREE.NearestFilter;
// gradient.generateMipmaps = false;

// const material = new THREE.MeshBasicMaterial({
//   map: baseColor,
//   transparent: true,
//   alphaMap: opacity,
//   side: THREE.DoubleSide,
// });
// const material = new THREE.MeshNormalMaterial({
//   transparent: true,
//   side: THREE.DoubleSide,
//   flatShading: true,
// });
// const material = new THREE.MeshMatcapMaterial({
//   matcap,
//   side: THREE.DoubleSide,
// });
// const material = new THREE.MeshPhongMaterial({
//   side: THREE.DoubleSide,
// });
// material.shininess = 100;
// material.specular = new THREE.Color(0x00ff00);
// const material = new THREE.MeshToonMaterial({
//   side: THREE.DoubleSide,
//   gradientMap: gradient,
// });

const sphereMaterial = new THREE.MeshStandardMaterial({
  roughness: 0,
  metalness: 1,
  envMap: environmentMap,
});

const groundGeometry = new THREE.PlaneGeometry(20, 20, 2, 2);

const groundMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
ground.position.y = -1;

scene.add(ground);

const material = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  // metalness: 0.45,
  // roughness: 0.65,
  map: baseColor,
  aoMap: ambientOcclusion,
  displacementMap: height,
  displacementScale: 0.1,
  metalnessMap: metallic,
  roughnessMap: roughness,
  normalMap: normal,
  alphaMap: opacity,
  transparent: true,
  envMap: environmentMap,
});

gui.add(material, "metalness").min(0).max(1).step(0.01);
gui.add(material, "roughness").min(0).max(1).step(0.01);
gui.add(material, "aoMapIntensity").min(0).max(10).step(0.01);
gui.add(material, "displacementScale").min(0).max(10).step(0.01);
gui.add(material.normalScale, "x").min(0).max(10).step(0.01);
gui.add(material.normalScale, "y").min(0).max(10).step(0.01);
let sphereFolder = gui.addFolder("sphere");

sphereFolder.add(sphereMaterial, "roughness").min(0).max(1).step(0.01);
sphereFolder.add(sphereMaterial, "metalness").min(0).max(1).step(0.01);

// !TO MAKE MATCAPS PUT THE CAMERA IN FRONT OF A SPHERE IN A 3D SOFTWARE
// !THEN PUT THE LIGHTS AS YOU WANT AND TAKE A SQUARE RENDER

// material.map = baseColor;
// material.color.set = 'yellow';
// material.color = new THREE.Color('pink');
// material.wireframe = true;
// Attributes below only work together
// material.opacity = 0.5;
// material.transparent = true

const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 64, 64),
  sphereMaterial
);

// sphere.geometry.setAttribute(
//   "uv2",
//   new THREE.BufferAttribute(sphere.geometry.attributes["uv"].array, 2)
// );

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);

plane.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(plane.geometry.attributes["uv"].array, 2)
);

scene.add(plane);
scene.add(sphere);

// const torus = new THREE.Mesh(
//   new THREE.TorusBufferGeometry(0.4, 0.15, 64, 128),
//   material
// );

// torus.geometry.setAttribute(
//   "uv2",
//   new THREE.BufferAttribute(torus.geometry.attributes["uv"].array, 2)
// );

// scene.add(sphere, plane, torus);

sphere.position.set(-1, 0, 0);
plane.position.set(1, 0, 0);
// torus.position.set(2, 0, 0);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLight.position.set(2, 3, 4);
scene.add(pointLight, pointLightHelper);

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

// Animations

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  plane.rotation.y = 0.1 * elapsedTime;
  // torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  plane.rotation.x = 0.15 * elapsedTime;
  // torus.rotation.x = 0.15 * elapsedTime;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
