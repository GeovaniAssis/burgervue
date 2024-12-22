const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Endpoints
app.get('/ingredientes', async (req, res) => {
    try {
        const paes = await pool.query('SELECT * FROM paes');
        const carnes = await pool.query('SELECT * FROM carnes');
        const opcionais = await pool.query('SELECT * FROM opcionais');
        const bebidas = await pool.query('SELECT * FROM bebidas');
        const batatas = await pool.query('SELECT * FROM batatas');
        res.json({ paes: paes.rows, carnes: carnes.rows, opcionais: opcionais.rows, bebidas: bebidas.rows, batatas: batatas.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar ingredientes');
    }
});

app.get('/burgers', async (req, res) => {
    try {
        const burgers = await pool.query('SELECT * FROM burgers');
        res.json(burgers.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar burgers');
    }
});

app.get('/status', async (req, res) => {
    try {
        const status = await pool.query('SELECT * FROM status');
        res.json(status.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar status');
    }
});

app.post('/burgers', async (req, res) => {
    const { nome, pao, carne, opcional, bebida, batata, status } = req.body;
    try {
        const novoBurger = await pool.query(
            'INSERT INTO burgers (nome, pao, carne, opcional, bebida, batata, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nome, pao, carne, opcional, bebida, batata, status]
        );
        res.status(201).json(novoBurger.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar pedido');
    }
});

app.put('/burgers/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, pao, carne, opcional, bebida, batata, status } = req.body;
    try {
        const burgerAtualizado = await pool.query(
            'UPDATE burgers SET nome = $1, pao = $2, carne = $3, opcional = $4, bebida = $5, batata = $6, status = $7 WHERE id = $8 RETURNING *',
            [nome, pao, carne, opcional, bebida, batata, status, id]
        );
        if (burgerAtualizado.rows.length === 0) {
            return res.status(404).send('Pedido não encontrado');
        }
        res.json(burgerAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar pedido');
    }
});

app.delete('/burgers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM burgers WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).send('Pedido não encontrado');
        }
        res.send('Pedido deletado com sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao deletar pedido');
    }
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
