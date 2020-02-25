import { ModelData } from "model/types";
import { validate } from "email-validator";

type EmailValidator = (email: string) => boolean;

export default function propertyIsEmail(
  prop: string,
  errorMessage: string = "%prop must be an email address",
  validator: EmailValidator = validate
) {
  const fullErrorMessage = errorMessage.replace("%prop", prop);
  return (data: ModelData) => {
    if (validator(data[prop])) return true;
    return fullErrorMessage;
  };
}
