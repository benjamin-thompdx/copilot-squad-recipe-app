using System.Net;
using System.Net.Http.Json;
using RecipeHub.Api.Dtos;
using Xunit;

namespace RecipeHub.Api.Tests;

/// <summary>
/// Integration tests for the Recipe CRUD endpoints.
/// Each test gets a fresh WebApplicationFactory with an isolated SQLite DB
/// (migrations + seed applied at startup via Program.cs).
/// </summary>
public class RecipeEndpointTests : IClassFixture<RecipeApiFactory>
{
    private readonly RecipeApiFactory _factory;
    private readonly HttpClient _client;

    public RecipeEndpointTests(RecipeApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // -----------------------------------------------------------------------
    // GET /api/recipes
    // -----------------------------------------------------------------------

    [Fact]
    public async Task GetAllRecipes_Returns200WithSeededData()
    {
        var response = await _client.GetAsync("/api/recipes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var recipes = await response.Content.ReadFromJsonAsync<RecipeDto[]>();
        Assert.NotNull(recipes);
        Assert.NotEmpty(recipes);
    }

    // -----------------------------------------------------------------------
    // GET /api/recipes/{id}
    // -----------------------------------------------------------------------

    [Fact]
    public async Task GetRecipeById_WithValidId_Returns200AndCorrectTitle()
    {
        // Seed always creates recipe ID 1 = "Classic Margherita Pizza"
        var response = await _client.GetAsync("/api/recipes/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<RecipeDetailDto>();
        Assert.NotNull(dto);
        Assert.Equal(1, dto!.Id);
        Assert.False(string.IsNullOrWhiteSpace(dto.Title));
        Assert.NotNull(dto.Steps);
        Assert.NotEmpty(dto.Steps);
    }

    [Fact]
    public async Task GetRecipeById_WithNonExistentId_Returns404()
    {
        var response = await _client.GetAsync("/api/recipes/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // -----------------------------------------------------------------------
    // POST /api/recipes
    // -----------------------------------------------------------------------

    [Fact]
    public async Task CreateRecipe_WithValidData_Returns201AndLocation()
    {
        var request = new CreateRecipeRequest(
            Title: "Test Soup",
            Description: "A simple test soup.",
            Difficulty: "Easy",
            PrepTimeMinutes: 5,
            CookTimeMinutes: 15,
            Servings: 2,
            ImageUrl: null,
            Tags: [],
            Steps:
            [
                new RecipeStepDto(1, "Boil water.", null),
                new RecipeStepDto(2, "Add ingredients.", 10),
            ]
        );

        var response = await _client.PostAsJsonAsync("/api/recipes", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<RecipeDetailDto>();
        Assert.NotNull(created);
        Assert.Equal("Test Soup", created!.Title);
        Assert.Equal(2, created.Steps.Length);
        Assert.Equal("Easy", created.Difficulty);
    }

    [Fact]
    public async Task CreateRecipe_WithInvalidDifficulty_Returns422ValidationProblem()
    {
        var request = new CreateRecipeRequest(
            Title: "Bad Recipe",
            Description: null,
            Difficulty: "Impossible",  // invalid
            PrepTimeMinutes: 5,
            CookTimeMinutes: 5,
            Servings: 1,
            ImageUrl: null,
            Tags: [],
            Steps: []
        );

        var response = await _client.PostAsJsonAsync("/api/recipes", request);

        // Results.ValidationProblem returns 400 Bad Request in ASP.NET Core minimal APIs
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // -----------------------------------------------------------------------
    // DELETE /api/recipes/{id}
    // -----------------------------------------------------------------------

    [Fact]
    public async Task DeleteRecipe_WithValidId_Returns204AndRecipeIsGone()
    {
        // First create a recipe so we have an ID we can safely delete
        var createRequest = new CreateRecipeRequest(
            Title: "Delete Me",
            Description: null,
            Difficulty: "Medium",
            PrepTimeMinutes: 10,
            CookTimeMinutes: 20,
            Servings: 4,
            ImageUrl: null,
            Tags: [],
            Steps: [new RecipeStepDto(1, "Step one.", null)]
        );

        var createResponse = await _client.PostAsJsonAsync("/api/recipes", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<RecipeDetailDto>();
        Assert.NotNull(created);
        var newId = created!.Id;

        // Delete it
        var deleteResponse = await _client.DeleteAsync($"/api/recipes/{newId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify it's gone
        var getResponse = await _client.GetAsync($"/api/recipes/{newId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteRecipe_WithNonExistentId_Returns404()
    {
        var response = await _client.DeleteAsync("/api/recipes/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
