# Fantasy Management Game

A browser-based fantasy kingdom manager built with HTML/CSS/JS. Generate resources, build structures, manage population, and expand your realm.

## How to Play

1. **Click building buttons** to construct mines, farms, lumber camps, and quarries
2. **Resources generate automatically** every second based on your buildings
3. **Manage population** - population consumes food, happiness affects productivity
4. **Save/load** your progress using the buttons in the top-right
5. **Upgrade buildings** - costs increase with each level

## Controls

| Action | Control |
|--------|---------|
| Purchase building | Click corresponding button |
| Save game | Click "Save" button (top-right) |
| Load game | Click "Load" button (top-right) |
| Remove building | Click × on any building |

## Objective

Expand your kingdom by constructing resource buildings, managing your population, and accumulating wealth. Unlock new building types and optimize your production chain.

## Technical Details

- **Engine**: Pure HTML5 + JavaScript (no external dependencies)
- **Architecture**: Entity-Component-System (ECS) lite pattern
- **Rendering**: DOM manipulation with CSS positioning
- **Save System**: localStorage JSON persistence
- **Tick Interval**: 1 second resource generation
- **Responsive**: Works on mobile and desktop

## Project Structure

```
fantasy-manager/
├── index.html          # Entry point with UI layout
├── style.css           # Styling, responsive design, animations
├── main.js            # Core game engine (265 lines)
├── data/config.json   # Configuration values and balancing
├── entities/player.js  # Player entity class
├── systems/resource-system.js  # Resource tick system
├── save/              # Save/load state directory
└── levels/            # Level/map data directory
```

## Building Types

| Building | Cost | Production | Effect |
|----------|------|------------|--------|
| Gold Mine | 50g | 1g/tick × level^1.5 | +2 max population |
| Lumber Camp | 30w | 1w/tick × level^1.5 | +2 max population |
| Farm | 40f | 1f/tick × level^1.5 | Food for population |
| Quarry | 60s | 1s/tick × level^1.5 | No population bonus |

## Roadmap

### Phase 1: Core Loop ✅
- Resource tick generation ✅
- Building purchase & placement ✅
- Population system ✅
- Save/load functionality ✅
- UI HUD display ✅

### Phase 2: Version 1.0
- Technology tree research
- Random events system (attacks, miracles, crises)
- Achievement system
- Multiple building types (10+)

### Phase 3: Version 2.0
- ECS refactoring for scalability
- Multiple save slots
- Complex AI for random events
- Guild/clan system

### Phase 4: Version 3.0
- Graphics library integration (PixiJS/Phaser)
- Multiplayer sync (WebSockets)
- Custom map editor
- Advanced visual effects

## Extending the Game

### Adding New Buildings

1. **Edit `data/config.json`** - Add building definitions
2. **No code changes required** - The system is data-driven

Example addition:
```json
{
  "type": "tavern",
  "baseCost": { "gold": 100 },
  "productionRate": 1,
  "populationBonus": 5
}
```

### Customizing Balance

Edit values in `data/config.json`:
- `baseRates` - Resource production rates
- `baseCosts` - Building purchase costs
- `costScaling` - Upgrade cost multiplier
- `populationConsumption` - Food consumption per pop

## Playing

1. Open `index.html` in any modern browser
2. Click building buttons to start generating resources
3. Monitor your HUD for resource levels and population
4. Save frequently and experiment with different strategies

## Development

### Prerequisites
- Modern web browser
- Text editor (VS Code, Sublime, etc.)

### Running Locally
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (if live server available)
npx serve

# Then visit http://localhost:8080
```

### Building & Testing
- JavaScript is browser-compatible (no module system)
- All logic tested manually in node environment
- Save/load tested with localStorage
- No build step required - vanilla JS

## License

This project is open source and available for modification.