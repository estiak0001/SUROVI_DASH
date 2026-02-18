"""
Migration Script: Populate Star Schema from Existing Data
=========================================================
Run this script to:
1. Create the star schema tables
2. Populate dimension tables
3. Populate fact tables from existing data
"""

from datetime import date
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import Region, Product, SalesMonthly, CollectionMonthly, ProductSalesValue, ProductSalesVolume
from app.models_star_schema import (
    Base as StarBase,
    DimTime, DimRegion, DimProduct,
    FactSales, FactProductPerformance,
    get_month_name, get_month_short, get_quarter, get_fiscal_year
)


def create_star_schema_tables():
    """Create all star schema tables"""
    print("Creating star schema tables...")
    StarBase.metadata.create_all(bind=engine)
    print("✅ Star schema tables created")


def populate_dim_time(db: Session, start_year: int = 2023, end_year: int = 2026):
    """Populate time dimension with monthly grain"""
    print("\nPopulating dim_time...")
    
    current_date = date.today()
    count = 0
    
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            # Check if already exists
            existing = db.query(DimTime).filter(
                DimTime.month == month,
                DimTime.year == year
            ).first()
            
            if existing:
                continue
            
            dim_time = DimTime(
                date=date(year, month, 1),
                day=1,
                month=month,
                month_name=get_month_name(month),
                month_short=get_month_short(month),
                quarter=get_quarter(month),
                quarter_name=f"Q{get_quarter(month)}",
                year=year,
                fiscal_year=get_fiscal_year(month, year),
                is_current_month=1 if (month == current_date.month and year == current_date.year) else 0,
                is_current_year=1 if year == current_date.year else 0
            )
            db.add(dim_time)
            count += 1
    
    db.commit()
    print(f"✅ Added {count} time dimension records")


def populate_dim_region(db: Session):
    """Populate region dimension from existing regions"""
    print("\nPopulating dim_region...")
    
    # Get existing regions
    regions = db.query(Region).all()
    count = 0
    
    for region in regions:
        # Check if already exists
        existing = db.query(DimRegion).filter(
            DimRegion.area_name == region.area_name
        ).first()
        
        if existing:
            continue
        
        # Determine zone based on division
        zone = determine_zone(region.division)
        
        dim_region = DimRegion(
            area_code=region.area_code,
            area_name=region.area_name,
            division=region.division,
            zone=zone,
            region_type='Area',
            is_active=1
        )
        db.add(dim_region)
        count += 1
    
    db.commit()
    print(f"✅ Added {count} region dimension records")


def determine_zone(division: str) -> str:
    """Determine zone based on division"""
    if not division:
        return 'Central'
    
    division_lower = division.lower()
    
    if division_lower in ['dhaka', 'mymensingh']:
        return 'Central'
    elif division_lower in ['chittagong', 'chattogram', 'sylhet']:
        return 'East'
    elif division_lower in ['khulna', 'barisal', 'barishal']:
        return 'South'
    elif division_lower in ['rajshahi', 'rangpur']:
        return 'North'
    else:
        return 'Central'


def populate_dim_product(db: Session):
    """Populate product dimension from existing products"""
    print("\nPopulating dim_product...")
    
    products = db.query(Product).all()
    count = 0
    
    for product in products:
        # Check if already exists
        existing = db.query(DimProduct).filter(
            DimProduct.product_name == product.product_name
        ).first()
        
        if existing:
            continue
        
        dim_product = DimProduct(
            product_name=product.product_name,
            product_category=product.product_category or 'General',
            product_group=product.product_category,  # Use same as category for now
            is_active=1
        )
        db.add(dim_product)
        count += 1
    
    db.commit()
    print(f"✅ Added {count} product dimension records")


