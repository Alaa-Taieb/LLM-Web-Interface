import { useState , useEffect } from 'react';

/**
 * Helper function to get the current window dimensions.
 * 
 * This function retrieves the current width and height of the browser window using
 * the `window` object's `innerWidth` and `innerHeight` properties.
 * 
 * @returns {Object} An object containing the current `width` and `height` of the window.
 */
const getWindowDimensions = () => {
    const {innerWidth: width , innerHeight: height} = window;
    return {width, height};
}

/**
 * Custom hook to track and return the current window dimensions.
 * 
 * This hook initializes the state with the current window dimensions and updates the state
 * whenever the window is resized. It uses the `resize` event listener to trigger updates
 * to the dimensions, ensuring that components using this hook can respond to window size changes.
 * 
 * @returns {Object} An object containing the current `width` and `height` of the window.
 */
const useWindowDimensions = () => {
    // Initialize the state with the current window dimensions
    const [windowDimensions , setWindowDimensions] = useState(getWindowDimensions());

    /**
     * Effect to set up the `resize` event listener on the window.
     * 
     * The `handleResize` function is defined to update the state with the new dimensions
     * whenever the window is resized. The event listener is cleaned up when the component
     * using this hook is unmounted to prevent memory leaks.
     */
    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(getWindowDimensions());
        }

        // Add event listener to handle window resize
        window.addEventListener('resize' , handleResize);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize' , handleResize);
    } , []);
    
    // Return the current window dimensions
    return windowDimensions
}

export default useWindowDimensions;