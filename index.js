import { connection } from "./db/connection.js";
import inquirer from "inquirer";
import { menuOptions, menuAnswers } from "./util/inquirerOptions.js";
import { cmsQueries } from "./db/queries.js";
import { banner } from "./util/banner.js";

function menuPrompt() {
  inquirer
    .prompt(menuOptions)
    .then(async (answers) => {
      switch (answers.input) {
        case menuAnswers.VerTodosLosEmpleados:
          await cmsQueries.ViewAllEmployees();
          menuPrompt();
          break;

        case menuAnswers.AgregarEmpleado:
          await cmsQueries.AddNewEmployee();
          menuPrompt();
          break;

        case menuAnswers.ActualizarRolEmpleado:
          await cmsQueries.UpdateEmployeeRole();
          menuPrompt();
          break;

        case menuAnswers.VerTodosRoles:
          await cmsQueries.ViewAllRoles();
          menuPrompt();
          break;

        case menuAnswers.AgregarRol:
          await cmsQueries.AddNewRole();
          menuPrompt();
          break;

        case menuAnswers.VerTodosDepartamentos:
          await cmsQueries.GetAllDepartments();
          menuPrompt();
          break;

        case menuAnswers.AgregarDepartamento:
          await cmsQueries.AddDepartment();
          menuPrompt();
          break;

        case menuAnswers.VerPresupuesto:
          await cmsQueries.ViewDepartmentBudget();
          menuPrompt();
          break;

        case menuAnswers.Exit:
          exitCMS();
          break;

        default:
          break;
      }
    })
    .catch((error) => {
      console.log(`Error!: ${error}`);
      exitCMS();
    });
}

console.log(banner);
menuPrompt();

const exitCMS = () => {
  process.exit();
};
