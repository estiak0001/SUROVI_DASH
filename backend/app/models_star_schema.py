"""
Star Schema for Surovi Agro Industries Dashboard
================================================

This implements a simple star schema with:
- 3 Dimension Tables: dim_time, dim_region, dim_product
- 2 Fact Tables: fact_sales, fact_product_performance

Star Schema Diagram:
                                    
                 +---------------+
                 |   dim_time    |
                 +---------------+
                 | time_id (PK)  |
                 | date          |
                 | day           |
                 | month         |
                 | month_name    |
                 | quarter       |
                 | year          |
                 | fiscal_year   |
                 +-------+-------+
                         |
    +---------------+    |    +------------------+
    |  dim_region   |    |    |   dim_product    |
    +---------------+    |    +------------------+
    | region_id(PK) |    |    | product_id (PK)  |
    | area_code     |    |    | product_name     |
    | area_name     |    |    | product_category |
    | division      |    |    | product_group    |
    | zone          |    |    | unit_of_measure  |
    +-------+-------+    |    +--------+---------+
            |            |             |
            |    +-------+-------+     |
            |    |  fact_sales   |     |
            +--->| (FK) region   |     |
                 | (FK) time     |     |
                 | sales_target  |     |
                 | gross_sales   |     |
                 | sales_return  |     |
                 | net_sales     |     |
                 | coll_target   |     |
                 | total_coll    |     |
                 | cash_coll     |     |
                 | credit_coll   |     |
                 | seed_coll     |     |
                 +---------------+     |
                                       |
                 +---------------------+
                 | fact_product_perf   |
                 +---------------------+
                 | (FK) product        |<--+
                 | (FK) time           |
                 | sales_value         |
                 | sales_volume        |
                 | prev_year_value     |
                 | prev_year_volume    |
                 | value_growth_pct    |
                 | volume_growth_pct   |
                 +---------------------+

"""

from sqlalchemy import Column, Integer, String, Float, SmallInteger, Date, TIMESTAMP, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


# ==================== DIMENSION TABLES ====================

class DimTime(Base):
    """
    Time Dimension - Contains date/time attributes for analysis
    Grain: Monthly (one row per month-year combination)
    """
    __tablename__ = "dim_time"
    
    time_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, unique=True)  # First day of month
    day = Column(SmallInteger, default=1)
    month = Column(SmallInteger, nullable=False)
    month_name = Column(String(20), nullable=False)
    month_short = Column(String(3), nullable=False)
    quarter = Column(SmallInteger, nullable=False)
    quarter_name = Column(String(10))  # Q1, Q2, Q3, Q4
    year = Column(SmallInteger, nullable=False)
    fiscal_year = Column(String(10))  # e.g., "FY2025-26"
    is_current_month = Column(SmallInteger, default=0)
    is_current_year = Column(SmallInteger, default=0)
    
    # Relationships
    fact_sales = relationship("FactSales", back_populates="time_dim")
    fact_products = relationship("FactProductPerformance", back_populates="time_dim")
    
    __table_args__ = (
        Index('idx_dim_time_month_year', 'month', 'year'),
    )


class DimRegion(Base):
    """
    Region Dimension - Contains geographic/territorial attributes
    Grain: One row per sales region/area
    """
    __tablename__ = "dim_region"
    
    region_id = Column(Integer, primary_key=True, autoincrement=True)
    area_code = Column(String(10))
    area_name = Column(String(100), nullable=False)
    division = Column(String(100))
    zone = Column(String(50))  # North, South, East, West, Central
    district = Column(String(100))
    region_type = Column(String(50), default='Area')  # Area, Territory, Zone
    is_active = Column(SmallInteger, default=1)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    fact_sales = relationship("FactSales", back_populates="region_dim")
    
    __table_args__ = (
        Index('idx_dim_region_division', 'division'),
        Index('idx_dim_region_zone', 'zone'),
    )


