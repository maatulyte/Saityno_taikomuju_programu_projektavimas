using Microsoft.AspNetCore.Identity;

namespace saitynai_backend.Entities
{
    public class User : IdentityUser
    {
        public string Name { get; set; }
        public string Surname { get; set; }
    }
}
