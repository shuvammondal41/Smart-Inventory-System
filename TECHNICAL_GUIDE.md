# Technical Guide - Smart Inventory & Billing System

This document explains the code functionality, database connections, API integration, and how different parts of the system work together.

## Table of Contents
1. [Database Connection Setup](#database-connection-setup)
2. [Backend Architecture](#backend-architecture)
3. [Frontend-Backend Connection](#frontend-backend-connection)
4. [Authentication Implementation](#authentication-implementation)
5. [Key Code Functionality](#key-code-functionality)
6. [Data Flow Examples](#data-flow-examples)

---

## Database Connection Setup

### MySQL Connection in Backend

**Location**: `Backend/SmartInventory.API/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=smart_inventory;user=root;password=yourpassword"
  }
}
```

### Entity Framework Configuration

**Location**: `Backend/SmartInventory.API/Data/ApplicationDbContext.cs`

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    // Database tables as DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<StockAlert> StockAlerts { get; set; }
}
```

### Registering Database in Program.cs

**Location**: `Backend/SmartInventory.API/Program.cs`

```csharp
// Read connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register MySQL with Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
```

**How it works**:
1. `GetConnectionString()` reads from appsettings.json
2. `AddDbContext` registers the database context
3. `UseMySql` tells EF Core to use MySQL provider
4. `ServerVersion.AutoDetect()` automatically detects MySQL version

---

## Backend Architecture

### Project Structure Explained

```
Backend/SmartInventory.API/
├── Controllers/          # Handle HTTP requests
├── Services/            # Business logic
├── Models/              # Database entity classes
├── DTOs/                # Data transfer objects
├── Data/                # Database context
└── Program.cs           # App configuration
```

### How Controllers Work

**Example**: `ProductController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly ProductService _productService;

    // Dependency injection - ProductService automatically provided
    public ProductController(ProductService productService)
    {
        _productService = productService;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] bool? lowStockOnly = null)
    {
        var products = await _productService.GetProductsAsync(lowStockOnly);
        return Ok(products);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(
        [FromBody] CreateProductRequest request)
    {
        var product = await _productService.CreateProductAsync(request);
        return CreatedAtAction(nameof(GetProduct),
            new { id = product.ProductId }, product);
    }
}
```

**Breakdown**:
- `[ApiController]` - Enables API features
- `[Route("api/[controller]")]` - Sets URL path (api/products)
- `[HttpGet]` - Handles GET requests
- `[FromQuery]` - Gets data from URL query string
- `[FromBody]` - Gets data from request body
- `async/await` - Non-blocking operations
- `ActionResult<T>` - Returns HTTP response with data

### Service Layer Pattern

**Example**: `ProductService.cs`

```csharp
public class ProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get products with optional filtering
    public async Task<List<Product>> GetProductsAsync(bool? lowStockOnly)
    {
        var query = _context.Products
            .Include(p => p.Category)  // Join with Category table
            .Where(p => p.IsActive);   // Only active products

        if (lowStockOnly == true)
        {
            // Filter products where stock < minimum
            query = query.Where(p => p.StockQuantity < p.MinStockLevel);
        }

        return await query.ToListAsync();
    }

    // Create new product
    public async Task<Product> CreateProductAsync(CreateProductRequest request)
    {
        // Check if product code already exists
        var exists = await _context.Products
            .AnyAsync(p => p.ProductCode == request.ProductCode);

        if (exists)
            throw new Exception("Product code already exists");

        var product = new Product
        {
            ProductName = request.ProductName,
            ProductCode = request.ProductCode,
            // ... map other properties
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);      // Add to context
        await _context.SaveChangesAsync();   // Save to database

        return product;
    }
}
```

**Key Concepts**:
- `Include()` - Eager loading (SQL JOIN)
- `Where()` - Filtering (SQL WHERE)
- `AnyAsync()` - Check existence
- `Add()` - Mark for insertion
- `SaveChangesAsync()` - Execute SQL and commit

---

## Frontend-Backend Connection

### API Base URL Configuration

**Location**: `Frontend/src/app/core/services/auth.service.ts` (and other services)

```typescript
private apiUrl = 'http://localhost:5000/api';
```

All services use this URL to connect to backend.

### HTTP Client Setup

**Location**: `Frontend/src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),  // Enables HTTP requests
    // ... other providers
  ]
};
```

### Making API Calls

**Example**: `ProductService.ts`

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  // GET request with query parameters
  getProducts(lowStockOnly: boolean = false): Observable<Product[]> {
    let params = new HttpParams();
    if (lowStockOnly) {
      params = params.set('lowStockOnly', 'true');
    }

    // http.get sends GET request and returns Observable
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // POST request with body
  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  // PUT request to update
  updateProduct(id: number, request: UpdateProductRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  // DELETE request
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

**How HTTP calls work**:
1. `HttpClient` is injected via constructor
2. `.get()`, `.post()`, `.put()`, `.delete()` methods make requests
3. Returns `Observable` - doesn't execute until subscribed
4. Generic type `<Product[]>` tells TypeScript expected response type

### Using Services in Components

**Example**: `ProductListComponent.ts`

```typescript
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;

    // Subscribe to execute the HTTP request
    this.productService.getProducts(false).subscribe({
      next: (products) => {
        // Success callback - runs when data arrives
        this.products = products;
        this.loading = false;
        console.log('loaded products:', products.length);
      },
      error: (error) => {
        // Error callback - runs if request fails
        console.error('failed to load products:', error);
        alert('Failed to load products');
        this.loading = false;
      }
    });
  }
}
```

**Flow**:
1. Component injects service
2. Calls service method
3. Service makes HTTP request to backend
4. Backend processes and returns data
5. Observable emits data
6. Subscribe callback updates component state
7. Template re-renders with new data

---

## Authentication Implementation

### Backend JWT Authentication

**1. User Registration**

**Location**: `AuthController.cs`

```csharp
[HttpPost("register")]
public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
{
    // Hash password using BCrypt
    var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

    var user = new User
    {
        FullName = request.FullName,
        Email = request.Email,
        PasswordHash = passwordHash,
        Role = "User"
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Generate JWT token
    var token = GenerateJwtToken(user);

    return Ok(new AuthResponse
    {
        Token = token,
        User = new UserDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        }
    });
}
```

**2. JWT Token Generation**

```csharp
private string GenerateJwtToken(User user)
{
    // Read secret key from configuration
    var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

    // Define claims (user data stored in token)
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.FullName),
        new Claim(ClaimTypes.Role, user.Role)
    };

    // Create token
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddDays(7),
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}
```

**3. User Login**

```csharp
[HttpPost("login")]
public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
{
    // Find user by email
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user == null)
        return Unauthorized(new { message = "Invalid credentials" });

    // Verify password
    bool isValidPassword = BCrypt.Net.BCrypt.Verify(
        request.Password, user.PasswordHash);

    if (!isValidPassword)
        return Unauthorized(new { message = "Invalid credentials" });

    // Generate token
    var token = GenerateJwtToken(user);

    return Ok(new AuthResponse { Token = token, User = /* ... */ });
}
```

### Frontend Authentication

**1. Auth Service**

**Location**: `Frontend/src/app/core/services/auth.service.ts`

```typescript
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  // BehaviorSubject holds current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from localStorage on app start
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`,
      { email, password })
      .pipe(
        tap(response => {
          // Store token and user in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));

          // Update current user state
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Clear storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Redirect to login
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
```

