const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Caminho para o arquivo JSON
const booksFilePath = path.join(__dirname, 'books.json');

// Função para ler os livros do arquivo JSON
const readBooks = () => {
  const data = fs.readFileSync(booksFilePath, 'utf8');
  return JSON.parse(data).books;
};

// Função para escrever os livros no arquivo JSON
const writeBooks = (books) => {
  fs.writeFileSync(booksFilePath, JSON.stringify({ books }, null, 2));
};

// Endpoint para listar todos os livros
app.get('/livros', (req, res) => {
  try {
    const books = readBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler os livros' });
  }
});

// Endpoint para comprar um livro
app.post('/livros/compra', [
  check('titulo').notEmpty().withMessage('Título do livro é obrigatório')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { titulo } = req.body;
  const books = readBooks();

  const bookIndex = books.findIndex(book => book.titulo === titulo);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Livro não encontrado' });
  }

  if (books[bookIndex].exemplares > 0) {
    books[bookIndex].exemplares -= 1;
    writeBooks(books);
    res.json({ message: 'Compra realizada com sucesso', livro: books[bookIndex] });
  } else {
    res.status(400).json({ error: 'Livro esgotado' });
  }
});

// Endpoint para cadastrar um novo livro
app.post('/livros', [
  check('titulo').notEmpty().withMessage('Título do livro é obrigatório'),
  check('autor').notEmpty().withMessage('Autor do livro é obrigatório'),
  check('genero').notEmpty().withMessage('Gênero do livro é obrigatório'),
  check('exemplares').isInt({ gt: 0 }).withMessage('Número de exemplares deve ser um inteiro maior que 0'),
  check('imagem').notEmpty().withMessage('URL da imagem é obrigatória')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { titulo, autor, genero, exemplares, imagem } = req.body;
  const books = readBooks();

  const bookExists = books.some(book => book.titulo === titulo);
  if (bookExists) {
    return res.status(400).json({ error: 'Livro já cadastrado' });
  }

  const newBook = { titulo, autor, genero, exemplares, imagem };
  books.push(newBook);
  writeBooks(books);

  res.status(201).json({ message: 'Livro cadastrado com sucesso', livro: newBook });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
