import CanvasRenderer from './canvas_renderer.js'; // Keep this
import { createSystemInstance } from './system_factory.js'; // This path is fine

document.addEventListener('DOMContentLoaded', () => {
    console.log("GenSys Lab Initializing...");

    // --- DOM Elements ---
    const canvas = document.getElementById('simulation-canvas');
    const systemTypeSelector = document.getElementById('system-type');
    const playPauseButton = document.getElementById('play-pause-button');
    const playIcon = playPauseButton.querySelector('i');
    const stepButton = document.getElementById('step-button');
    const resetButton = document.getElementById('reset-button');
    const clearButton = document.getElementById('clear-button');
    const speedSlider = document.getElementById('speed-slider');
    const speedValueDisplay = document.getElementById('speed-value');
    const paramsContainer = document.getElementById('dynamic-params');
    const currentSystemNameDisplay = document.getElementById('current-system-name');
    const iterationCountDisplay = document.getElementById('iteration-count');
    const populationCountDisplay = document.getElementById('population-count');
    const colorPaletteSelector = document.getElementById('color-palette');
    const gridToggle = document.getElementById('toggle-grid');
    const interactionHint = document.getElementById('interaction-hint');

    if (!canvas || !systemTypeSelector || !playPauseButton || !stepButton || !resetButton || !clearButton || !speedSlider || !paramsContainer || !colorPaletteSelector) {
        console.error("Fatal Error: Core UI element not found!");
        return;
    }

    // --- State Variables ---
    let currentSystem = null;
    let renderer = null;
    let isRunning = false;
    let animationFrameId = null;
    let lastTimestamp = 0;
    let targetInterval = 1000 / 10; // Corresponds to initial speed slider value (10 fps)
    let redrawRequested = false;
    let isMouseDown = false;

    // --- Initialize ---
    function initialize() {
        console.log("Setting up simulation environment...");
        renderer = new CanvasRenderer(canvas);
        loadSystem(systemTypeSelector.value); // Load initial system
        setupEventListeners();
        resizeCanvas(); // Initial size adjustment
        updateUI(); // Set initial UI states
        startAnimationLoop(); // Start the loop paused
        console.log("Lab setup complete.");
    }

    // --- System Loading & Management ---
    function loadSystem(systemId) {
        console.log(`Loading system: ${systemId}`);
        isRunning = false; // Pause on system change
        if (currentSystem && typeof currentSystem.destroy === 'function') {
            currentSystem.destroy(); // Clean up previous system if necessary
        }

        currentSystem = createSystemInstance(systemId, canvas.width, canvas.height);

        if (!currentSystem) {
            console.error(`Failed to create instance for system ID: ${systemId}`);
            paramsContainer.innerHTML = `<p>Error loading system.</p>`;
            return;
        }

        currentSystem.reset();
        populateParameterControls();
        renderer.setVisualizationParams({
             gridEnabled: gridToggle.checked,
             palette: colorPaletteSelector.value
        });
        if (typeof currentSystem.getVisualizationHints === 'function'){
             renderer.updateHints(currentSystem.getVisualizationHints());
        }

        // Prepare pixel buffer for agent systems
        if (systemId === 'agent_slime') {
            renderer.preparePixelBuffer();
        }

        updateUI(); // Update buttons, info display
        requestRedraw(); // Draw initial state
    }

    // --- UI Parameter Generation ---
    function populateParameterControls() {
        paramsContainer.innerHTML = ''; // Clear old controls
        const systemParams = currentSystem.getParameters();
        currentSystemNameDisplay.textContent = currentSystem.name || 'Unknown';

        if (!systemParams || Object.keys(systemParams).length === 0) {
            paramsContainer.innerHTML = `<p>No adjustable parameters for this system.</p>`;
            return;
        }

        systemParams.forEach(param => {
            const controlDiv = document.createElement('div');
            controlDiv.classList.add('param-control');

            const label = document.createElement('label');
            label.htmlFor = `param-${param.id}`;
            label.textContent = param.label;
            label.title = param.tooltip || ''; // Add tooltip
            controlDiv.appendChild(label);

            let inputElement;
            switch(param.type) {
                case 'slider':
                    inputElement = document.createElement('input');
                    inputElement.type = 'range';
                    inputElement.min = param.min;
                    inputElement.max = param.max;
                    inputElement.step = param.step;
                    inputElement.value = currentSystem.getParamValue(param.id);
                    // Add value display span
                    const valueSpan = document.createElement('span');
                    valueSpan.classList.add('param-value-display');
                    valueSpan.textContent = inputElement.value;
                    inputElement.addEventListener('input', (e) => {
                         currentSystem.setParamValue(param.id, parseFloat(e.target.value));
                        valueSpan.textContent = e.target.value;
                    });
                    controlDiv.appendChild(inputElement);
                    controlDiv.appendChild(valueSpan);
                    break;
                 case 'number':
                    inputElement = document.createElement('input');
                    inputElement.type = 'number';
                     if(param.min !== undefined) inputElement.min = param.min;
                    if(param.max !== undefined) inputElement.max = param.max;
                    if(param.step !== undefined) inputElement.step = param.step;
                     inputElement.value = currentSystem.getParamValue(param.id);
                     inputElement.addEventListener('change', (e) => { // Use change for number fields
                         currentSystem.setParamValue(param.id, parseFloat(e.target.value));
                     });
                     controlDiv.appendChild(inputElement);
                     break;
                case 'checkbox':
                     inputElement = document.createElement('input');
                    inputElement.type = 'checkbox';
                    inputElement.checked = currentSystem.getParamValue(param.id);
                     inputElement.addEventListener('change', (e) => {
                         currentSystem.setParamValue(param.id, e.target.checked);
                    });
                    // Checkbox is typically smaller, maybe different layout
                     controlDiv.classList.add('param-control-checkbox');
                     controlDiv.appendChild(inputElement);
                     break;
                 case 'textarea': // For L-System rules etc.
                    inputElement = document.createElement('textarea');
                    inputElement.rows = param.rows || 3;
                     inputElement.value = currentSystem.getParamValue(param.id);
                     // Update on blur might be better for textareas
                    inputElement.addEventListener('blur', (e) => {
                         currentSystem.setParamValue(param.id, e.target.value);
                         currentSystem.reset(); // Need to reset L-System on rule change
                         requestRedraw();
                    });
                     controlDiv.appendChild(inputElement);
                     break;
                case 'button': // Trigger actions
                     inputElement = document.createElement('button');
                    inputElement.textContent = param.buttonText || 'Trigger';
                    inputElement.addEventListener('click', () => {
                         if(typeof currentSystem.triggerAction === 'function'){
                             currentSystem.triggerAction(param.id);
                         }
                         requestRedraw();
                    });
                     controlDiv.appendChild(inputElement);
                     break;

                // Add more types as needed (select, color picker)
                default:
                     inputElement = document.createElement('input');
                     inputElement.type = 'text';
                     inputElement.value = currentSystem.getParamValue(param.id);
                    inputElement.addEventListener('change', (e) => {
                         currentSystem.setParamValue(param.id, e.target.value);
                    });
                    controlDiv.appendChild(inputElement);
            }
            inputElement.id = `param-${param.id}`; // Link label and input
            paramsContainer.appendChild(controlDiv);
        });
    }

    // --- Animation Loop & Simulation Step ---
    function startAnimationLoop() {
        if (!animationFrameId) {
            console.log("Starting animation loop.");
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function stopAnimationLoop() {
        if (animationFrameId) {
            console.log("Stopping animation loop.");
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function animate(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const elapsed = timestamp - lastTimestamp;
        
        if (isRunning && elapsed >= targetInterval) {
            if (currentSystem) {
                currentSystem.step();
                updateUI();
                requestRedraw();
            }
            lastTimestamp = timestamp;
        }
        
        requestAnimationFrame(animate);
    }

    function requestRedraw() {
        if (!redrawRequested) {
            redrawRequested = true;
            requestAnimationFrame(renderFrame);
        }
    }

    function renderFrame(timestamp) {
        if (renderer && currentSystem) {
            renderer.render(currentSystem);
        }
        redrawRequested = false;
    }

    // --- UI Updates & Event Handlers ---
    function updateUI() {
        // Update play/pause button
        playPauseButton.textContent = isRunning ? '⏸' : '▶';
        
        // Update speed display
        speedValueDisplay.textContent = `${speedSlider.value} fps`;
        
        // Update system info
        updateInfoDisplay();
    }

    function updateInfoDisplay() {
        if (currentSystem) {
            currentSystemNameDisplay.textContent = currentSystem.name;
            iterationCountDisplay.textContent = currentSystem.getIteration();
            populationCountDisplay.textContent = currentSystem.getPopulation();
        } else {
            currentSystemNameDisplay.textContent = 'No System';
            iterationCountDisplay.textContent = '0';
            populationCountDisplay.textContent = '-';
        }
    }

    function setupEventListeners() {
        // System Selector
         systemTypeSelector.addEventListener('change', (e) => {
            loadSystem(e.target.value);
         });

        // Simulation Controls
        playPauseButton.addEventListener('click', () => {
            togglePlayPause();
        });
        stepButton.addEventListener('click', () => {
            if (!isRunning) { // Only allow step when paused
                stepSimulation();
                requestRedraw();
            }
         });
        resetButton.addEventListener('click', () => {
            if (currentSystem) {
                isRunning = false; // Pause on reset
                currentSystem.reset();
                updateUI();
                requestRedraw();
                 console.log("Simulation Reset.");
            }
        });
        clearButton.addEventListener('click', () => {
            if (currentSystem) {
                isRunning = false; // Pause on clear
                // First clear the renderer
                renderer.clear();
                // Then reset the system to a blank state
                currentSystem.reset(false); // Pass false to avoid randomization
                updateUI();
                requestRedraw();
                console.log("Simulation Cleared.");
            }
        });
        speedSlider.addEventListener('input', () => {
            updateSpeed();
        });

         // Visualization Controls
        colorPaletteSelector.addEventListener('change', (e) => {
            if (renderer) {
                renderer.setVisualizationParams({ palette: e.target.value });
                requestRedraw();
            }
         });
        gridToggle.addEventListener('change', (e) => {
            if (renderer) {
                 renderer.setVisualizationParams({ gridEnabled: e.target.checked });
                 requestRedraw();
            }
         });

        // Canvas Interaction
        canvas.addEventListener('mousedown', (e) => {
            if (currentSystem && typeof currentSystem.handleMouseDown === 'function') {
                const coords = getCanvasCoords(e);
                if (coords) {
                    isMouseDown = true;
                    currentSystem.handleMouseDown(coords.x, coords.y, e.button);
                    requestRedraw();
                 }
             }
         });
        canvas.addEventListener('mousemove', (e) => {
            if (isMouseDown && currentSystem && typeof currentSystem.handleMouseMove === 'function') {
                const coords = getCanvasCoords(e);
                 if (coords) {
                    currentSystem.handleMouseMove(coords.x, coords.y);
                    requestRedraw();
                }
            }
             // Maybe update interaction hint based on hover?
         });
        canvas.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                 isMouseDown = false;
                if (currentSystem && typeof currentSystem.handleMouseUp === 'function') {
                    const coords = getCanvasCoords(e);
                     if(coords) currentSystem.handleMouseUp(coords.x, coords.y);
                    // Maybe trigger final redraw or action
                     requestRedraw();
                }
             }
         });
         canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent right-click menu


        // Window Resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
             clearTimeout(resizeTimeout);
             resizeTimeout = setTimeout(() => {
                console.log("Window resized.");
                handleResize();
             }, 250); // Debounce resize
        });
     }

     // --- Utility Functions ---
    function getCanvasCoords(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

     function resizeCanvas() {
         const container = canvas.parentElement;
         const width = container.clientWidth;
         const height = container.clientHeight;
         // Check if size actually changed to avoid unnecessary operations
        if(canvas.width !== width || canvas.height !== height){
            canvas.width = width;
             canvas.height = height;
            console.log(`Canvas resized to: ${width}x${height}`);
            return true; // Indicates resize happened
        }
        return false;
     }

    function handleResize() {
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Update canvas size
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        
        // Update renderer
        if (renderer) {
            renderer.resize(canvas.width, canvas.height);
        }
        
        // Update current system
        if (currentSystem) {
            currentSystem.onResize(canvas.width, canvas.height);
        }
        
        // Request redraw
        requestRedraw();
    }

    function handleMouseInteraction(event) {
        if (!currentSystem || !renderer) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (event.type === 'mousedown') {
            isMouseDown = true;
            if (currentSystem.onMouseDown) {
                currentSystem.onMouseDown(x, y);
            }
        } else if (event.type === 'mousemove' && isMouseDown) {
            if (currentSystem.onMouseMove) {
                currentSystem.onMouseMove(x, y);
            }
        } else if (event.type === 'mouseup') {
            isMouseDown = false;
            if (currentSystem.onMouseUp) {
                currentSystem.onMouseUp(x, y);
            }
        }
        
        requestRedraw();
    }

    function updateSpeed() {
        targetInterval = 1000 / parseInt(speedSlider.value, 10);
        speedValueDisplay.textContent = `${speedSlider.value} fps`;
    }

    function togglePlayPause() {
        isRunning = !isRunning;
        updateUI();
        console.log(`Simulation ${isRunning ? 'Started' : 'Paused'}.`);
    }

    function stepSimulation() {
        if (currentSystem && typeof currentSystem.step === 'function') {
            currentSystem.step();
            updateUI();
            requestRedraw();
        }
    }

    function clearSimulation() {
        if (currentSystem && typeof currentSystem.clear === 'function') {
            currentSystem.clear();
            updateUI();
            requestRedraw();
            console.log("Simulation cleared.");
        }
    }

    // --- Start ---
    initialize();
});