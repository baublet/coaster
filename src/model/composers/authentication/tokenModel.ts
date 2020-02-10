import { createModel } from "model/createModel";
import generateToken from "uuid/v4";
import { BeforeCreateHookArguments } from "model/hooks/hooks";

export enum TokenType {
  JWT = "json-web-token",
  SESSION = "session",
  SSO = "single-sign-on"
}

export interface UserTokenModel {
  type: TokenType | string;
  userId: string;
}

function generateTokenIfOneIsNotPresent({
  initialData
}: BeforeCreateHookArguments) {
  if (initialData.token) return;
  if (!initialData.token) {
    initialData.token = generateToken();
  }
}

function setDefaultTokenType({ initialData }: BeforeCreateHookArguments): void {
  if (!initialData.type) {
    initialData.type = TokenType.SESSION;
  }
}

export default createModel({
  name: "Authentication Token",
  hooks: {
    beforeCreate: [generateTokenIfOneIsNotPresent, setDefaultTokenType]
  }
});
