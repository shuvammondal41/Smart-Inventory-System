namespace SmartInventory.Core.DTOs;

public class ProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; }
    public string Unit { get; set; } = "pcs";
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock => StockQuantity <= MinStockLevel;
}

public class CreateProductRequest
{
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; } = 10;
    public string Unit { get; set; } = "pcs";
    public string? ImageUrl { get; set; }
}

public class UpdateProductRequest
{
    public string ProductName { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; }
    public string Unit { get; set; } = "pcs";
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}

public class StockAdjustmentRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string TransactionType { get; set; } = "Adjustment"; // Purchase, Adjustment, Return
    public string? Notes { get; set; }
}
