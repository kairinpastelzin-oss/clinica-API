import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

//const express = require('express');
//const sqlite3 = require('sqlite3').verbose();

const poo1 = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'clinica',
    password: '123',
    port: 5432
});

poo1.connect((err, client, realease) =>{
    if(err){
        return console.error("Erro ao conectar ao PostgreSQl.", err.mensage)
    }
    console.log("Conectando ao Banco de Dados PostgreSQL. com sucesso!");
    realease();
});

const app = express();
app.use(express.json());
app.use(express.static('public'));

const port = 3000;

/*
const db = new sqlite3.Database('./clinica.db', (err) => {
    if (err) {
        console.error("Erro ao abrir o Banco de Dados:", err.message);
    } else {
        console.log("Conectado ao Banco de Dados SQLite com sucesso!");
    }
});

db.serialize(() => {

    db.run('PRAGMA foreign_keys = ON;');

    db.run(`
        CREATE TABLE IF NOT EXISTS atendentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            turno TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL
        )
    `);

   
    db.run(`
        CREATE TABLE IF NOT EXISTS atendimentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            descricao TEXT,
            cliente_id INTEGER,
            atendente_id INTEGER,
            FOREIGN KEY (cliente_id) REFERENCES clientes (id),
            FOREIGN KEY (atendente_id) REFERENCES atendentes (id)
        )
    `);
});
*/

await poo1.query(`
    CREATE TABLE IF NOT EXISTS atendentes(
        id SERIAL PRIMARY KEY, 
        nome VARCHAR(100) NOT NULL,
        turno VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clientes(
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(20) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS atendimentos(
        id SERIAL PRIMARY KEY,
        data VARCHAR(50) NOT NULL,
        descricao TEXT,
        cliente_id INTEGER REFERENCES clientes(id),
        atendente_id INTEGER REFERENCES atendentes(id)
    );
`);

app.get('/', (req, res) => {
   res.send('A API da clínica está online.');
});


app.get('/sobre', (req, res) => {
    res.send('Desenvolvido por Kairo Carvalho.');
});
/*
app.post('/clientes', (req, res) => {

    const nome = req.body.nome;
    const cpf = req.body.cpf;

    const sql = `
        INSERT INTO clientes (nome, cpf) 
        VALUES (?, ?)
    `;

    db.run(sql, [nome, cpf], function(err) {

        if (err) {
            return res.status(400).json({
                erro: err.message
            });
        }

        res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso!",
            id: this.lastID,
            nome: nome,
            cpf: cpf
        });
    });
});
*/
app.get('/clientes', async (req, res) =>{
    const sql = 'SELECT * FROM clientes';

    try{
        const resultado = await poo1.query(sql);
        res.json(resultado.rows);
    }catch(err){
        res.status(500).json({ erro: err.message });
    }
});

app.post('/clientes', async (req,res) =>{
    const{nome,cpf} = req.body;
    const sql = 'INSERT INTO clientes (nome, cpf) VALUES ($1, $2) RETURNING id';

    try{
        const resultado = await poo1.query(sql, [nome, cpf]);
        res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso',
            id: resultado.rows[0].id,
            nome,
            cpf
        });
    }catch(err){
        res.status(400).json({ erro: err.message })
    }
});
/*
app.get('/clientes', (req, res) => {
    const sql = `SELECT * FROM clientes`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send(`
                <h1>Erro ao buscar clientes</h1>
                <p>${err.message}</p>
            `);
        }

        // Se não houver clientes cadastrados
        if (rows.length === 0) {
            return res.send('<h1>Nenhum cliente encontrado.</h1>');
        }

        // Obtém os nomes das colunas dinamicamente a partir das chaves do primeiro registro
        const colunas = Object.keys(rows[0]);

        // Monta o cabeçalho da tabela
        let html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Lista de Clientes</title>
                <style>
                    table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h2>Lista de Clientes</h2>
                <table>
                    <thead>
                        <tr>
                            ${colunas.map(coluna => `<th>${coluna}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>'
        `;

        
        rows.forEach(row => {
            html += '<tr>';
            colunas.forEach(coluna => {
                html += `<td>${row[coluna] ?? ''}</td>`;
            });
            html += '</tr>';
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    });
});    
app.post('/atendentes', (req, res) => {

    const nome = req.body.nome;
    const turno = req.body.turno;

    const sql = `
        INSERT INTO atendentes (nome, turno)
        VALUES (?, ?)
    `;

    db.run(sql, [nome, turno], function(err) {

        if (err) {
            return res.status(400).json({
                erro: err.message
            });
        }

        res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso!",
            id: this.lastID,
            nome: nome,
            turno: turno
        });
    });
});

app.post('/atendimentos', (req, res) => {

    const {data, descricao, cliente_id, atendente_id} = req.body;

    const sql = `
        INSERT INTO atendimentos (data, descricao, cliente_id, atendente_id)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [data, descricao, cliente_id, atendente_id], function(err) {

        if (err) {
            return res.status(400).json({
                erro: "falha a registrar atendimento. Verifique se o cliente e o atedndimento",
                detalhe: err.message
            });
        }

        res.status(201).json({
            mensagem: "Atendimento registrado com sucesso!",
            id: this.lastID,
            data,
            descricao,
            cliente_id,
            atendente_id
        });
    });
});

app.get('/atendimentos', (req, res) =>{
    const sql=`
        SELECT
            a.id AS atendimento_id,
            a.data,
            a.descricao,
            c.nome AS cliente_nome,
            c.cpf AS cliente_cpf,
            at.nome AS atendente_nome,
            at.turno AS atendente_turno
            FROM atendimentos a
            INNER JOIN clientes c ON a.cliente_id = c.id
            INNER JOIN atendentes at ON a.atendente_ID = at.id
    `;

    db.all(sql, [], (err, rows) =>{
        if(err){
            return res.status(500).json({erro:err.message})
        }
        res.json(rows)
    });
});
*/
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});