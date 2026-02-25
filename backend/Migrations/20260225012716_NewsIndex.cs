using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace newsai_webapi.Migrations
{
    /// <inheritdoc />
    public partial class NewsIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_news_PublishedAt",
                table: "news",
                column: "PublishedAt");

            migrationBuilder.CreateIndex(
                name: "IX_news_Views",
                table: "news",
                column: "Views");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_news_PublishedAt",
                table: "news");

            migrationBuilder.DropIndex(
                name: "IX_news_Views",
                table: "news");
        }
    }
}
