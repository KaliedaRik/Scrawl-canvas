// # WASM initialization
// This code will import/export all wasm functions, so they can be used in other pages

// Whenever a file uses a wasm function, it has to initialize the code - ASYNC FUNCTION - before it can use the other functions?


// #### Imports
import wasmInit from '../sc-wasm-rust/pkg/sc_wasm_rust.js';
import { 
    // greet as alertGreeting,
    log_message as logMessage,
    average_channels,
    FilterAverageChannels as makeFilterAverageChannels,
} from '../sc-wasm-rust/pkg/sc_wasm_rust.js';


// #### Exports
export {
    wasmInit,
    // alertGreeting,
    logMessage,
    average_channels,
    makeFilterAverageChannels,
};

// import { logMessage } from '../core/wasmWrapper.js';

// if (window.scrawlEnvironmentWebAssemblyInitialized) logMessage('wasm is working');
// else console.log('wasm not ready');
