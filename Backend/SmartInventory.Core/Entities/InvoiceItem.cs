namespace SmartInventory.Core.Entities;

public class InvoiceItem
{
    public int InvoiceItemId { get; set; }
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
