import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";

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

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.4);
scene.add(directionalLight);
directionalLight.position.set(1, 0.25, 0);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
scene.add(hemisphereLight);

const pointLight = new THREE.PointLight(0xff9000, 0.5, 40, 10);
scene.add(pointLight);

pointLight.position.set(3, 0, 3);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 30, 1, 1);
scene.add(rectAreaLight);

rectAreaLight.position.set(-2, 2, -2);

const spotLight = new THREE.SpotLight(
  0x78ff00,
  0.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
scene.add(spotLight.target);

// Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.2
);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

window.requestAnimationFrame(() => {
  spotLightHelper.update();
});

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

// Meshes
const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

mesh.position.set(0, 0, 0);

mesh.geometry.computeBoundingBox();

rectAreaLight.lookAt(mesh.position);
spotLight.target.position.x = -1;

// Plane
const planeGeometry = new THREE.PlaneGeometry(20, 20, 2, 2);

const plane = new THREE.Mesh(planeGeometry, material);

plane.rotation.x = -Math.PI / 2;
if (mesh.geometry.boundingBox) {
  plane.position.y =
    mesh.geometry.boundingBox.min.y - mesh.geometry.boundingBox.max.y;
}

scene.add(plane);

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

  // Update Camera Via Orbit Controls

  mesh.rotation.set(
    elapsedTime / Math.PI,
    elapsedTime / Math.PI,
    elapsedTime / Math.PI
  );

  spotLight.target.position.set(
    1 * Math.sin(elapsedTime),
    1 * Math.sin(elapsedTime),
    1 * Math.sin(elapsedTime)
  );

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
