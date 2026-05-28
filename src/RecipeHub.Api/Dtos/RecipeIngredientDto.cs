namespace RecipeHub.Api.Dtos;

public record RecipeIngredientDto(int Order, string Name, string? Amount, string? Unit);
