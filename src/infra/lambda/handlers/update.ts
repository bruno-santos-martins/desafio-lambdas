import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import DynamoEmployeeRepository from '../../db/DynamoEmployeeRepository';
import updateEmployee from '../../../application/use-cases/updateEmployee';
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
    const updateData = JSON.parse(event.body || '{}');
    const updatedEmployee = await updateEmployee(employeeRepository, employeeId as string, updateData);
    if (!updatedEmployee) return response(404, { message: 'Funcionário não encontrado' });
    return response(200, updatedEmployee);
  } catch (err) {
    return errorResponse(err);
  }
};
