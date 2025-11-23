using Humanizer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mentor>>> GetMentors()
        {
            var MentorsList = await _context.Mentors.ToListAsync();
            if (MentorsList == null || MentorsList.Count == 0)
            {
                return NotFound("No mentors found.");
            }
            return Ok(MentorsList);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Mentor>> GetMentor(int Id)
        {
            var Mentor = await _context.Mentors.FindAsync(Id);
            if (Mentor == null)
            {
                return NotFound("No mentor found.");
            }
            return Ok(Mentor);
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteMentor(int Id)
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

            Mentor mentor = new Mentor
            {
                Name = MentorDto.Name,
                Surname = MentorDto.Surname,
                Email = MentorDto.Email,
                PhoneNumber = MentorDto.PhoneNumber,
                FacultyId = MentorDto.FacultyId,
                StudyProgram = MentorDto.StudyProgram,
                StudyYear = MentorDto.StudyYear,
                StudyLevel = MentorDto.StudyLevel
            };

            _context.Mentors.Add(mentor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMentor), new { id = mentor }, mentor);
        }

        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateMentor([FromBody] UpdateMentorDTO dto, int Id)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Surname)
                || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.PhoneNumber)
                || dto.FacultyId <= 0 || string.IsNullOrWhiteSpace(dto.StudyProgram))
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

            var mentor = await _context.Mentors.FindAsync(Id);

            if (mentor == null)
            {
                return NotFound($"Mentor with ID {Id} not found.");
            }

            mentor.Name = dto.Name;
            mentor.Surname = dto.Surname;
            mentor.Email = dto.Email;
            mentor.PhoneNumber = dto.PhoneNumber;
            mentor.FacultyId = dto.FacultyId;

            _context.Mentors.Update(mentor);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}