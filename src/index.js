const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return res.status(404).json({ error: "User not found" });

  req.user = user;

  return next();
}

function checkIfTodoExist(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (todoIndex < 0) return res.status(404).json({ error: "Todo not found" });

  req.params = {
    ...req.params,
    todoIndex,
  };

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some(
    (costumer) => costumer.username === username
  );

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newData = { id: uuidv4(), username, name, todos: [] };
  users.push(newData);

  return res.status(201).json(newData);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return res.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, checkIfTodoExist, (req, res) => {
  const { user } = req;
  const { todoIndex } = req.params;
  const { title, deadline } = req.body;

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    title,
    deadline: new Date(deadline),
  };

  return res.status(201).json(user.todos[todoIndex]);
});

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkIfTodoExist,
  (req, res) => {
    const { user } = req;
    const { todoIndex } = req.params;

    user.todos[todoIndex] = {
      ...user.todos[todoIndex],
      done: true,
    };

    return res.status(201).json(user.todos[todoIndex]);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkIfTodoExist,
  (req, res) => {
    const { user } = req;
    const { todoIndex } = req.params;

    user.todos.splice(todoIndex, 1);

    return res.status(204).send();
  }
);

module.exports = app;
