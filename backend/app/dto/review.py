
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Double


class Review(BaseModel):
  sk_movie_review_id: str
  sk_movie_id: str
  nome: str
  nota: Double
  created_at: datetime
  review_text: str

class ReviewResponse(BaseModel):
  nome: str
  nota: Double
  review_text: str