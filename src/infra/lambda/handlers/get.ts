

import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import DynamoEmployeeRepository from '../../db/DynamoEmployeeRepository';
import getEmployee from '../../../application/use-cases/getEmployee';
import { withCorsHeaders } from '../utils/corsResponse';
import { errorResponse } from '../utils/errorResponse';

function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return withCorsHeaders({
    statusCode,
    body: JSON.stringify(body),
  });
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const employeeRepository = new DynamoEmployeeRepository();
  try {
    const employeeId = event.pathParameters && event.pathParameters.id;
    const fetchedEmployee = await getEmployee(employeeRepository, employeeId as string);
    if (!fetchedEmployee) return response(404, { message: 'Funcionário não encontrado' });
    return response(200, fetchedEmployee);
  } catch (err) {
    return errorResponse(err);
  }
};
