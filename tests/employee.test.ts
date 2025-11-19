import EmployeeRepository from "../src/domain/repositories/EmployeeRepository";
import createEmployee from "../src/application/use-cases/createEmployee";
import getEmployee from "../src/application/use-cases/getEmployee";
import updateEmployee from "../src/application/use-cases/updateEmployee";
import deleteEmployee from "../src/application/use-cases/deleteEmployee";
import type Employee from "../src/domain/entities/Employee";

class InMemoryEmployeeRepository extends EmployeeRepository {
  async findByNomeCargoIdade(
    nome: string,
    cargo: string,
    idade: number
  ): Promise<Employee | null> {
    for (const emp of this.employeeStore.values()) {
      if (emp.nome === nome && emp.cargo === cargo && emp.idade === idade) {
        return emp;
      }
    }
    return null;
  }
  private employeeStore = new Map<string, Employee>();

  async create(employeeData: Employee): Promise<Employee> {
    if (this.employeeStore.has(employeeData.id)) {
      const error: any = new Error("Already exists");
      error.code = "ConditionalCheckFailedException";
      throw error;
    }
    this.employeeStore.set(
      employeeData.id,
      JSON.parse(JSON.stringify(employeeData))
    );
    return employeeData;
  }
  async getById(employeeId: string): Promise<Employee | null> {
    return this.employeeStore.get(employeeId) || null;
  }
  async update(
    employeeId: string,
    updateFields: Partial<Employee>
  ): Promise<Employee | null> {
    const existingEmployee = await this.getById(employeeId);
    if (!existingEmployee) return null;
    const updatedEmployee = {
      ...existingEmployee,
      ...updateFields,
    } as Employee;
    this.employeeStore.set(employeeId, updatedEmployee);
    return updatedEmployee;
  }
  async delete(employeeId: string): Promise<void> {
    if (!this.employeeStore.has(employeeId)) {
      const error: any = new Error("Not found");
      error.code = "ConditionalCheckFailedException";
      throw error;
    }
    this.employeeStore.delete(employeeId);
  }
}

describe("Employee use-cases", () => {
  test("should not allow duplicate employee (nome, cargo, idade)", async () => {
    const employeeRepository = new InMemoryEmployeeRepository();
    await createEmployee(employeeRepository, {
      nome: "Bruno",
      cargo: "Dev",
      idade: 32,
    });
    await expect(
      createEmployee(employeeRepository, {
        nome: "Bruno",
        cargo: "Dev",
        idade: 32,
      })
    ).rejects.toThrow(
      "Já existe um funcionário cadastrado com mesmo nome, cargo e idade"
    );
  });
  test("create and get employee", async () => {
    const employeeRepository = new InMemoryEmployeeRepository();
    const createdEmployee = await createEmployee(employeeRepository, {
      nome: "Ana",
      cargo: "Dev",
      idade: 30,
    });
    expect(createdEmployee.id).toBeDefined();
    const fetchedEmployee = await getEmployee(
      employeeRepository,
      createdEmployee.id
    );
    expect(fetchedEmployee).toEqual(createdEmployee);
  });

  test("get employee by id", async () => {
    const employeeRepository = new InMemoryEmployeeRepository();
    const employeeData = {
      id: "123",
      nome: "Carlos",
      cargo: "Designer",
      idade: 28,
    } as Employee;
    await employeeRepository.create(employeeData);
    const fetchedEmployee = await getEmployee(employeeRepository, "123");
    expect(fetchedEmployee).toEqual(employeeData);
  });

  test("update employee fields", async () => {
    const employeeRepository = new InMemoryEmployeeRepository();
    const createdEmployee = await createEmployee(employeeRepository, {
      nome: "João",
      cargo: "QA",
      idade: 25,
    });
    const updatedEmployee = await updateEmployee(
      employeeRepository,
      createdEmployee.id,
      { cargo: "QA Sr", idade: 26 }
    );
    expect(updatedEmployee!.cargo).toBe("QA Sr");
    expect(updatedEmployee!.idade).toBe(26);
    const fetchedEmployee = await getEmployee(
      employeeRepository,
      createdEmployee.id
    );
    expect(fetchedEmployee).toEqual(updatedEmployee);
  });

  test("delete employee", async () => {
    const employeeRepository = new InMemoryEmployeeRepository();
    const createdEmployee = await createEmployee(employeeRepository, {
      nome: "Maria",
      cargo: "PM",
      idade: 35,
    });
    await deleteEmployee(employeeRepository, createdEmployee.id);
    const fetchedEmployee = await getEmployee(
      employeeRepository,
      createdEmployee.id
    );
    expect(fetchedEmployee).toBeNull();
  });
});
