import type Employee from '../entities/Employee';

export type EmployeeUpdate = Partial<Pick<Employee, 'nome' | 'cargo' | 'idade'>>;

export default abstract class EmployeeRepository {
  abstract create(employee: Employee): Promise<Employee>;
  abstract getById(id: string): Promise<Employee | null>;
  abstract update(id: string, updates: EmployeeUpdate): Promise<Employee | null>;
  abstract delete(id: string): Promise<void>;
}
