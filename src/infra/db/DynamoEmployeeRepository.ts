import AWS from 'aws-sdk';
import type Employee from '../../domain/entities/Employee';
import EmployeeRepository, { type EmployeeUpdate } from '../../domain/repositories/EmployeeRepository';

const docClient = new AWS.DynamoDB.DocumentClient();

export default class DynamoEmployeeRepository extends EmployeeRepository {
  private employeeTableName: string;

  constructor(employeeTableName: string = process.env.EMPLOYEES_TABLE as string) {
    super();
    if (!employeeTableName) throw new Error('EMPLOYEES_TABLE não configurada');
    this.employeeTableName = employeeTableName;
  }

  async create(employeeData: Employee): Promise<Employee> {
    await docClient
      .put({
        TableName: this.employeeTableName,
        Item: employeeData,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: { '#id': 'id' },
      })
      .promise();
    return employeeData;
  }

  async getById(employeeId: string): Promise<Employee | null> {
    const result = await docClient
      .get({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
      })
      .promise();
    return (result.Item as Employee) || null;
  }

  async update(employeeId: string, updateFields: EmployeeUpdate): Promise<Employee | null> {
    const attributeNames: Record<string, string> = {};
    const attributeValues: Record<string, unknown> = {};
    const updateExpressions: string[] = [];

    if (Object.prototype.hasOwnProperty.call(updateFields, 'nome')) {
      attributeNames['#nome'] = 'nome';
      attributeValues[':nome'] = updateFields.nome as string;
      updateExpressions.push('#nome = :nome');
    }
    if (Object.prototype.hasOwnProperty.call(updateFields, 'cargo')) {
      attributeNames['#cargo'] = 'cargo';
      attributeValues[':cargo'] = updateFields.cargo as string;
      updateExpressions.push('#cargo = :cargo');
    }
    if (Object.prototype.hasOwnProperty.call(updateFields, 'idade')) {
      attributeNames['#idade'] = 'idade';
      attributeValues[':idade'] = updateFields.idade as number;
      updateExpressions.push('#idade = :idade');
    }

    if (updateExpressions.length === 0) {
      return await this.getById(employeeId);
    }

    const result = await docClient
      .update({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
        UpdateExpression: 'SET ' + updateExpressions.join(', '),
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ConditionExpression: 'attribute_exists(#id)',
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return result.Attributes as Employee;
  }

  async delete(employeeId: string): Promise<void> {
    await docClient
      .delete({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
        ConditionExpression: 'attribute_exists(#id)',
        ExpressionAttributeNames: { '#id': 'id' },
      })
      .promise();
  }
}
