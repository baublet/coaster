import { rawTypes } from "./rawTypes";
import { mockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

describe("interfaces/types", () => {
  it("spits out types", () => {
    expect(
      rawTypes(mockRawSchema, getMockMetaData(), { typesOrInterfaces: "types" })
    ).toMatchSnapshot();
  });

  it("spits out interfaces", () => {
    expect(
      rawTypes(mockRawSchema, getMockMetaData(), {
        typesOrInterfaces: "interfaces",
      })
    ).toMatchSnapshot();
  });
});
