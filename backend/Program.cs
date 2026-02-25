using Microsoft.EntityFrameworkCore; 
using newsai_webapi.Data;
using newsai_webapi.Services;
using newsai_webapi.Workers;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<RssService>();
builder.Services.AddScoped<CurrencyService>();
builder.Services.AddScoped<EquakeService>();
builder.Services.AddScoped<WeatherService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<EarthquakeWorker>();
builder.Services.AddHostedService<CurrencyWorker>();
builder.Services.AddHostedService<NewsWorker>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();
app.UseCors();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
