export default function indexNameExists(
  databaseName: string,
  indexName: string
): string {
  return `We tried to create an index named ${indexName} on the database ${databaseName}. That index name already exists. Maybe you already created it? If you didn't, you will need to rename your new index.`;
}
