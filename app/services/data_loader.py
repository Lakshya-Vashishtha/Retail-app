from typing import List
from langchain_core.documents import Document
from sqlalchemy.orm import Session
from .. import models as product
from datetime import datetime
from collections import defaultdict

def load_product_and_sales_data(db: Session) -> List[Document]:
    """
    Loads product data and their associated sales history from the database,
    calculates key performance metrics, and formats them as a list of
    LangChain Documents for the RAG system.
    """
    documents = []
    products = db.query(product.Product).all()

    for p in products:
        # --- Basic Information ---
        cost_price_str = f"${p.cost_price:.2f}" if p.cost_price is not None else "N/A"
        content = (
            f"Product Name: {p.name}\n"
            f"Brand: {p.Brand}\n"
            f"Category: {p.category}\n"
            f"Current Stock: {p.quantity}\n"
            f"Retail Price: ${p.price:.2f}\n"
            f"Cost Price: {cost_price_str}\n"
            f"Expiry Date: {p.expiry_date.strftime('%Y-%m-%d') if p.expiry_date else 'N/A'}\n"
        )

        # --- Profitability Analysis ---
        profit_margin = "N/A"
        if p.price and p.cost_price and p.price > 0:
            margin = ((p.price - p.cost_price) / p.price) * 100
            profit_margin = f"{margin:.2f}%"
        
        content += f"Profit Margin: {profit_margin}\n"

        # --- Sales History & Trend Analysis ---
        if p.sales:
            total_units_sold = sum(s.quantity_sold for s in p.sales)
            total_revenue = sum(s.total_price for s in p.sales)
            
            # Calculate total profit from sales
            if p.cost_price is not None:
                total_profit = sum((s.total_price - (p.cost_price * s.quantity_sold)) for s in p.sales)
            else:
                total_profit = 0.0
            content += f"\n--- Lifetime Performance ---\n"
            content += (
                f"Total Units Sold: {total_units_sold}\n"
                f"Total Revenue: ${total_revenue:.2f}\n"
                f"Estimated Total Profit: ${total_profit:.2f}\n"
            )

            # --- Monthly Sales Aggregation & Velocity ---
            monthly_sales = defaultdict(int)
            for s in p.sales:
                month_key = s.sale_date.strftime('%Y-%m')
                monthly_sales[month_key] += s.quantity_sold
            
            if monthly_sales:
                content += "\n--- Monthly Sales Volume ---\n"
                # Sort months chronologically
                sorted_months = sorted(monthly_sales.keys())
                for month in sorted_months:
                    content += f"- {month}: {monthly_sales[month]} units\n"
                
                # Calculate Sales Velocity (average units sold per month)
                num_months_with_sales = len(monthly_sales)
                sales_velocity = total_units_sold / num_months_with_sales if num_months_with_sales > 0 else 0
                content += f"\nSales Velocity: {sales_velocity:.2f} units/month\n"

                # --- Predictive Insights ---
                stock_duration_months = p.quantity / sales_velocity if sales_velocity > 0 else float('inf')
                stock_out_risk = "Low"
                if sales_velocity > 0:
                    if stock_duration_months < 1:
                        stock_out_risk = "High (less than 1 month of stock remaining)"
                    elif stock_duration_months < 2:
                        stock_out_risk = "Medium (1-2 months of stock remaining)"
                
                content += f"Estimated Stock Duration: {stock_duration_months:.1f} months\n"
                content += f"Stock-Out Risk: {stock_out_risk}\n"

        else:
            content += "\nNo sales history available for this product.\n"

        # Create a LangChain Document object
        # doc = Document(
        #     page_content=content,
        #     metadata={
        #         "product_id": p.id,
        #         "product_name": p.name,
        #         "brand": p.Brand,
        #         "quantity": p.quantity,
        #         "price": p.price,
        #         "cost_price": p.cost_price,
        #         "category": p.category,
        #         "expiry_date": p.expiry_date.strftime('%Y-%m-%d')
        #     },
        # )
        # Create a LangChain Document object
        doc = Document(
            page_content=content,
            metadata={
                "product_id": p.id,
                "product_name": p.name,
                "quantity": p.quantity,
                "page_content": content # This is the crucial part that was missing or incorrect
            }
        )
        # documents.append(doc)
        documents.append(doc)
    
    return documents
