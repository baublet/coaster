import log from "./log";

it("logs properly and maintains the context", () => {
  log("test!", { toots: 123 })
})