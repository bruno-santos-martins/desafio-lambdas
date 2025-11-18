


import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import DynamoEmployeeRepository from '../../db/DynamoEmployeeRepository';
import deleteEmployee from '../../../application/use-cases/deleteEmployee';
import { withCorsHeaders } from '../utils/corsResponse';
import { errorResponse } from '../utils/errorResponse';

function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return withCorsHeaders({
    statusCode,
    body: body === undefined ? '' : JSON.stringify(body),
  });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const employeeRepository = new DynamoEmployeeRepository();
  try {
    const employeeId = event.pathParameters && event.pathParameters.id;
    await deleteEmployee(employeeRepository, employeeId as string);
    return response(204);
  } catch (err) {
    return errorResponse(err);
  }
};
