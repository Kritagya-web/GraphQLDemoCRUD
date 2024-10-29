const Recipe = require("../models/Recipe");

module.exports = {
  Query: {
    async recipe(_, { ID }) {
      if (!ID) {
        throw new Error("ID is required to fetch a recipe");
      }
      const recipe = await Recipe.findById(ID);
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      return recipe;
    },

    async getRecipe(_, { amount }) {
      if (amount && typeof amount !== "number") {
        throw new Error("Amount must be a valid number");
      }
      // Fetch recipes
      const recipes = await Recipe.find()
        .sort({ createdAt: -1 })
        .limit(amount || 10);
      // Check if recipes list is empty
      if (recipes.length === 0) {
        throw new Error("No recipes found");
      }
      return recipes;
    },
  },
  Mutation: {
    async createRecipe(_, { recipeInput: { name, description } }) {
      // Validate required fields
      if (!name || !description) {
        throw new Error("Both name and description are required");
      }
      // Type validation
      if (typeof name !== "string" || typeof description !== "string") {
        throw new Error("Name and description must be strings");
      }
      // Trim and sanitize inputs
      const sanitizedName = name.trim().toLowerCase(); // Convert to lowercase for Checks
      const sanitizedDescription = description.trim();
      // Check for name length
      if (sanitizedName.length < 3 || sanitizedName.length > 50) {
        throw new Error("Name must be between 3 and 50 characters");
      }
      // Check for description length
      if (
        sanitizedDescription.length < 10 ||
        sanitizedDescription.length > 500
      ) {
        throw new Error("Description must be between 10 and 500 characters");
      }
      // Check for duplicate name (case-insensitive)
      const existingRecipe = await Recipe.findOne({ name: sanitizedName });
      if (existingRecipe) {
        throw new Error("A recipe with this name already exists");
      }
      // Create the recipe if validation passes
      const createRecipe = new Recipe({
        name: sanitizedName, // Save the sanitized name
        description: sanitizedDescription,
        createdAt: new Date().toISOString(),
        thumbsUp: 0,
        thumbsDown: 0,
      });
      try {
        // Mongo Save
        const res = await createRecipe.save();
        if (!res) throw new Error("Failed to create recipe");
        return {
          id: res.id,
          ...res._doc,
        };
      } catch (err) {
        console.error("Database error while creating recipe:", err);
        throw new Error("Failed to create recipe due to a database error");
      }
    },
    async deleteRecipe(_, { ID }) {
      // Validate ID
      if (!ID) {
        throw new Error("ID is required to delete a recipe");
      }
      // Check if the recipe exists
      const recipe = await Recipe.findById(ID);
      if (!recipe) {
        throw new Error("Recipe with this ID does not exist");
      }
      // Attempt deletion
      const wasDeleted = (await Recipe.deleteOne({ _id: ID })).deletedCount;
      if (!wasDeleted) {
        throw new Error("Failed to delete recipe");
      }
      return true;
    },
    async editRecipe(_, { ID, recipeInput: { name, description } }) {
      // Validate ID
      if (!ID) {
        throw new Error("ID is required to edit a recipe");
      }
      // Check if the recipe exists
      const recipe = await Recipe.findById(ID);
      if (!recipe) {
        throw new Error("Recipe with this ID does not exist");
      }
      // Validate and sanitize inputs
      if (name) {
        if (typeof name !== "string") {
          throw new Error("Name must be a string");
        }
        const sanitizedName = name.trim();
        if (sanitizedName.length < 3 || sanitizedName.length > 50) {
          throw new Error("Name must be between 3 and 50 characters");
        }
        // Check for duplicate name if name is being updated
        const existingRecipe = await Recipe.findOne({ name: sanitizedName });
        if (existingRecipe && existingRecipe.id !== ID) {
          throw new Error("A recipe with this name already exists");
        }
      }
      if (description) {
        if (typeof description !== "string") {
          throw new Error("Description must be a string");
        }
        const sanitizedDescription = description.trim();
        if (
          sanitizedDescription.length < 10 ||
          sanitizedDescription.length > 500
        ) {
          throw new Error("Description must be between 10 and 500 characters");
        }
      }
      // Perform the update
      const updateFields = {};
      if (name) updateFields.name = name.trim();
      if (description) updateFields.description = description.trim();
      const wasEdited = (await Recipe.updateOne({ _id: ID }, updateFields))
        .modifiedCount;
      if (!wasEdited) {
        throw new Error("Failed to edit recipe");
      }
      return true;
    },
  },
};
