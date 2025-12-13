using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;
using saitynai_backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.Pkcs;

namespace saitynai_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly SessionService _sessionService;

        public UserController(
            AppDbContext context,
            UserManager<User> userManager,
            JwtTokenService jwtTokenService,
            SessionService sessionService)
        {
            _context = context;
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _sessionService = sessionService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> registerUser([FromBody] UserRegisterDTO dto)
        {
            var checkUser = await _userManager.FindByNameAsync(dto.Username);
            if (checkUser != null)
            {
                return UnprocessableEntity("Username already exists.");
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Surname)
                        || string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email)
                        || string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto == null)
                {
                    return BadRequest("Invalid user data.");
                }
                return UnprocessableEntity("Invalid user data.");
            }

            User user = new User
            {
                Name = dto.Name,
                Surname = dto.Surname,
                UserName = dto.Username,
                Email = dto.Email
            };
            
            var createdUserResult = await _userManager.CreateAsync(user, dto.Password);
            if (!createdUserResult.Succeeded)
            {
                var errors = createdUserResult.Errors.Select(e => new
                {
                    Code = e.Code,
                    Description = e.Description
                });

                return StatusCode(StatusCodes.Status422UnprocessableEntity, new
                {
                    Message = "User creation failed",
                    Errors = errors
                });
            }

            var role = await _userManager.AddToRoleAsync(user, "SysAdmin");
            if (role == null)
            {
                return UnprocessableEntity("Assigning role failed.");
            }

            return Created();
        }

        [HttpPost("login")]
        public async Task<IActionResult> loginUser([FromBody] UserLoginDTO dto)
        {
            var checkUser = await _userManager.FindByNameAsync(dto.Username);
            if (checkUser == null)
            {
                return UnprocessableEntity("User does not exist.");
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.Username) 
                            || string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto == null)
                {
                    return BadRequest("Invalid user data.");
                }
                return UnprocessableEntity("Invalid user data.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(checkUser, dto.Password);
            if (!isPasswordValid)
            {
                return UnprocessableEntity("Incorrect username or password.");
            }

            var roles = await _userManager.GetRolesAsync(checkUser);

            var sessionId = Guid.NewGuid();
            var expiresAt = DateTime.UtcNow.AddDays(3);
            var accessToken = _jwtTokenService.CreateAccessToken(checkUser.UserName, checkUser.Id.ToString(), roles);
            var refreshToken = _jwtTokenService.CreateRefreshToken(sessionId, checkUser.Id, expiresAt);

            await _sessionService.CreateSessionAsync(sessionId, checkUser.Id, refreshToken, expiresAt);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = expiresAt
            };

            HttpContext.Response.Cookies.Append("RefreshToken", refreshToken, cookieOptions);

            return Ok(new SuccessfulLoginDTO(accessToken));
        }

        [HttpPost("accessToken")]
        public async Task<ActionResult<string>> getAccessToken()
        {
            if (!HttpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken))
            {
                return Unauthorized("Refresh token not found.");
            }

            if (!_jwtTokenService.TryParseRefreshToken(refreshToken, out var claims))
            {
                return Unauthorized("Invalid refresh token.");
            }

            var sessionId = claims.FindFirstValue("SessionId");
            if (sessionId == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            var sessionIdAsGuid = Guid.Parse(sessionId);
            if (!await _sessionService.IsSessionValidAsync(sessionIdAsGuid, refreshToken))
            {
                return Unauthorized("Invalid refresh token.");
            }

            var userId = claims.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return UnprocessableEntity("User not found.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var expiresAt = DateTime.UtcNow.AddDays(3);
            var accessToken = _jwtTokenService.CreateAccessToken(user.UserName, user.Id, roles);
            var newRefreshToken = _jwtTokenService.CreateRefreshToken(sessionIdAsGuid, user.Id, expiresAt);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = expiresAt
            };

            HttpContext.Response.Cookies.Append("RefreshToken", newRefreshToken, cookieOptions);

            await _sessionService.ExtendSessionAsync(sessionIdAsGuid, newRefreshToken, expiresAt);

            return Ok(new SuccessfulLoginDTO(accessToken));
        }

        [HttpPost("logout")]
        public async Task<ActionResult<string>> logout()
        {
            if (!HttpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken))
            {
                return Unauthorized("Refresh token not found.");
            }
            if (!_jwtTokenService.TryParseRefreshToken(refreshToken, out var claims))
            {
                return Unauthorized("Invalid refresh token.");
            }

            var sessionId = claims.FindFirstValue("SessionId");
            if (sessionId == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            await _sessionService.InvalidateSessionAsync(Guid.Parse(sessionId));

            HttpContext.Response.Cookies.Delete("RefreshToken");

            return Ok();
        }

        public record SuccessfulLoginDTO(string AccessToken);
    }
}
