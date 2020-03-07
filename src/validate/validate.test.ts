import { createModel } from "model/createModel";

import { validateFactory } from "./validate";
import { ModelArgsPropertyType } from "model/types";

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

const validate = validateFactory(User);

it("validates fields", () => {
  const user = User({
    firstName: "1",
    lastName: "2"
  });
  expect(validate(user)).toEqual([
    false,
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
  expect(validate(user)).toEqual([
    false,
    { firstName: false, lastName: ["lastName is required"] }
  ]);
});
