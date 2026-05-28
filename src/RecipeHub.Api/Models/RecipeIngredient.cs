namespace RecipeHub.Api.Models;

public class RecipeIngredient
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public int Order { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Amount { get; set; }
    public string? Unit { get; set; }
    public Recipe? Recipe { get; set; }
}
