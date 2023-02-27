import "cookie-parser";
import { Request, Response } from "express";

import { Context } from "./base";

export interface CoasterCookieOptions {
  expiry?: Date;
  httpOnly?: boolean;
  domain?: string;
  path?: string;
}

export interface RequestContext extends Context {
  response: Response;
  request: Request;
}
