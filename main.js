import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  alpha: true, // transparent background
  premultipliedAlpha: false,
});

// const gridHelper = new THREE.GridHelper(30, 30);
// scene.add(gridHelper);

// Scene objects
const material = new THREE.MeshBasicMaterial({
  color: 0x22bbaa,
  wireframe: true,
});

const pointLight = new THREE.PointLight(0xffffff, 2, 100);
pointLight.position.set(-6, 6, 0);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// GLTF object import
let medallion;
const loader = new GLTFLoader();
loader.load(
  "3D Models/HubbleMedallion.glb",
  function (gltf) {
    medallion = gltf.scene.children[0];
    scene.add(medallion);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

camera.position.y = 11;
camera.rotation.x = -90 * THREE.Math.DEG2RAD;

// RENDER
function animate(time) {
  requestAnimationFrame(animate);

  time *= 0.001; //seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  medallion.rotation.z = time * 0.4;

  renderer.render(scene, camera);
}
animate();
//
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
