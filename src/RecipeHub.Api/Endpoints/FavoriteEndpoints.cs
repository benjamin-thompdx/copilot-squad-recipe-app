using Microsoft.EntityFrameworkCore;
using RecipeHub.Api.Data;
using RecipeHub.Api.Dtos;
using RecipeHub.Api.Models;

namespace RecipeHub.Api.Endpoints;

public static class FavoriteEndpoints
{
    public static void MapFavoriteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/favorites").WithTags("Favorites");

        group.MapGet("/", GetAllAsync);
        group.MapPost("/", AddAsync);
        group.MapDelete("/{recipeId:int}", RemoveAsync);
    }

    private static async Task<IResult> GetAllAsync(HttpContext http, RecipeDbContext db, CancellationToken ct)
    {
        var userId = http.Request.Headers["X-User-Id"].FirstOrDefault();
        if (string.IsNullOrEmpty(userId))
            return Results.BadRequest(new { error = "X-User-Id header is required." });

        var recipes = await db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .Include(f => f.Recipe)
                .ThenInclude(r => r!.RecipeTags)
                    .ThenInclude(rt => rt.Tag)
            .Select(f => f.Recipe!)
            .OrderBy(r => r.Id)
            .ToListAsync(ct);

        return Results.Ok(recipes.Select(RecipeEndpoints.ToSummaryDto).ToArray());
    }

    private static async Task<IResult> AddAsync(
        AddFavoriteRequest request,
        HttpContext http,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var userId = http.Request.Headers["X-User-Id"].FirstOrDefault();
        if (string.IsNullOrEmpty(userId))
            return Results.BadRequest(new { error = "X-User-Id header is required." });

        var exists = await db.Favorites
            .AnyAsync(f => f.UserId == userId && f.RecipeId == request.RecipeId, ct);

        if (exists)
        {
            var existing = await db.Favorites
                .FirstAsync(f => f.UserId == userId && f.RecipeId == request.RecipeId, ct);
            return Results.Created($"/api/favorites/{existing.RecipeId}",
                new FavoriteDto(existing.Id, existing.RecipeId, existing.CreatedAt));
        }

        var favorite = new Favorite
        {
            UserId = userId,
            RecipeId = request.RecipeId,
            CreatedAt = DateTime.UtcNow
        };

        db.Favorites.Add(favorite);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/favorites/{favorite.RecipeId}",
            new FavoriteDto(favorite.Id, favorite.RecipeId, favorite.CreatedAt));
    }

    private static async Task<IResult> RemoveAsync(
        int recipeId,
        HttpContext http,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var userId = http.Request.Headers["X-User-Id"].FirstOrDefault();
        if (string.IsNullOrEmpty(userId))
            return Results.BadRequest(new { error = "X-User-Id header is required." });

        var favorite = await db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == recipeId, ct);

        if (favorite is not null)
        {
            db.Favorites.Remove(favorite);
            await db.SaveChangesAsync(ct);
        }

        return Results.NoContent();
    }
}

public record AddFavoriteRequest(int RecipeId);
