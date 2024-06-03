const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir o uso de JSON nos corpos das requisições
app.use(express.json());

// Rota para listar todos os livros
app.get('/books', (req, res) => {
  fs.readFile('livros.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao ler o arquivo de livros');
      return;
    }
    const books = JSON.parse(data).books;
    res.json(books);
  });
});

// Rota para comprar um livro
app.post('/buy', (req, res) => {
  const { titulo } = req.body;

  fs.readFile('livros.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao ler o arquivo de livros');
      return;
    }

    const livros = JSON.parse(data);
    const bookIndex = livros.books.findIndex((book) => book.titulo === titulo);

    if (bookIndex === -1) {
      res.status(404).send('Livro não encontrado');
      return;
    }

    if (livros.books[bookIndex].exemplares > 0) {
      livros.books[bookIndex].exemplares--;
      fs.writeFile('livros.json', JSON.stringify(livros), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erro ao salvar o arquivo de livros');
          return;
        }
        res.status(200).send('Compra realizada com sucesso');
      });
    } else {
      res.status(400).send('Livro fora de estoque');
    }
  });
});

// Rota para cadastrar um novo livro
app.post('/books', (req, res) => {
  const novoLivro = req.body;

  fs.readFile('livros.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao ler o arquivo de livros');
      return;
    }

    const livros = JSON.parse(data);
    livros.books.push(novoLivro);

    fs.writeFile('livros.json', JSON.stringify(livros), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar o arquivo de livros');
        return;
      }
      res.status(200).send('Livro cadastrado com sucesso');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
