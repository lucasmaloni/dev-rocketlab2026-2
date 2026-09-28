export interface Review {
  nome: string;
  comentario: string | null;
  nota: number;
}

export interface ReviewSummary {
  qtd_avaliacoes_usuarios: number;
  nota_media_usuarios: number | null;
}

export interface CreateReviewPayload {
  nome: string;
  nota: number;
  comentario: string | null;
}

export interface ReviewCreatedResponse {
  review: Review;
  reviews_summary: ReviewSummary;
}
