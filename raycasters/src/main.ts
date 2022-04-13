import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * GUI
 */
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

window.addEventListener("click", (e) => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case mesh2:
        console.log("clicked First sphere");
        break;

      case mesh1:
        console.log("clicked Second sphere");
        break;

      case mesh3:
        console.log("clicked Third sphere");
        break;

      default:
        break;
    }
  }
});

// Scene
const scene = new THREE.Scene();

// Meshes
const geometry = new THREE.SphereBufferGeometry(0.5, 32, 32);

const materialOptions: THREE.MeshBasicMaterialParameters = {
  color: 0xff0000,
};
const material1 = new THREE.MeshBasicMaterial(materialOptions);
const material2 = new THREE.MeshBasicMaterial(materialOptions);
const material3 = new THREE.MeshBasicMaterial(materialOptions);

const mesh1 = new THREE.Mesh(geometry, material1);
const mesh2 = new THREE.Mesh(geometry, material2);
const mesh3 = new THREE.Mesh(geometry, material3);

scene.add(mesh1, mesh2, mesh3);

mesh1.position.set(0, 0, 0);
mesh2.position.set(-1.5, 0, 0);
mesh3.position.set(1.5, 0, 0);

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();

// raycaster.set(rayOrigin, rayDirection);

// const intersect = raycaster.intersectObject(mesh2);
// const intersects = raycaster.intersectObjects([mesh1, mesh2, mesh3]);

// console.log(intersect, intersects);

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

camera.position.set(0, 0, 5);

scene.add(camera);

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -((e.clientY / sizes.height) * 2 - 1);
});

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

let currentIntersect: THREE.Intersection<THREE.Object3D<THREE.Event>> | null =
  null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update spheres
  mesh1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  mesh2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  mesh3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

  // Update Mousemove Raycaster
  raycaster.setFromCamera(mouse, camera);

  // Update Raycaster
  // const rayOrigin = new THREE.Vector3(-3, 0, 0);
  // const rayDirection = new THREE.Vector3(10, 0, 0);
  // rayDirection.normalize();

  // raycaster.set(rayOrigin, rayDirection);

  const objectsToTest = [mesh1, mesh2, mesh3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  for (const mesh of objectsToTest) {
    mesh.material.color.set("#ff0000");
  }

  for (const intersect of intersects) {
    //@ts-ignore
    intersect.object.material.color.set("#0000ff");
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      console.log("mouse enter");
    }

    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }

    currentIntersect = null;
  }

  // Mouse Hovering

  // Update Camera Via Orbit Controls
  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
