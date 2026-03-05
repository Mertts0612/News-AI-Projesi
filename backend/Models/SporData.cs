namespace newsai_webapi.Models
{
    public class SporData
    {
        public int Id { get; set; }
        public string HomeTeam { get; set; } = "";
        public string AwayTeam { get; set; } = "";
        public string HomeLogo { get; set; } = "";
        public string AwayLogo { get; set; } = "";
        public string Score { get; set; } = "0 - 0";
        public string Status { get; set; } = "NS"; // NS: Not Started, FT: Finished, LIVE: Canlı
        public DateTime MatchDate { get; set; }
        public string LeagueName { get; set; } = "Süper Lig";
        public string MatchTime { get; set; } = "";
    }
}