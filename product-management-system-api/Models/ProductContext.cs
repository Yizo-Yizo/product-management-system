using Microsoft.EntityFrameworkCore;

namespace product_management_system_api.Models
{
    public class ProductContext : DbContext
    {
        public ProductContext(DbContextOptions<ProductContext> options) : base(options) { }

        public DbSet<Product>? ProductItems { get; set; } = null;
    }
}
