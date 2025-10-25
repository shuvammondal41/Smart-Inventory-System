using Microsoft.EntityFrameworkCore;
using SmartInventory.Core.Entities;

namespace SmartInventory.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StockAlert> StockAlerts { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<StockTransaction> StockTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).HasConversion<string>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        });

        // Category Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId);
            entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Product Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProductCode).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.ProductCode).IsUnique();
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.Unit).HasMaxLength(20).HasDefaultValue("pcs");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // StockAlert Configuration
        modelBuilder.Entity<StockAlert>(entity =>
        {
            entity.HasKey(e => e.AlertId);
            entity.Property(e => e.AlertType).HasConversion<string>().IsRequired();
            entity.Property(e => e.AlertMessage).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Product)
                .WithMany(p => p.StockAlerts)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Customer Configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Invoice Configuration
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId);
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.Property(e => e.InvoiceDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.SubTotal).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(10,2)").HasDefaultValue(0);
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(10,2)").HasDefaultValue(0);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.PaymentMethod).HasConversion<string>().IsRequired();
            entity.Property(e => e.PaymentStatus).HasConversion<string>().IsRequired();

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Invoices)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Invoices)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // InvoiceItem Configuration
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(e => e.InvoiceItemId);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10,2)").IsRequired();

            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.InvoiceItems)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.InvoiceItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StockTransaction Configuration
        modelBuilder.Entity<StockTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.Property(e => e.TransactionType).HasConversion<string>().IsRequired();
            entity.Property(e => e.TransactionDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.ReferenceNumber).HasMaxLength(50);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.StockTransactions)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.StockTransactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
