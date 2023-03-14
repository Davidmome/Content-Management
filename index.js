require("dotenv").config();
const inquirer = require("inquirer");
const cTable = require("console.table");
const Database = require("./db/database");
const banner = require("./assets/js/banner");
var db = new Database();

var employees = [];
var departments = [];
var roles = [];
var result = [];
var managers = [];

var datosPresupuesto = [
  {
    type: "list",
    name: "departmentSel",
    message: "De que departamento quiere ver el presupuesto?",
    choices: [],
  },
];

var datosRolemp = [
  {
    type: "list",
    name: "empleadoSel",
    message: "Que empleado quiere actualizar?",
    choices: [],
  },
  {
    type: "list",
    name: "roleSel",
    message: "Cual es su nuevo rol?",
    choices: [],
  },
];

var datosEmpleado = [
  {
    type: "input",
    name: "first_name",
    message: "Cual es el nombre del empleado?",
    validate: (dataInput) => {
      if (dataInput !== "") {
        return true;
      } else {
        return "Porfavor capture un nombre de empleado";
      }
    },
  },
  {
    type: "input",
    name: "last_name",
    message: "Cual es el apellido del empleado?",
    validate: (dataInput) => {
      if (dataInput !== "") {
        return true;
      } else {
        return "Porfavor capture un apellido de empleado";
      }
    },
  },
  {
    type: "list",
    name: "roleSel",
    message: "Cual es el rol del empleado?",
    choices: [],
  },
];

var datosRol = [
  {
    type: "input",
    name: "name",
    message: "Que rol desea dar de alta?",
    validate: (dataInput) => {
      if (dataInput !== "") {
        return true;
      } else {
        return "Porfavor registre un rol";
      }
    },
  },
  {
    type: "input",
    name: "salary",
    message: "Que salario va a tener el nuevo rol?",
    validate: function (salary) {
      if (isNaN(salary) || salary <= 0) {
        return "Porfavor capture un salario";
      } else {
        return true;
      }
    },
  },
  {
    type: "list",
    name: "departmentSel",
    message: "Cual es el departamento del nuevo rol?",
    choices: [],
  },
];

const datosDep = [
  {
    type: "input",
    name: "name",
    message: "Cual es el nombre del departamento?",
    validate: (dataInput) => {
      if (dataInput !== "") {
        return true;
      } else {
        return "Porfavor Capture un departamento";
      }
    },
  },
];

const menu = [
  {
    type: "list",
    name: "Opcion",
    message: "Seleccione la operacion que desea realizar",
    choices: [
      "Ver todos los Empleados",
      "Agregar Empleado",
      "Actualizar rol de Empleado",
      "Ver todos los Roles",
      "Agregar Rol",
      "Ver todos los Departamentos",
      "Agregar departamento",
      "Ver presupuesto",
      "Salir",
    ],
  },
];

function menuPrincipal() {
  inquirer.prompt(menu).then(async (answers) => {
    switch (answers.Opcion) {
      case "Ver todos los Empleados":
        employees = await db.getEmployee(0);
        console.table(employees);
        menuPrincipal();
        break;
      case "Agregar empleado":
        roles = await db.getRole(0);
        managers = await db.getManager(0);
        datosEmpleado[2].choices = roles.map((row) => {
          return row.title;
        });
        datosEmpleado[3].choices = managers.map((row) => {
          return row.name;
        });

        inquirer.createPromptModule(datosEmpleado).then(async (data) => {
          let idxRol = roles.findIndex(
            (element) => element.title === data.roleSel
          );
          let idxMan = managers.findIndex(
            (element) => element.name === data.managerSel
          );
          result = await db.addEmployee(
            data.first_name,
            data.last_name,
            roles[idxRol].id,
            managers[idxMan].id
          );
          console.log(
            "Se agrego: [" +
              data.first_name +
              " " +
              data.last_name +
              "] a la base de datos"
          );
          menuPrincipal();
        });
        break;
      case "Actualizar rol del empleado":
        roles = await db.getRole(0);
        employees = await db.getEmployeeList();
        datosRolemp[0].choices = employees.map((row) => {
          return row.name;
        });
        datosRolemp[1].choices = roles.map((row) => {
          return row.title;
        });

        inquirer.createPromptModule(datosRolemp).then(async (data) => {
          let idxRol = roles.findIndex(
            (element) => element.title === data.roleSel
          );
          let idxEmp = employees.findIndex(
            (element) => element.name === data.empleadosSel
          );
          result = await db.UpdateRoleEmployee(
            employees[idxEmp].id,
            roles[idxRol].id
          );
          console.log(
            "Se a actualizado el rol de: [" + data.empleadosSel + "]"
          );
          menuPrincipal();
        });
        break;
      case "Ver todos los roles":
        roles = await db.getRole(0);
        console.table(roles);
        menuPrincipal();
        break;
      case "Agregar rol":
        departments = await db.getDepartment(0);
        datosRol[2].choices = departments.map((row) => {
          return row.name;
        });
        inquirer.prompt(datosRol).then(async (data) => {
          let idx = departments.findIndex(
            (element) => element.name === data.departmentSel
          );
          result = await db.addRol(data.name, data.salary, departments[idx].id);
          console.log("Se agrego: [" + data.name + "]");
          menuPrincipal();
        });
        break;
      case "Ver todos los departamentos":
        departments = await db.getDepartment(0);
        console.table(departments);
        menuPrincipal();
        break;
      case "Agregar departamento":
        inquirer.prompt(datosDep).then(async (data) => {
          result = await db.addDepartment(data.name);
          console.log("Se agrego:[" + data.name + "]");
          menuPrincipal();
        });
        break;
      case "Ver presupuest":
        departments = await db.getDepartment(0);
        datosPresupuesto[0].choices = departments.map((row) => {
          return row.name;
        });
        datosPresupuesto[0].choices.unshift("TODOS");

        inquirer.prompt(datosPresupuesto).then(async (data) => {
          let idx = departments.findIndex(
            (element) => element.name === data.departmentSel
          );
          result = await db.getPresupuesto(idx == -1 ? 0 : departments[idx].id);
          console.log("Consulta completada");
          menuPrincipal();
        });
        break;
      case "Salir":
        console.log("Proceso finalizado");
        break;
    }
  });
}

async function init() {
  console.log(banner);
  menuPrincipal();
}

init();
