/**
 * Enhanced fetch with automatic retries for network resilience.
 * @param {string} url - The URL to fetch.
 * @param {Object} options - Fetch options.
 * @param {number} retries - Number of retry attempts.
 * @param {number} backoff - Initial backoff delay in ms.
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Only retry on server errors (5xx) or if explicitly needed
            if (response.status >= 500 && retries > 0) {
                console.warn(`Server error ${response.status}. Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            return response;
        }
        return response;
    } catch (error) {
        // Retry on network errors (e.g., ERR_NETWORK_CHANGED, timeout)
        if (retries > 0) {
            console.error(`Network error: ${error.message}. Retrying in ${backoff}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
};
