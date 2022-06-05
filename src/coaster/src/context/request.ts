import type { Request, Response } from "express";

import { Context } from "./base";

export type RequestContext = Context & {
  request: Request;
  response: Response;
};
