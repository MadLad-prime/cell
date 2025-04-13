// --- System Factory Module ---
// Import classes from their dedicated files
import { ConwayLife, BrianBrain } from './systems/cellular_automata.js';
import { LSystemTree, KochSnowflake } from './systems/l_system.js';
import { SlimeMold } from './systems/agent_system.js';
import { GenerativeSystem } from './base_system.js';

// --- Mapping from System ID to Class ---
const systemRegistry = {
    'ca_life': ConwayLife,
    'ca_brain': BrianBrain,          // NEW
    'l_system_tree': LSystemTree,
    'l_system_koch': KochSnowflake,  // NEW
    'agent_slime': SlimeMold         // NEW
};

// --- Factory Function ---
export function createSystemInstance(systemId, width, height) {
    const SystemClass = systemRegistry[systemId];
    if (SystemClass) {
        try {
            console.log(`Creating instance of ${SystemClass.name}...`);
            const instance = new SystemClass(width, height);
            instance.id = systemId;
            instance.iteration = instance.iteration || 0;
            if (typeof instance.step !== 'function') {
                console.warn(`System ${systemId} does not implement a step method.`);
            }
            return instance;
        } catch (e) {
            console.error(`Error constructing system ${systemId}:`, e);
            return null;
        }
    } else {
        console.warn(`System ID "${systemId}" not found in registry.`);
        return new GenerativeSystem(width, height);
    }
}