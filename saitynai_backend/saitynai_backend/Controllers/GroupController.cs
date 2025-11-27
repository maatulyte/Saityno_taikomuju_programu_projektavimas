using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace saitynai_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GroupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Mentor")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Entities.Group>>> GetGroups()
        {
            var GroupList = await _context.Groups.ToListAsync();
            if (GroupList == null || GroupList.Count == 0)
            {
                return NotFound("No groups found.");
            }
            var dto = GroupList
                .Select(Group => new ResponseGroupDTO
                {
                    Id = Group.Id,
                    Name = Group.Name,
                    StudyLevel = Group.StudyLevel,
                    StudyYear = Group.StudyYear,
                    MentorId = Group.MentorId
                })
                .ToList();
            return Ok(dto);
        }

        [Authorize(Roles = "Mentor")]
        [HttpGet("{Id}")]
        public async Task<ActionResult<Entities.Group>> GetGroup(int Id)
        {
            var Group = await _context.Groups.FindAsync(Id);
            if (Group == null)
            {
                return NotFound("No group found.");
            }
            ResponseGroupDTO dto = new ResponseGroupDTO
            {
                Id = Group.Id,
                Name = Group.Name,
                StudyLevel = Group.StudyLevel,
                StudyYear = Group.StudyYear,
                MentorId = Group.MentorId
            };
            return Ok(dto);
        }

        [Authorize(Roles = "Mentor")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteGroup(int Id)
        {
            var Group = await _context.Groups.FindAsync(Id);
            if (Group == null)
            {
                return NotFound("No group found.");
            }
            _context.Groups.Remove(Group);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Mentor")]
        [HttpPost]
        public async Task<ActionResult<Entities.Group>> CreateFaculty([FromBody] CreateGroupDTO GroupDto)
        {
            if (GroupDto == null || string.IsNullOrWhiteSpace(GroupDto.Name) || GroupDto.StudyYear <= 0 || GroupDto.MentorId <= 0)
            {
                if (GroupDto == null)
                {
                    return BadRequest("Invalid group data.");
                }
                return UnprocessableEntity("Invalid group data.");
            }

            Entities.Group group = new Entities.Group
            {
                Name = GroupDto.Name,
                StudyYear = GroupDto.StudyYear,
                StudyLevel = GroupDto.StudyLevel,
                MentorId = GroupDto.MentorId,
                UserId = HttpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            ResponseGroupDTO dto = new ResponseGroupDTO
            {
                Id = group.Id,
                Name = group.Name,
                StudyLevel = group.StudyLevel,
                StudyYear = group.StudyYear,
                MentorId = group.MentorId
            };

            return CreatedAtAction(nameof(GetGroup), new { id = group }, dto);
        }

        [Authorize(Roles = "Mentor")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateGroup([FromBody] UpdateGroupDTO dto, int Id)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || dto.StudyYear <= 0 || dto.MentorId <= 0)
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
             
            var group = await _context.Groups.FindAsync(Id);

            if (group == null)
            {
                return NotFound($"Group with ID {Id} not found.");
            }

            group.Name = dto.Name;
            group.StudyYear = dto.StudyYear;
            group.StudyLevel = dto.StudyLevel;
            group.MentorId = dto.MentorId;

            _context.Groups.Update(group);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}