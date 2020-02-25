import { createModel } from "../createModel";

import { validate } from "./validate";
import { ModelArgsPropertyType } from "../types";

function validateName(firstName: string) {
  return firstName.length > 1
    ? false
    : ["First names have more than 1 character!"];
}

function validateFullName(fullName: string) {
  return fullName.length > 3 ? false : ["Full name doesn't fit the minimum!"];
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
    },
    name: {
      type: ModelArgsPropertyType.COMPUTED,
      compute: data => data.firstName + " " + data.lastName,
      validate: [validateFullName]
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
      firstName: ["First names have more than 1 character!"],
      lastName: ["First names have more than 1 character!"],
      name: ["Full name doesn't fit the minimum!"]
    }
  ]);
});

it("validates required fields", () => {
  const user = User({
    firstName: "1"
  } as any);
  expect(validate(User, user)).toEqual([
    true,
    { firstName: false, lastName: ["lastName is required"], name: false }
  ]);
});
