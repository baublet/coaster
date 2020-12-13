export function getPathAndExport(
  path: string
): { path: string; exportName: string } {
  const paths = path.split("#");
  return {
    path: path[0],
    exportName: paths.length > 0 ? paths[1] : "default",
  };
}
