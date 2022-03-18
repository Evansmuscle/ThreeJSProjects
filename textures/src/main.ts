import * as THREE from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Textures
 */
// const imageFactory = async (url: string): Promise<THREE.Texture> => {
//   return new Promise((res, _rej) => {
//     const image = new Image();
//     image.src = url;

//     const texture = new THREE.Texture(image);

//     image.addEventListener("load", function () {
//       texture.needsUpdate = true;

//       res(texture);
//     });
//   });
// };

// const baseColor = await imageFactory("/assets/door/basecolor.jpg");
// const height = await imageFactory("/assets/door/height.png");
// const metallic = await imageFactory("/assets/door/metallic.jpg");
// const ambientOcclusion = await imageFactory(
//   "/assets/door/ambientOcclusion.jpg"
// );
// const normal = await imageFactory("/assets/door/normal.jpg");
// const opacity = await imageFactory("/assets/door/opacity.jpg");
// const roughness = await imageFactory("/assets/door/roughness.jpg");

/**
 * Texture Loader Path
 */
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = (url, loaded, total) => {
  console.log(url, loaded, total);
};

loadingManager.onLoad = () => {
  //
};

loadingManager.onProgress = (url, loaded, total) => {
  console.log(url, loaded, total);
};

loadingManager.onError = (url) => {
  console.log(url);
};

const textureLoader = new THREE.TextureLoader(loadingManager);

const baseColor = textureLoader.load("/assets/door/basecolor.jpg");
const height = textureLoader.load("/assets/door/height.png");
const metallic = textureLoader.load("/assets/door/metallic.jpg");
const ambientOcclusion = textureLoader.load(
  "/assets/door/ambientOcclusion.jpg"
);
const normal = textureLoader.load("/assets/door/normal.jpg");
const opacity = textureLoader.load("/assets/door/opacity.jpg");
const roughness = textureLoader.load("/assets/door/roughness.jpg");

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

// Debug Parameters
const debugObject = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
    // Or just renew mesh.rotation.y to 0 every time this animation happens
  },
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

// Scene
const scene = new THREE.Scene();

// Meshes
const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ map: baseColor });

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

mesh.position.set(0, 0, 0);

// Camera

const canvas = document.createElement("canvas");
canvas.style.zIndex = "-1";

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

// GUI
const guiOptions: dat.GUIParams = {
  closed: true,
  width: 400,
};

const gui = new dat.GUI(guiOptions);
gui.add(mesh.position, "y", -3, 3, 0.01);
gui.add(mesh.position, "z", -3, 3, 0.01);
gui.add(mesh.position, "x").min(-3).max(3).step(0.01); // Same thing as the two adds above, just using functions

gui.add(mesh, "visible");
gui.add(mesh.material, "wireframe");

gui.addColor(debugObject, "color").onChange(() => {
  mesh.material.color.set(debugObject.color);
});

gui.add(debugObject, "spin");

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

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
