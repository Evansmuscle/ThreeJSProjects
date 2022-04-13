import * as THREE from "three";
import * as dat from "dat.gui";
import * as CANNON from "cannon-es";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Audio
 */
// Hit Sound
const delay = 100;
let playing: boolean;
const hitSound = new Audio("/sounds/hit.mp3");
const playHitSound = (collision: any) => {
  const velocity: number = collision.contact.getImpactVelocityAlongNormal();
  const volume: number = (velocity / 100) * 7;

  if (velocity > 1.5 && !playing) {
    playing = true;
    setTimeout(() => {
      hitSound.currentTime = 0;
      hitSound.volume = Math.min(volume, 1);
      hitSound.play();
      playing = false;
    }, delay);
  }
};

/**
 * GUI
 */
const gui = new dat.GUI();

const params = {
  windForce: 0.5,
};

gui.add(params, "windForce").min(-10).max(10).step(0.01);

/**
 * Textures
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 */
const world = new CANNON.World();

world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Materials
const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.9,
  }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Plane
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, 0, 0),
  shape: planeShape,
  // material: defaultMaterial,
});

planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

world.addBody(planeBody);

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 0.3);
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0;
directionalLight.shadow.camera.far = 35;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.top = 10;

directionalLight.position.set(14, 15, 10);

scene.add(directionalLight, ambientLight);

/**
 * Meshes
 */

// Plane
const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  side: THREE.DoubleSide,
  metalness: 0.4,
  roughness: 0.5,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.receiveShadow = true;

plane.rotation.set(-Math.PI / 2, 0, 0);
plane.position.set(0, -0.005, 0);

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

// window.addEventListener("dblclick", (_) => {
//   const doc: any = window.document;
//   const fullscreenElement =
//     doc.fullscreenElement || doc.webkitFullscreenElement;

//   if (!fullscreenElement) {
//     if (canvas.requestFullscreen) {
//       canvas.requestFullscreen();
//       //@ts-ignore
//     } else if (canvas.webkitRequestFullscreen) {
//       //@ts-ignore
//       canvas.webkitRequestFullscreen();
//     }
//     return;
//   }

//   if (doc.exitFullscreen) {
//     doc.exitFullscreen();
//     return;
//   }

//   if (doc.webkitExitFullscreen) {
//     doc.webkitExitFullscreen();
//   }
// });

camera.position.set(0, 50, 100);

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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Sphere Creator
 */
const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
});

const sphereGeometry = new THREE.SphereBufferGeometry(1, 36, 36);
const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

/**
 * Utils
 */
interface SphereCreator {
  radius: number;
  position: { x: number; y: number; z: number };
  mass: number;
  sphereArray: Array<{
    sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
    sphereBody: CANNON.Body;
  }>;
  create: () => void;
}
const sphereCreator: SphereCreator = {
  radius: 1,
  position: { x: 0, y: 5, z: 0 },
  mass: 1,
  sphereArray: [],
  create: function () {
    const sphere = new THREE.Mesh(sphereGeometry, material);

    sphere.scale.set(this.radius, this.radius, this.radius);

    sphere.castShadow = true;
    sphere.position.set(this.position.x, this.position.y, this.position.z);

    scene.add(sphere);

    const sphereShape = new CANNON.Sphere(this.radius);
    const sphereBody = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y,
        this.position.z
      ),
      shape: sphereShape,
      // material: defaultMaterial,
    });

    sphereBody.addEventListener("collide", playHitSound);

    world.addBody(sphereBody);

    this.sphereArray.push({ sphere, sphereBody });
  },
};

const sphereFolder = gui.addFolder("Sphere Creator");

sphereFolder.add(sphereCreator, "radius");
sphereFolder.add(sphereCreator, "mass");
sphereFolder.add(sphereCreator.position, "x");
sphereFolder.add(sphereCreator.position, "y");
sphereFolder.add(sphereCreator.position, "z");
sphereFolder.add(sphereCreator, "create");

// Cube Creator
interface CubeCreator {
  size: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  mass: number;
  cubes: Array<{
    cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    cubeBody: CANNON.Body;
  }>;
  create: () => void;
}
const cubeCreator: CubeCreator = {
  size: { x: 1, y: 1, z: 1 },
  position: { x: 0, y: 5, z: 0 },
  mass: 1,
  cubes: [],
  create: function () {
    const cube = new THREE.Mesh(cubeGeometry, material);

    cube.castShadow = true;
    cube.scale.set(this.size.x, this.size.y, this.size.z);

    scene.add(cube);

    const cubeShape = new CANNON.Box(
      new CANNON.Vec3(this.size.x / 2, this.size.y / 2, this.size.z / 2)
    );
    const cubeBody = new CANNON.Body({
      mass: this.mass,
      shape: cubeShape,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y,
        this.position.z
      ),
    });

    cubeBody.addEventListener("collide", playHitSound);

    world.addBody(cubeBody);

    this.cubes.push({ cube, cubeBody });
  },
};

const cubeFolder = gui.addFolder("Cube Creator");
const cubeSizeFolder = cubeFolder.addFolder("Size");
const cubePositionFolder = cubeFolder.addFolder("Position");

cubeFolder.add(cubeCreator, "create");
cubeFolder.add(cubeCreator, "mass");

cubeSizeFolder.add(cubeCreator.size, "x");
cubeSizeFolder.add(cubeCreator.size, "y");
cubeSizeFolder.add(cubeCreator.size, "z");

cubePositionFolder.add(cubeCreator.position, "x");
cubePositionFolder.add(cubeCreator.position, "y");
cubePositionFolder.add(cubeCreator.position, "z");

// Reset World
interface Utils {
  resetWorld: () => void;
}
const utils: Utils = {
  resetWorld: function () {
    cubeCreator.cubes.forEach(({ cube, cubeBody }) => {
      cubeBody.removeEventListener("collide", playHitSound);
      world.removeBody(cubeBody);

      scene.remove(cube);
    });
    sphereCreator.sphereArray.forEach(({ sphere, sphereBody }) => {
      sphereBody.removeEventListener("collide", playHitSound);
      world.removeBody(sphereBody);

      scene.remove(sphere);
    });

    cubeCreator.cubes.splice(0, cubeCreator.cubes.length);
    sphereCreator.sphereArray.splice(0, sphereCreator.sphereArray.length);
  },
};

const utilsFolder = gui.addFolder("Utilities");

utilsFolder.add(utils, "resetWorld");

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  // Update Physics World
  world.step(1 / 60, deltaTime, 3);

  sphereCreator.sphereArray.forEach(({ sphere, sphereBody }) => {
    const pos = sphereBody.position.clone();
    const rot = sphereBody.quaternion.clone();

    sphere.position.set(pos.x, pos.y, pos.z);
    sphere.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  });

  cubeCreator.cubes.forEach(({ cube, cubeBody }) => {
    const pos = cubeBody.position.clone();
    const rot = cubeBody.quaternion.clone();

    cube.position.set(pos.x, pos.y, pos.z);
    cube.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  });

  // Update Camera Via Orbit Controls

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
