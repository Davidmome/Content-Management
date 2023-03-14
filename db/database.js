const mysql = require("mysql2/promise");

var dbConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
};

const executeQuery = async function (Query, Data) {
  const connection = await mysql.createConnection(dbConfig);
  connection.connect(function (error) {
    if (error) console.log(error);
  });

  const [resultset] = await connection.query(
    Query,
    Data,
    function (error, result) {
      if (error) throw error;
      return result;
    }
  );

  connection.end();
  return resultset;
};

var DB = function (config) {
  config = config || {};
};

DB.prototype.getPresupuesto = async function (departmentId) {
  var query = `Select dep.id, dep.name as department , sum(rol.salary) as presupuesto from
    department dep inner join role rol on rol.department_id = dep.id inner join employee emp on
    emp.role_id = rol.id`;

  if (departmentId !== null && departmentId > 0) {
    var where = ` where dep.id = ${departmentId}`;
    query += where;
  }

  query += ` group by dep.id, dep.name, order by dep.id`;

  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.UpdateRoleEmployee = async function (employeId, roleId) {
  var query = ` update employee set role_id = ${roleId} where id =${employeId}`;
  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.addEmployee = async function (
  firstName,
  lastName,
  roleId,
  managerId
) {
  var query = `insert into employee (first_name, last_name, role_id, manager_id) values (?,?,?,?)`;
  const result = await executeQuery(query, [
    firstName,
    lastName,
    roleId,
    managerId == 0 ? null : managerId,
  ]);
  return result;
};

DB.prototype.getManager = async function () {
  var query = ` SELECT id, CONCAT(first_name, " ", last_name) as name FROM employee
    where manager_id is null union select 0, 'ninguno' order by id;`;

  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.addRol = async function (nameRol, salaryRol, depId) {
  var query = `insert into role (title, salary, department_id) values (?,?,?)`;
  const result = await executeQuery(query, [nameRol, salaryRol, depId]);
  return result;
};

DB.prototype.addDepartment = async function (nameDep) {
  var query = `insert into department (name) values (?)`;
  const result = await executeQuery(query, [nameDep]);
  return result;
};

DB.prototype.getRole = async function (rolId) {
  var query = `select rol.id, rol.title, dep.name as department, rol.salary
    from role rol inner join department dep on dep.id = rol.department_id`;

  if (rolId !== null && rolId > 0) {
    var where = `where rol.id = ${rolId}`;
    query += where;
  }

  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.getDepartment = async function (departmentId) {
  var query = `SELECT id, name FROM department`;

  if (departmentId !== null && departmentId > 0) {
    var where = `where id = ${departmentId}`;
    query += where;
  }
  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.getEmployee = async function (employeeId) {
  var query = `SELECT emp.id, emp.first_name, emp.last_name,
    rol.title, dep.name as department, rol.salary, CONCAT(man.first_name, " "
    , man.last_name) as manager FROM employee emp inner join role rol on
    rol.id = emp.role_id inner join department dep on dep.id = rol.department_id
    left join employee man on man.id = emp.manager_id`;

  if (employeeId !== null && employeeId > 0) {
    var where = `where emp.id=${employeeId}`;
    query += where;
  }
  const result = await executeQuery(query, null);
  return result;
};

DB.prototype.getEmployeeList = async function () {
  var query = `SELECT id, concat (first_name, " ", last_name) as name
    FROM employee`;

  const result = await executeQuery(query, null);
  return result;
};

module.exports = DB;
