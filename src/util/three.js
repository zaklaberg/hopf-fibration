import { Raycaster, Vector2 } from "three";

const raycaster = new Raycaster();

export const findMouseClickMeshIntersections = ({
  coordinates,
  camera,
  objects,
  sceneDimensions,
  offsets,
}) => {
  const newPointerPosition = new Vector2(
    (coordinates.x / sceneDimensions.width) * 2 - 1,
    -(
      (sceneDimensions.height - (offsets.y - coordinates.y)) /
      sceneDimensions.height
    ) *
      2 +
      1
  );

  raycaster.setFromCamera(newPointerPosition, camera);
  const intersections = raycaster.intersectObjects(objects);

  return intersections || [];
};
