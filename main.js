import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function main() {
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setScissorTest(true);

  const sceneElements = [];
  function addScene(elem, fn) {
    const ctx = document.createElement("canvas").getContext("2d");
    elem.appendChild(ctx.canvas);
    sceneElements.push({ elem, ctx, fn });
  }

  function makeScene(elem) {
    const scene = new THREE.Scene();

    const fov = 40;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 20;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1, 2.5);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const controls = new TrackballControls(camera, elem);
    controls.noZoom = true;
    controls.noPan = true;
    controls.target.set(0, 0, 0);

    {
      const light = new THREE.AmbientLight(0xffffff);
      scene.add(light);
    }
    {
      const light = new THREE.DirectionalLight("0xffffff", 4);
      light.position.set(10, 10, 10);
      scene.add(light);
    }
    {
      const light = new THREE.DirectionalLight("0xffffff", 2);
      light.position.set(-10, -10, -10);
      scene.add(light);
    }
    // {
    //   const pointLight = new THREE.PointLight(0x404040);
    //   camera.add(pointLight);
    // }
    // {
    //   const pointLight = new THREE.PointLight(0xffffff);
    //   pointLight.position.set(0, -5, -5);
    //   scene.add(pointLight);
    // }

    return { scene, camera, controls };
  }

  const sceneInitFunctionsByName = {
    ingenuity: (elem) => {
      const { scene, camera, controls } = makeScene(elem);

      let model;
      const loader = new GLTFLoader();
      loader.load(
        "./3D Models/Ingenuity.glb",
        function (gltf) {
          model = gltf.scene;
          scene.add(model);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );

      return (time, rect) => {
        if (model) model.rotation.y = time * 0.1;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        controls.handleResize();
        controls.update();
        renderer.render(scene, camera);
      };
    },
    medallion: (elem) => {
      const { scene, camera, controls } = makeScene(elem);

      let model;
      const loader = new GLTFLoader();
      loader.load(
        "./3D Models/HubbleMedallion.glb",
        function (gltf) {
          model = gltf.scene;
          scene.add(model);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
      return (time, rect) => {
        if (model) model.rotation.y = time * 0.15;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        controls.handleResize();
        controls.update();
        renderer.render(scene, camera);
      };
    },
  };

  document.querySelectorAll("[data-diagram]").forEach((elem) => {
    const sceneName = elem.dataset.diagram;
    const sceneInitFunction = sceneInitFunctionsByName[sceneName];
    const sceneRenderFunction = sceneInitFunction(elem);
    addScene(elem, sceneRenderFunction);
  });

  function render(time) {
    time *= 0.001;

    for (const { elem, fn, ctx } of sceneElements) {
      // get the viewport relative position of this element
      const rect = elem.getBoundingClientRect();
      const { left, right, top, bottom, width, height } = rect;
      const rendererCanvas = renderer.domElement;

      const isOffscreen =
        bottom < 0 ||
        top > window.innerHeight ||
        right < 0 ||
        left > window.innerWidth;

      if (!isOffscreen) {
        // make sure the renderer's canvas is big enough
        if (rendererCanvas.width < width || rendererCanvas.height < height) {
          renderer.setSize(width, height, false);
        }

        // make sure the canvas for this area is the same size as the area
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
          ctx.canvas.width = width;
          ctx.canvas.height = height;
        }

        renderer.setScissor(0, 0, width, height);
        renderer.setViewport(0, 0, width, height);

        fn(time, rect);

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(
          rendererCanvas,
          0,
          rendererCanvas.height - height,
          width,
          height, // src rect
          0,
          0,
          width,
          height
        ); // dst rect
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
