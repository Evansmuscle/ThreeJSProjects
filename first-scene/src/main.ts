import * as THREE from "three";
import gsap from "gsap";

// Scene
const scene = new THREE.Scene();

// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const meshOptions: THREE.MeshBasicMaterialParameters = {
  color: 0xff0000,
};
const material = new THREE.MeshBasicMaterial(meshOptions);
const mesh = new THREE.Mesh(geometry, material);

// scene.add(mesh);

// Axes Helper
// const axesHelper = new THREE.AxesHelper();

// scene.add(axesHelper);

// Positions
mesh.position.set(0, 0, 0);

// Scales
mesh.scale.set(1, 1, 1);

// Rotation
mesh.rotation.reorder("YXZ");
mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.25);

// Quaternions
// const quaternion = new THREE.Quaternion(0.1, 0.1, 0.1, 0.5);

// mesh.applyQuaternion(quaternion);

// Camera
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// The lookAt method for looking at the object
camera.lookAt(mesh.position);

// Grouping
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);

cube1.position.set(1.5, 0, 0);
cube3.position.set(-1.5, 0, 0);

// group.rotation.set(45, 0, 0);
group.scale.set(0.5, 0.5, 0.5);

group.add(cube1);
group.add(cube2);
group.add(cube3);

// Renderer
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const rendererOptions: THREE.WebGLRendererParameters = {
  canvas,
};

const renderer = new THREE.WebGLRenderer(rendererOptions);

renderer.setSize(sizes.width, sizes.height);

// // Time
// let time = Date.now();

// Clock
const clock = new THREE.Clock();

// GSAP animations
// gsap.to(cube1.position, { duration: 2, delay: 0.2, x: 4 }).then(() => {
//   gsap.to(cube1.position, { duration: 2, delay: 0, x: 1.5 });
// });

// Animation
const tick = () => {
  // // Delta Time
  // const currentTime = Date.now();
  // const deltaTime = currentTime - time;
  // time = currentTime;

  // Elapsed Time
  const elapsedTime = clock.getElapsedTime();

  // Update the cubes
  cube1.rotation.x = elapsedTime * Math.PI; // Half turn per second because of PI

  cube2.position.y = Math.sin(elapsedTime) * 2;
  cube2.position.x = Math.cos(elapsedTime) * 3.5;

  cube3.rotation.z = Math.tan(elapsedTime);

  camera.lookAt(group.position);
  camera.position.x = Math.cos(elapsedTime) * 6;
  camera.position.z = Math.sin(elapsedTime) * 6;

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
