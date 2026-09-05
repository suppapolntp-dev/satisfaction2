using System.Net;
using System.Text.Json;
using Backend.Common;

namespace Backend.Middlewares;

/// <summary>
/// ExceptionHandlingMiddleware: ดักจับ Unhandled Exceptions ทุกจุดในระบบ
/// แปลง Error ให้เป็น ApiResponse<object> ที่ได้มาตรฐาน และป้องกันไม่ให้ข้อมูล Database หรือ StackTrace รั่วไหลสู่สาธารณะ
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ [Unhandled Exception] เกิดข้อผิดพลาดที่ไม่คาดคิด: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = ApiResponse.Fail("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง", new List<string>
        {
            exception.Message
        });

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        return context.Response.WriteAsync(json);
    }
}

