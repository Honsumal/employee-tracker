const mysql = require('mysql2');
const inquirer = require('inquirer')
const table = require('console.table');
const e = require('express');

let roles;
let depts;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '#k4zenoyon1',
        database: 'company_db'
    }
)

function view (str) {
    let query;
    if (str === 'd') {
        query = `SELECT * FROM department`
    } else if (str === 'r') {
        query = `SELECT R.id, R.title, D.name AS department, R.salary
    FROM ROLE AS R 
    LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id;`
    } else if (str === 'e') {
        query = `SELECT E.id, E.first_name, E.last_name, R.title AS "role", D.name AS "department", R.salary AS "salary", CONCAT(M.first_name, " ", M.last_name) AS manager 
    FROM EMPLOYEE AS E 
    LEFT JOIN ROLE AS R ON E.role_id = R.id 
    LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
    LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`
    }

    db.query (query, (err, results) => {
        console.table(results)
    })

    //start()
}

view('e')

function addDept(name) {
    db.query(`INSERT INTO department (name) VALUES (?)`, name, (err, results) => {
        if (err) throw err;
        else {
            console.log(`Added Department: ${name} with id: ${results.insertId}`)
        }
    })

    //start
}

const startQuestions = [
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do? ',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee',
            'Nothing'
        ]
    },
    {
        type: 'input',
        name: 'deptName',
        message: 'What is the name of the department? ',
        when: (input) => input.action === 'Add a Department',
        validate: (deptName) => {
            if (deptName){
                return true
            } else {
                console.log(' Please enter the name of the department.')
                return false
            }
        }
    },
    {
        type: 'input',
        name: 'roleName',
        message: 'What is the name of the role? ',
        when: (input) => input.action === 'Add a Role',
        validate: (roleName) => {
            if (roleName){
                return true
            } else {
                console.log(' Please enter the name of the role.')
                return false
            }
        }
    },
    {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this role? ',
        when: (input) => input.action === 'Add a Role',
        validate: (salary) => {
            if (!Number.isNaN(parseInt(salary)) && (Math.sign(parseInt(salary)) === 1)){
                return true
            } else {
                console.log(' Please enter a valid salary.')
                return false
            }
        }
    },
    {   
        type: 'list',
        name: 'roleDept',
        message: 'What department does this role fall under? ',
        when: (input) => input.action === 'Add a Role',
        choices: depts
    }
]

function start () {
    inquirer.prompt(startQuestions). then((answers) => {
        switch (answers.action) {
            case 'View All Departments': 
                view('d');
            break;
            case 'View All Roles':
                view('r');
            break;
            case 'View All Employees':
                view('e');
            break;
            case 'Add a Department':
                addDept(answers.deptName);
            break;
            case 'Add a Role':
                addRole();
            break;
            case 'Add an Employee':
                addEmp();
            break;
            case 'Update an Employee':
                update();
            break;
            case 'Nothing':
                console.log ('Understood, have a nice day!')
            break;
        }
    })
}