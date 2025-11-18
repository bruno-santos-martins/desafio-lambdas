import { v4 as uuidv4 } from 'uuid';
import Employee from '../../domain/entities/Employee';
import type EmployeeRepository from '../../domain/repositories/EmployeeRepository';

type CreateEmployeeInput = {
  id?: string;
  nome: string;
  cargo: string;
  idade: number;
};

export default async function createEmployee(
  employeeRepository: EmployeeRepository,
  employeeData: CreateEmployeeInput
) {
  if (!employeeRepository) throw new Error('employeeRepository é obrigatório');
  const employeeId = employeeData.id || uuidv4();

  const newEmployee = new Employee({
    id: employeeId,
    nome: employeeData.nome,
    cargo: employeeData.cargo,
    idade: employeeData.idade,
  });

  await employeeRepository.create(newEmployee);
  return newEmployee;
}
