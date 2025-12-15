using saitynai_backend.Entities;
using System.Drawing;

namespace saitynai_backend.DTOs;

public record MeDto(
    string Id,
    string UserName,
    string? Email,
    IList<string> Roles
);
