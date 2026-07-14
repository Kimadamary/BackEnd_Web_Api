

using Microsoft.EntityFrameworkCore;
using BackEnd_Web_Api.Models;


namespace BackEnd_Web_Api.Data;
public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
	{ 
	}
    public DbSet<User> Users { get; set; }
}
