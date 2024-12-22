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

app.get('/status', async (req, res) => {
    try {
        const status = await pool.query('SELECT * FROM status');
        res.json(status.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar status');
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

app.patch('/burgers/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, pao, carne, opcional, bebida, batata, status } = req.body;

    try {
        // Atualiza apenas os campos enviados no body
        const camposAtualizados = [];
        const valoresAtualizados = [];
        let contador = 1;

        if (nome !== undefined) {
            camposAtualizados.push(`nome = $${contador++}`);
            valoresAtualizados.push(nome);
        }
        if (pao !== undefined) {
            camposAtualizados.push(`pao = $${contador++}`);
            valoresAtualizados.push(pao);
        }
        if (carne !== undefined) {
            camposAtualizados.push(`carne = $${contador++}`);
            valoresAtualizados.push(carne);
        }
        if (opcional !== undefined) {
            camposAtualizados.push(`opcional = $${contador++}`);
            valoresAtualizados.push(opcional);
        }
        if (bebida !== undefined) {
            camposAtualizados.push(`bebida = $${contador++}`);
            valoresAtualizados.push(bebida);
        }
        if (batata !== undefined) {
            camposAtualizados.push(`batata = $${contador++}`);
            valoresAtualizados.push(batata);
        }
        if (status !== undefined) {
            camposAtualizados.push(`status = $${contador++}`);
            valoresAtualizados.push(status);
        }

        valoresAtualizados.push(id);

        const query = `UPDATE burgers SET ${camposAtualizados.join(', ')} WHERE id = $${contador} RETURNING *`;
        const burgerAtualizado = await pool.query(query, valoresAtualizados);

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
