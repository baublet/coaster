import {
  ModelFactoryComposerFunction,
  ModelFactoryComposerArguments
} from "model/createModel";
import passwordValidator from "./passwordValidator";

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
}: WithAuthenticationOptions = defaultOptions): ModelFactoryComposerFunction {
  return ({ validators }: ModelFactoryComposerArguments) => {
    // Password strength and confirmation equality validator
    validators.push(
      passwordValidator({
        passwordProperty,
        passwordConfirmationProperty,
        passwordHashProperty
      })
    );
    return;
  };
}
