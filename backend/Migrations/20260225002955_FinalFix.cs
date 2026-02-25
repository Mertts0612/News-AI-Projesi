using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace newsai_webapi.Migrations
{
    /// <inheritdoc />
    public partial class FinalFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Buying = table.Column<decimal>(type: "numeric", nullable: false),
                    Selling = table.Column<decimal>(type: "numeric", nullable: false),
                    ChangeRate = table.Column<decimal>(type: "numeric", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "earthquakes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Location = table.Column<string>(type: "text", nullable: false),
                    Magnitude = table.Column<double>(type: "double precision", nullable: false),
                    Date = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_earthquakes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "news",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    OriginalContent = table.Column<string>(type: "text", nullable: false),
                    SourceUrl = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Views = table.Column<int>(type: "integer", nullable: false),
                    ReadTime = table.Column<string>(type: "text", nullable: false),
                    Importance = table.Column<int>(type: "integer", nullable: false),
                    Featured = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_news", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "currencies");

            migrationBuilder.DropTable(
                name: "earthquakes");

            migrationBuilder.DropTable(
                name: "news");
        }
    }
}
