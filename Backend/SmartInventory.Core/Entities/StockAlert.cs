namespace SmartInventory.Core.Entities;

public class StockAlert
{
    public int AlertId { get; set; }
    public int ProductId { get; set; }
    public AlertType AlertType { get; set; }
    public string? AlertMessage { get; set; }
    public bool IsResolved { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
}

public enum AlertType
{
    LowStock,
    OutOfStock,
    Reordered
}
