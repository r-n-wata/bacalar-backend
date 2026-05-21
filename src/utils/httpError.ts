export class HttpError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, message: string, code = 'HTTP_ERROR') {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.code = code
  }
}
