using Humanizer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using saitynai_backend.DataTransferObject;
using saitynai_backend.Entities;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            var GroupList = await _context.Groups.ToListAsync();
            if (GroupList == null || GroupList.Count == 0)
            {
                return NotFound("No groups found.");
            }
            return Ok(GroupList);
        }

        [HttpGet("{Id}")]
        public async Task<ActionResult<Group>> GetGroup(int Id)
        {
            var Group = await _context.Groups.FindAsync(Id);
            if (Group == null)
            {
                return NotFound("No group found.");
            }
            return Ok(Group);
        }

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

        [HttpPost]
        public async Task<ActionResult<Group>> CreateFaculty([FromBody] CreateGroupDTO GroupDto)
        {
            if (GroupDto == null || string.IsNullOrWhiteSpace(GroupDto.Name) || GroupDto.StudyYear <= 0 || GroupDto.MentorId <= 0)
            {
                if (GroupDto == null)
                {
                    return BadRequest("Invalid group data.");
                }
                return UnprocessableEntity("Invalid group data.");
            }

            Group group = new Group
            {
                Name = GroupDto.Name,
                StudyYear = GroupDto.StudyYear,
                MentorId = GroupDto.MentorId
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroup), new { id = group }, group);
        }

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
            group.MentorId = dto.MentorId;

            _context.Groups.Update(group);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}