**2. HTTP Interceptor - Auto-attach Token**

**Location**: `Frontend/src/app/core/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone request and add Authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

**How it works**:
- Every HTTP request passes through interceptor
- Interceptor adds `Authorization: Bearer <token>` header
- Backend validates token and extracts user info

**3. Route Guard - Protect Routes**

**Location**: `Frontend/src/app/core/guards/auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return true;  // Allow access
  } else {
    // Redirect to login
    router.navigate(['/auth']);
    return false;  // Block access
  }
};
```

**Applied in routes**:

```typescript
export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],  // Protected route
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductListComponent },
      // ... other protected routes
    ]
  }
];
```

---

## Key Code Functionality

### 1. Billing System - Invoice Creation

**Backend Transaction Handling**

**Location**: `InvoiceService.cs`

```csharp
public async Task<Invoice> CreateInvoiceAsync(CreateInvoiceRequest request)
{
    // Start database transaction
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // Create invoice
        var invoice = new Invoice
        {
            CustomerId = request.CustomerId,
            Subtotal = request.Subtotal,
            TaxAmount = request.TaxAmount,
            DiscountAmount = request.DiscountAmount,
            TotalAmount = request.TotalAmount,
            InvoiceDate = DateTime.UtcNow,
            Items = new List<InvoiceItem>()
        };

        // Process each item
        foreach (var itemDto in request.Items)
        {
            // Get product
            var product = await _context.Products
                .FindAsync(itemDto.ProductId);

            if (product == null)
                throw new Exception($"Product {itemDto.ProductId} not found");

            // Check stock
            if (product.StockQuantity < itemDto.Quantity)
                throw new Exception($"Insufficient stock for {product.ProductName}");

            // Create invoice item
            var item = new InvoiceItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemDto.TotalPrice
            };
            invoice.Items.Add(item);

            // Deduct stock
            product.StockQuantity -= itemDto.Quantity;

            // Create stock alert if needed
            if (product.StockQuantity < product.MinStockLevel)
            {
                var alert = new StockAlert
                {
                    ProductId = product.ProductId,
                    AlertType = product.StockQuantity == 0
                        ? "OutOfStock" : "LowStock",
                    AlertMessage = $"{product.ProductName} is low on stock",
                    IsResolved = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.StockAlerts.Add(alert);
            }
        }

        // Save invoice
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        // Commit transaction - all changes saved together
        await transaction.CommitAsync();

        return invoice;
    }
    catch (Exception)
    {
        // Rollback transaction - undo all changes
        await transaction.RollbackAsync();
        throw;
    }
}
```

**Key Points**:
- Transaction ensures all-or-nothing operation
- If any step fails, entire operation is rolled back
- Stock deduction happens atomically with invoice creation

**Frontend Billing Logic**

**Location**: `BillingComponent.ts`

```typescript
export class BillingComponent {
  cart: CartItem[] = [];
  subtotal = 0;
  taxPercent = 5;
  taxAmount = 0;
  discountAmount = 0;
  total = 0;

