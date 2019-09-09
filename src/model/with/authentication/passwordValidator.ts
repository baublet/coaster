import { Validator } from "model/validate/validate";
import { WithAuthenticationOptions } from "./authentication";
import passwordsDoNotMatch from "./errors/passwordsDoNotMatch";
import passwordStrengthValidator from "helpers/passwordIsStrong";
import { ModelDataDefaultType } from "model/createModel";

export default function passwordValidator({
  passwordProperty,
  passwordConfirmationProperty,
  passwordHashProperty
}: WithAuthenticationOptions): Validator<ModelDataDefaultType> {
  const passwordValidator: Validator<ModelDataDefaultType> = ({ data }) => {
    // If there's already a hash set and no password is set,
    // we're just saving the user as normal, so skip this.
    if (
      data[passwordHashProperty] &&
      !data[passwordProperty] &&
      !data[passwordConfirmationProperty]
    ) {
      return true;
    }
    if (data[passwordProperty] !== data[passwordConfirmationProperty]) {
      return passwordsDoNotMatch();
    }
    const passwordIsStrong = passwordStrengthValidator(data[passwordProperty]);
    if (passwordIsStrong === true) {
      return true;
    }
    return passwordIsStrong;
  };
  return passwordValidator;
}
