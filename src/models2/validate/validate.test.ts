import { createModel } from "../createModel";

import { validate } from "./validate";
import { ModelArgsPropertyType, Model } from "models2/types";

function validateName(firstName: string) {
  return firstName.length > 1
    ? false
    : ["First names have more than 1 character!"];
}

function validateFullName(fullName: string, model: Model) {
  return fullName.length > 3 ? false : ["Full name doesn't fit the minimum!"];
}

const User = createModel({
  name: "User",
  properties: {
    firstName: {
      type: ModelArgsPropertyType.STRING,
      validate: [validateName]
    },
    lastName: {
      type: ModelArgsPropertyType.STRING,
      validate: [validateName]
    },
    name: {
      type: ModelArgsPropertyType.COMPUTED,
      compute: data => data.firstName + " " + data.lastName,
      validate: [validateFullName]
    }
  }
});

it("validates first name", () => {
  const user = User({
    firstName: "1"
  });
  expect(validate(User, user)).toEqual(1);
});
