// src/db.js
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('Aviso: EXPO_PUBLIC_NEON_DATABASE_URL não encontrada no .env');
}

const sql = neon(DATABASE_URL);

/**
 * Garante a criação da tabela no Neon conforme a especificação:
 * CREATE TABLE produtos (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, preco NUMERIC(10,2) NOT NULL);
 */
export async function inicializarBanco() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      preco NUMERIC(10,2) NOT NULL
    );
  `);
}

/**
 * Busca todos os produtos ordenados pelos mais recentes
 */
export async function listarProdutos() {
  const produtos = await sql.query('SELECT id, nome, preco FROM produtos ORDER BY id DESC;');
  return produtos;
}

/**
 * Cadastra um novo produto no banco Neon
 */
export async function salvarProduto(nome, preco) {
  const rows = await sql.query(
    'INSERT INTO produtos (nome, preco) VALUES ($1, $2) RETURNING id, nome, preco;',
    [nome, preco]
  );
  return rows[0];
}

/**
 * Exclui um produto do banco pelo ID
 */
export async function excluirProduto(id) {
  await sql.query('DELETE FROM produtos WHERE id = $1;', [id]);
}
