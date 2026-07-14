using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd_Web_Api.Data;
using BackEnd_Web_Api.Models;


namespace BackEnd_Web_Api.Controllers;


[ApiController]


[Route("api/[controller]")]

public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterUser([FromBody] BackEnd_Web_Api.Models.User user)
    {
        if(string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.PasswordHash))
        {
            return BadRequest("Email и пароль заполни");
        }

        bool userExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == user.Email.ToLower());

        if (userExists)
        {
            return BadRequest("Пользователь с таким Email уже зарегистрирован.");
        }


        user.CreatedAt = DateTime.UtcNow;

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Регистрация прошла успешно!" });

    }
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }
    [HttpPost("login")]
    public async Task<IActionResult> LoginUser([FromBody] BackEnd_Web_Api.Models.User loginData)
    {
        
        if (string.IsNullOrEmpty(loginData.Email) || string.IsNullOrEmpty(loginData.PasswordHash))
        {
            return BadRequest("Email и пароль обязательны для входа.");
        }

        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == loginData.Email.ToLower());

        
        if (user == null || user.PasswordHash != loginData.PasswordHash)
        {
            
            return Unauthorized("Неверный Email или пароль.");
        }

        return Ok(new
        {
            message = "Вход успешно выполнен!",
            username = user.Username,
            email = user.Email
        });
    }
}