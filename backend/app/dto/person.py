from pydantic import BaseModel


class Person(BaseModel):
  sk_person_id: str
  nome_pessoa: str
  tipo_pessoa: str
