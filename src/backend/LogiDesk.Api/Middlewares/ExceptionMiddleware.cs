using System.Net;
using System.Text.Json;
using LogiDesk.Application.Exceptions;

namespace LogiDesk.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning("Handled application exception: {Message} (Status: {StatusCode})", ex.Message, ex.StatusCode);
            await HandleExceptionAsync(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled server error occurred.");
            await HandleExceptionAsync(context, (int)HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.");
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var payload = JsonSerializer.Serialize(new
        {
            statusCode,
            message,
            timestamp = DateTime.UtcNow
        });

        return context.Response.WriteAsync(payload);
    }
}
