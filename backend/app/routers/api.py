from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from io import BytesIO
import math
import os

from app.database import get_db
from app.models_star_schema import DimTime, DimRegion, DimProduct, FactSales, FactProductPerformance
from app.schemas import FileUploadResponse
from app.services.file_processor import (
    process_sales_collection_file, process_product_comparison_file, 
    detect_file_type, get_sample_format_info, generate_sample_template
)

router = APIRouter()


def clean_value(val):
    """Convert NaN/None to 0 for JSON serialization"""
    if val is None:
        return 0
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return 0
    return val


# ============================================================================
# FILE UPLOAD ENDPOINTS
# ============================================================================

@router.get("/upload/sample-format")
def get_upload_sample_format():
    """Get sample format information for file uploads"""
    return get_sample_format_info()


@router.get("/upload/template/{template_type}")
def download_template(template_type: str):
    """
    Download sample Excel template file.
    
    template_type: 'sales_collection' or 'product_comparison'
    """
    if template_type not in ['sales_collection', 'product_comparison']:
        raise HTTPException(status_code=400, detail="Invalid template type. Use 'sales_collection' or 'product_comparison'")
    
    try:
        file_content, filename = generate_sample_template(template_type)
        
        return StreamingResponse(
            file_content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating template: {str(e)}")


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...), 
    month: Optional[int] = Form(None, description="Override month (1-12)"),
    year: Optional[int] = Form(None, description="Override year (e.g., 2025)"),
    db: Session = Depends(get_db)
):
    """
    Upload and process Excel file.
    
    - Automatically detects month/year from filename or Excel content
    - You can override month/year using form parameters
    - Existing data for the same month/year will be REPLACED
    
    Supported file types:
    - Sales & Collection: filename should contain 'sales' and 'collection'
    - Product Comparison: filename should contain 'product' or 'comparison'
    """
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported")
    
    # Validate month/year if provided
    if month is not None and (month < 1 or month > 12):
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    if year is not None and (year < 2020 or year > 2030):
        raise HTTPException(status_code=400, detail="Year must be between 2020 and 2030")
    
    content = await file.read()
    file_content = BytesIO(content)
    
    file_type = detect_file_type(file.filename)
    
    if file_type == 'sales_collection':
        success, message, details = process_sales_collection_file(
            file_content, file.filename, db, 
            override_month=month, override_year=year
        )
    elif file_type == 'product_comparison':
        success, message, details = process_product_comparison_file(
            file_content, file.filename, db,
            override_month=month, override_year=year
        )
    else:
        raise HTTPException(
            status_code=400, 
            detail="Unknown file type. Filename should contain 'Sales_Collection' or 'Product_Comparison'. "
                   "Use GET /api/upload/sample-format to see expected formats."
        )
    
    if not success:
        raise HTTPException(status_code=500, detail=message)
    
    # Calculate meaningful total
    total_records = details.get('fact_sales_inserted', 0) + details.get('fact_records_inserted', 0)
    
    return FileUploadResponse(
        success=success,
        message=message,
        file_type=file_type,
        records_processed=total_records,
        details=details
    )


# ============================================================================
# REGION ENDPOINTS (Using dim_region)
# ============================================================================

@router.get("/regions")
def get_regions(db: Session = Depends(get_db)):
    """Get all regions from dimension table"""
    regions = db.query(DimRegion).filter(DimRegion.is_active == 1).all()
    return [{
        'region_id': r.region_id,
        'area_code': r.area_code,
        'area_name': r.area_name,
        'division': r.division,
        'zone': r.zone,
        'region_type': r.region_type
    } for r in regions]


