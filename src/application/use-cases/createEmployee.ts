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
  employeeRepository: EmployeeRepository & {
    findByNomeCargoIdade: (nome: string, cargo: string, idade: number) => Promise<Employee | null>;
  },
  employeeData: CreateEmployeeInput
) {
  if (!employeeRepository) throw new Error('employeeRepository é obrigatório');

  // Sanitização para comparação e persistência consistente
  const nomeSan = String(employeeData.nome).trim().toLowerCase();
  const cargoSan = String(employeeData.cargo).trim().toLowerCase();
  const idadeSan = Number(employeeData.idade);

  // Verifica duplicidade com dados sanitizados
  const exists = await employeeRepository.findByNomeCargoIdade(nomeSan, cargoSan, idadeSan);
  if (exists) {
    throw new Error('Já existe um funcionário cadastrado com mesmo nome, cargo e idade');
  }

  const employeeId = employeeData.id || uuidv4();

  const newEmployee = new Employee({
    id: employeeId,
    nome: nomeSan,
    cargo: cargoSan,
    idade: idadeSan,
  });

  await employeeRepository.create(newEmployee);
  return newEmployee;
}
