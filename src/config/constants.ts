//
// Radar Fetching
//

// radar will only be refetched on moveend/zoomend if map center moves by at least this meters
export const RADAR_MOVE_MIN_DIST_M = 1000; // 1km

// radar fetches triggered by moveend/zoomend will debounce at least this time
export const RADAR_BASE_DEBOUNCE_MS = 1000; // 1s

// min time between radar fetches. Calls will be delayed to have at least this gap
export const RADAR_MIN_GAP_MS = 5000; // 5s

//
// Animation
//
export const ANIMATION_TOTAL_DURATION_S = 60;
export const ANIMATION_TOTAL_DURATION_MS = ANIMATION_TOTAL_DURATION_S * 1000;

// number of positions calculated within the animation duration
// we do linear interpolation between these positions
export const ANIMATION_FRAMES = 6;
