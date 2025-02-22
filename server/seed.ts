import { db } from "./db";

type Task = {
    task: string;
    date: string;
};

const tasks: Task[] = [
    { task: "Water the plants", date: "2024-01-01" },
    { task: "Take dog for a walk", date: "2024-01-01" },
    { task: "Quickly chop down some trees", date: "2024-01-01" },
    { task: "Create lasting memories", date: "2024-01-01" },
];

db.prepare(
    "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, task TEXT NOT NULL, date DATE)"
).run();

const insert = db.prepare(
    "INSERT INTO tasks (task, date) VALUES (@task, @date)"
);

const insertDefault = db.transaction((tasks: Task[]) => {
    for (const task of tasks) insert.run(task);
});

insertDefault(tasks);
