from pydantic import BaseModel


class Company(BaseModel):
    sk_company_id: str
    nome_produtora: str