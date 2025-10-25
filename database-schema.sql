-- Smart Inventory & Billing Management System Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS SmartInventoryDB;
USE SmartInventoryDB;

-- Users Table (Role-based access)
CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Role ENUM('Admin', 'SalesStaff') NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE Products (
    ProductId INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(200) NOT NULL,
    ProductCode VARCHAR(50) UNIQUE NOT NULL,
    CategoryId INT,
    Description TEXT,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    MinStockLevel INT NOT NULL DEFAULT 10,
    Unit VARCHAR(20) DEFAULT 'pcs',
    ImageUrl VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId) ON DELETE SET NULL,
    INDEX idx_product_code (ProductCode),
    INDEX idx_stock_level (StockQuantity)
);

-- Stock Alerts Table
CREATE TABLE StockAlerts (
    AlertId INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT NOT NULL,
    AlertType ENUM('LowStock', 'OutOfStock', 'Reordered') DEFAULT 'LowStock',
    AlertMessage VARCHAR(500),
    IsResolved BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE,
    INDEX idx_unresolved (IsResolved, CreatedAt)
);

-- Customers Table
CREATE TABLE Customers (
    CustomerId INT AUTO_INCREMENT PRIMARY KEY,
    CustomerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    Phone VARCHAR(20),
    Address TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales/Invoices Table
CREATE TABLE Invoices (
    InvoiceId INT AUTO_INCREMENT PRIMARY KEY,
    InvoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    CustomerId INT,
    UserId INT NOT NULL,
    InvoiceDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SubTotal DECIMAL(10, 2) NOT NULL,
    TaxAmount DECIMAL(10, 2) DEFAULT 0,
    DiscountAmount DECIMAL(10, 2) DEFAULT 0,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('Cash', 'Card', 'Bank Transfer', 'Other') DEFAULT 'Cash',
    PaymentStatus ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Paid',
    Notes TEXT,
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE SET NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    INDEX idx_invoice_date (InvoiceDate),
    INDEX idx_invoice_number (InvoiceNumber)
);

-- Invoice Items Table
CREATE TABLE InvoiceItems (
    InvoiceItemId INT AUTO_INCREMENT PRIMARY KEY,
    InvoiceId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    INDEX idx_invoice (InvoiceId)
);

-- Stock Transactions Table (Audit Trail)
CREATE TABLE StockTransactions (
    TransactionId INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT NOT NULL,
    TransactionType ENUM('Purchase', 'Sale', 'Adjustment', 'Return') NOT NULL,
    Quantity INT NOT NULL,
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UserId INT NOT NULL,
    ReferenceNumber VARCHAR(50),
    Notes TEXT,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    INDEX idx_transaction_date (TransactionDate)
);

-- Insert Default Admin User (password: Admin@123)
INSERT INTO Users (Username, PasswordHash, Email, FullName, Role)
VALUES ('admin', '$2a$11$XrJz9VGYqVHKK8XDHQxVcupWQgqGZLfHXYh9LQvQKLCMD9eiVK.3u', 'admin@smartinventory.com', 'System Administrator', 'Admin');

-- Insert Sample Categories
INSERT INTO Categories (CategoryName, Description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Furniture', 'Office and home furniture'),
('Stationery', 'Office supplies and stationery items'),
('Clothing', 'Apparel and accessories'),
('Food & Beverages', 'Food items and drinks');

-- Insert Sample Products
INSERT INTO Products (ProductName, ProductCode, CategoryId, Description, UnitPrice, StockQuantity, MinStockLevel, Unit) VALUES
('Wireless Mouse', 'ELEC-001', 1, 'Ergonomic wireless mouse with USB receiver', 25.99, 50, 10, 'pcs'),
('Office Chair', 'FURN-001', 2, 'Adjustable office chair with lumbar support', 199.99, 15, 5, 'pcs'),
('A4 Paper Pack', 'STAT-001', 3, 'Pack of 500 sheets A4 paper', 4.99, 100, 20, 'pack'),
('LED Monitor 24"', 'ELEC-002', 1, '24-inch Full HD LED monitor', 149.99, 8, 5, 'pcs'),
('Ballpoint Pen (Box)', 'STAT-002', 3, 'Box of 50 blue ballpoint pens', 12.99, 30, 10, 'box');

-- Create Views for Analytics

-- Daily Sales Summary View
CREATE VIEW vw_DailySales AS
SELECT
    DATE(InvoiceDate) as SaleDate,
    COUNT(InvoiceId) as TotalInvoices,
    SUM(TotalAmount) as TotalSales,
    AVG(TotalAmount) as AverageSale
FROM Invoices
GROUP BY DATE(InvoiceDate);

-- Monthly Sales Summary View
CREATE VIEW vw_MonthlySales AS
SELECT
    YEAR(InvoiceDate) as Year,
    MONTH(InvoiceDate) as Month,
    COUNT(InvoiceId) as TotalInvoices,
    SUM(TotalAmount) as TotalSales,
    AVG(TotalAmount) as AverageSale
FROM Invoices
GROUP BY YEAR(InvoiceDate), MONTH(InvoiceDate);

-- Low Stock Products View
CREATE VIEW vw_LowStockProducts AS
SELECT
    p.ProductId,
    p.ProductName,
    p.ProductCode,
    c.CategoryName,
    p.StockQuantity,
    p.MinStockLevel,
    (p.MinStockLevel - p.StockQuantity) as StockDeficit
FROM Products p
LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
WHERE p.StockQuantity <= p.MinStockLevel AND p.IsActive = TRUE;

-- Top Selling Products View
CREATE VIEW vw_TopSellingProducts AS
SELECT
    p.ProductId,
    p.ProductName,
    p.ProductCode,
    SUM(ii.Quantity) as TotalQuantitySold,
    SUM(ii.TotalPrice) as TotalRevenue,
    COUNT(DISTINCT ii.InvoiceId) as NumberOfSales
FROM InvoiceItems ii
JOIN Products p ON ii.ProductId = p.ProductId
JOIN Invoices i ON ii.InvoiceId = i.InvoiceId
WHERE i.InvoiceDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY p.ProductId, p.ProductName, p.ProductCode
ORDER BY TotalRevenue DESC;

-- Trigger to create stock alert when product goes below minimum level
DELIMITER //

CREATE TRIGGER trg_CheckStockLevel
AFTER UPDATE ON Products
FOR EACH ROW
BEGIN
    IF NEW.StockQuantity <= NEW.MinStockLevel AND OLD.StockQuantity > OLD.MinStockLevel THEN
        INSERT INTO StockAlerts (ProductId, AlertType, AlertMessage)
        VALUES (NEW.ProductId,
                IF(NEW.StockQuantity = 0, 'OutOfStock', 'LowStock'),
                CONCAT('Product "', NEW.ProductName, '" is ',
                       IF(NEW.StockQuantity = 0, 'out of stock', 'running low on stock'),
                       '. Current quantity: ', NEW.StockQuantity,
                       ', Minimum level: ', NEW.MinStockLevel));
    END IF;
END//

-- Trigger to update stock quantity after invoice item is created
CREATE TRIGGER trg_UpdateStockAfterSale
AFTER INSERT ON InvoiceItems
FOR EACH ROW
BEGIN
    UPDATE Products
    SET StockQuantity = StockQuantity - NEW.Quantity
    WHERE ProductId = NEW.ProductId;

    -- Log transaction
    INSERT INTO StockTransactions (ProductId, TransactionType, Quantity, UserId, ReferenceNumber)
    SELECT NEW.ProductId, 'Sale', NEW.Quantity, i.UserId, i.InvoiceNumber
    FROM Invoices i WHERE i.InvoiceId = NEW.InvoiceId;
END//

DELIMITER ;
