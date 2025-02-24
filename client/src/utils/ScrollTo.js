/**
 * Utility function to scroll to a specific element referenced by ref.
 * 
 * This function scrolls the element into view with the specified behavior.
 * 
 * @param {React.RefObject} ref - The reference to the element to scroll into view.
 * @param {Object} options - Options for the scrolling behavior.
 * @param {string} [options.behavior="instant"] - The scrolling behavior. Can be "auto", "smooth", or "instant".
 */
const scrollTo = (ref, { behavior = "instant" } = {}) => {
    ref.current?.scrollIntoView({ behavior });
}

export default scrollTo;
