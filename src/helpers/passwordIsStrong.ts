import validator from "owasp-password-strength-test";

export default function passwordIsStrong(password: string): string | true {
  const validationResult = validator.test(password);
  if (validationResult.errors.length > 0) {
    return validationResult.errors[0];
  }
  return true;
}
