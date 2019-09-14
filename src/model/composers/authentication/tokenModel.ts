import createModel, { ModelFactory } from "model/createModel";
import generateToken from "uuid/v4";

export enum TokenType {
  JWT = "json-web-token",
  SESSION = "session",
  SSO = "single-sign-on"
}

export default (UserModel: ModelFactory) =>
  createModel({
    name: "Session Token",
    has: [UserModel],
    hooks: {
      beforeCreate: ({ initialData }) => {
        if (initialData.token) return;
        if (!initialData.type) {
          initialData.type = TokenType.SESSION;
        }
        if (!initialData.token) {
          initialData.token = generateToken();
        }
      }
    }
  });
