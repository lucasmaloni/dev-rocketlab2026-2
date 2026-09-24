# Frontend

## Organização do projeto:

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
