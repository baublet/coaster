function objectHasProperties(obj: Record<string, any>, properties: string[]): boolean {
  for(const property of properties) {
    if(!obj.hasOwnProperty(property)) {
      return false;
    }
  }
  return true;
}
