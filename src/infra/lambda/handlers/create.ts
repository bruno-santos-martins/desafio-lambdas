
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import DynamoEmployeeRepository from '../../db/DynamoEmployeeRepository';
import createEmployee from '../../../application/use-cases/createEmployee';
import { withCorsHeaders } from '../utils/corsResponse';
import { errorResponse } from '../utils/errorResponse';

function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return withCorsHeaders({
    statusCode,
    body: body === undefined ? '' : JSON.stringify(body),
  });
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const employeeRepository = new DynamoEmployeeRepository();
  
  try {
    const employeeData = JSON.parse(event.body || '{}');
    const createdEmployee = await createEmployee(employeeRepository, employeeData);
    return response(201, createdEmployee);
  } catch (err) {
    
    return errorResponse(err);
  }
};
