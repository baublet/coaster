import { rawTypes } from "./rawTypes";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

describe("interfaces/types", () => {
  it("spits out types", () => {
    expect(
      rawTypes(getMockRawSchema(), getMockMetaData(), {
        typesOrInterfaces: "types",
      })
    ).toMatchSnapshot();
  });

  it("spits out interfaces", () => {
    expect(
      rawTypes(getMockRawSchema(), getMockMetaData(), {
        typesOrInterfaces: "interfaces",
      })
    ).toMatchSnapshot();
  });
});