  // Add product to cart
  addToCart(product: Product): void {
    // Check if already in cart
    const existing = this.cart.find(item => item.productId === product.productId);

    if (existing) {
      // Increment quantity
      existing.quantity++;
      existing.total = existing.quantity * existing.unitPrice;
    } else {
      // Add new item
      this.cart.push({
        productId: product.productId,
        productName: product.productName,
        unitPrice: product.unitPrice,
        quantity: 1,
        total: product.unitPrice,
        availableStock: product.stockQuantity
      });
    }

    this.updateTotals();
  }

  // Recalculate totals
  updateTotals(): void {
    // Sum all item totals
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax
    this.taxAmount = (this.subtotal * this.taxPercent) / 100;

    // Calculate final total
    this.total = this.subtotal + this.taxAmount - this.discountAmount;
  }

  // Create invoice
  createInvoice(): void {
    const request: CreateInvoiceRequest = {
      customerId: this.customerId,
      subtotal: this.subtotal,
      taxAmount: this.taxAmount,
      discountAmount: this.discountAmount,
      totalAmount: this.total,
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total
      }))
    };

    this.invoiceService.createInvoice(request).subscribe({
      next: (invoice) => {
        alert('Invoice created successfully!');
        this.cart = [];
        this.updateTotals();
        this.loadProducts(); // Refresh stock
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to create invoice');
      }
    });
  }
}
```

### 2. Real-time Search Implementation

**Frontend Search Logic**

```typescript
export class ProductListComponent {
  products: Product[] = [];       // All products
  filteredProducts: Product[] = []; // Displayed products
  searchTerm = '';

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      // Show all if search is empty
      this.filteredProducts = this.products;
      return;
    }

    // Filter by name, code, or category
    this.filteredProducts = this.products.filter(p =>
      p.productName.toLowerCase().includes(term) ||
      p.productCode.toLowerCase().includes(term) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(term))
    );
  }
}
```

**Template Binding**

```html
<!-- Search input -->
<input
  type="text"
  [(ngModel)]="searchTerm"
  (input)="filterProducts()"
  placeholder="Search"
/>

<!-- Display filtered results -->
<tr *ngFor="let product of filteredProducts">
  <td>{{ product.productCode }}</td>
  <td>{{ product.productName }}</td>
  <!-- ... -->
</tr>
```

**How it works**:
1. `[(ngModel)]` creates two-way binding with searchTerm
2. `(input)` event fires on every keystroke
3. `filterProducts()` updates filteredProducts array
4. `*ngFor` re-renders table with new data

### 3. Stock Alert System

**Backend Auto-alert Creation**

This happens in `InvoiceService.CreateInvoiceAsync()` (shown above):

```csharp
// After deducting stock
if (product.StockQuantity < product.MinStockLevel)
{
    var alert = new StockAlert
    {
        ProductId = product.ProductId,
        AlertType = product.StockQuantity == 0 ? "OutOfStock" : "LowStock",
        AlertMessage = $"{product.ProductName} is low on stock",
        CurrentStock = product.StockQuantity,
        MinStockLevel = product.MinStockLevel,
        IsResolved = false,
        CreatedAt = DateTime.UtcNow
    };
    _context.StockAlerts.Add(alert);
}
```

**Frontend Alert Display**

```typescript
export class AnalyticsComponent implements OnInit {
  stockAlerts: StockAlert[] = [];

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    // Get only unresolved alerts
    this.analyticsService.getStockAlerts(true).subscribe({
      next: (alerts) => {
        this.stockAlerts = alerts;
      }
    });
  }

  resolveAlert(alertId: number): void {
    this.analyticsService.resolveStockAlert(alertId).subscribe({
      next: () => {
        // Remove from UI
        this.stockAlerts = this.stockAlerts.filter(a => a.alertId !== alertId);
      }
    });
  }
}
```

---

## Data Flow Examples

### Example 1: User Login Flow

```
1. User enters email/password in LoginComponent
   ↓
