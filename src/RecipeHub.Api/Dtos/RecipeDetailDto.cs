namespace RecipeHub.Api.Dtos;

public record RecipeDetailDto(
    int Id,
    string Title,
    string? Description,
    string Difficulty,
    int PrepTimeMinutes,
    int CookTimeMinutes,
    int Servings,
    string? ImageUrl,
    string[] TagNames,
    RecipeStepDto[] Steps,
    RecipeIngredientDto[] Ingredients,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
