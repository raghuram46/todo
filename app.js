const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const checkValidProperty = (request, response, next) => {
  let { dueDate, priority, category, status } = request.query;
  switch (true) {
    case priority !== undefined && status !== undefined:
      if (
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        next();
      } else if (
        !(status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case category !== undefined && status !== undefined:
      if (
        (category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        next();
      } else if (
        !(status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case priority !== undefined && category !== undefined:
      if (
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
        (category === "WORK" || category === "HOME" || category === "LEARNING")
      ) {
        next();
      } else if (
        !(category === "WORK" || category === "HOME" || category === "LEARNING")
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case dueDate !== undefined:
      if (isValid(new Date(dueDate))) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          next();
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;

    default:
      next();
      break;
  }
};

const checkValidPropertyPut = (request, response, next) => {
  let { todo, dueDate, priority, category, status } = request.body;
  switch (true) {
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case dueDate !== undefined:
      if (isValid(new Date(dueDate))) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          next();
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;

    default:
      next();
      break;
  }
};

const checkValidPropertyPost = (request, response, next) => {
  let { dueDate, priority, category, status } = request.body;
  if (
    (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
    (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
    (category === "WORK" || category === "HOME" || category === "LEARNING") &&
    isValid(new Date(dueDate))
  ) {
    next();
  } else if (
    !(status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    !(category === "WORK" || category === "HOME" || category === "LEARNING")
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    !(priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!isValid(new Date(dueDate))) {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

//API 1
app.get("/todos/", checkValidProperty, async (request, response) => {
  const { search_q, priority, category, status } = request.query;
  let getTodosQuery = "";

  switch (true) {
    case priority !== undefined && status !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE priority = '${priority}' AND status = '${status}';
        `;
      break;
    case category !== undefined && status !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE category = '${category}' AND status = '${status}';
        `;
      break;
    case priority !== undefined && category !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE priority = '${priority}' AND category = '${category}';
        `;
      break;
    case status !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE status = '${status}';
        `;
      break;
    case priority !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE priority = '${priority}';
        `;
      break;
    case category !== undefined:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE category = '${category}';
        `;
      break;

    default:
      getTodosQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE todo LIKE '%${search_q}%';
        `;
      break;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  getTodoQuery = `
        SELECT id, todo, priority, category, status, due_date AS dueDate
        FROM todo
        WHERE id = '${todoId}';
    `;
  const todoObj = await db.get(getTodoQuery);
  response.send(todoObj);
});

//API 3
app.get("/agenda/", async (request, response) => {
  let { date } = request.query;

  if (isValid(new Date(date))) {
    if (isMatch(date, "yyyy-M-dd")) {
      date = format(new Date(date), "yyyy-MM-dd");
      getTodoQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE due_date = '${date}';
        `;
      const result = await db.all(getTodoQuery);
      response.send(result);
    } else if (isMatch(date, "yyyy-MM-dd")) {
      getTodoQuery = `
            SELECT id, todo, priority, category, status, due_date AS dueDate
            FROM todo
            WHERE due_date = '${date}';
        `;
      const result = await db.all(getTodoQuery);
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", checkValidPropertyPost, async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
  if (isMatch(dueDate, "yyyy-MM-dd")) {
    const addTodoQuery = `
            INSERT INTO
                todo(id, todo, priority, status, category, due_date)
            VALUES
                (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');
        `;
    await db.run(addTodoQuery);
    response.send("Todo Successfully Added");
  } else if (isMatch(dueDate, "yyyy-M-dd")) {
    dueDate = format(new Date(dueDate), "yyyy-MM-dd");
    const addTodoQuery = `
            INSERT INTO
                todo(id, todo, priority, status, category, due_date)
            VALUES
                (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');
        `;
    await db.run(addTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 5
app.put("/todos/:todoId/", checkValidPropertyPut, async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  let updateTodoQuery = "";

  switch (true) {
    case status !== undefined:
      updateTodoQuery = `
                UPDATE 
                    todo
                SET
                    status = '${status}'
                WHERE
                    id = ${todoId};
            `;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      updateTodoQuery = `
                UPDATE 
                    todo
                SET
                    priority = '${priority}'
                WHERE
                    id = ${todoId};
            `;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      updateTodoQuery = `
                UPDATE 
                    todo
                SET
                    todo = '${todo}'
                WHERE
                    id = ${todoId};
            `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      updateTodoQuery = `
                UPDATE 
                    todo
                SET
                    category = '${category}'
                WHERE
                    id = ${todoId};
            `;
      await db.run(updateTodoQuery);
      response.send("Category Updated");
      break;

    default:
      updateTodoQuery = `
            UPDATE 
                todo
            SET
                due_date = '${dueDate}'
            WHERE
                id = ${todoId};
        `;
      await db.run(updateTodoQuery);
      response.send("Due Date Updated");
      break;
  }
});

//API 6
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM
            todo
        WHERE
            id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
