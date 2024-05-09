const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tasksdb'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(bodyParser.json());

// Create Task
app.post('/tasks', (req, res) => {
    const { title, description, status } = req.body;
    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required.' });
    }

    const newTask = { title, description, status };
    const query = 'INSERT INTO tasks SET ?';

    connection.query(query, newTask, (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        newTask.id = result.insertId;
        res.status(201).json(newTask);
    });
});

// Read Tasks
app.get('/tasks', (req, res) => {
    const query = 'SELECT * FROM tasks';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error reading tasks:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// Update Task
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;

    const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
    connection.query(query, [title, description, status, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const query = 'DELETE FROM tasks WHERE id = ?';

    connection.query(query, taskId, (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Node API is running on port ${port}`);
});
