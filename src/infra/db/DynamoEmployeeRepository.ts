import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type Employee from '../../domain/entities/Employee';
import EmployeeRepository, { type EmployeeUpdate } from '../../domain/repositories/EmployeeRepository';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export default class DynamoEmployeeRepository extends EmployeeRepository {
  private employeeTableName: string;

  constructor(employeeTableName: string = process.env.EMPLOYEES_TABLE as string) {
    super();
    if (!employeeTableName) throw new Error('EMPLOYEES_TABLE não configurada');
    this.employeeTableName = employeeTableName;
  }

  async findByNomeCargoIdade(nome: string, cargo: string, idade: number): Promise<Employee | null> {
    // Sanitiza os valores para busca
    const nomeSan = String(nome).trim().toLowerCase();
    const cargoSan = String(cargo).trim().toLowerCase();
    const idadeSan = Number(idade);

    let lastKey: Record<string, any> | undefined = undefined;
    do {
      const page = await docClient.send(
        new ScanCommand({
          TableName: this.employeeTableName,
          // Reduz o volume filtrando por idade no servidor
          FilterExpression: '#idade = :idade',
          ExpressionAttributeNames: {
            '#id': 'id',
            '#nome': 'nome',
            '#cargo': 'cargo',
            '#idade': 'idade',
          },
          ExpressionAttributeValues: {
            ':idade': idadeSan,
          },
          ProjectionExpression: '#id, #nome, #cargo, #idade',
          ExclusiveStartKey: lastKey,
        })
      );

      const items = page.Items ?? [];
      const match = items.find((item: any) =>
        String(item.nome).trim().toLowerCase() === nomeSan &&
        String(item.cargo).trim().toLowerCase() === cargoSan &&
        Number(item.idade) === idadeSan
      );
      if (match) return match as Employee;

      lastKey = page.LastEvaluatedKey as any;
    } while (lastKey);

    return null;
  }

  async create(employeeData: Employee): Promise<Employee> {
    // Sanitiza antes de salvar
    const sanitized: Employee = {
      ...employeeData,
      nome: String(employeeData.nome).trim().toLowerCase(),
      cargo: String(employeeData.cargo).trim().toLowerCase(),
      idade: Number(employeeData.idade),
    };
    await docClient.send(
      new PutCommand({
        TableName: this.employeeTableName,
        Item: sanitized,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: { '#id': 'id' },
      })
    );
    return sanitized;
  }

  async getById(employeeId: string): Promise<Employee | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
      })
    );
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

    // Necessário para ConditionExpression usar #id
    attributeNames['#id'] = 'id';

    const result = await docClient.send(
      new UpdateCommand({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
        UpdateExpression: 'SET ' + updateExpressions.join(', '),
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ConditionExpression: 'attribute_exists(#id)',
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as Employee;
  }

  async delete(employeeId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: this.employeeTableName,
        Key: { id: employeeId },
        ConditionExpression: 'attribute_exists(#id)',
        ExpressionAttributeNames: { '#id': 'id' },
      })
    );
  }
}
