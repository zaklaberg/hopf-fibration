import { SphereGeometry, MeshStandardMaterial, Mesh, Vector3 } from "three";

export const createSphere = ({
  position = new Vector3(0, 0, 0),
  radius = 50,
  color = 0xd3d3d3,
  opacity = 0.2,
}) => {
  const geometry = new SphereGeometry(radius, 200, 200);
  var material = new MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
  });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);

  return mesh;
};
