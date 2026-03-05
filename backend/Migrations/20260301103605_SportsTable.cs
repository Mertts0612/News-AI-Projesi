using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace newsai_webapi.Migrations
{
    /// <inheritdoc />
    public partial class SportsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HomeTeam = table.Column<string>(type: "text", nullable: false),
                    AwayTeam = table.Column<string>(type: "text", nullable: false),
                    HomeLogo = table.Column<string>(type: "text", nullable: false),
                    AwayLogo = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    MatchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LeagueName = table.Column<string>(type: "text", nullable: false),
                    MatchTime = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Matches");
        }
    }
}
