
from pydantic import BaseModel


class Genre(BaseModel):
  sk_genre_id: str
  name: str

class GenreName(BaseModel):
  sk_genre_id: str
  name: str
