import { APIGatewayProxyResult } from 'aws-lambda';
import { withCorsHeaders } from './corsResponse';

export function errorResponse(err: unknown): APIGatewayProxyResult {
  const error = err as { message?: string; code?: string };
  const message = error && error.message ? error.message : 'Erro interno';
  let statusCode = 500;
  console.log(error);
  if (error && error.code === 'ConditionalCheckFailedException') statusCode = 409;
  else if (/obrigat[oó]rio|inv[aá]lid/i.test(message)) statusCode = 400;
  return withCorsHeaders({
    statusCode,
    body: JSON.stringify({ message }),
  });
}
