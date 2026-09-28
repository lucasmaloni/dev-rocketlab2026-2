# NERV Movie Manager - RocketLab 2026.2

## Estrutura

### Backend

Aproveitei boa parte da estrutura inicial, fazendo ajustes apenas na configuração/composição do roteamento da api, criando a pasta `/router` e os dominios da aplicação como pastas desse diretório.

Além disso, adicionei uma pasta `/dto`, responsável por agrupar todos os DTOs utilizados pela API para retornar dados de forma segura e são espelhados em TypeScript no frontend.

Para a população dos dados, criei uma classe `Seeder` que consome os `.csv` e popula o banco na inicialização da aplicação.

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
|   |   |    ├──v1/        # ponto de composição dos futuros routers
|   |   |    ├──routes/    # Dominío da aplicão dividido por rotas da API
│   │   ├── core/          # configurações e logging
│   │   ├── db/            # Base ORM, engine e sessões
|   |        └── seed/
│   │   └── movies/        # modelos SQLAlchemy do domínio de filmes
│   ├── migrations/        # ambiente e revisões Alembic
│   │   └── data/
|   |        └── seeds/    # Contém os .csv utilizados para popular a aplicação
│   └── tests/
└── README.md
```

### Frontend

Implementei do zero seguindo esse padrão, visando modularidade e aproveitamendo de componentes genéricos em diferentes partes da aplicação.

```txt
src/
├── api/                   # Camada de interaçao com API
│   ├── client.ts
│   ├── movies.ts
│   └── reviews.ts
├── components/            # Componentes consumidos por toda aplicação
│   ├── Pagination.tsx
│   ├── SearchBar.tsx
│   ├── StarRating.tsx
│   └── Modal.tsx
├── features/              # Componentes que agrupam componentes genéricos e possuem lógica própria de renderização
│   └── movies/
│       ├── MovieCard.tsx
│       ├── MovieForm.tsx
│       ├── ReviewList.tsx
│       ├── ReviewForm.tsx
│       └── useMovies.ts
├── pages/
│   ├── MoviesPage.tsx
│   └── MovieDetailPage.tsx
├── types/                 # Criação de tipos/DTOs/interfaces do TS
│   └── movie.ts
├── App.tsx
└── main.tsx
```

## Execução

A aplicação roda da mesma maneira, a partir do diretório local, siga esses passos:

### Inicialização do Back-End

Mude para o diretório do backend

```bash
cd backend
```

Estando no diretório correto, crie um ambiente virtual e faça a instalação das dependências da aplicação:

```bash
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
```

Com as dependências instaladas, faça uma cópia do .env.example nomeada para .env, fornecendo as variaveis de ambiente para a aplicação rodar

```bash
cp .env.example .env
```

Com isso feito, basta iniciar a aplicação. Antes de inicializar a API, vá até `backend/app/main.py` e altere a constante `SEEDING_ENABLED`:

```python
SEEDING_ENABLED = True  # Autoriza o seeding na inicialização da aplicação
SEEDING_ENABLED = False # Impede o seeding na inicialização da aplicação
```

Essa configuração foi utilizada para impedir seeding durante a etapa de hot reloading da aplicação. Cada aplicativo alterado e salvo gerava uma reinicialização que, se não controlada, gerava um novo seeding. Ajuste conforme sua necessidade, mas para a inicialização, é fundamental que a variável esteja setada para `True`.

Por fim, rode esses dois ultimos comandos para inicializar a API:

```bash
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Isso inicializará a aplicação em `http://localhost:8000`e voce pode usar `http://localhost:8000/docs` para consultar endpoints e entender o funcionamento da API.

### Inicialização do Front-End

A partir do diretório local, rode os seguintes comandos:

```bash
cd frontend
```

Assim como no backend, gere um .env a partir do .env.example:

```bash
cp .env.example .env
```

Por fim, com o npm instalado na máquina, rode:

```bash
npm install
npm run dev
```

Isso vai inicializar o front-end em `http://localhost:5173`.

## Banco de dados e migrações

O modelo usa um esquema estrela para o catálogo de filmes:

- dimensões de filmes, gêneros, pessoas, produtoras e resumo de avaliações;
- fato de desempenho financeiro e de engajamento;
- tabelas de associação N:N entre filmes, gêneros, produtoras e pessoas;

O schema corresponde aos nove arquivos CSV atuais da camada Diamond, com a
adição de `movie_reviews`: uma avaliação individual por linha, na escala 0–10.
A tabela aceita diretamente as colunas `sk_movie_review_id`, `sk_movie_id`,
`nome`, `nota` e `comentario` do CSV enviado separadamente. `created_at` é
gerado pelo banco. O contexto generativo não faz parte desta base.

O repositório não inclui CSVs nem rotinas de carga. Para usar avaliações,
importe primeiro os filmes em `dim_movies` e depois o CSV de `movie_reviews`.

As tabelas são criadas exclusivamente pelo Alembic. Para evoluir os modelos,
crie uma revisão e aplique-a:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "descreva a alteração"
.venv/bin/alembic upgrade head
```

O banco padrão é SQLite local em `backend/rocketlab.db`. Ajuste
`DATABASE_URL` no arquivo `.env` para usar outro banco compatível.

## Sobre a aplicação

Para desenvolver visualmente a aplicação, me inspirei nas cores/estilo do anime Evangelion, isso deu a cara/tema da aplicação como um todo, e boa parte das cores vistas na aplicação foram inspiradas no anime.

Quanto as funcionalidades, a base de inspiração é o Letterboxd - aplicativo voltado justamente para registro de avaliações de filmes e navegação em catálogo de filmes.

### Funcionalidades:

1. Busca de filmes

Na página inicial/catálogo, o usuário pode buscar filmes pelo título, gerando um dropdown com as opções que se assemelham ao título buscado e, ao clicar no filme, o usuário é redirecionado para a aba própria sobre o filme. O catálogo é paginado e cada card do filme contém um botão que redireciona o usuário para o filme desejado.

2. Consulta de informações sobre o filme

Na tela própria do filme, o usuário pode consultar mais informações sobre o filme, vindo diretamente da base de dados ao renderizar a tela.

3. Edição de informações sobre o filme

O usuário, a partir da tela inicial do filme, pode editar os dados dele (sinopse, gênero, etc.), que são refletidos instantâneamente.

4. Registro de avaliação e sistema de avaliaçao próprio

O usuário pode registrar novas avaliações sobre o filme que está sendo visualizado, essas avaliações são então contabilizadas e geram um sistema de notas separado das notas provenientes do IMBD e TMDB, que são visualizadas na página de catálogo.

5. Exclusão de filme

A página do filme possui um botão que inicia o fluxo de exclusão, a partir do clique no botão da lixeira. Após confirmação, o filme é excluído e o usuario volta para a página de catalogo.
