export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const notFound = (resource = 'Resource') => new ApiError(404, `${resource} not found`);
export const forbidden = (message = 'You do not have access to this resource') => new ApiError(403, message);
