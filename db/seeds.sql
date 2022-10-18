INSERT INTO department (id, name)
VALUES
    (1, 'R&D'),
    (2, 'Marketing');

INSERT INTO role (id, title, salary, department_id)
VALUES
    (1, 'Manager', 85375.00, 1),
    (2, 'Engineer', 79520.00, 1),
    (3, 'Intern', 37793.60, 1);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, "Samwell", "Lockwood", 1, NULL),
    (2, "Candice", "Hartley", 2, 1),
    (3, "Shigeo", "Shearer", 3, 1),
    (4, "Elias", "Lumina", 1, NULL),
    (5, "Alice", "Carlson", 2, 4),
    (6, "Amadeus", "Galbranth", 3, 4)