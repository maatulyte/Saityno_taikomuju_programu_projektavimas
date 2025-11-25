namespace saitynai_backend.DataTransferObject
{
    public class CreateFacultyDTO
    {
        public string Name { get; set; }
        public string Address { get; set; }
    }

    public class UpdateFacultyDTO
    {
        public string Name { get; set; }
        public string Address { get; set; }
    }

    public class ResponseFacultyDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
    }
}