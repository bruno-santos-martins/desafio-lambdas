export type EmployeeProps = {
  id: string;
  idade: number;
  nome: string;
  cargo: string;
};

export default class Employee {
  public id: string;
  public idade: number;
  public nome: string;
  public cargo: string;

  constructor({ id: employeeId, idade: employeeAge, nome: employeeName, cargo: employeeRole }: EmployeeProps) {
    if (employeeName === undefined || employeeRole === undefined || employeeAge === undefined) {
      throw new Error('Dados do funcionário incompletos (nome, cargo, idade)');
    }
    if (typeof employeeName !== 'string' || !employeeName.trim()) {
      throw new Error('nome inválido');
    }
    if (typeof employeeRole !== 'string' || !employeeRole.trim()) {
      throw new Error('cargo inválido');
    }
    const parsedEmployeeAge = Number(employeeAge);
    if (!Number.isInteger(parsedEmployeeAge) || parsedEmployeeAge < 0) {
      throw new Error('idade inválida');
    }

    this.id = employeeId;
    this.idade = parsedEmployeeAge;
    this.nome = employeeName.trim();
    this.cargo = employeeRole.trim();
  }
}
