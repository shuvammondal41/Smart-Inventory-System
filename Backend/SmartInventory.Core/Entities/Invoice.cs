namespace SmartInventory.Core.Entities;

public class Invoice
{
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public int UserId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Customer? Customer { get; set; }
    public User User { get; set; } = null!;
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
}

public enum PaymentMethod
{
    Cash,
    Card,
    BankTransfer,
    Other
}

public enum PaymentStatus
{
    Paid,
    Pending,
    Partial
}
