import { connection } from "./connection.js";
import inquirer from "inquirer";

const updateRoleQuery = `UPDATE employee 
    SET 
      role_id = ?
    WHERE id = ?
  `;

const newEmployeeQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES (?, ?, ?, ?)
  `;

const newRoleQuery = `INSERT INTO role (title, salary, department_id)
  VALUES (?, ?, ?)
  `;

const allEmployeesQuery = `SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title, 
      d.name AS department,
      r.salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN employee m ON e.manager_id = m.id
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    `;

const allRolesQuery = `SELECT 
r.id,
r.title,
d.name,
r.salary
FROM Role r
INNER JOIN Department d ON r.department_id = d.id;`;

const allDepartmentsQuery = `SELECT * FROM department;`;

const newDepartmentQuery = `INSERT INTO department (name)
  VALUES (?)
  `;

function getTable(tableName, connection) {
  return new Promise(function (resolve, reject) {
    connection.query("SELECT * FROM ??;", [tableName], function (err, data) {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

const ViewAllEmployees = async () => {
  return new Promise(function (resolve, reject) {
    let query = allEmployeesQuery;

    connection.query(query, function (err, res) {
      if (err) return reject(err);
      console.log("");
      console.table(res);
      console.log("");

      resolve();
    });
  });
};

const GetAllDepartments = async () => {
  return new Promise(function (resolve, reject) {
    let query = allDepartmentsQuery;

    connection.query(query, function (err, res) {
      if (err) return reject(err);
      console.log("");
      console.table(res);
      console.log("");

      resolve();
    });
  });
};

const AddDepartment = async (department) => {
  return new Promise(async function (resolve, reject) {
    try {
      inquirer
        .prompt([
          {
            name: "department",
            type: "input",
            message: "Nombre del nuevo departamento?",
          },
        ])
        .then((answer) => {
          const query = newDepartmentQuery;

          connection.query(query, [answer.department], function (err, res) {
            if (err) return reject(err);

            resolve();
          });
        });
    } catch (err) {
      reject(err);
    }
  });
};

function AddNewEmployee() {
  return new Promise(async function (resolve, reject) {
    try {
      const roleTable = await getTable("role", connection);
      const employeesTable = await getTable("employee", connection);

      const roleList = roleTable.map((role) => role.title);
      const employeeList = employeesTable.map((employee) => {
        return `${employee.first_name} ${employee.last_name}`;
      });

      inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "Cual es el nombre del empleado?",
          },
          {
            name: "secondName",
            type: "input",
            message: "Cual es el apellido del empleado?",
          },
          {
            name: "role",
            type: "rawlist",
            message: "Cual es el puesto del empleado?",
            choices: roleList,
          },
          {
            name: "manager",
            type: "rawlist",
            message: "Quien es el el jefe del empleado?",
            choices: employeeList,
          },
        ])
        .then((answer) => {
          const roleID = roleTable.find(
            (role) => answer.role === role.title
          ).id;
          const managerID =
            employeesTable[employeeList.indexOf(answer.manager)].id;

          const query = newEmployeeQuery;

          connection.query(
            query,
            [answer.firstName, answer.secondName, roleID, managerID],
            function (err, res) {
              if (err) return reject(err);

              resolve();
            }
          );
        });
    } catch (err) {
      reject(err);
    }
  });
}

function ViewAllRoles() {
  return new Promise(function (resolve, reject) {
    let query = allRolesQuery;

    connection.query(query, function (err, res) {
      if (err) return reject(err);
      console.log("");
      console.table(res);
      console.log("");

      resolve();
    });
  });
}

function AddNewRole() {
  return new Promise(async function (resolve, reject) {
    try {
      const departmentTable = await getTable("department", connection);
      const departmentList = departmentTable.map(
        (department) => department.name
      );

      inquirer
        .prompt([
          {
            name: "role",
            type: "input",
            message: "Cual es el nuevo puesto?",
          },
          {
            name: "salary",
            type: "input",
            message: "Cual es el salario del nuevo puest?",
          },
          {
            name: "department",
            type: "rawlist",
            message: "Cual es el departamento del nuevo puesto?",
            choices: departmentList,
          },
        ])
        .then((answer) => {
          const departmentID = departmentTable.find(
            (department) => answer.department === department.name
          ).id;

          const query = newRoleQuery;

          connection.query(
            query,
            [answer.role, answer.salary, departmentID],
            function (err, res) {
              if (err) return reject(err);

              resolve();
            }
          );
        });
    } catch (err) {
      reject(err);
    }
  });
}

function ViewDepartmentBudget() {
  return new Promise(async function (resolve, reject) {
    const departmentTable = await getTable("department", connection);
    const departmentList = departmentTable.map((department) => department.name);

    inquirer
      .prompt([
        {
          name: "department",
          type: "rawlist",
          message: "Cual es el nuevo departamento?",
          choices: departmentList,
        },
      ])
      .then((answer) => {
        const departmentID = departmentTable.find(
          (department) => answer.department === department.name
        ).id;

        connection.query(
          `SELECT 
              d.name AS department,
              SUM(r.salary) used_budget
            FROM employee e
            JOIN role r ON e.role_id = r.id
            LEFT JOIN department d ON r.department_id = d.id
            WHERE d.id = ?
            `,
          [departmentID],
          function (err, res) {
            if (err) return reject(err);

            console.log("");
            console.table(res);
            console.log("");

            resolve();
          }
        );
      });
  });
}

function UpdateEmployeeRole() {
  return new Promise(async function (resolve, reject) {
    const employeesTable = await getTable("employee", connection);
    const employeeList = employeesTable.map((employee) => {
      return `${employee.first_name} ${employee.last_name}`;
    });

    inquirer
      .prompt([
        {
          name: "name",
          type: "rawlist",
          message: "A que empleado desea actualizar?",
          choices: employeeList,
        },
      ])
      .then(async function (answer) {
        const employee = employeesTable[employeeList.indexOf(answer.name)];
        const roleTable = await getTable("role", connection);
        const roleList = roleTable.map((role) => role.title);

        inquirer
          .prompt([
            {
              name: "role",
              type: "rawlist",
              message: "Cual es el puesto del empleado?",
              default: employee.role_id - 1,
              choices: roleList,
            },
          ])
          .then((ans) => {
            const roleID = roleTable.find((role) => ans.role === role.title).id;

            let query = updateRoleQuery;

            connection.query(query, [roleID, employee.id], function (err, res) {
              if (err) return reject(err);

              resolve();
            });
          });
      });
  });
}

export const cmsQueries = {
  GetAllDepartments,
  AddDepartment,
  ViewAllEmployees,
  AddNewEmployee,
  ViewAllRoles,
  AddNewRole,
  ViewDepartmentBudget,
  UpdateEmployeeRole,
};
