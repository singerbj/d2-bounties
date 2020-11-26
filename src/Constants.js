const DEFAULT_STATE = { loading: true };
const BUNGIE_APP_ID = '34720';//'34694';
const API_KEY = 'b2b60918af5f4f24affcea8f149ea424';//'8961c5b112cf48388a50dda77e6e1eee';
const TOKEN_URL='https://www.bungie.net/Platform/App/OAuth/token/';
const AUTHORIZE_URL=`https://www.bungie.net/en/OAuth/Authorize?client_id=${BUNGIE_APP_ID}&response_type=code`;

const LOCATIONS = ['edz', 'luna', 'europa', 'dreaming_city', 'cosmodrome', 'nessus', 'tangled_shore'];
const ACTIVITIES = ['raid', 'crucible', 'gambit', 'strike', 'patrol', 'lost_sector'];
const WEAPONS = ['hand_cannon', 'sidearm', 'submachinegun', 'machinegun', 'auto_rifle', 'sniper_rifle', 
        'trace_rifle', 'bow', 'shotgun', 'sword', 'scout_rifle', 'pulse_rifle', 'grenade_launcher', 
        'rocket_launcher', { text: 'grenade', not: 'grenade_launcher'}, 'melee', 'abilities', 'super', 'precision', 'finisher'];
const ELEMENTS = ['elemental', 'solar', 'arc', 'void', 'stasis']; // stasis?
const ENEMIES = ['fallen', 'scorn', 'cabal', 'hive', 'vex'];
const ALL_KEYS = [...LOCATIONS, ...WEAPONS, ...ELEMENTS, ...ACTIVITIES, ...ENEMIES];

export {
    DEFAULT_STATE,
    BUNGIE_APP_ID,
    API_KEY,
    TOKEN_URL,
    AUTHORIZE_URL,
    LOCATIONS,
    ACTIVITIES,
    WEAPONS,
    ELEMENTS,
    ENEMIES,
    ALL_KEYS
}