def populate_fact_sales(db: Session):
    """Populate fact_sales from sales_monthly and collection_monthly"""
    print("\nPopulating fact_sales...")
    
    # Get all sales records
    sales_records = db.query(SalesMonthly).all()
    count = 0
    
    for sales in sales_records:
        # Get corresponding time dimension
        time_dim = db.query(DimTime).filter(
            DimTime.month == sales.month,
            DimTime.year == sales.year
        ).first()
        
        if not time_dim:
            continue
        
        # Get corresponding region dimension
        old_region = db.query(Region).filter(Region.region_id == sales.region_id).first()
        if not old_region:
            continue
            
        region_dim = db.query(DimRegion).filter(
            DimRegion.area_name == old_region.area_name
        ).first()
        
        if not region_dim:
            continue
        
        # Check if fact already exists
        existing = db.query(FactSales).filter(
            FactSales.region_id == region_dim.region_id,
            FactSales.time_id == time_dim.time_id
        ).first()
        
        if existing:
            continue
        
        # Get collection data
        collection = db.query(CollectionMonthly).filter(
            CollectionMonthly.region_id == sales.region_id,
            CollectionMonthly.month == sales.month,
            CollectionMonthly.year == sales.year
        ).first()
        
        # Calculate metrics
        sales_ach_pct = (sales.net_sales / sales.sales_target * 100) if sales.sales_target else 0
        return_rate = (sales.sales_return / sales.gross_sales * 100) if sales.gross_sales else 0
        
        coll_target = collection.coll_target if collection else 0
        total_coll = collection.total_coll if collection else 0
        cash_coll = collection.cash_coll if collection else 0
        credit_coll = collection.credit_coll if collection else 0
        seed_coll = collection.seed_coll if collection else 0
        coll_ach_pct = (total_coll / coll_target * 100) if coll_target else 0
        
        outstanding = (sales.net_sales or 0) - total_coll
        
        fact = FactSales(
            region_id=region_dim.region_id,
            time_id=time_dim.time_id,
            sales_target=sales.sales_target or 0,
            gross_sales=sales.gross_sales or 0,
            sales_return=sales.sales_return or 0,
            net_sales=sales.net_sales or 0,
            sales_achievement_pct=round(sales_ach_pct, 2),
            coll_target=coll_target,
            total_collection=total_coll,
            cash_collection=cash_coll,
            credit_collection=credit_coll,
            seed_collection=seed_coll,
            coll_achievement_pct=round(coll_ach_pct, 2),
            outstanding=outstanding,
            return_rate_pct=round(return_rate, 2)
        )
        db.add(fact)
        count += 1
    
    db.commit()
    print(f"✅ Added {count} fact_sales records")


def populate_fact_product_performance(db: Session):
    """Populate fact_product_performance from product sales value/volume"""
    print("\nPopulating fact_product_performance...")
    
    # Get all product value records
    value_records = db.query(ProductSalesValue).all()
    count = 0
    
    for value_rec in value_records:
        # Get product dimension
        old_product = db.query(Product).filter(Product.product_id == value_rec.product_id).first()
        if not old_product:
            continue
            
        product_dim = db.query(DimProduct).filter(
            DimProduct.product_name == old_product.product_name
        ).first()
        
        if not product_dim:
            continue
        
        # Get time dimension (use end period)
        time_dim = db.query(DimTime).filter(
            DimTime.month == value_rec.period_end_month,
            DimTime.year == value_rec.period_end_year
        ).first()
        
        if not time_dim:
            continue
        
        # Check if fact already exists
        existing = db.query(FactProductPerformance).filter(
            FactProductPerformance.product_id == product_dim.product_id,
            FactProductPerformance.time_id == time_dim.time_id
        ).first()
        
        if existing:
            continue
        
        # Get corresponding volume record
        volume_rec = db.query(ProductSalesVolume).filter(
            ProductSalesVolume.product_id == value_rec.product_id,
            ProductSalesVolume.period_end_month == value_rec.period_end_month,
            ProductSalesVolume.period_end_year == value_rec.period_end_year
        ).first()
        
        sales_value = value_rec.sales_value or 0
        sales_volume = volume_rec.sales_volume if volume_rec else 0
        
        # For YoY, we'd need previous year data - set to 0 for now
        # In production, query previous year's data
        prev_value = 0
        prev_volume = 0
        
        value_growth = sales_value - prev_value
        volume_growth = sales_volume - prev_volume
        value_growth_pct = (value_growth / prev_value * 100) if prev_value else 0
        volume_growth_pct = (volume_growth / prev_volume * 100) if prev_volume else 0
        
        fact = FactProductPerformance(
            product_id=product_dim.product_id,
            time_id=time_dim.time_id,
            sales_value=sales_value,
            sales_volume=sales_volume,
            prev_year_value=prev_value,
            prev_year_volume=prev_volume,
            value_growth=value_growth,
            volume_growth=volume_growth,
            value_growth_pct=round(value_growth_pct, 2),
            volume_growth_pct=round(volume_growth_pct, 2)
        )
        db.add(fact)
        count += 1
    
    db.commit()
    print(f"✅ Added {count} fact_product_performance records")


def run_migration():
    """Run full migration to star schema"""
    print("=" * 60)
    print("STAR SCHEMA MIGRATION")
    print("Surovi Agro Industries Dashboard")
    print("=" * 60)
    
    # Create tables
    create_star_schema_tables()
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Populate dimensions first
        populate_dim_time(db)
        populate_dim_region(db)
        populate_dim_product(db)
        
        # Then populate facts
        populate_fact_sales(db)
        populate_fact_product_performance(db)
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETE!")
        print("=" * 60)
        
        # Print summary
        print("\nTable Summary:")
        print(f"  dim_time: {db.query(DimTime).count()} records")
        print(f"  dim_region: {db.query(DimRegion).count()} records")
        print(f"  dim_product: {db.query(DimProduct).count()} records")
        print(f"  fact_sales: {db.query(FactSales).count()} records")
        print(f"  fact_product_performance: {db.query(FactProductPerformance).count()} records")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
