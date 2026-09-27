from pydantic import BaseModel


class Review(BaseModel):
    nome: str
    comentario: str
    nota: float