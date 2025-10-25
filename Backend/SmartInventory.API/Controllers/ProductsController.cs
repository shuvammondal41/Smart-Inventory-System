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
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] bool? lowStockOnly = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool activeOnly = true)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsQueryable();

        if (activeOnly)
        {
            query = query.Where(p => p.IsActive);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (lowStockOnly == true)
        {
            query = query.Where(p => p.StockQuantity <= p.MinStockLevel);
        }

        var products = await query
            .OrderBy(p => p.ProductName)
            .Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductCode = p.ProductCode,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.CategoryName : null,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                StockQuantity = p.StockQuantity,
                MinStockLevel = p.MinStockLevel,
                Unit = p.Unit,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(new ProductDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductCode = product.ProductCode,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.CategoryName,
            Description = product.Description,
            UnitPrice = product.UnitPrice,
            StockQuantity = product.StockQuantity,
            MinStockLevel = product.MinStockLevel,
            Unit = product.Unit,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        // Check if product code already exists
        if (await _context.Products.AnyAsync(p => p.ProductCode == request.ProductCode))
        {
            return BadRequest(new { message = "Product code already exists" });
        }

        var product = new Product
        {
            ProductName = request.ProductName,
            ProductCode = request.ProductCode,
            CategoryId = request.CategoryId,
            Description = request.Description,
            UnitPrice = request.UnitPrice,
            StockQuantity = request.StockQuantity,
            MinStockLevel = request.MinStockLevel,
            Unit = request.Unit,
            ImageUrl = request.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Check if initial stock is low
        if (product.StockQuantity <= product.MinStockLevel)
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
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, new ProductDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductCode = product.ProductCode,
            CategoryId = product.CategoryId,
            Description = product.Description,
            UnitPrice = product.UnitPrice,
            StockQuantity = product.StockQuantity,
            MinStockLevel = product.MinStockLevel,
            Unit = product.Unit,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        var oldStockQuantity = product.StockQuantity;

        product.ProductName = request.ProductName;
        product.CategoryId = request.CategoryId;
        product.Description = request.Description;
        product.UnitPrice = request.UnitPrice;
        product.StockQuantity = request.StockQuantity;
        product.MinStockLevel = request.MinStockLevel;
        product.Unit = request.Unit;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // Check if stock level changed from above minimum to below or vice versa
        if (oldStockQuantity > product.MinStockLevel && product.StockQuantity <= product.MinStockLevel)
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

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        // Soft delete - just mark as inactive
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("adjust-stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdjustStock([FromBody] StockAdjustmentRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Parse transaction type
        if (!Enum.TryParse<TransactionType>(request.TransactionType, out var transactionType))
        {
            return BadRequest(new { message = "Invalid transaction type" });
        }

        var oldStock = product.StockQuantity;
        product.StockQuantity += request.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        // Log stock transaction
        var transaction = new StockTransaction
        {
            ProductId = product.ProductId,
            TransactionType = transactionType,
            Quantity = request.Quantity,
            UserId = userId,
            Notes = request.Notes,
            TransactionDate = DateTime.UtcNow
        };

        _context.StockTransactions.Add(transaction);

        // Check for stock alerts
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

        await _context.SaveChangesAsync();

        return Ok(new { message = "Stock adjusted successfully", newStock = product.StockQuantity });
    }
}
