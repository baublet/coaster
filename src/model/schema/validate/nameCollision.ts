import { Schema } from "..";
import nameCollisionError from "../error/nameCollision";

function intersectsIfAnyNamesAreTheSame(
  obj1: Record<string, string>,
  obj2: Record<string, string>
): boolean {
  const leftNames = Object.values(obj1);
  const rightNames = Object.values(obj2);
  for (let i = 0; i < leftNames.length; i++) {
    if (rightNames.includes(leftNames[i])) {
      return true;
    }
  }
  return false;
}

function collisionErrorLine(names: Record<string, string>): string {
  return `${Object.values(names).join(", ")}`;
}

export default function nameCollision({
  $tableName,
  ...schema
}: Schema): true | string {
  const allNames = [];
  Object.values(schema).forEach(node => {
    if (typeof node === "string") return;
    const names = {
      uniqueName: node.uniqueName,
      ...node.names
    };
    allNames.push(names);
  });

  const nodes = allNames.reduce(
    (nodes, current) => {
      const collisions = [current];
      nodes.all.forEach(node => {
        if (intersectsIfAnyNamesAreTheSame(node, current)) {
          collisions.push(node);
        }
      });
      if (collisions.length > 1) {
        nodes.collisions.push(collisions);
      }
      nodes.all.push(current);
      return nodes;
    },
    { all: [], collisions: [] }
  );

  const collisionMap: Record<string, string[]> = {};
  nodes.collisions.forEach(collision => {
    const [primary, ...collisions] = collision;
    const key = collisionErrorLine(primary);
    collisionMap[key] = collisions.map(collision =>
      collisionErrorLine(collision)
    );
  });

  if (Object.values(collisionMap).length)
    return nameCollisionError($tableName, collisionMap);
  return true;
}
