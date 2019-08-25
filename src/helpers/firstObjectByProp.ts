export default function firstObjectByProp(
  objects: Record<string, any>[],
  prop: string,
  val: any
): Record<string, any> | false {
  for (let i = 0; i < objects.length; i++) {
    if (objects[i][prop] === val) {
      return objects[i];
    }
  }
  return false;
}
