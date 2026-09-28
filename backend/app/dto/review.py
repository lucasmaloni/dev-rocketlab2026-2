from pydantic import BaseModel, Field, field_validator


class Review(BaseModel):
    nome: str
    comentario: str
    nota: float


class ReviewCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    comentario: str | None = Field(default=None, max_length=4000)
    nota: float = Field(ge=0.5, le=5)

    @field_validator("nome")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Nome é obrigatório")
        return value

    @field_validator("nota")
    @classmethod
    def validate_rating_step(cls, value: float) -> float:
        if not value * 2 == round(value * 2):
            raise ValueError("A nota deve variar em passos de 0,5")
        return value


class ReviewSummary(BaseModel):
    qtd_avaliacoes_usuarios: int
    nota_media_usuarios: float | None


class ReviewCreatedResponse(BaseModel):
    review: Review
    reviews_summary: ReviewSummary