/**
 * Building model for the guided, multi-floor learning game.
 *
 * The player starts OUTSIDE, walks into the building, and uses the elevator to
 * travel between floors. Each floor is a single room (one department). Floors
 * are visited in story order; questions get harder floor by floor.
 *
 * Coordinate system: XZ ground plane, +Y up. One indoor room footprint is
 * reused for every floor (only one floor is visible at a time).
 */

export const BUILDING = {
  minX: -18,
  maxX: 18,
  minZ: -16,
  maxZ: 16,
  wallHeight: 6,
  wallThickness: 0.6
};

/** Open plaza in front of the building (the "outside" area). */
export const OUTSIDE = {
  minX: -24,
  maxX: 24,
  minZ: -4,
  maxZ: 34
};

/** Where the player starts the game: on the plaza, facing the entrance. */
export const OUTSIDE_SPAWN = { x: 0, z: 26, heading: 0 };

/** Door trigger just inside the facade — walking here enters the building. */
export const ENTRANCE = { x: 0, z: 3, r: 2.6 };

/** Elevator interaction point (same spot on every indoor floor). */
export const ELEVATOR = { x: 13, z: 11, r: 3 };

/** Where the player stands right after the elevator opens on a floor. */
export const ELEVATOR_EXIT = { x: 13, z: 6, heading: 0 };

/**
 * Floors served by the elevator, in building order. `accent` tints the floor
 * label/sign; `short` is the panel button text. Each upper floor is one
 * department; questions get harder as you go up.
 */
export const FLOORS = [
  { id: 'eg', label: 'Erdgeschoss · Foyer', short: 'EG', accent: 0xe2001a },
  { id: 'og1', label: '1. OG · Empfang', short: '1. OG', accent: 0xe2001a },
  { id: 'og2', label: '2. OG · Open Space', short: '2. OG', accent: 0x8f0682 },
  { id: 'og3', label: '3. OG · Digital Solutions', short: '3. OG', accent: 0x00707f },
  { id: 'og4', label: '4. OG · Inclusive Design Lab', short: '4. OG', accent: 0x8f0682 },
  { id: 'og5', label: '5. OG · App Factory', short: '5. OG', accent: 0xdb9b4d },
  { id: 'og6', label: '6. OG · Facility Management', short: '6. OG', accent: 0x00707f },
  { id: 'og7', label: '7. OG · People · Culture · Places', short: '7. OG', accent: 0xe36e6e },
  { id: 'og8', label: '8. OG · Backend & Serverraum', short: '8. OG', accent: 0xdc1b42 }
];

export function floorById(id) {
  return FLOORS.find((f) => f.id === id) || null;
}
