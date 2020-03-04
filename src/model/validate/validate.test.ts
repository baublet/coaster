import { createModel } from "../createModel";

import { validate } from "./validate";
import { ModelArgsPropertyType } from "../types";

function validateName(firstName: string) {
  return firstName.length > 1 ? false : ["Names have more than 1 character!"];
}

const User = createModel({
  name: "User",
  properties: {
    firstName: {
      type: ModelArgsPropertyType.STRING,
      validate: [validateName],
      required: true
    },
    lastName: {
      type: ModelArgsPropertyType.STRING,
      validate: [validateName],
      required: true
    }
  }
});

it("validates fields", () => {
  const user = User({
    firstName: "1",
    lastName: "2"
  });
  expect(validate(User, user)).toEqual([
    true,
    {
      firstName: ["Names have more than 1 character!"],
      lastName: ["Names have more than 1 character!"]
    }
  ]);
});

it("validates required fields", () => {
  const user = User({
    firstName: "1"
  } as any);
  expect(validate(User, user)).toEqual([
    true,
    { firstName: false, lastName: ["lastName is required"] }
  ]);
});
