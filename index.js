const express = require('express');
const fs = require('fs').promises; // Usando promessas para operações de arquivo assíncronas

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Função para ler os dados do arquivo JSON
async function lerLivros() {
  try {
    const data = await fs.readFile('livros.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Erro ao ler o arquivo de livros');
  }
}

// Função para escrever os dados no arquivo JSON
async function salvarLivros(livros) {
  try {
    await fs.writeFile('livros.json', JSON.stringify(livros, null, 2));
  } catch (error) {
    throw new Error('Erro ao salvar o arquivo de livros');
  }
}

// Rota para listar todos os livros
app.get('/books', async (req, res) => {
  try {
    const livros = await lerLivros();
    res.json(livros.books);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

// Rota para comprar um livro
app.post('/buy', async (req, res) => {
  const { titulo } = req.body;

  try {
    let livros = await lerLivros();
    const bookIndex = livros.books.findIndex((book) => book.titulo === titulo);

    if (bookIndex === -1) {
      res.status(404).send('Livro não encontrado');
      return;
    }

    if (livros.books[bookIndex].exemplares > 0) {
      livros.books[bookIndex].exemplares--;
      await salvarLivros(livros);
      res.status(200).send('Compra realizada com sucesso');
    } else {
      res.status(400).send('Livro fora de estoque');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

// Rota para cadastrar um novo livro
app.post('/books', async (req, res) => {
  const novoLivro = req.body;

  try {
    let livros = await lerLivros();
    livros.books.push(novoLivro);
    await salvarLivros(livros);
    res.status(200).send('Livro cadastrado com sucesso');
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
