"use strict";
const Employee = require("./employee.model");
const toPlainEmployee = (employee) => {
    return typeof employee.toJSON === "function" ? employee.toJSON() : employee;
};
class EmployeeService {
    static async create(data) {
        const employee = await Employee.create(data);
        return toPlainEmployee(employee);
    }
    static async getAll() {
        const employees = await Employee.findAll();
        return employees.map((employee) => toPlainEmployee(employee));
    }
    static async getOne(id) {
        const employee = await Employee.findByPk(id);
        return employee ? toPlainEmployee(employee) : null;
    }
    static async update(id, data) {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return null;
        }
        const updatedEmployee = await employee.update(data);
        return toPlainEmployee(updatedEmployee);
    }
    static async delete(id) {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return false;
        }
        await employee.destroy();
        return true;
    }
}
module.exports = EmployeeService;
//# sourceMappingURL=employee.service.js.map