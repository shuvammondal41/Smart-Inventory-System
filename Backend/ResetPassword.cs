using System;

class Program
{
    static void Main()
    {
        string password = "Admin@123";
        string hash = BCrypt.Net.BCrypt.HashPassword(password);
        Console.WriteLine("Password: " + password);
        Console.WriteLine("Hash: " + hash);

        // Test verification
        bool verified = BCrypt.Net.BCrypt.Verify(password, hash);
        Console.WriteLine("Verification test: " + verified);
    }
}
