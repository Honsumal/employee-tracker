const mysql = require('mysql2');
const inquirer = require('inquirer')
const table = require('console.table');

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

function addDept(name) {
    db.query(`INSERT INTO department (name) VALUES (?)`, name, (err, results) => {
        if (err) throw err;
        else {
            console.log(`Added Department: ${name} with id: ${results.insertId}`)
        }
    })

    //start
}

function addRole() {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) throw err;
        else {
            depts = results

            const roleQuestions = [{
                type: 'input',
                name: 'name',
                message: 'What is the name of the role? ',
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
                name: 'dept',
                message: 'What department does this role fall under? ',
                choices: depts
            }]

            let query =  `INSERT INTO role (title, salary, department_id) VALUES (?)`
           
            inquirer.prompt(roleQuestions).then((answers) => {
                let dID;                
                for (let i = 0; i < depts.length; i++) {
                    if (answers.dept === depts[i].name){
                    dID = depts[i].id
                    console.log(dID)
                }}
                
                db.query(query, [[answers.name,answers.salary, dID]], (err, results) => {
                    if (err) throw err;
                    else {
                        console.log (`Added Role: ${answers.name} with id ${results.insertId}`)
                    }
                })

                //start()
             })
        }
    })   
}

function addEmp() { 
    db.query (`SELECT id, title FROM role`, (err, results) => {
        if (err) throw err;
        else{
            roles = results.map((obj) => obj.title)

            db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee WHERE manager_id IS NULL', (err, response) => {
                if (err) throw err;
                else {
                    managers = response.map((obj) => obj.manager_name)

                    managers.push("This Employee is a Manager")
                    const empQuestions = [
                {
                type: 'input',
                name: 'first',
                message: 'What is the first name of this employee? ',
                validate: (fName) => {
                    if (fName){
                        return true
                    } else {
                        console.log(' Please enter this employee\'s first name.')
                        return false
                    }
                }
                },
                {
                    type: 'input',
                    name: 'last',
                    message: 'What is the last name of this employee? ',
                    validate: (lName) => {
                        if (lName){
                            return true
                        } else {
                            console.log(' Please enter this employee\'s last name.')
                            return false
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is this employee\'s manager? ',
                    choices: managers
                    
                },
                {   
                    type: 'list',
                    name: 'role',
                    message: 'What role does this employee hold ',
                    choices: roles
                }
                    ]
                
                    let query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`

                    inquirer.prompt(empQuestions).then((answers) => {
                        let rID;
                        let mID;

                        for (let i = 0; i < results.length; i++) {
                            if (answers.role === results[i].title){
                            rID = results[i].id
                        }}

                        for (let j = 0; j < response.length; j++) {
                            if (answers.manager === response[j].manager_name){
                            mID = response[j].id
                        }}

                        db.query(query, [[answers.first, answers.last, rID, mID]], (err, results) => {
                            if (err) throw err;
                            else {
                                console.log (`Added Employee: ${answers.first} ${answers.last} with id ${results.insertId}`)
                            }
                        });

                        //start()
                    });
                }
            }
        )}
    })
}

function updateRole() {
    db.query(`SELECT id, CONCAT(first_name, " ", last_name) AS employee_name FROM employee`, (err, res) => {
        if (err) throw err;
        else {
            employee = res.map((obj) => obj.employee_name)

            db.query(`SELECT id, title FROM role`, (err, results) => {
                if (err) throw err;
                else {
                    roles = results.map((obj) => obj.title)

                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Which employee do you want to update? ",
                            name: "employee",
                            choices: employee
                        },
                        {
                            type: 'list',
                            message: 'What role does this employee now hold? ',
                            name: 'role',
                            choices: roles
                        }
                    ]).then((answers) => {
                        let eID;
                        let rID;
                        for (let i = 0; i < res.length; i++) {
                            if (answers.employee === res[i].employee_name){
                                eID = res[i].id
                        }}

                        for (let j = 0; j < results.length; j++) {
                            if (answers.role === results[j].title){
                                rID = results[j].id
                            }
                        }

                        db.query(`UPDATE employee SET role_id = ${rID} WHERE id = ${eID}`, (err, response) => {
                            if (err) throw err;
                            else{
                                console.log (`Updated Employee: ${answers.employee} to new role: ${answers.role}`)
                            }
                        })
                       //start()
                    })
                }
            })            
        }
    })
}

function updateManager() {
    db.query(`SELECT id, CONCAT(first_name, " ", last_name) AS employee_name FROM employee`, (err, res) => {
        if (err) throw err;
        else {
            let employee = res.map((obj) => obj.employee_name)

            db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee WHERE manager_id IS NULL', (err, response) => {
                if (err) throw err;
                else {
                    let managers = response.map((obj) => obj.manager_name)

                    managers.push("This got promoted to manager")

                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Which employee do you want to update? ",
                            name: "employee",
                            choices: employee
                        },
                        {
                            type: 'list',
                            message: 'Who is this employee\'s new manager? ',
                            name: 'manager',
                            choices: managers
                        }
                    ]).then((answers) => {
                        let eID;
                        let mID;
                        for (let i = 0; i < res.length; i++) {
                            if (answers.employee === res[i].employee_name){
                                eID = res[i].id
                        }}

                        for (let j = 0; j < response.length; j++) {
                            if (answers.manager === response[j].manager_name){
                                mID = response[j].id
                            }
                        }

                        db.query(`UPDATE employee SET manager_id = ${mID} WHERE id = ${eID}`, (err, response) => {
                            if (err) throw err;
                            else{
                                console.log (`Updated Employee: ${answers.employee} to have a new manager`)
                            }
                        })
                        //start
                    })
                }
            })            
        }
    })
}

updateRole()

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
            'Update an Employee\'s Role',
            'Update an Employee\'s Manager',
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
            case 'Update an Employee\'s Role':
                updateRole();
            break;
            case 'Update an Employee\'s Manager':
                updateManager();
            break
            case 'Nothing':
                console.log ('Understood, have a nice day!')
            break;
        }
    })
}