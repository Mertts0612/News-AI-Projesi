using newsai_webapi.Services;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<RssService>();
builder.Services.AddScoped<CurrencyService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors(); 

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
