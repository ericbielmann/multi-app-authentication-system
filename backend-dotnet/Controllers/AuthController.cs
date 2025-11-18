using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackendDotnet.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Hard-coded credentials for testing
    private readonly Dictionary<string, string> _phoneUsers = new()
    {
        { "+1234567890", "123456" }, // phone: OTP
        { "+9876543210", "654321" }
    };

    private readonly Dictionary<string, string> _adminUsers = new()
    {
        { "admin@example.com", "admin123" }, // email: password
        { "supervisor@example.com", "super456" }
    };

    [HttpPost("login/phone")]
    public async Task<IActionResult> LoginWithPhone([FromBody] PhoneLoginRequest request)
    {
        // Validate OTP
        if (_phoneUsers.TryGetValue(request.Phone, out var validOtp) && validOtp == request.Otp)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, $"User {request.Phone}"),
                new("phone", request.Phone),
                new("userType", "regular")
            };

            await SignInUser(claims);

            return Ok(new { success = true, userType = "regular", phone = request.Phone });
        }

        return Unauthorized(new { success = false, message = "Invalid phone or OTP" });
    }

    [HttpPost("login/admin")]
    public async Task<IActionResult> LoginAsAdmin([FromBody] AdminLoginRequest request)
    {
        // Validate credentials
        if (_adminUsers.TryGetValue(request.Email, out var validPassword) && validPassword == request.Password)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, ExtractNameFromEmail(request.Email)),
                new(ClaimTypes.Email, request.Email),
                new("userType", "admin")
            };

            await SignInUser(claims);

            return Ok(new { 
                success = true, 
                userType = "admin", 
                name = ExtractNameFromEmail(request.Email),
                email = request.Email 
            });
        }

        return Unauthorized(new { success = false, message = "Invalid email or password" });
    }

    [HttpGet("session")]
    public IActionResult GetSession()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var userType = User.FindFirst("userType")?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var phone = User.FindFirst("phone")?.Value;

            return Ok(new
            {
                authenticated = true,
                userType,
                name,
                email,
                phone
            });
        }

        return Ok(new { authenticated = false });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { success = true });
    }

    private async Task SignInUser(List<Claim> claims)
    {
        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties
        );
    }

    private string ExtractNameFromEmail(string email)
    {
        var name = email.Split('@')[0];
        return char.ToUpper(name[0]) + name.Substring(1);
    }
}

public record PhoneLoginRequest(string Phone, string Otp);
public record AdminLoginRequest(string Email, string Password);
