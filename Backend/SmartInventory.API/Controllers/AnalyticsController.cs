using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInventory.Core.DTOs;
using SmartInventory.Data;

namespace SmartInventory.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AnalyticsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var todaySales = await _context.Invoices
            .Where(i => i.InvoiceDate >= today)
            .SumAsync(i => i.TotalAmount);

        var todayInvoices = await _context.Invoices
            .Where(i => i.InvoiceDate >= today)
            .CountAsync();

        var lowStockCount = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= p.MinStockLevel)
            .CountAsync();

        var totalProducts = await _context.Products
            .Where(p => p.IsActive)
            .CountAsync();

        var totalCustomers = await _context.Customers.CountAsync();

        var monthSales = await _context.Invoices
            .Where(i => i.InvoiceDate >= startOfMonth)
            .SumAsync(i => i.TotalAmount);

        var activeAlerts = await _context.StockAlerts
            .Where(a => !a.IsResolved)
            .CountAsync();

        return Ok(new DashboardStatsDto
        {
            TodaySales = todaySales,
            TodayInvoices = todayInvoices,
            LowStockProductsCount = lowStockCount,
            TotalProducts = totalProducts,
            TotalCustomers = totalCustomers,
            MonthSales = monthSales,
            ActiveAlerts = activeAlerts
        });
    }

    [HttpGet("daily-sales")]
    public async Task<ActionResult<IEnumerable<SalesReportDto>>> GetDailySales(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var from = fromDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var to = toDate ?? DateTime.UtcNow.Date;

        var sales = await _context.Invoices
            .Where(i => i.InvoiceDate >= from && i.InvoiceDate <= to)
            .GroupBy(i => i.InvoiceDate.Date)
            .Select(g => new SalesReportDto
            {
                Period = g.Key.ToString("yyyy-MM-dd"),
                TotalSales = g.Sum(i => i.TotalAmount),
                TotalInvoices = g.Count(),
                AverageSale = g.Average(i => i.TotalAmount)
            })
            .OrderBy(s => s.Period)
            .ToListAsync();

        return Ok(sales);
    }

    [HttpGet("monthly-sales")]
    public async Task<ActionResult<IEnumerable<SalesReportDto>>> GetMonthlySales([FromQuery] int months = 12)
    {
        var startDate = DateTime.UtcNow.Date.AddMonths(-months);

        var sales = await _context.Invoices
            .Where(i => i.InvoiceDate >= startDate)
            .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
            .Select(g => new SalesReportDto
            {
                Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                TotalSales = g.Sum(i => i.TotalAmount),
                TotalInvoices = g.Count(),
                AverageSale = g.Average(i => i.TotalAmount)
            })
            .OrderBy(s => s.Period)
            .ToListAsync();

        return Ok(sales);
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<IEnumerable<TopProductDto>>> GetTopProducts([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days);

        var topProducts = await _context.InvoiceItems
            .Include(ii => ii.Invoice)
            .Include(ii => ii.Product)
            .Where(ii => ii.Invoice.InvoiceDate >= startDate)
            .GroupBy(ii => new
            {
                ii.ProductId,
                ii.Product.ProductName,
                ii.Product.ProductCode
            })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                ProductCode = g.Key.ProductCode,
                TotalQuantitySold = g.Sum(ii => ii.Quantity),
                TotalRevenue = g.Sum(ii => ii.TotalPrice)
            })
            .OrderByDescending(p => p.TotalRevenue)
            .Take(10)
            .ToListAsync();

        return Ok(topProducts);
    }

    [HttpGet("stock-alerts")]
    public async Task<ActionResult<IEnumerable<StockAlertDto>>> GetStockAlerts([FromQuery] bool unresolvedOnly = true)
    {
        var query = _context.StockAlerts
            .Include(a => a.Product)
            .AsQueryable();

        if (unresolvedOnly)
        {
            query = query.Where(a => !a.IsResolved);
        }

        var alerts = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new StockAlertDto
            {
                AlertId = a.AlertId,
                ProductId = a.ProductId,
                ProductName = a.Product.ProductName,
                ProductCode = a.Product.ProductCode,
                AlertType = a.AlertType.ToString(),
                AlertMessage = a.AlertMessage,
                CurrentStock = a.Product.StockQuantity,
                MinStockLevel = a.Product.MinStockLevel,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(alerts);
    }

    [HttpPost("stock-alerts/{id}/resolve")]
    public async Task<IActionResult> ResolveStockAlert(int id)
    {
        var alert = await _context.StockAlerts.FindAsync(id);

        if (alert == null)
        {
            return NotFound();
        }

        alert.IsResolved = true;
        alert.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Alert resolved successfully" });
    }
}
