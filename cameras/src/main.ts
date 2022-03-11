import * as THREE from "three";
import gsap from "gsap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;

  console.log(cursor.x, cursor.y);
});

// Scene
const scene = new THREE.Scene();

// Meshes
// const geometry = new THREE.BoxGeometry(1, 1, 1);
const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const meshOptions: THREE.MeshBasicMaterialParameters = {
  color: 0xff0000,
};
const material = new THREE.MeshBasicMaterial(meshOptions);
const mesh = new THREE.Mesh(geometry, material);
// const mesh2 = new THREE.Mesh(geometry, material);

scene.add(mesh);
// scene.add(mesh2);

mesh.position.set(0, 0, 0);
// mesh.position.set(0, 0, -2);

// const sphereGeometry = new THREE.SphereGeometry(100);
// const sphereMaterial = new THREE.MeshBasicMaterial({
//   color: 0x0000ff,
//   wireframe: true,
// });

// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

// scene.add(sphere);

// sphere.position.set(0, 0, 0);

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

// const aspectRatio = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(
//   -1 * aspectRatio,
//   1 * aspectRatio,
//   1,
//   -1,
//   0.1,
//   100
// );
camera.position.z = 3;
camera.position.y = 0;
camera.position.x = 0;
scene.add(camera);

// Controls

const controls = new OrbitControls(camera, canvas);
// controls.target.set(0, 0, 0);
// controls.update();

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

// camera.lookAt(mesh.position);

// gsap.to(mesh.position, { duration: 2, delay: 0.1, z: -10 }).then(() => {
//   gsap.to(mesh.position, { duration: 2, delay: 0.1, z: -2 });
// });

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // camera.lookAt(mesh.position);

  // Update Camera Manuallpy

  // camera.position.y = -cursor.y * 10;
  // camera.position.x = -cursor.x * 10;
  // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
  // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
  // camera.position.y = cursor.y * 5;
  // camera.lookAt(mesh.position);

  // Update Camera Via Orbit Controls

  controls.update();

  // sphere.rotation.z = (elapsedTime * Math.PI) / 20;

  // mesh.rotation.y = elapsedTime * Math.PI;

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
