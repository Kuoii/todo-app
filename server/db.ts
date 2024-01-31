import sqlite from "better-sqlite3";

export const db = new sqlite("todo.db");
