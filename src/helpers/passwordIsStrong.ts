import validator from "owasp-password-strength-test";

/**
 * Takes a plaintext password and returns an English-language string of why the
 * password is not strong if it is not. If the password is strong, returns true.
 * @param password
 */
export default function passwordIsStrong(password: string): string | true {
  const validationResult = validator.test(password);
  if (validationResult.errors.length > 0) {
    return validationResult.errors[0];
  }
  return true;
}
