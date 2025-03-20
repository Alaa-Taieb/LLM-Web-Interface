/**
 * @fileoverview React Context for managing Groq API instance and configuration
 * @module components/GroqContext
 */

import { createContext } from "react";

/**
 * Context for sharing Groq API instance and configuration across components
 * 
 * @type {React.Context<[GroqInstance|null, Function, GroqConfig|null, Function]>}
 * Tuple containing:
 * - [0] GroqInstance: Current Groq API instance or null
 * - [1] Function: Setter for Groq instance
 * - [2] GroqConfig: Additional configuration object or null
 * - [3] Function: Setter for configuration
 */
const GroqContext = createContext();

/**
 * @typedef {Object} GroqInstance
 * @property {string} apiKey - Groq API key
 * @property {boolean} dangerouslyAllowBrowser - Browser usage flag
 * @property {Object} config - API configuration
 */

/**
 * @typedef {Object} GroqConfig
 * @property {string} apiKey - API key
 * @property {string} model - Model identifier
 * @property {Object} options - Additional options
 */

export default GroqContext;
