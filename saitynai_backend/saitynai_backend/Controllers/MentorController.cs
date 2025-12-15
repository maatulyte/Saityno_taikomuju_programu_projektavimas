using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Xml.Linq;

namespace saitynai_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MentorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MentorController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Coordinator")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mentor>>> GetMentors()
        {
            var MentorsList = await _context.Mentors.ToListAsync();
            if (MentorsList == null || MentorsList.Count == 0)
            {
                return NotFound("No mentors found.");
            }
            var dto = MentorsList
                .Select(Mentor => new ResponseMentorDTO
                {
                    Id = Mentor.Id,
                    Name = Mentor.Name,
                    Surname = Mentor.Surname,
                    Email = Mentor.Email,
                    PhoneNumber = Mentor.PhoneNumber,
                    FacultyId = Mentor.FacultyId,
                    StudyProgram = Mentor.StudyProgram,
                    StudyYear = Mentor.StudyYear,
                    StudyLevel = Mentor.StudyLevel
                })
                .ToList();
            return Ok(dto);
        }

        [Authorize(Roles = "Coordinator")]
        [HttpGet("{Id}")]
        public async Task<ActionResult<Mentor>> GetMentor(string Id)
        {
            var Mentor = await _context.Mentors.FindAsync(Id);
            if (Mentor == null)
            {
                return NotFound("No mentor found.");
            }
            ResponseMentorDTO dto = new ResponseMentorDTO
            {
                Id = Mentor.Id,
                Name = Mentor.Name,
                Surname = Mentor.Surname,
                Email = Mentor.Email,
                PhoneNumber = Mentor.PhoneNumber,
                FacultyId = Mentor.FacultyId,
                StudyProgram = Mentor.StudyProgram,
                StudyYear = Mentor.StudyYear,
                StudyLevel = Mentor.StudyLevel
            };
            return Ok(dto);
        }

        [Authorize(Roles = "Coordinator")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteMentor(string Id)
        {
            var Mentor = await _context.Mentors.FindAsync(Id);
            if (Mentor == null)
            {
                return NotFound("No mentor found.");
            }
            _context.Mentors.Remove(Mentor);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Coordinator")]
        [HttpPost]
        public async Task<ActionResult<Mentor>> CreateMentor([FromBody] CreateMentorDTO MentorDto)
        {
            if (MentorDto == null || string.IsNullOrWhiteSpace(MentorDto.Name) || string.IsNullOrWhiteSpace(MentorDto.Surname) 
                || string.IsNullOrWhiteSpace(MentorDto.Email) || string.IsNullOrWhiteSpace(MentorDto.PhoneNumber)
                || MentorDto.FacultyId <= 0 || string.IsNullOrWhiteSpace(MentorDto.StudyProgram))
            {
                if (MentorDto == null)
                {
                    return BadRequest("Invalid mentor data.");
                }
                return UnprocessableEntity("Invalid mentor data.");
            }

            if (!await _context.Faculties.AnyAsync(f => f.Id == MentorDto.FacultyId))
            {
                return UnprocessableEntity($"Faculty with ID {MentorDto.FacultyId} does not exist.");
            }

            Mentor mentor = new Mentor
            {
                Id = HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub),
                Name = MentorDto.Name,
                Surname = MentorDto.Surname,
                Email = MentorDto.Email,
                PhoneNumber = MentorDto.PhoneNumber,
                FacultyId = MentorDto.FacultyId,
                StudyProgram = MentorDto.StudyProgram,
                StudyYear = MentorDto.StudyYear,
                StudyLevel = MentorDto.StudyLevel,
                UserId = HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            };

            _context.Mentors.Add(mentor);
            await _context.SaveChangesAsync();

            ResponseMentorDTO dto = new ResponseMentorDTO
            {
                Id = mentor.Id,
                Name = mentor.Name,
                Surname = mentor.Surname,
                Email = mentor.Email,
                PhoneNumber = mentor.PhoneNumber,
                FacultyId = mentor.FacultyId,
                StudyProgram = mentor.StudyProgram,
                StudyYear = mentor.StudyYear,
                StudyLevel = mentor.StudyLevel
            };

            return CreatedAtAction(nameof(GetMentor), new { id = mentor }, dto);
        }

        [Authorize(Roles = "Coordinator")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateMentor([FromBody] UpdateMentorDTO dto, string Id)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Surname)
                || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.PhoneNumber)
                || dto.FacultyId <= 0 || string.IsNullOrWhiteSpace(dto.StudyProgram))
            {
                if (dto == null)
                {
                    return BadRequest("Invalid Mentor data.");
                }
                return UnprocessableEntity("Invalid Mentor data.");
            }

            var mentor = await _context.Mentors.FindAsync(Id);

            if (mentor == null)
            {
                return NotFound($"Mentor with ID {Id} not found.");
            }

            if (!await _context.Faculties.AnyAsync(f => f.Id == dto.FacultyId))
            {
                return UnprocessableEntity($"Faculty with ID {dto.FacultyId} does not exist.");
            }

            //TODO: istrint po gynimo
            if (!HttpContext.User.IsInRole("Coordinator") && mentor.UserId != HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub))
            {
                return Forbid();
            }

            mentor.Name = dto.Name;
            mentor.Surname = dto.Surname;
            mentor.Email = dto.Email;
            mentor.PhoneNumber = dto.PhoneNumber;
            mentor.FacultyId = dto.FacultyId;
            mentor.StudyProgram = dto.StudyProgram;
            mentor.StudyYear = dto.StudyYear;
            mentor.StudyLevel = dto.StudyLevel;

            _context.Mentors.Update(mentor);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}