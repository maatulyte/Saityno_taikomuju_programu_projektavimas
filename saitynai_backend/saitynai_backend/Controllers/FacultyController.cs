using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace saitynai_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FacultyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FacultyController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "SysAdmin, Coordinator")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Faculty>>> GetFaculties()
        {
            var FacultyList = await _context.Faculties.ToListAsync();
            if (FacultyList == null || FacultyList.Count == 0)
            {
                return NotFound("No faculties found.");
            }
            var dto = FacultyList
                .Select(Faculty => new ResponseFacultyDTO
                {
                    Id = Faculty.Id,
                    Name = Faculty.Name,
                    Address = Faculty.Address
                })
                .ToList();
            return Ok(dto);
        }

        [Authorize(Roles = "SysAdmin")]
        [HttpGet("{Id}")]
        public async Task<ActionResult<Faculty>> GetFaculty(int Id)
        {
            var Faculty = await _context.Faculties.FindAsync(Id);
            if (Faculty == null)
            {
                return NotFound("No faculty found.");
            }
            ResponseFacultyDTO dto = new ResponseFacultyDTO
            {
                Id = Faculty.Id,
                Name = Faculty.Name,
                Address = Faculty.Address
            };
            return Ok(dto);
        }

        [Authorize(Roles = "SysAdmin")]
        //konkreciu fakulteto mentoriu grupes perziura
        [HttpGet("{FacultyId}/mentors/groups")]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroupsByMentorId(int FacultyId)
        {
            var mentors = await _context.Mentors.Where(p => p.FacultyId == FacultyId)
                .Select(p => p.Id)
                .ToListAsync();
            if (mentors == null || mentors.Count == 0)
            {
                return NotFound($"No mentors found for faculty ID {FacultyId}.");
            }

            var groups = await _context.Groups
                .Where(c => mentors.Contains(c.MentorId))
                .ToListAsync();
            if (groups == null || groups.Count == 0)
            {
                return NotFound($"No groups found for community ID {FacultyId}.");
            }

            var dto = groups
                .Select(group => new ResponseGroupDTO
                {
                    Id = group.Id,
                    Name = group.Name,
                    StudyLevel = group.StudyLevel,
                    StudyYear = group.StudyYear,
                    MentorId = group.MentorId
                })
                .ToList();

            return Ok(dto);
        }

        [Authorize(Roles = "SysAdmin")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteFaculty(int Id)
        {
            var Faculty = await _context.Faculties.FindAsync(Id);
            if (Faculty == null)
            {
                return NotFound("No faculty found.");
            }
            _context.Faculties.Remove(Faculty);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "SysAdmin")]
        [HttpPost]
        public async Task<ActionResult<Faculty>> CreateFaculty([FromBody] CreateFacultyDTO FacultyDto)
        {
            if (FacultyDto == null || string.IsNullOrWhiteSpace(FacultyDto.Name) || string.IsNullOrWhiteSpace(FacultyDto.Address))
            {
                if (FacultyDto == null)
                {
                    return BadRequest("Invalid community data.");
                }
                return UnprocessableEntity("Invalid community data.");
            }

            Faculty faculty = new Faculty
            {
                Name = FacultyDto.Name,
                Address = FacultyDto.Address,
                UserId = HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            };

            _context.Faculties.Add(faculty);
            await _context.SaveChangesAsync();

            ResponseFacultyDTO dto = new ResponseFacultyDTO
            {
                Id = faculty.Id,
                Name = faculty.Name,
                Address = faculty.Address
            };

            return CreatedAtAction(nameof(GetFaculty), new { id = faculty }, dto);
        }

        [Authorize(Roles = "SysAdmin")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateFaculty([FromBody] UpdateFacultyDTO dto, int Id)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Address))
            {
                if (dto == null)
                {
                    return BadRequest("Invalid post data.");
                }
                return UnprocessableEntity("Invalid post data.");
            }

            if (Id <= 0)
            {
                return BadRequest("Invalid post ID.");
            }
             
            var faculty = await _context.Faculties.FindAsync(Id);

            if (faculty == null)
            {
                return NotFound($"Community with ID {Id} not found.");
            }

            faculty.Name = dto.Name;
            faculty.Address = dto.Address;

            _context.Faculties.Update(faculty);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}