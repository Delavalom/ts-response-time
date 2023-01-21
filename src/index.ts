type Response = Record<string, any>

export type NextFunction = {
    (err?: any): void;
    // "Break-out" of a router by calling {next('router')};
    (deferToNext: 'router'): void;
    // "Break-out" of a route by calling {next('route')};
    (deferToNext: 'route'): void;
}

var deprecate = require('depd')('response-time')
var onHeaders = require('on-headers')

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

function responseTime (options = {}) {


  if (typeof options === 'number') {
    // back-compat single number argument
    deprecate('number argument: use {digits: ' + JSON.stringify(options) + '} instead')
    options = { digits: options }
  }

  // get the function to invoke
  const fn = typeof options !== 'function'
    ? createSetHeader(options)
    : options

  return function responseTime (req: Request, res: Response, next: NextFunction) {
    const startAt = process.hrtime()

    onHeaders(res, function onHeaders () {
      const diff = process.hrtime(startAt)
      const time = diff[0] * 1e3 + diff[1] * 1e-6

      fn(req, res, time)
    })

    next()
  }
}

/**
 * Create function to set respoonse time header.
 * @private
 */

type Options = { digits?: number, header?: string, suffix?: boolean }

const createSetHeader = (options: Options) => {
  // response time digits
  const digits = options.digits !== undefined
    ? options.digits
    : 3

  // header name
  const header = options.header || 'X-Response-Time'

  // display suffix
  const suffix = options.suffix !== undefined
    ? Boolean(options.suffix)
    : true

  return function setResponseHeader (req: Request, res: Response, time: number) {
    if (res.getHeader(header)) {
      return
    }

    let val = time.toFixed(digits)

    if (suffix) {
      val += 'ms'
    }

    res.setHeader(header, val)
  }
}