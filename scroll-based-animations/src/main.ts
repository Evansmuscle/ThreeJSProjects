import * as THREE from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

import "./style.css";

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * GUI
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particles.material.color.set(parameters.materialColor);
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const gradientOne = textureLoader.load("/textures/gradients/3.jpg");
const gradientTwo = textureLoader.load("/textures/gradients/5.jpg");

gradientOne.magFilter = THREE.NearestFilter;
gradientTwo.magFilter = THREE.NearestFilter;

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

directionalLight.position.set(1, 1, 0);

scene.add(directionalLight);

/**
 * Meshes
 */
const objectsDistance = 6;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientOne,
});

const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(1, 0.4, 16, 60),
  material
);

const cone = new THREE.Mesh(new THREE.ConeBufferGeometry(1, 2, 32), material);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotBufferGeometry(0.8, 0.35, 100, 16),
  material
);

torus.position.y = -objectsDistance * 0;
cone.position.y = -objectsDistance * 1;
torusKnot.position.y = -objectsDistance * 2;

torus.position.x = 4;
cone.position.x = -3;
torusKnot.position.x = 4;

scene.add(torus, cone, torusKnot);

const sectionMeshes = [torus, cone, torusKnot];

/**
 * Particles
 */
// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}

const positionsAttr = new THREE.BufferAttribute(positions, 3);
const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute("position", positionsAttr);

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  size: 0.03,
  sizeAttenuation: true,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);

/**
 * Camera
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

scene.add(camera);

// Always add things to a group after adding them to the scene
cameraGroup.add(camera);

/**
 * Canvas
 */

const canvas = document.createElement("canvas");

document.body.appendChild(canvas);

/**
 * Renderer
 */
const rendererParams: THREE.WebGLRendererParameters = {
  canvas,
  alpha: true,
};

const renderer = new THREE.WebGLRenderer(rendererParams);

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Resize
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = (e.clientX / sizes.width - 0.5) * 2;
  cursor.y = -(e.clientY / sizes.height - 0.5) * 2;
});

/**
 * Clock
 */
const clock = new THREE.Clock();
let previousTime = 0;

/**
 * Tick
 */
const tick = () => {
  // Elapsed Time
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate Camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate Meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  renderer.render(scene, camera);

  // Run on every frame
  window.requestAnimationFrame(tick);
};

tick();
