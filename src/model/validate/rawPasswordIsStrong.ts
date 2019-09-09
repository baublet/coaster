import { ModelData } from "../createModel";
import passwordIsStrong from "helpers/passwordIsStrong";

export default function passwordPropertyIsStrong(
  prop: string = "password",
  validator: (password: string) => string | true = passwordIsStrong
) {
  return (data: ModelData) => {
    return validator(data[prop]);
  };
}
