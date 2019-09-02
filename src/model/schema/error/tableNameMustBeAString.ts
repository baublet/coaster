export default function tableNameMustBeAString(name: any) {
  return `$tableName in your schema definition must be a string. Received instead ${typeof name}.`;
}
