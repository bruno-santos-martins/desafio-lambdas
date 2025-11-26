

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
    if (employeeId) {
      const fetchedEmployee = await getEmployee(employeeRepository, employeeId as string);
      if (!fetchedEmployee) return response(404, { message: 'Funcionário não encontrado com essas informações' });
      return response(200, fetchedEmployee);
    } else {
      // Paginação opcional via query string: ?page=1&limit=10
      const page = event.queryStringParameters && event.queryStringParameters.page ? parseInt(event.queryStringParameters.page, 10) : 1;
      const limit = event.queryStringParameters && event.queryStringParameters.limit ? parseInt(event.queryStringParameters.limit, 10) : 10;
      const allEmployees = await employeeRepository.getAll();
      const total = allEmployees.length;
      const start = (page - 1) * limit;
      const paginated = allEmployees.slice(start, start + limit);
      return response(200, {
        data: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }
  } catch (err) {
    return errorResponse(err);
  }
};
