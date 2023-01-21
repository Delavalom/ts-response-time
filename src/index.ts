import { IncomingMessage, ServerResponse } from "http";

type Options = { digits?: number; header?: string; suffix?: boolean };
type NextFunction = (err?: any) => void;

/**
 * Create a middleware to add a `X-Response-Time` header displaying
 * the response duration in milliseconds.
 *
 * @param {object|function} [options]
 * @param {number} [options.digits=3]
 * @param {string} [options.header=X-Response-Time]
 * @param {boolean} [options.suffix=true]
 * @return {function}
 * @public
 */

const responseTime = (options = {}) => {
  // get the function to invoke
  const fn = typeof options !== "function" ? createSetHeader(options) : options;

  return function responseTime(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ) {
    const startAt = process.hrtime();

    // create onHeader

    // onHeaders(res, function onHeaders() {
    //   const diff = process.hrtime(startAt);
    //   const currentTime = diff[0] * 1000 + diff[1] * 1000_000;

    //   fn(req, res, currentTime);
    // });

    next();
  };
};

/**
 * Create function to set respoonse time header.
 * @private
 */

const createSetHeader = (
  options: Options = { digits: 3, header: "X-Response-Time", suffix: true }
) => {
  return function setResponseHeader(
    _req: IncomingMessage,
    res: ServerResponse,
    time: number
  ) {
    if (res.getHeader(options.header as string)) {
      return;
    }

    let val = time.toFixed(options.digits);
    if (options.suffix) {
      val += "ms";
    }

    res.setHeader(options.header as string, val);
  };
};
