from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Region Schemas
class RegionBase(BaseModel):
    area_code: Optional[str] = None
    area_name: str
    division: Optional[str] = None

class RegionCreate(RegionBase):
    pass

class RegionResponse(RegionBase):
    region_id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    product_name: str
    product_category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    product_id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Sales Monthly Schemas
class SalesMonthlyBase(BaseModel):
    region_id: int
    month: int
    year: int
    sales_target: Optional[float] = None
    gross_sales: Optional[float] = None
    sales_return: Optional[float] = None
    net_sales: Optional[float] = None

class SalesMonthlyCreate(SalesMonthlyBase):
    pass

class SalesMonthlyResponse(SalesMonthlyBase):
    id: int
    sales_ach_pct: Optional[float] = None
    
    class Config:
        from_attributes = True


# Collection Monthly Schemas
class CollectionMonthlyBase(BaseModel):
    region_id: int
    month: int
    year: int
    coll_target: Optional[float] = None
    total_coll: Optional[float] = None
    cash_target: Optional[float] = None
    cash_coll: Optional[float] = None
    credit_target: Optional[float] = None
    credit_coll: Optional[float] = None
    seed_target: Optional[float] = None
    seed_coll: Optional[float] = None

class CollectionMonthlyCreate(CollectionMonthlyBase):
    pass

class CollectionMonthlyResponse(CollectionMonthlyBase):
    id: int
    coll_ach_pct: Optional[float] = None
    
    class Config:
        from_attributes = True


# Product Sales Value Schemas
class ProductSalesValueBase(BaseModel):
    product_id: int
    period_start_month: int
    period_start_year: int
    period_end_month: int
    period_end_year: int
    sales_value: Optional[float] = None

class ProductSalesValueCreate(ProductSalesValueBase):
    pass

class ProductSalesValueResponse(ProductSalesValueBase):
    id: int
    
    class Config:
        from_attributes = True


# Product Sales Volume Schemas
class ProductSalesVolumeBase(BaseModel):
    product_id: int
    period_start_month: int
    period_start_year: int
    period_end_month: int
    period_end_year: int
    sales_volume: Optional[float] = None

class ProductSalesVolumeCreate(ProductSalesVolumeBase):
    pass

class ProductSalesVolumeResponse(ProductSalesVolumeBase):
    id: int
    
    class Config:
        from_attributes = True


# Dashboard Summary Schemas
class SalesSummary(BaseModel):
    total_regions: int
    total_sales_target: float
    total_gross_sales: float
    total_net_sales: float
    overall_achievement_pct: float

class CollectionSummary(BaseModel):
    total_coll_target: float
    total_collection: float
    overall_coll_ach_pct: float
    cash_collection: float
    credit_collection: float
    seed_collection: float

class ProductSummary(BaseModel):
    total_products: int
    total_value_current: float
    total_value_previous: float
    overall_growth_pct: float

class DashboardSummary(BaseModel):
    sales: SalesSummary
    collection: CollectionSummary
    products: ProductSummary


# File Upload Response
class FileUploadResponse(BaseModel):
    success: bool
    message: str
    file_type: str
    records_processed: int
    details: Optional[dict] = None