class DimProduct(Base):
    """
    Product Dimension - Contains product attributes
    Grain: One row per product
    """
    __tablename__ = "dim_product"
    
    product_id = Column(Integer, primary_key=True, autoincrement=True)
    product_code = Column(String(50))
    product_name = Column(String(200), nullable=False)
    product_category = Column(String(100))  # e.g., Fertilizer, Pesticide, Seed
    product_group = Column(String(100))  # Sub-category
    brand = Column(String(100))
    unit_of_measure = Column(String(20))  # KG, LTR, PCS
    unit_price = Column(Float)
    is_active = Column(SmallInteger, default=1)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    fact_products = relationship("FactProductPerformance", back_populates="product_dim")
    
    __table_args__ = (
        Index('idx_dim_product_category', 'product_category'),
        Index('idx_dim_product_group', 'product_group'),
    )


# ==================== FACT TABLES ====================

class FactSales(Base):
    """
    Sales & Collection Fact Table
    Grain: One row per Region per Month
    Contains both sales and collection metrics
    """
    __tablename__ = "fact_sales"
    
    fact_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Keys to Dimensions
    region_id = Column(Integer, ForeignKey("dim_region.region_id"), nullable=False)
    time_id = Column(Integer, ForeignKey("dim_time.time_id"), nullable=False)
    
    # Sales Measures
    sales_target = Column(Float, default=0)
    gross_sales = Column(Float, default=0)
    sales_return = Column(Float, default=0)
    net_sales = Column(Float, default=0)
    sales_achievement_pct = Column(Float, default=0)
    
    # Collection Measures
    coll_target = Column(Float, default=0)
    total_collection = Column(Float, default=0)
    cash_collection = Column(Float, default=0)
    credit_collection = Column(Float, default=0)
    seed_collection = Column(Float, default=0)
    coll_achievement_pct = Column(Float, default=0)
    
    # Derived Measures
    outstanding = Column(Float, default=0)  # net_sales - total_collection
    return_rate_pct = Column(Float, default=0)  # sales_return / gross_sales * 100
    
    # Audit
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    region_dim = relationship("DimRegion", back_populates="fact_sales")
    time_dim = relationship("DimTime", back_populates="fact_sales")
    
    __table_args__ = (
        UniqueConstraint('region_id', 'time_id', name='uq_fact_sales_region_time'),
        Index('idx_fact_sales_region', 'region_id'),
        Index('idx_fact_sales_time', 'time_id'),
    )


class FactProductPerformance(Base):
    """
    Product Performance Fact Table
    Grain: One row per Product per Month
    Contains sales value, volume and YoY comparison
    """
    __tablename__ = "fact_product_performance"
    
    fact_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Keys to Dimensions
    product_id = Column(Integer, ForeignKey("dim_product.product_id"), nullable=False)
    time_id = Column(Integer, ForeignKey("dim_time.time_id"), nullable=False)
    
    # Current Period Measures
    sales_value = Column(Float, default=0)  # In BDT
    sales_volume = Column(Float, default=0)  # In units
    
    # Previous Year Measures (for YoY comparison)
    prev_year_value = Column(Float, default=0)
    prev_year_volume = Column(Float, default=0)
    
    # Growth Metrics
    value_growth = Column(Float, default=0)  # Current - Previous
    volume_growth = Column(Float, default=0)
    value_growth_pct = Column(Float, default=0)  # Growth %
    volume_growth_pct = Column(Float, default=0)
    
    # Audit
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product_dim = relationship("DimProduct", back_populates="fact_products")
    time_dim = relationship("DimTime", back_populates="fact_products")
    
    __table_args__ = (
        UniqueConstraint('product_id', 'time_id', name='uq_fact_product_time'),
        Index('idx_fact_product_product', 'product_id'),
        Index('idx_fact_product_time', 'time_id'),
    )


# ==================== HELPER FUNCTIONS ====================

def get_month_name(month: int) -> str:
    """Get full month name from month number"""
    months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    return months[month] if 1 <= month <= 12 else ''


def get_month_short(month: int) -> str:
    """Get short month name from month number"""
    months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month] if 1 <= month <= 12 else ''


def get_quarter(month: int) -> int:
    """Get quarter number from month"""
    return (month - 1) // 3 + 1


def get_fiscal_year(month: int, year: int) -> str:
    """
    Get fiscal year string (July-June fiscal year for Bangladesh)
    """
    if month >= 7:  # July onwards
        return f"FY{year}-{str(year + 1)[-2:]}"
    else:
        return f"FY{year - 1}-{str(year)[-2:]}"
