namespace SmartInventory.Core.Entities;

public class StockTransaction
{
    public int TransactionId { get; set; }
    public int ProductId { get; set; }
    public TransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; }
    public int UserId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
    public User User { get; set; } = null!;
}

public enum TransactionType
{
    Purchase,
    Sale,
    Adjustment,
    Return
}
