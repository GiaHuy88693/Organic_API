export interface SwaggerOptions {
  username: string
  password: string
}

/**
 * Enum cho các mã trạng thái HTTP
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Interface cho response message configuration
 */
export interface ResponseMessage {
  statusCode: number
  message: string
  description?: string
}

/**
 * Interface cho API response structure
 */
export interface ApiResponseStructure<T = any> {
  statusCode: number
  message: string
  data?: T
  dateTime: string
}
