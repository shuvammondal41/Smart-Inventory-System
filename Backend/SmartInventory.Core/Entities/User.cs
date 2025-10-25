namespace SmartInventory.Core.Entities;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}

public enum UserRole
{
    Admin,
    SalesStaff
}