@router.get("/regions/{region_id}")
def get_region(region_id: int, db: Session = Depends(get_db)):
    """Get region by ID"""
    region = db.query(DimRegion).filter(DimRegion.region_id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return {
        'region_id': region.region_id,
        'area_code': region.area_code,
        'area_name': region.area_name,
        'division': region.division,
        'zone': region.zone,
        'region_type': region.region_type
    }


# ============================================================================
# PRODUCT ENDPOINTS (Using dim_product)
# ============================================================================

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    """Get all products from dimension table"""
    products = db.query(DimProduct).filter(DimProduct.is_active == 1).all()
    return [{
        'product_id': p.product_id,
        'product_code': p.product_code,
        'product_name': p.product_name,
        'product_category': p.product_category,
        'product_group': p.product_group,
        'brand': p.brand,
        'unit_of_measure': p.unit_of_measure
    } for p in products]


# ============================================================================
# TIME DIMENSION ENDPOINTS
# ============================================================================

@router.get("/time-periods")
def get_time_periods(db: Session = Depends(get_db)):
    """Get available time periods"""
    times = db.query(DimTime).order_by(DimTime.year.desc(), DimTime.month.desc()).all()
    return [{
        'time_id': t.time_id,
        'month': t.month,
        'month_name': t.month_name,
        'month_short': t.month_short,
        'quarter': t.quarter,
        'quarter_name': t.quarter_name,
        'year': t.year,
        'fiscal_year': t.fiscal_year
    } for t in times]


# ============================================================================
# SALES ENDPOINTS (Using fact_sales)
# ============================================================================

@router.get("/sales")
def get_sales(month: int = None, year: int = None, db: Session = Depends(get_db)):
    """Get sales data from fact table with optional month/year filter"""
    
    query = db.query(
        FactSales,
        DimRegion.area_name,
        DimRegion.division,
        DimRegion.zone,
        DimTime.month,
        DimTime.year,
        DimTime.month_name
    ).join(
        DimRegion, FactSales.region_id == DimRegion.region_id
    ).join(
        DimTime, FactSales.time_id == DimTime.time_id
    )
    
    if month:
        query = query.filter(DimTime.month == month)
    if year:
        query = query.filter(DimTime.year == year)
    
    results = query.all()
    
    return [{
        'fact_id': r[0].fact_id,
        'region_id': r[0].region_id,
        'area_name': r[1],
        'division': r[2],
        'zone': r[3],
        'month': r[4],
        'year': r[5],
        'month_name': r[6],
        'sales_target': clean_value(r[0].sales_target),
        'gross_sales': clean_value(r[0].gross_sales),
        'sales_return': clean_value(r[0].sales_return),
        'net_sales': clean_value(r[0].net_sales),
        'sales_ach_pct': clean_value(r[0].sales_achievement_pct),
        'return_rate_pct': clean_value(r[0].return_rate_pct)
    } for r in results]


# ============================================================================
# COLLECTION ENDPOINTS (Using fact_sales)
# ============================================================================

@router.get("/collections")
def get_collections(month: int = None, year: int = None, db: Session = Depends(get_db)):
    """Get collection data from fact table with optional month/year filter"""
    
    query = db.query(
        FactSales,
        DimRegion.area_name,
        DimRegion.division,
        DimRegion.zone,
        DimTime.month,
        DimTime.year,
        DimTime.month_name
    ).join(
        DimRegion, FactSales.region_id == DimRegion.region_id
    ).join(
        DimTime, FactSales.time_id == DimTime.time_id
    )
    
    if month:
        query = query.filter(DimTime.month == month)
    if year:
        query = query.filter(DimTime.year == year)
    
    results = query.all()
    
    return [{
        'fact_id': r[0].fact_id,
        'region_id': r[0].region_id,
        'area_name': r[1],
        'division': r[2],
        'zone': r[3],
        'month': r[4],
        'year': r[5],
        'month_name': r[6],
        'coll_target': clean_value(r[0].coll_target),
        'total_coll': clean_value(r[0].total_collection),
        'coll_ach_pct': clean_value(r[0].coll_achievement_pct),
        'cash_coll': clean_value(r[0].cash_collection),
        'credit_coll': clean_value(r[0].credit_collection),
        'seed_coll': clean_value(r[0].seed_collection),
        'outstanding': clean_value(r[0].outstanding)
    } for r in results]


# ============================================================================
# PRODUCT PERFORMANCE ENDPOINTS (Using fact_product_performance)
# ============================================================================

@router.get("/product-sales")
def get_product_sales(month: int = None, year: int = None, db: Session = Depends(get_db)):
    """Get product sales with value and volume from fact table"""
    
    query = db.query(
        FactProductPerformance,
        DimProduct.product_name,
        DimProduct.product_category,
        DimTime.month,
        DimTime.year,
        DimTime.month_name
    ).join(
        DimProduct, FactProductPerformance.product_id == DimProduct.product_id
    ).join(
        DimTime, FactProductPerformance.time_id == DimTime.time_id
    )
    
    if month:
        query = query.filter(DimTime.month == month)
    if year:
        query = query.filter(DimTime.year == year)
    
    results = query.all()
    
    return [{
        'fact_id': r[0].fact_id,
        'product_id': r[0].product_id,
        'product_name': r[1],
        'product_category': r[2],
        'month': r[3],
        'year': r[4],
        'month_name': r[5],
        'sales_value': clean_value(r[0].sales_value),
        'sales_volume': clean_value(r[0].sales_volume),
        'prev_year_value': clean_value(r[0].prev_year_value),
        'prev_year_volume': clean_value(r[0].prev_year_volume),
        'value_growth_pct': clean_value(r[0].value_growth_pct),
        'volume_growth_pct': clean_value(r[0].volume_growth_pct)
    } for r in results]


@router.get("/product-comparison")
def get_product_comparison(db: Session = Depends(get_db)):
    """Get product YoY comparison from fact table"""
    
    products = db.query(DimProduct).filter(DimProduct.is_active == 1).all()
    
    result = []
    for product in products:
        # Get 2024 data
        data_2024 = db.query(FactProductPerformance).join(DimTime).filter(
            FactProductPerformance.product_id == product.product_id,
            DimTime.year == 2024
        ).first()
        
        # Get 2025 data
        data_2025 = db.query(FactProductPerformance).join(DimTime).filter(
            FactProductPerformance.product_id == product.product_id,
            DimTime.year == 2025
        ).first()
        
        value_2024 = clean_value(data_2024.sales_value) if data_2024 else 0
        value_2025 = clean_value(data_2025.sales_value) if data_2025 else 0
        volume_2024 = clean_value(data_2024.sales_volume) if data_2024 else 0
        volume_2025 = clean_value(data_2025.sales_volume) if data_2025 else 0
        
        value_growth = ((value_2025 - value_2024) / value_2024 * 100) if value_2024 > 0 else 0
        volume_growth = ((volume_2025 - volume_2024) / volume_2024 * 100) if volume_2024 > 0 else 0
        
        result.append({
            'product_id': product.product_id,
            'product_name': product.product_name,
            'product_category': product.product_category,
            'value_2024': value_2024,
            'value_2025': value_2025,
            'value_growth_pct': round(clean_value(value_growth), 2),
            'volume_2024': volume_2024,
            'volume_2025': volume_2025,
            'volume_growth_pct': round(clean_value(volume_growth), 2)
        })
    
    return result


# ============================================================================
# DASHBOARD SUMMARY ENDPOINT (Using fact tables)
# ============================================================================

@router.get("/dashboard-summary")
def get_dashboard_summary(month: int = 11, year: int = 2025, db: Session = Depends(get_db)):
    """Get dashboard summary with calculated metrics from fact tables"""
    
    # Get time_id for the specified month/year
    time_dim = db.query(DimTime).filter(
        DimTime.month == month,
        DimTime.year == year
    ).first()
    
    if not time_dim:
        return {
            'sales': {'total_regions': 0, 'total_sales_target': 0, 'total_gross_sales': 0, 'total_net_sales': 0, 'overall_achievement_pct': 0},
            'collection': {'total_coll_target': 0, 'total_collection': 0, 'overall_coll_ach_pct': 0, 'cash_collection': 0, 'credit_collection': 0, 'seed_collection': 0},
            'products': {'total_products': 0, 'total_value_current': 0, 'total_value_previous': 0, 'overall_growth_pct': 0},
            'month': month, 'year': year
        }
    
    # Sales & Collection Summary from fact_sales
    sales_data = db.query(
        func.count(FactSales.fact_id).label('count'),
        func.sum(FactSales.sales_target).label('total_target'),
        func.sum(FactSales.gross_sales).label('total_gross'),
        func.sum(FactSales.net_sales).label('total_net'),
        func.sum(FactSales.coll_target).label('coll_target'),
        func.sum(FactSales.total_collection).label('total_coll'),
        func.sum(FactSales.cash_collection).label('cash_coll'),
        func.sum(FactSales.credit_collection).label('credit_coll'),
        func.sum(FactSales.seed_collection).label('seed_coll')
    ).filter(
        FactSales.time_id == time_dim.time_id
    ).first()
    
    total_target = clean_value(sales_data.total_target)
    total_net = clean_value(sales_data.total_net)
    total_gross = clean_value(sales_data.total_gross)
    coll_target = clean_value(sales_data.coll_target)
    total_coll = clean_value(sales_data.total_coll)
    cash_coll = clean_value(sales_data.cash_coll)
    credit_coll = clean_value(sales_data.credit_coll)
    seed_coll = clean_value(sales_data.seed_coll)
    
    # Product Summary from fact_product_performance
    product_count = db.query(func.count(DimProduct.product_id)).filter(DimProduct.is_active == 1).scalar() or 0
    
    # Current year value
    time_current = db.query(DimTime).filter(DimTime.year == year).all()
    time_ids_current = [t.time_id for t in time_current]
    
    value_current = clean_value(db.query(func.sum(FactProductPerformance.sales_value)).filter(
        FactProductPerformance.time_id.in_(time_ids_current)
    ).scalar()) if time_ids_current else 0
    
    # Previous year value
    time_previous = db.query(DimTime).filter(DimTime.year == year - 1).all()
    time_ids_previous = [t.time_id for t in time_previous]
    
    value_previous = clean_value(db.query(func.sum(FactProductPerformance.sales_value)).filter(
        FactProductPerformance.time_id.in_(time_ids_previous)
    ).scalar()) if time_ids_previous else 0
    
    return {
        'sales': {
            'total_regions': sales_data.count or 0,
            'total_sales_target': total_target,
            'total_gross_sales': total_gross,
            'total_net_sales': total_net,
            'overall_achievement_pct': round((total_net / total_target * 100), 2) if total_target else 0
        },
        'collection': {
            'total_coll_target': coll_target,
            'total_collection': total_coll,
            'overall_coll_ach_pct': round((total_coll / coll_target * 100), 2) if coll_target else 0,
            'cash_collection': cash_coll,
            'credit_collection': credit_coll,
            'seed_collection': seed_coll
        },
        'products': {
            'total_products': product_count,
            'total_value_current': value_current,
            'total_value_previous': value_previous,
            'overall_growth_pct': round(((value_current - value_previous) / value_previous * 100), 2) if value_previous else 0
        },
        'month': month,
        'year': year,
        'month_name': time_dim.month_name,
        'fiscal_year': time_dim.fiscal_year
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/sales-by-zone")
def get_sales_by_zone(month: int = None, year: int = None, db: Session = Depends(get_db)):
    """Get sales aggregated by zone"""
    
    query = db.query(
        DimRegion.zone,
        func.sum(FactSales.sales_target).label('total_target'),
        func.sum(FactSales.net_sales).label('total_sales'),
        func.sum(FactSales.total_collection).label('total_collection')
    ).join(
        FactSales, DimRegion.region_id == FactSales.region_id
    ).join(
        DimTime, FactSales.time_id == DimTime.time_id
    )
    
    if month:
        query = query.filter(DimTime.month == month)
    if year:
        query = query.filter(DimTime.year == year)
    
    results = query.group_by(DimRegion.zone).all()
    
    return [{
        'zone': r[0],
        'total_target': clean_value(r[1]),
        'total_sales': clean_value(r[2]),
        'total_collection': clean_value(r[3]),
        'achievement_pct': round((clean_value(r[2]) / clean_value(r[1]) * 100), 2) if clean_value(r[1]) else 0
    } for r in results]


@router.get("/analytics/top-products")
def get_top_products(limit: int = 10, year: int = 2025, db: Session = Depends(get_db)):
    """Get top products by sales value"""
    
    time_periods = db.query(DimTime).filter(DimTime.year == year).all()
    time_ids = [t.time_id for t in time_periods]
    
    if not time_ids:
        return []
    
    results = db.query(
        DimProduct.product_id,
        DimProduct.product_name,
        DimProduct.product_category,
        func.sum(FactProductPerformance.sales_value).label('total_value'),
        func.sum(FactProductPerformance.sales_volume).label('total_volume')
    ).join(
        FactProductPerformance, DimProduct.product_id == FactProductPerformance.product_id
    ).filter(
        FactProductPerformance.time_id.in_(time_ids)
    ).group_by(
        DimProduct.product_id, DimProduct.product_name, DimProduct.product_category
    ).order_by(
        func.sum(FactProductPerformance.sales_value).desc()
    ).limit(limit).all()
    
    return [{
        'product_id': r[0],
        'product_name': r[1],
        'product_category': r[2],
        'total_value': clean_value(r[3]),
        'total_volume': clean_value(r[4])
    } for r in results]


@router.get("/analytics/monthly-trend")
def get_monthly_trend(year: int = 2025, db: Session = Depends(get_db)):
    """Get monthly sales and collection trend"""
    
    results = db.query(
        DimTime.month,
        DimTime.month_name,
        func.sum(FactSales.net_sales).label('total_sales'),
        func.sum(FactSales.total_collection).label('total_collection')
    ).join(
        FactSales, DimTime.time_id == FactSales.time_id
    ).filter(
        DimTime.year == year
    ).group_by(
        DimTime.month, DimTime.month_name
    ).order_by(
        DimTime.month
    ).all()
    
    return [{
        'month': r[0],
        'month_name': r[1],
        'total_sales': clean_value(r[2]),
        'total_collection': clean_value(r[3])
    } for r in results]
