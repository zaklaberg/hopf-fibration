import {
  AmbientLight,
  AxesHelper,
  BufferGeometry,
  Color,
  DirectionalLight,
  Line,
  Euler,
  LineBasicMaterial,
  PerspectiveCamera,
  Matrix4,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { stereographic, isEqual, linspace } from "./util/vector";
import { findMouseClickMeshIntersections } from "./util/three";
import { createSphere } from "./util/mesh";

const MINIMAP_WIDTH = window.innerWidth / 6;
const MINIMAP_HEIGHT = window.innerHeight / 6;

let mainScene,
  mainCamera,
  minimapCamera,
  minimapScene,
  renderer,
  minimapLocked = true,
  controls,
  sphere,
  previewFiber,
  previewIndicator;

let fibers = [];
let fiberIndicators = [];

let mousePosition = new Vector2();

const getFiberFromPoint = (p) => {
  const fiber = (t) => {
    const n = 1 / Math.sqrt(2 * (1 + p.x));

    const fiberPoint = new Vector4(
      -Math.sin(t) * (1 + p.x),
      Math.cos(t) * (1 + p.x),
      p.y * Math.cos(t) - p.z * Math.sin(t),
      p.z * Math.cos(t) + p.y * Math.sin(t)
    );

    return fiberPoint.multiplyScalar(n);
  };
  const fiberSpecial = (t) => new Vector4();
  const specialPoint = new Vector3(-1, 0, 0);

  const ts = linspace(0, 2 * Math.PI, 1000);

  const circleInS3 = isEqual(specialPoint, p)
    ? ts.map(fiberSpecial)
    : ts.map(fiber);
  const circleInS2 = circleInS3.map(stereographic);

  return circleInS2;
};

const createFiber = (p) => {
  const fiber = getFiberFromPoint(p);
  const color = getColorFromPoint(p);

  const material = new LineBasicMaterial({ color });
  const geometry = new BufferGeometry().setFromPoints(fiber);
  const fiberMesh = new Line(geometry, material);

  return fiberMesh;
};

const addFiber = (p) => {
  const fiber = createFiber(p);
  const indicator = createIndicator(p);

  mainScene.add(fiber);
  minimapScene.add(indicator);

  fiberIndicators.push(indicator);
  fibers.push(fiber);
};

const getColorFromPoint = (p) => {
  const { phi } = new Spherical().setFromCartesianCoords(p.x, p.y, p.z);
  const color = new Color(
    `hsl(${Math.floor((phi / (2 * Math.PI)) * 360)}, 100%, 60%)`
  );
  return color;
};

const createIndicator = (p) => {
  const color = getColorFromPoint(p);

  const indicator = createSphere({
    position: p.normalize().multiplyScalar(50),
    radius: 1,
    color,
    opacity: 0.9,
    scene: minimapScene,
  });

  return indicator;
};

const onWindowResize = () => {
  minimapCamera.aspect = window.innerWidth / window.innerHeight;
  minimapCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const init = () => {
  minimapCamera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  minimapCamera.position.z = 100;
  minimapScene = new Scene();

  mainCamera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  mainCamera.position.z = 10;
  mainScene = new Scene();

  sphere = createSphere({ scene: minimapScene });
  minimapScene.add(sphere);
  previewIndicator = createSphere({ scene: minimapScene });
  previewFiber = createFiber({ x: 0, y: 0, z: 0 });
  addAxes(minimapScene);
  addLighting(minimapScene);
  //addLighting(mainScene);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);
  document.body.style.margin = 0;

  const onPointerDown = (event) => {
    event.preventDefault();
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  };

  const onPointerMove = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !minimapLocked &&
      !isEqual(
        { x: event.clientX, y: event.clientY, z: 0 },
        { ...mousePosition, z: 0 }
      )
    ) {
      return;
    }

    const intersections = findMouseClickMeshIntersections({
      objects: minimapScene.children,
      camera: minimapCamera,
      coordinates: { x: event.clientX, y: event.clientY },
      sceneDimensions: { width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT },
      offsets: { y: window.innerHeight },
    });

    if (intersections.length > 0) {
      const intersectionPoint = intersections[0].point.normalize();
      const points = getFiberFromPoint(intersectionPoint);
      previewFiber.geometry.setFromPoints(points);
      /* previewIndicator.position.set(intersectionPoint.multiplyScalar(50));
      previewIndicator.material.color = getColorFromPoint(intersectionPoint); */

      mainScene.add(previewFiber);
      minimapScene.add(previewIndicator);
    } else {
      previewFiber.removeFromParent();
      previewIndicator.removeFromParent();
    }
  };

  const onPointerUp = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !minimapLocked &&
      !isEqual(
        { x: event.clientX, y: event.clientY, z: 0 },
        { ...mousePosition, z: 0 }
      )
    ) {
      return;
    }

    const intersections = findMouseClickMeshIntersections({
      objects: minimapScene.children,
      camera: minimapCamera,
      coordinates: { x: event.clientX, y: event.clientY },
      sceneDimensions: { width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT },
      offsets: { y: window.innerHeight },
    });

    if (intersections.length > 0) {
      addFiber(intersections[0].point.normalize());
    }
  };

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("keyup", onKeyUp);

  controls = new OrbitControls(mainCamera, renderer.domElement);

  animate();
};

