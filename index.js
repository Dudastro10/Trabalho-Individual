const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const booksFilePath = path.join(__dirname, 'books.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Listagem dos livros
app.get('/api/books', (req, res) => {
  fs.readFile(booksFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler o arquivo de livros');
    }
    const books = JSON.parse(data);
    res.json(books);
  });
});

// Cadastro de novos livros
app.post('/api/books',
  [
    check('titulo').notEmpty().withMessage('Título é obrigatório'),
    check('autor').notEmpty().withMessage('Autor é obrigatório'),
    check('genero').notEmpty().withMessage('Gênero é obrigatório'),
    check('exemplares').isInt({ gt: 0 }).withMessage('Número de exemplares deve ser um inteiro positivo'),
    check('imagem').isURL().withMessage('URL da imagem é inválida')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newBook = req.body;

    fs.readFile(booksFilePath, (err, data) => {
      if (err) {
        return res.status(500).send('Erro ao ler o arquivo de livros');
      }

      const books = JSON.parse(data);
      books.books.push(newBook);

      fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Erro ao salvar o livro');
        }

        res.status(201).json(newBook);
      });
    });
  }
);

// Compra de um livro
app.post('/api/books/buy', [
  check('titulo').notEmpty().withMessage('Título é obrigatório'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { titulo } = req.body;

  fs.readFile(booksFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler o arquivo de livros');
    }

    const books = JSON.parse(data);
    const book = books.books.find(b => b.titulo === titulo);

    if (!book) {
      return res.status(404).send('Livro não encontrado');
    }

    if (book.exemplares > 0) {
      book.exemplares -= 1;

      fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Erro ao atualizar o livro');
        }

        res.status(200).json(book);
      });
    } else {
      res.status(400).send('Livro esgotado');
    }
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
