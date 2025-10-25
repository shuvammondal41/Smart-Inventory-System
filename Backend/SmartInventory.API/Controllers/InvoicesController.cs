using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInventory.Core.DTOs;
using SmartInventory.Core.Entities;
using SmartInventory.Data;
using System.Security.Claims;

namespace SmartInventory.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InvoicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null)
    {
        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.User)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
            .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(i => i.InvoiceDate <= toDate.Value);
        }

        if (customerId.HasValue)
        {
            query = query.Where(i => i.CustomerId == customerId.Value);
        }

        var invoices = await query
            .OrderByDescending(i => i.InvoiceDate)
            .Select(i => new InvoiceDto
            {
                InvoiceId = i.InvoiceId,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                CustomerName = i.Customer != null ? i.Customer.CustomerName : "Walk-in Customer",
                UserName = i.User.FullName,
                InvoiceDate = i.InvoiceDate,
                SubTotal = i.SubTotal,
                TaxAmount = i.TaxAmount,
                DiscountAmount = i.DiscountAmount,
                TotalAmount = i.TotalAmount,
                PaymentMethod = i.PaymentMethod.ToString(),
                PaymentStatus = i.PaymentStatus.ToString(),
                Notes = i.Notes,
                Items = i.InvoiceItems.Select(ii => new InvoiceItemDto
                {
                    InvoiceItemId = ii.InvoiceItemId,
                    ProductId = ii.ProductId,
                    ProductName = ii.Product.ProductName,
                    ProductCode = ii.Product.ProductCode,
                    Quantity = ii.Quantity,
                    UnitPrice = ii.UnitPrice,
                    TotalPrice = ii.TotalPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.User)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);

        if (invoice == null)
        {
            return NotFound();
        }

        return Ok(new InvoiceDto
        {
            InvoiceId = invoice.InvoiceId,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer?.CustomerName ?? "Walk-in Customer",
            UserName = invoice.User.FullName,
            InvoiceDate = invoice.InvoiceDate,
            SubTotal = invoice.SubTotal,
            TaxAmount = invoice.TaxAmount,
            DiscountAmount = invoice.DiscountAmount,
            TotalAmount = invoice.TotalAmount,
            PaymentMethod = invoice.PaymentMethod.ToString(),
            PaymentStatus = invoice.PaymentStatus.ToString(),
            Notes = invoice.Notes,
            Items = invoice.InvoiceItems.Select(ii => new InvoiceItemDto
            {
                InvoiceItemId = ii.InvoiceItemId,
                ProductId = ii.ProductId,
                ProductName = ii.Product.ProductName,
                ProductCode = ii.Product.ProductCode,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                TotalPrice = ii.TotalPrice
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest(new { message = "Invoice must have at least one item" });
        }

        // Get user ID from token
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Generate invoice number
        var invoiceNumber = await GenerateInvoiceNumber();

        // Calculate totals
        decimal subTotal = 0;
        var invoiceItems = new List<InvoiceItem>();

        foreach (var item in request.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product == null)
            {
                return BadRequest(new { message = $"Product with ID {item.ProductId} not found" });
            }

            if (product.StockQuantity < item.Quantity)
            {
                return BadRequest(new { message = $"Insufficient stock for product '{product.ProductName}'. Available: {product.StockQuantity}, Requested: {item.Quantity}" });
            }

            var itemTotal = product.UnitPrice * item.Quantity;
            subTotal += itemTotal;

            invoiceItems.Add(new InvoiceItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.UnitPrice,
                TotalPrice = itemTotal
            });
        }

        var totalAmount = subTotal + request.TaxAmount - request.DiscountAmount;

        // Parse payment enums
        if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, out var paymentMethod))
        {
            return BadRequest(new { message = "Invalid payment method" });
        }

        if (!Enum.TryParse<PaymentStatus>(request.PaymentStatus, out var paymentStatus))
        {
            return BadRequest(new { message = "Invalid payment status" });
        }

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = request.CustomerId,
            UserId = userId,
            InvoiceDate = DateTime.UtcNow,
            SubTotal = subTotal,
            TaxAmount = request.TaxAmount,
            DiscountAmount = request.DiscountAmount,
            TotalAmount = totalAmount,
            PaymentMethod = paymentMethod,
            PaymentStatus = paymentStatus,
            Notes = request.Notes,
            InvoiceItems = invoiceItems
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Update stock quantities and create stock transactions
        foreach (var item in invoice.InvoiceItems)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                var oldStock = product.StockQuantity;
                product.StockQuantity -= item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                // Create stock transaction
                var transaction = new StockTransaction
                {
                    ProductId = product.ProductId,
                    TransactionType = TransactionType.Sale,
                    Quantity = -item.Quantity,
                    UserId = userId,
                    ReferenceNumber = invoiceNumber,
                    TransactionDate = DateTime.UtcNow
                };
                _context.StockTransactions.Add(transaction);

                // Check for low stock alert
                if (oldStock > product.MinStockLevel && product.StockQuantity <= product.MinStockLevel)
                {
                    var alert = new StockAlert
                    {
                        ProductId = product.ProductId,
                        AlertType = product.StockQuantity == 0 ? AlertType.OutOfStock : AlertType.LowStock,
                        AlertMessage = $"Product '{product.ProductName}' is {(product.StockQuantity == 0 ? "out of stock" : "running low on stock")}. Current quantity: {product.StockQuantity}, Minimum level: {product.MinStockLevel}",
                        IsResolved = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.StockAlerts.Add(alert);
                }
            }
        }

        await _context.SaveChangesAsync();

        // Reload invoice with related data
        var createdInvoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.User)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
            .FirstOrDefaultAsync(i => i.InvoiceId == invoice.InvoiceId);

        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.InvoiceId }, new InvoiceDto
        {
            InvoiceId = createdInvoice!.InvoiceId,
            InvoiceNumber = createdInvoice.InvoiceNumber,
            CustomerId = createdInvoice.CustomerId,
            CustomerName = createdInvoice.Customer?.CustomerName ?? "Walk-in Customer",
            UserName = createdInvoice.User.FullName,
            InvoiceDate = createdInvoice.InvoiceDate,
            SubTotal = createdInvoice.SubTotal,
            TaxAmount = createdInvoice.TaxAmount,
            DiscountAmount = createdInvoice.DiscountAmount,
            TotalAmount = createdInvoice.TotalAmount,
            PaymentMethod = createdInvoice.PaymentMethod.ToString(),
            PaymentStatus = createdInvoice.PaymentStatus.ToString(),
            Notes = createdInvoice.Notes,
            Items = createdInvoice.InvoiceItems.Select(ii => new InvoiceItemDto
            {
                InvoiceItemId = ii.InvoiceItemId,
                ProductId = ii.ProductId,
                ProductName = ii.Product.ProductName,
                ProductCode = ii.Product.ProductCode,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                TotalPrice = ii.TotalPrice
            }).ToList()
        });
    }

    private async Task<string> GenerateInvoiceNumber()
    {
        var today = DateTime.UtcNow;
        var prefix = $"INV-{today:yyyyMMdd}";

        var lastInvoice = await _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        if (lastInvoice == null)
        {
            return $"{prefix}-001";
        }

        var lastNumber = int.Parse(lastInvoice.InvoiceNumber.Split('-').Last());
        return $"{prefix}-{(lastNumber + 1):D3}";
    }
}
