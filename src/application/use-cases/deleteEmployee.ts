import type EmployeeRepository from '../../domain/repositories/EmployeeRepository';

export default async function deleteEmployee(
  employeeRepository: EmployeeRepository,
  employeeId: string
): Promise<void> {
  if (!employeeRepository) throw new Error('employeeRepository é obrigatório');
  if (!employeeId) throw new Error('employeeId é obrigatório');
  await employeeRepository.delete(employeeId);
}
