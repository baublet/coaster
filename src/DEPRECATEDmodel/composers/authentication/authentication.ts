import passwordValidator from "./passwordValidator";
import tokenModel from "./tokenModel";
import { ModelDataPropTypes } from "model/types";

const defaultOptions = {
  usernameProperties: ["username", "email"],
  passwordProperty: "password",
  passwordConfirmationProperty: "password_confirmation",
  passwordHashProperty: "password_hash"
};

export interface WithAuthenticationOptions {
  usernameProperties?: string[];
  passwordProperty?: string;
  passwordConfirmationProperty?: string;
  passwordHashProperty?: string;
}

export default function withAuthentication({
  passwordProperty,
  passwordConfirmationProperty,
  passwordHashProperty
}: WithAuthenticationOptions = defaultOptions): ModelDataPropTypes {
  return ({ validators, has }: ModelDataPropTypes) => {
    // Password strength and confirmation equality validator
    validators.push(
      passwordValidator({
        passwordProperty,
        passwordConfirmationProperty,
        passwordHashProperty
      })
    );

    // Session tokens
    has.push(tokenModel);
  };
}
