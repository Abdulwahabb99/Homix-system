import type { CreationAttributes } from "sequelize";

const Employee = require("./employee.model") as typeof import("./employee.model");

type EmployeeAttributes = {
  email: string | null;
  firstName: string;
  id: number;
  lastName: string;
  phoneNumber: string | null;
  salary: number;
  toJSON?: () => EmployeeAttributes;
  update: (payload: Partial<EmployeeAttributes>) => Promise<EmployeeAttributes>;
  destroy: () => Promise<void>;
};

type EmployeeCreationAttributes = CreationAttributes<typeof Employee>;

const toPlainEmployee = (employee: EmployeeAttributes): EmployeeAttributes => {
  return typeof employee.toJSON === "function" ? employee.toJSON() : employee;
};

class EmployeeService {
  public static async create(data: EmployeeCreationAttributes): Promise<EmployeeAttributes> {
    const employee = await Employee.create(data);
    return toPlainEmployee(employee as EmployeeAttributes);
  }

  public static async getAll(): Promise<EmployeeAttributes[]> {
    const employees = await Employee.findAll();
    return employees.map((employee: EmployeeAttributes) => toPlainEmployee(employee));
  }

  public static async getOne(id: string): Promise<EmployeeAttributes | null> {
    const employee = await Employee.findByPk(id);
    return employee ? toPlainEmployee(employee as EmployeeAttributes) : null;
  }

  public static async update(
    id: string,
    data: Partial<EmployeeCreationAttributes>,
  ): Promise<EmployeeAttributes | null> {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return null;
    }

    const updatedEmployee = await (employee as EmployeeAttributes).update(data);
    return toPlainEmployee(updatedEmployee);
  }

  public static async delete(id: string): Promise<boolean> {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return false;
    }

    await (employee as EmployeeAttributes).destroy();
    return true;
  }
}

export = EmployeeService;
