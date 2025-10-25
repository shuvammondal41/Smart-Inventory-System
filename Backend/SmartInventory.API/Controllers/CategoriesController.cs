using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInventory.Data;

namespace SmartInventory.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new
            {
                c.CategoryId,
                c.CategoryName,
                c.Description,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .OrderBy(c => c.CategoryName)
            .ToListAsync();

        return Ok(categories);
    }
}
