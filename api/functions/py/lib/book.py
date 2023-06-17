from pydantic import BaseModel, Field
import uuid


class Book(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    author: str
