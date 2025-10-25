namespace SmartInventory.Core.Entities;

public class Customer
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
