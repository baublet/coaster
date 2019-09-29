export default function indexNotFound(
  database: string,
  table: string,
  index: string
): string {
  return `We tried to perform an operation or access an index named ${index} on the the table named ${table}, on database ${database}. That index doesn't seem to exist! Try to create it with the following command:

  schema
    .database("${database}")
    .table("${table}")
    .createIndex("${index}", ["id"]);`;
}
