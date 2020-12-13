import express from "express";
import bodyParser from "body-parser";
import { Server } from "http";

import {
  CoasterApplicationFactory,
  CoasterRequest,
  CoasterResponse,
  CoasterApplicationConfigurationBase,
} from "../types";

export type CoasterHttpApplicationRoute =
  | CoasterHttpApplicationRouteApplication
  | CoasterHttpApplicationMiddleware;

export interface CoasterHttpApplicationRouteApplication
  extends CoasterHttpApplicationRouteBase {
  application: string;
}

export interface CoasterHttpApplicationMiddleware {
  method?: string | string[];
  route?: string;
  handler: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => any;
}

function isMiddleware(
  middlewareOrRoute: CoasterHttpApplicationRoute
): middlewareOrRoute is CoasterHttpApplicationMiddleware {
  return "handler" in middlewareOrRoute;
}

interface CoasterHttpApplicationRouteBase {
  route: string;
  method?: string | string[];
}

export interface CoasterHttpApplicationConfiguration
  extends CoasterApplicationConfigurationBase {
  port?: number;
  handlers: CoasterHttpApplicationRoute[];
}

export const Http: CoasterApplicationFactory = async (
  config: CoasterHttpApplicationConfiguration,
  system
) => {
  let expressServer: Server;

  function getRequestHandler(applicationName: string) {
    return async (req: express.Request, res: express.Response) => {
      const application = await system.getApplication(applicationName);
      const request: CoasterRequest = {
        body: req.body,
        domain: req.get("host"),
        headers: { ...req.headers },
        originalUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
        parameters: req.query,
        path: req.originalUrl,
        method: req.method as any,
      };

      const response: CoasterResponse = {
        status: (status) => {
          res.status(status);
        },
        headers: new Map<string, any>(),
        send: (data, status) => {
          res.write(data);
          if (status) {
            res.status(status);
          }
        },
        end: (status) => {
          if (status) {
            res.status(status);
          }
          res.end();
        },
      };
      await application.handleRequest(request, response);
    };
  }

  const initialize = () => {
    const port = config.port || "8888";
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));

    for (const middlewareOrRoute of config.handlers) {
      if (isMiddleware(middlewareOrRoute)) {
        app.use(middlewareOrRoute.handler);
        continue;
      }
      const methods = !middlewareOrRoute.method
        ? ["all"]
        : Array.isArray(middlewareOrRoute.method)
        ? middlewareOrRoute.method
        : [middlewareOrRoute.method];
      for (const method of methods) {
        app[method](
          middlewareOrRoute.route,
          getRequestHandler(middlewareOrRoute.application)
        );
      }
    }

    app.listen(port, () => {
      console.log(`${config.name} listening on port ${port}`);
    });
  };

  const teardown = () => {
    expressServer.close();
  };

  return {
    initialize,
    teardown,
    handleRequest: () => {},
  };
};
