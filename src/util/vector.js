import { Vector3 } from "three";

export const isEqual = (a, b, eps = 1e-12) => {
  return (
    Math.abs(a.x - b.x) < eps &&
    Math.abs(a.y - b.y) < eps &&
    Math.abs(a.z - b.z) < eps
  );
};

export const linspace = (start, stop, nPoints) => {
  const step = (stop - start) / (nPoints - 1);
  return new Array(nPoints).fill().map((_, i) => start + step * i);
};

export const stereographic = (p) => {
  const n = 1 / (1 - p.w);
  return new Vector3(p.x, p.y, p.z).multiplyScalar(n);
};