2. Component calls authService.login(email, password)
   ↓
3. AuthService makes POST /api/auth/login
   ↓
4. Backend AuthController receives request
   ↓
5. Finds user in database by email
   ↓
6. Verifies password with BCrypt
   ↓
7. Generates JWT token
   ↓
8. Returns { token, user } response
   ↓
9. AuthService saves token to localStorage
   ↓
10. Updates currentUser$ BehaviorSubject
   ↓
11. Router navigates to /dashboard
   ↓
12. AuthGuard checks token - allows access
   ↓
13. Dashboard loads
```

### Example 2: Creating Invoice Flow

```
1. User adds products to cart in BillingComponent
   ↓
2. Each addition calls updateTotals()
   ↓
3. User clicks "Create Invoice"
   ↓
4. Component builds CreateInvoiceRequest object
   ↓
5. Calls invoiceService.createInvoice(request)
   ↓
6. Service makes POST /api/invoices with token in header
   ↓
7. AuthInterceptor adds Authorization header
   ↓
8. Backend validates JWT token
   ↓
9. InvoiceController calls InvoiceService
   ↓
10. Service starts database transaction
   ↓
11. Creates Invoice record
   ↓
12. For each item:
    - Validates product exists
    - Checks stock availability
    - Creates InvoiceItem
    - Deducts stock from Product
    - Creates StockAlert if needed
   ↓
13. Saves all changes to database
   ↓
14. Commits transaction
   ↓
15. Returns created invoice
   ↓
16. Frontend receives response
   ↓
17. Shows success message
   ↓
18. Clears cart
   ↓
19. Reloads products (shows updated stock)
```

### Example 3: Real-time Search Flow

```
1. User types in search box
   ↓
2. (input) event fires
   ↓
3. Calls filterProducts()
   ↓
4. Reads searchTerm value
   ↓
5. Converts to lowercase
   ↓
6. Filters products array:
   - Checks productName contains term
   - Checks productCode contains term
   - Checks categoryName contains term
   ↓
7. Updates filteredProducts array
   ↓
8. Angular change detection runs
   ↓
9. Template re-renders with *ngFor
   ↓
10. Table shows filtered results
```

---

## Common Code Patterns

### Pattern 1: Async Data Loading

```typescript
// Component
export class MyComponent implements OnInit {
  data: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.myService.getData().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
}
```

### Pattern 2: Form Submission

```typescript
saveData(): void {
  const request = {
    field1: this.formData.field1,
    field2: this.formData.field2
  };

  this.myService.save(request).subscribe({
    next: () => {
      alert('Saved successfully!');
      this.closeModal();
      this.loadData();
    },
    error: (error) => {
      alert('Failed to save');
    }
  });
}
```

### Pattern 3: Repository Pattern (Backend)

```csharp
// Service
public async Task<List<Entity>> GetAllAsync()
{
    return await _context.Entities
        .Where(e => e.IsActive)
        .Include(e => e.RelatedEntity)
        .ToListAsync();
}

public async Task<Entity> CreateAsync(CreateRequest request)
{
    var entity = new Entity
    {
        Name = request.Name,
        CreatedAt = DateTime.UtcNow
    };

    _context.Entities.Add(entity);
    await _context.SaveChangesAsync();

    return entity;
}
```

---

## Debugging Tips

### Backend Debugging

1. **Check Console Output**: Backend logs appear in terminal
2. **Breakpoints**: Use Visual Studio or VS Code debugger
3. **SQL Logging**: Add to `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

### Frontend Debugging

1. **Console Logs**: Already added throughout code
2. **Network Tab**: Check browser DevTools → Network
3. **Angular DevTools**: Chrome extension for component inspection
4. **RxJS Debugging**: Add `.pipe(tap(data => console.log(data)))`

### Common Issues

**CORS Error**:
- Check backend `Program.cs` has CORS configured
- Verify frontend URL matches allowed origin

**401 Unauthorized**:
- Token might be expired
- Check localStorage has valid token
- Verify Authorization header is being sent

**Database Connection Error**:
- Check MySQL is running
- Verify connection string
- Test connection manually

---

## Performance Considerations

1. **Lazy Loading**: Routes load components on demand
2. **Async Pipes**: Automatically unsubscribe from observables
3. **Database Indexing**: Primary keys and foreign keys indexed
4. **EF Core Tracking**: Use `.AsNoTracking()` for read-only queries
5. **Pagination**: Can be added for large datasets

---

This guide covers the core technical implementation. For specific questions about a particular feature, refer to the code comments in the respective files.
