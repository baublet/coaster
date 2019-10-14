export default function andAndOrCannotCoexist(query: any): string {
  return `Oopsie. In the below query, it appears we tried to set both "$and" and "$or" to true. This means we're trying to tell the query to find instances where, e.g., name == Rachel AND/OR name == Mark. In common vernacular, AND/OR means just "OR". Is that what we meant? If not, we may try a more complicated query through the "$with" and "$without" operators.

${JSON.stringify(query)}`;
}
