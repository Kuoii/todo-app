const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(log);

function log(req, res, next) {
    const time = new Date().toString().slice(16, 24);
    const method = req.method;
    const body = req.body;
    const path = req.url;
    console.log(`[${time}]`, method, path, body);
    next();
}

const db = require("better-sqlite3")("todo.db");

app.get("/", (req, res) => {
    const rawDate = new Date(req.query.date ?? Date.now());
    const date = rawDate.toISOString().split("T")[0];

    try {
        const getQuery = db.prepare(
            "SELECT * FROM tasks WHERE date = @date LIMIT @limit"
        );
        const todos = getQuery.all({
            date,
            limit: Math.min(req.query.limit ?? 20, 100),
        });

        res.send(todos);
        console.log(todos);
    } catch (err) {
        console.error("Chybka :c", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

app.post("/", (req, res) => {
    try {
        const postQuery = db.prepare(
            "INSERT INTO tasks (task, date) VALUES (@task, @date) RETURNING id, task, date"
        );
        const task = { task: req.body.task, date: req.body.date };
        const postedTask = postQuery.get(task);
        console.log(postedTask);
        res.send(postedTask);
    } catch (err) {
        console.error("Chybka :c", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

app.put("/", (req, res) => {
    try {
        const updateQuery = db.prepare(
            "UPDATE tasks SET task = (@task) WHERE id = (@id) RETURNING id, task"
        );
        const task = { id: req.body["id"], task: req.body["task"] };
        const updatedTask = updateQuery.get(task);
        console.log(updatedTask);
        res.send(updatedTask);
    } catch (err) {
        console.error("Chybka :c", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

app.delete("/", (req, res) => {
    try {
        const taskId = req.body.id;
        console.log(taskId);
        const deleteQuery = db.prepare("DELETE FROM tasks WHERE id = ?");
        deleteQuery.run(taskId);

        res.sendStatus(200);
    } catch (err) {
        console.error("Chybka :c", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
