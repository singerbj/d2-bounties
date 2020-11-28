const VERSION = '0.1.0';

const DEFAULT_STATE = { loading: true };
const BUNGIE_APP_ID = '34694';
const API_KEY = '8961c5b112cf48388a50dda77e6e1eee';
const TOKEN_URL='https://www.bungie.net/Platform/App/OAuth/token/';
const AUTHORIZE_URL=`https://www.bungie.net/en/OAuth/Authorize?client_id=${BUNGIE_APP_ID}&response_type=code`;

const LOCATIONS = ['edz', 'luna', 'europa', 'dreaming_city', 'cosmodrome', 'nessus', 'tangled_shore'];
const ACTIVITIES = ['raid', 'crucible', 'gambit', 'strike', 'patrol', 'lost_sector'];
const PVP_ONLY_ACTIVITIES = ['crucible'];
const WEAPONS = ['hand_cannon', 'sidearm', 'submachinegun', 'machinegun', 'auto_rifle', 'sniper_rifle', 
        'trace_rifle', 'bow', 'shotgun', 'sword', 'scout_rifle', 'pulse_rifle', 'grenade_launcher', 
        'rocket_launcher', { text: 'grenade', not: 'grenade_launcher'}, 'melee', 'abilities', 'super', 
        'precision', 'finisher'
];
const ALL_ELEMENTAL = ['elemental'];
const ELEMENTS = ['solar', 'arc', 'void', 'stasis']; // stasis?
const ENEMIES = ['fallen', 'scorn', 'cabal', 'hive', 'vex'];
const ALL_KEYS = [...LOCATIONS, ...WEAPONS, ...ALL_ELEMENTAL, ...ELEMENTS, ...ACTIVITIES, ...ENEMIES];

const MAX_LIST_LENGTH = 30;

export {
    VERSION,
    DEFAULT_STATE,
    BUNGIE_APP_ID,
    API_KEY,
    TOKEN_URL,
    AUTHORIZE_URL,
    LOCATIONS,
    ACTIVITIES,
    PVP_ONLY_ACTIVITIES,
    WEAPONS,
    ALL_ELEMENTAL,
    ELEMENTS,
    ENEMIES,
    ALL_KEYS,
    MAX_LIST_LENGTH
};
