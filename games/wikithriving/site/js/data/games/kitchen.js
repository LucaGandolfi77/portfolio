/* Game: kitchen */
window.GameRegistry.register("kitchen",
{
      stage: 'explorer',
      title: '\uD83C\uDF73 Kitchen Sequencing',
      desc: 'Put the cooking steps in order',
      recipes: [
        {
          name: 'Scrambled Eggs',
          steps: [
            'Crack 2 eggs into a bowl and whisk',
            'Heat butter in a pan over medium heat',
            'Pour eggs into the pan',
            'Stir gently with a spatula',
            'Remove from heat while still slightly wet',
            'Season with salt and pepper'
          ]
        },
        {
          name: 'Pasta with Garlic & Oil',
          steps: [
            'Boil water and add salt',
            'Cook pasta according to package',
            'Slice garlic thinly',
            'Heat olive oil and saut\u00E9 garlic',
            'Drain pasta and add to garlic oil',
            'Toss, season, and serve'
          ]
        },
        {
          name: 'Simple Sandwich',
          steps: [
            'Lay out two slices of bread',
            'Spread butter or mayo on both slices',
            'Add lettuce and tomato on one slice',
            'Add protein (cheese, meat, or hummus)',
            'Close the sandwich and press gently',
            'Cut diagonally and serve'
          ]
        },
        {
          name: 'Rice',
          steps: [
            'Measure 1 cup rice and rinse it',
            'Add 2 cups water to a pot',
            'Bring water to a boil',
            'Add rice, reduce heat to low, cover',
            'Simmer for 15 minutes without lifting lid',
            'Fluff with a fork and serve'
          ]
        },
        {
          name: 'Fruit Salad',
          steps: [
            'Wash all fruits thoroughly',
            'Peel fruits that need peeling',
            'Cut fruits into bite-sized pieces',
            'Put all pieces in a large bowl',
            'Add a squeeze of lemon juice',
            'Toss gently and serve'
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  11. Values Sort
    // ═══════════════════════════════════════════════════
);
