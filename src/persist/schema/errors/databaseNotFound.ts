export default function databaseNotFound(database: string): string {
  return `We tried to perform an action or access a database named ${database}, which does not exist. You need to tell the schema to create a database before you can perform operations on it. Try using the following:

  schema.createDatabase("${database}");`;
}
