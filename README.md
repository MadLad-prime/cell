# Generative Systems Lab

A web-based interactive laboratory for exploring various generative systems including cellular automata, L-systems, and agent-based simulations.

![Generative Systems Lab](screenshot.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Systems](#systems)
  - [Cellular Automata](#cellular-automata)
  - [L-Systems](#l-systems)
  - [Agent Systems](#agent-systems)
- [Controls](#controls)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Generative Systems Lab is an interactive web application that allows users to explore and experiment with various generative systems. The application provides a visual interface for running simulations, adjusting parameters, and observing emergent behaviors.

The project is built using vanilla JavaScript and HTML5 Canvas, with no external dependencies. It follows a modular architecture that makes it easy to add new systems and features.

## Features

- **Multiple Simulation Systems**: Includes Conway's Game of Life, Brian's Brain, L-System Trees, Koch Snowflakes, and Agent-based Slime Mold simulations.
- **Interactive Controls**: Play/pause, step-by-step execution, reset, and clear functionality.
- **Parameter Adjustment**: Real-time adjustment of system parameters with immediate visual feedback.
- **Visualization Options**: Multiple color palettes and grid toggle for enhanced visualization.
- **Responsive Design**: Adapts to different screen sizes and window dimensions.
- **Mouse Interaction**: Direct interaction with simulations through mouse clicks and drags.
- **Performance Optimized**: Efficient rendering and simulation algorithms for smooth performance.

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of JavaScript (for development)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cell.git
   cd cell
   ```

2. Start a local web server:
   ```
   # Using npm's http-server
   npm install -g http-server
   http-server -c-1
   
   # Or using Python
   python -m http.server
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Usage

### Basic Controls

- **Play/Pause**: Start or pause the simulation
- **Step**: Advance the simulation by one step (when paused)
- **Reset**: Reset the simulation to its initial state with randomization
- **Clear**: Clear the simulation to a blank state without randomization
- **Speed Slider**: Adjust the simulation speed (frames per second)
- **System Selector**: Choose between different simulation systems
- **Color Palette**: Select different color schemes for visualization
- **Grid Toggle**: Show or hide the grid overlay

### System-Specific Controls

Each system has its own set of parameters that can be adjusted in real-time:

- **Cellular Automata**: Cell size, initial density
- **L-Systems**: Iterations, angle, axiom, rules, randomness
- **Agent Systems**: Agent count, move speed, turn speed, sensor parameters

### Mouse Interaction

- **Click and Drag**: In cellular automata, toggle cells on/off
- **Click**: In L-systems, trigger regeneration
- **Click and Drag**: In agent systems, influence agent behavior (system-dependent)

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Core Components

- **lab.js**: Main application entry point, handles UI and system management
- **base_system.js**: Base class for all simulation systems
- **canvas_renderer.js**: Handles rendering to the HTML5 Canvas
- **system_factory.js**: Factory for creating system instances

### System Structure

Each simulation system extends the `GenerativeSystem` base class and implements:

- `constructor(width, height)`: Initialize the system
- `reset(randomize)`: Reset the system to initial state
- `step()`: Advance the simulation by one step
- `getParameters()`: Return system parameters for UI
- `getParamValue(paramId)`: Get parameter value
- `setParamValue(paramId, value)`: Set parameter value
- `getVisualizationHints()`: Provide rendering hints
- `getInteractionHint()`: Provide interaction hints
- `handleMouseDown(x, y, button)`: Handle mouse down events
- `handleMouseMove(x, y)`: Handle mouse move events
- `handleMouseUp(x, y)`: Handle mouse up events
- `onResize(newWidth, newHeight)`: Handle window resize
- `destroy()`: Clean up resources

### Rendering Pipeline

1. The animation loop in `lab.js` calls `step()` on the current system
2. The system updates its internal state
3. The renderer is called to visualize the current state
4. The UI is updated with current statistics

## Systems

### Cellular Automata

#### Conway's Game of Life

A classic cellular automaton where cells live or die based on their neighbors:

- **States**: Cells can be alive (1) or dead (0)
- **Rules**:
  - Any live cell with fewer than two live neighbors dies (underpopulation)
  - Any live cell with two or three live neighbors lives
  - Any live cell with more than three live neighbors dies (overpopulation)
  - Any dead cell with exactly three live neighbors becomes alive (reproduction)

#### Brian's Brain

A three-state cellular automaton that simulates neurons:

- **States**: 
  - 0 = OFF (resting)
  - 1 = FIRING (active)
  - 2 = REFRACTORY (recovering)
- **Rules**:
  - FIRING cells become REFRACTORY
  - REFRACTORY cells become OFF
  - OFF cells become FIRING if exactly 2 neighbors are FIRING

### L-Systems

Lindenmayer systems for generating fractal-like structures:

#### L-System Tree

Generates tree-like structures using recursive rules:

- **Parameters**:
  - Iterations: Depth of recursion
  - Angle: Branching angle
  - Axiom: Initial string
  - Rules: Transformation rules
  - Randomness: Variation in angles and lengths

#### Koch Snowflake

Generates the Koch snowflake fractal:

- **Parameters**:
  - Iterations: Depth of recursion
  - Angle: 60 degrees for equilateral triangles
  - Axiom: "F++F++F" (equilateral triangle)
  - Rules: "F" → "F-F++F-F"

### Agent Systems

#### Slime Mold

Simulates the behavior of slime mold using agents that follow trails:

- **Parameters**:
  - Agent Count: Number of agents
  - Move Speed: How fast agents move
  - Turn Speed: How quickly agents can turn
  - Sensor Angle: Angle of side sensors
  - Sensor Distance: How far ahead agents look
  - Deposition Amount: How much trail is left per step
  - Random Steer Strength: How much randomness in steering

## Controls

### UI Elements

- **System Selector**: Dropdown menu to choose the simulation system
- **Play/Pause Button**: Toggle simulation running state
- **Step Button**: Advance simulation by one step (when paused)
- **Reset Button**: Reset simulation to initial state with randomization
- **Clear Button**: Clear simulation to blank state without randomization
- **Speed Slider**: Adjust simulation speed (1-60 fps)
- **Color Palette Selector**: Choose visualization color scheme
- **Grid Toggle**: Show/hide grid overlay
- **Parameter Controls**: Dynamic controls for system-specific parameters
- **Info Display**: Shows current system name, iteration count, and population

### Keyboard Shortcuts

- **Space**: Toggle play/pause
- **Right Arrow**: Step forward (when paused)
- **R**: Reset simulation
- **C**: Clear simulation
- **G**: Toggle grid
- **+/-**: Increase/decrease speed

## Development

### Adding a New System

To add a new system:

1. Create a new file in the `systems` directory
2. Import the `GenerativeSystem` base class
3. Extend the base class and implement required methods
4. Add the system to the `system_factory.js` file
5. Add the system to the system selector in `index.html`

Example:

```javascript
// systems/my_system.js
import { GenerativeSystem } from '../base_system.js';

export class MySystem extends GenerativeSystem {
    constructor(width, height) {
        super(width, height);
        this.name = "My System";
        this.params = {
            // Define parameters
        };
        this.reset();
    }

    reset(randomize = false) {
        super.reset(randomize);
        // Reset logic
    }

    step() {
        // Step logic
        this.iteration++;
    }

    // Implement other required methods
}
```

### Customizing Rendering

The `CanvasRenderer` class handles all rendering. To customize rendering for a specific system:

1. Implement the `getVisualizationHints()` method in your system
2. Add rendering logic in the appropriate method in `CanvasRenderer`

### Performance Optimization

For performance-critical systems:

- Use efficient data structures (e.g., TypedArrays for pixel data)
- Implement dirty region tracking to only render changed areas
- Use requestAnimationFrame for smooth animation
- Consider using Web Workers for computation-heavy systems

## Troubleshooting

### Common Issues

- **Simulation not running**: Check if the play button is pressed and the speed slider is not at zero
- **High CPU usage**: Reduce the number of agents or cells, or lower the simulation speed
- **Visual artifacts**: Try refreshing the page or clearing the simulation
- **Missing systems**: Ensure all system files are properly loaded and registered in the factory

### Browser Compatibility

The application is tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, some features may not work correctly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by various generative art and simulation projects
- Based on classic algorithms and models from computational biology and mathematics
- Thanks to the open-source community for inspiration and tools 