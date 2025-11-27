using Microsoft.AspNetCore.Identity;
using saitynai_backend.Entities;

namespace Backend.Services
{
    public class IdentitySeeder
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public IdentitySeeder(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task SeedAsync()
        {
            await AddDefaultRolesAsync();
            await AddDefaultAdminUserAsync();
        }

        private async Task AddDefaultRolesAsync()
        {
            string[] roleNames = { "User", "Mentor", "Coordinator", "SysAdmin"};
            foreach (var role in roleNames)
            {
                var roleExists = await _roleManager.RoleExistsAsync(role);
                if (!roleExists)
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private async Task AddDefaultAdminUserAsync()
        {
            var newAdminUser = new User()
            {
                UserName = "admin",
                Email = "admin@admin.com"
            };

            var existingAdminUser = await _userManager.FindByNameAsync("admin");
            if (existingAdminUser != null)
            {
                var createdAdminUser = await _userManager.CreateAsync(newAdminUser, "Admin123!");
                if (createdAdminUser.Succeeded)
                {
                    await _userManager.AddToRoleAsync(newAdminUser, "Admin");
                }
            }
        }
    }
}