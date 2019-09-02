import { PersistMatcher, PersistMatcherType } from "..";

export default function dataIsMatch(
  data: Record<string, any>,
  matcher: PersistMatcher
): boolean {
  const modelData = data[matcher.property];
  switch (matcher.type) {
    case PersistMatcherType.EQUAL:
      return modelData === matcher.value;
    case PersistMatcherType.NOT_EQUAL:
      return modelData !== matcher.value;
    case PersistMatcherType.GREATER_THAN:
      return modelData > matcher.value;
    case PersistMatcherType.LESS_THAN:
      return modelData < matcher.value;
    case PersistMatcherType.ONE_OF:
      return matcher.value.includes(modelData);
    case PersistMatcherType.NOT_ONE_OF:
      return !matcher.value.includes(modelData);
    case PersistMatcherType.BETWEEN:
      matcher.value.sort();
      return modelData > matcher.value[0] && modelData < matcher.value[1];
    case PersistMatcherType.NOT_BETWEEN:
      matcher.value.sort();
      return modelData >= matcher.value[1] || modelData <= matcher.value[0];
  }
  return false;
}
