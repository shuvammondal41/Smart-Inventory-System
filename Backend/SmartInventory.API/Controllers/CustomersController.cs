using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInventory.Core.DTOs;
using SmartInventory.Core.Entities;
using SmartInventory.Data;

namespace SmartInventory.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        var customers = await _context.Customers
            .OrderBy(c => c.CustomerName)
            .Select(c => new CustomerDto
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address
            })
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound();
        }

        return Ok(new CustomerDto
        {
            CustomerId = customer.CustomerId,
            CustomerName = customer.CustomerName,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address
        });
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var customer = new Customer
        {
            CustomerName = request.CustomerName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, new CustomerDto
        {
            CustomerId = customer.CustomerId,
            CustomerName = customer.CustomerName,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CreateCustomerRequest request)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound();
        }

        customer.CustomerName = request.CustomerName;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.Address = request.Address;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound();
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
