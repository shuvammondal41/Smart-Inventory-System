namespace SmartInventory.Core.Entities;

public class Product
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; } = 10;
    public string Unit { get; set; } = "pcs";
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Category? Category { get; set; }
    public ICollection<StockAlert> StockAlerts { get; set; } = new List<StockAlert>();
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}
