node index.js

curl http://localhost:3000/livros
curl -X POST http://localhost:3000/livros/compra -H "Content-Type: application/json" -d '{"titulo": "Meditações"}'
curl -X POST http://localhost:3000/livros -H "Content-Type: application/json" -d '{"titulo": "Novo Livro", "autor": "Novo Autor", "genero": "Aventura", "exemplares": 5, "imagem": "url-da-imagem"}'
