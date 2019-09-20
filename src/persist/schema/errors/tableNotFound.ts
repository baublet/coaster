export default function tableNotFound(database: string, table: string): string {
  return `We tried to perform an operation or access the table named ${table} on database ${database}. That table doesn't seem to exist! Try to create it with the following command:

  schema.database("${database}").createTable("${table}")`;
}