const clearFibers = () => {
  fibers.forEach((fiber) => {
    fiber.removeFromParent();
    fiber.material.dispose();
    fiber.geometry.dispose();
  });

  fiberIndicators.forEach((indicator) => {
    indicator.removeFromParent();
    indicator.material.dispose();
    indicator.geometry.dispose();
  });
};

const onKeyUp = (event) => {
  if (event.key.toLowerCase() === "g") {
    minimapLocked = controls.object !== mainCamera;
    if (controls.object === mainCamera) {
      controls.object = minimapCamera;
    } else controls.object = mainCamera;
  } else if (event.key.toLowerCase() === "h") {
    controls.enabled = !controls.enabled;
  } else if (event.key.toLowerCase() === "a") {
    const thetas = prompt("enter theta(s): ", 0).split(",").map(Number);
    const ts = linspace(0, 2 * Math.PI, 50);
    const colors = linspace(0, 0x0000ff, 50);
    const pointsByTheta = thetas.map((theta) =>
      ts.map(
        (t) =>
          new Vector3(
            Math.sin(theta),
            Math.cos(theta) * Math.sin(t),
            Math.cos(theta) * Math.cos(t)
          )
      )
    );

    pointsByTheta.forEach((points) =>
      points.forEach((point, i) =>
        setTimeout(() => addFiber(point, colors[i]), i * 100)
      )
    );
  } else if (event.key.toLowerCase() === "b") {
    const thetas = prompt("enter theta(s): ", 0).split(",").map(Number);
    const cutoff = Number(prompt("enter cutoff angle: ", 2 * Math.PI));
    const ts = linspace(0, cutoff, 50);
    const colors = linspace(0, 0x0000ff, 50);
    const pointsByTheta = thetas.map((theta) =>
      ts.map(
        (t) =>
          new Vector3(
            Math.sin(theta),
            Math.cos(theta) * Math.sin(t),
            Math.cos(theta) * Math.cos(t)
          )
      )
    );

    pointsByTheta.forEach((points) =>
      points.forEach((point, i) =>
        setTimeout(() => addFiber(point, colors[i]), i * 100)
      )
    );
  } else if (event.key.toLowerCase() === "c") {
    const angles = prompt("Enter theta, phi, gamma", "0, 0, 0")
      ?.split(",")
      .map((angle) => parseInt(angle)) ?? [0, 0, 0];

    const ts = linspace(0, 2 * Math.PI, 100);
    const colors = linspace(0, 0x0000ff, 100);
    const points = ts.map((t) => new Vector3(0, Math.sin(t), Math.cos(t)));

    points.forEach((point, i) => {
      const matrix = new Matrix4();
      matrix.makeRotationFromEuler(new Euler(...angles));

      point.applyMatrix4(matrix);
      addFiber(point, colors[i]);
    });
  } else if (event.key.toLowerCase() === "d") {
    clearFibers();
  }
};

const animate = () => {
  requestAnimationFrame(animate);

  renderer.setScissorTest(false);
  renderer.setClearColor(0x00000f);
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(mainScene, mainCamera);

  renderer.setClearColor(0x000000);
  renderer.setScissorTest(true);

  renderer.setScissor(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  renderer.setViewport(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

  renderer.render(minimapScene, minimapCamera);
};

const addLighting = (scene) => {
  const ambientLight = new AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(90, 30, 1).normalize();
  scene.add(dirLight);
};

const addAxes = (scene) => {
  const axesHelper = new AxesHelper(25);
  scene.add(axesHelper);
};

init();
