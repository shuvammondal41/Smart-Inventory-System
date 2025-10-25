namespace SmartInventory.Core.DTOs;

public class DashboardStatsDto
{
    public decimal TodaySales { get; set; }
    public int TodayInvoices { get; set; }
    public int LowStockProductsCount { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
    public decimal MonthSales { get; set; }
    public int ActiveAlerts { get; set; }
}

public class SalesReportDto
{
    public string Period { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }
    public int TotalInvoices { get; set; }
    public decimal AverageSale { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class StockAlertDto
{
    public int AlertId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty;
    public string? AlertMessage { get; set; }
    public int CurrentStock { get; set; }
    public int MinStockLevel { get; set; }
    public DateTime CreatedAt { get; set; }
}
