import "cookie-parser";
import { CoasterError } from "@baublet/coaster-utils";

import { HttpMethod } from "../endpoints/types";
import { Context } from "./base";

export interface CoasterCookieOptions {
  expiry?: Date;
  httpOnly?: boolean;
  domain?: string;
  path?: string;
}

export interface RequestContext extends Context {
  request: {
    cookies: Map<string, string>;
    headers: Map<string, string | string[] | undefined>;
    method: HttpMethod;
    body?: any;
  };
  response: {
    /**
     * Sets the status of the request. Returns a CoasterError if we have already
     * sent data (like the status, headers, or any data) to the client. (We have
     * to set the status and headers early in the request. HTTP requires us to
     * send that kind of stuff before any data can be sent to the client.)
     */
    setStatus: (status: number) => undefined | CoasterError;
    /**
     * Appends data to the response that we will later flush to the client
     */
    appendData: (data: any) => undefined | CoasterError;
    /**
     * Sets the response data that we will later flush to the client. If any
     * other data has been set or appended, this call overwrites that data.
     */
    setData: (data: any) => undefined | CoasterError;
    /**
     * Flushes all data in the response buffer to the client. If the status
     * and other headers have not yet been sent to the client, this function
     * will flush the initial headers.
     */
    flushData: () => void;
    /**
     * Sets the response data to JSON if no partial data has yet been flushed
     * to the client. Returns CoasterError if data has already been flushed to
     * the client.
     */
    sendJson: (payload: any) => undefined | CoasterError;
    /**
     * Sets a response header. Returns a CoasterError if headers have already
     * been sent to the client;
     */
    setHeader: (key: string, payload: string) => undefined | CoasterError;
    /**
     * Sets a series of response headers. Returns a CoasterError if headers have
     * already been sent to the client.
     */
    setHeaders: (
      headers: Map<string, string> | Record<string, string>
    ) => undefined | CoasterError;
    /**
     * Returns the value of a response header. Returns undefined if the response
     * header has not been set.
     */
    getHeader: (key: string) => string | undefined;
    /**
     * Sets a cookie that will be sent to the client. Returns CoasterError if
     * the headers have already been sent to the client.
     */
    setCookie: (
      key: string,
      payload: string,
      options?: CoasterCookieOptions
    ) => undefined | CoasterError;
  };
}
