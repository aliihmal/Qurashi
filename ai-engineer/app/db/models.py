import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, Numeric, String, Text,
                        UniqueConstraint, func)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

EMBED_DIM = 1024


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_ref: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    locale: Mapped[str | None] = mapped_column(String(8))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = (UniqueConstraint("user_id", "key", "value"), Index("ix_pref_user", "user_id"))
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(32))     # family|note|disliked_note|occasion|season|budget_max|intensity|gender
    value: Mapped[str] = mapped_column(String(64))
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    source: Mapped[str] = mapped_column(String(16), default="explicit")  # explicit | inferred
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (Index("ix_conv_user", "user_id", "started_at"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    session_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (Index("ix_msg_conv", "conversation_id", "created_at"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(12))    # user | assistant
    content: Mapped[str] = mapped_column(Text)
    parsed_json: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_prod_notes", "notes", postgresql_using="gin"),
        Index("ix_prod_occasions", "occasions", postgresql_using="gin"),
        Index("ix_prod_seasons", "seasons", postgresql_using="gin"),
        Index("ix_prod_price_stock", "price", postgresql_where="in_stock"),
        Index("ix_prod_family", "family"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    brand: Mapped[str] = mapped_column(String(100), default="AL-QURASHI")
    description: Mapped[str | None] = mapped_column(Text)
    family: Mapped[str] = mapped_column(String(32))
    notes: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)       # lowercase
    occasions: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)   # lowercase
    seasons: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)     # lowercase
    gender: Mapped[str] = mapped_column(String(8), default="unisex")
    intensity: Mapped[int | None] = mapped_column(Integer)                    # 1-5
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="SAR")
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[str | None] = mapped_column(String(500))
    url: Mapped[str | None] = mapped_column(String(500))
    embedding = mapped_column(Vector(EMBED_DIM), nullable=True)               # phase 2
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    query_json: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RecommendationItem(Base):
    __tablename__ = "recommendation_items"
    __table_args__ = (Index("ix_recitem_product", "product_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recommendation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("recommendations.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    rank: Mapped[int] = mapped_column(Integer)
    score: Mapped[float] = mapped_column(Float)
    score_breakdown: Mapped[dict] = mapped_column(JSONB)
    reason_data: Mapped[dict] = mapped_column(JSONB)


class Interaction(Base):
    __tablename__ = "interactions"
    __table_args__ = (Index("ix_inter_user", "user_id", "created_at"), Index("ix_inter_prod", "product_id", "type"))
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("recommendations.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(16))   # click|like|dislike|add_to_cart|purchase
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
