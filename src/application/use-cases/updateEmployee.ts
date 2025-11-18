import type Employee from '../../domain/entities/Employee';
import type EmployeeRepository from '../../domain/repositories/EmployeeRepository';

type UpdateEmployeeInput = Partial<{
  nome: string;
  cargo: string;
  idade: number;
}>;

export default async function updateEmployee(
  employeeRepository: EmployeeRepository,
  employeeId: string,
  updateData: UpdateEmployeeInput
): Promise<Employee | null> {
  if (!employeeRepository) throw new Error('employeeRepository é obrigatório');
  if (!employeeId) throw new Error('employeeId é obrigatório');

  const updateFields: UpdateEmployeeInput = {};

  if (Object.prototype.hasOwnProperty.call(updateData, 'nome')) {
    const employeeName = updateData.nome as string;
    if (typeof employeeName !== 'string' || !employeeName.trim()) throw new Error('nome inválido');
    updateFields.nome = employeeName.trim();
  }
  if (Object.prototype.hasOwnProperty.call(updateData, 'cargo')) {
    const employeeRole = updateData.cargo as string;
    if (typeof employeeRole !== 'string' || !employeeRole.trim()) throw new Error('cargo inválido');
    updateFields.cargo = employeeRole.trim();
  }
  if (Object.prototype.hasOwnProperty.call(updateData, 'idade')) {
    const employeeAge = Number(updateData.idade);
    if (!Number.isInteger(employeeAge) || employeeAge < 0) throw new Error('idade inválida');
    updateFields.idade = employeeAge;
  }

  if (Object.keys(updateFields).length === 0) {
    return await employeeRepository.getById(employeeId);
  }

  const updatedEmployee = await employeeRepository.update(employeeId, updateFields);
  return updatedEmployee;
}
