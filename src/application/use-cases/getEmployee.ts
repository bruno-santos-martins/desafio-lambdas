import type Employee from '../../domain/entities/Employee';
import type EmployeeRepository from '../../domain/repositories/EmployeeRepository';

export default async function getEmployee(
  employeeRepository: EmployeeRepository,
  employeeId: string
): Promise<Employee | null> {
  if (!employeeRepository) throw new Error('employeeRepository é obrigatório');
  if (!employeeId) throw new Error('employeeId é obrigatório');
  const fetchedEmployee = await employeeRepository.getById(employeeId);
  return fetchedEmployee || null;
}
