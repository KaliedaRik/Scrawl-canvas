// # Shared variables

export const _abs = Math.abs;
export const _atan2 = Math.atan2;
export const _cbrt = Math.cbrt;
export const _ceil = Math.ceil;
export const _cos = Math.cos;
export const _create = Object.create;
export const _entries = Object.entries;
export const _setPrototypeOf = Object.setPrototypeOf;
export const _seal = Object.seal;
export const _floor = Math.floor;
export const _isArray = Array.isArray;
export const _keys = Object.keys;
export const _now = Date.now;
export const _parse = JSON.parse;
export const _pi = Math.PI;
export const _piDouble = Math.PI * 2;
export const _piHalf = Math.PI * 0.5;
export const _pow = Math.pow;
export const _hypot = Math.hypot;
export const _max = Math.max;
export const _min = Math.min;
export const _random = Math.random;
export const _round = Math.round;
export const _sin = Math.sin;
export const _sqrt = Math.sqrt;
export const _string = JSON.stringify;
export const _values = Object.values;
export const _isInteger = Number.isInteger;

export const _tick = 16 / 1000;

/* mixin/anchor */
// export const DESCRIPTION = 'description';
// export const DOWNLOAD = 'download';
// export const HREF = 'href';
// export const HREFLANG = 'hreflang';
// export const PING = 'ping';
// export const REFERRERPOLICY = 'referrerpolicy';
// export const REL = 'rel';
// export const T_CANVAS = 'Canvas';
// export const T_CELL = 'Cell';
// export const TARGET = 'target';
// export const TYPE = 'type';

/* mixin/asset */
// export const SOURCE = 'source';
// export const SOURCE_LOADED = 'sourceLoaded';
// export const SUBSCRIBERS = 'subscribers';

/* mixin/assetAdvancedFunctionality */
// export const _2D = '2d';
// export const CANVAS = 'canvas';
// export const PC100 = '100%';

/* mixin/assetConsumers */
// export const ADD_TEXT_TRACK = 'addTextTrack';
// export const CAN_PLAY_TYPE = 'canPlayType';
// export const CAPTURE_STREAM = 'captureStream';
// export const DEFAULT = 'default';
// export const FAST_SEEK = 'fastSeek';
// export const LOAD = 'load';
// export const PAUSE = 'pause';
// export const PLAY = 'play';
// export const SET_MEDIA_KEYS = 'setMediaKeys';
// export const SET_SINK_ID = 'setSinkId';
// export const T_SPRITE = 'Sprite';
// export const T_VIDEO = 'Video';

/* mixin/base */
// export const ARG_SPLITTER = ',';
// export const BAD_PACKET_CHECK = '"name":';
// export const HAS_PACKET_CHECK = '[';
// export const NAME = 'name';
// export const NATIVE_CODE = '[native code]';
// export const PACKET_DIVIDER = '~~~';
// export const TYPE_EXCLUSIONS = ['Image', 'Sprite', 'Video', 'Canvas', 'Stack'];
// export const UNDEF = 'undefined';
// export const ZERO_STR = '';

/* mixin/cascade */
// export const ADD_ARTEFACT_CLASSES = 'addArtefactClasses';
// export const REMOVE_ARTEFACT_CLASSES = 'removeArtefactClasses';
// export const REVERSE_BY_DELTA = 'reverseByDelta';
// export const SET_ARTEFACTS = 'setArtefacts';
// export const UPDATE_ARTEFACTS = 'updateArtefacts';
// export const UPDATE_BY_DELTA = 'updateByDelta';

/* mixin/cell-key-functions */
// export const BLANK = 'rgb(0 0 0 / 0)';
// export const LEFT = 'left';
// export const LINE_DASH = 'lineDash';
// export const STYLES_ARR = ['Gradient', 'RadialGradient', 'Pattern'];
// export const TOP = 'top';

/* mixin/delta */
// export const ADD = 'add';
// export const LONGCHECK = ['startX', 'startY', 'handleX', 'handleY', 'offsetX', 'offsetY', 'width', 'height'];
// export const LOOP = 'loop';
// export const MULTIPLY = 'multiply';
// export const NEWNUMBER = 'newNumber';
// export const NEWSTRING = 'newString';
// export const PC = '%';
// export const REMOVE = 'remove';
// export const REVERSE = 'reverse';
// export const SEPARATOR = ':';
// export const SHORTCHECK = ['startY', 'handleY', 'offsetY', 'height'];
// export const UPDATE = 'update';

/* mixin/displayShape */
// export const BANNER = 'banner';
// export const LANDSCAPE = 'landscape';
// export const LARGER = 'larger';
// export const LARGEST = 'largest';
// export const PORTRAIT = 'portrait';
// export const RECTANGLE = 'rectangle';
// export const REGULAR = 'regular';
// export const SKYSCRAPER = 'skyscraper';
// export const SMALLER = 'smaller';
// export const SMALLEST = 'smallest';
// export const ZERO_STR = '';

/* mixin/dom */
// export const ABSOLUTE = 'absolute';
// export const ARIA_HIDDEN = 'aria-hidden';
// export const BORDER_BOX = 'border-box';
// export const BOTTOMLEFT = 'bottomLeft';
// export const BOTTOMRIGHT = 'bottomRight';
// export const CLASS_REGEX = /[\s\uFEFF\xA0]+/g;
// export const CORNER_ATTR = 'data-scrawl-corner-div';
// export const CORNER_ATTR_VAL = 'sc';
// export const CORNER_LABELS = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
// export const CORNER_SELECTOR = '[data-scrawl-corner-div="sc"]';
// export const DIV = 'div';
// export const LOCAL = 'local';
// export const MIMIC = 'mimic';
// export const MOUSE = 'mouse';
// export const NO_CORNER_ELEMENTS = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR', 'CANVAS'];
// export const PARTICLE = 'particle';
// export const PATH = 'path';
// export const PC0 = '0%';
// export const PC100 = '100%';
// export const PIVOT = 'pivot';
// export const SPACE = ' ';
// export const T_STACK = 'Stack';
// export const TABINDEX = 'tabindex';
// export const TOPLEFT = 'topLeft';
// export const TOPRIGHT = 'topRight';
// export const TRUE = 'true';

/* mixin/entity */
// export const FILL = 'fill';
// export const GOOD_HOST = ['Cell', 'CellFragment'];
// export const IMG = 'img';
// export const MOUSE = 'mouse';
// export const NAME = 'name';
// export const NONZERO = 'nonzero';
// export const PARTICLE = 'particle';
// export const SOURCE_IN = 'source-in';
// export const SOURCE_OVER = 'source-over';
// export const UNDEF = 'undefined';

/* mixin/filter */
// export const PROCESS_IMAGE = 'process-image';
// export const SOURCE_OVER = 'source-over';
// export const T_CELL = 'Cell';
// export const T_FILTER = 'Filter';
// export const T_IMAGE = 'Image';
// export const T_NOISE = 'Noise';
// export const T_RAWASSET = 'RawAsset';
// export const T_RDASSET = 'RdAsset';
// export const T_SPRITE = 'Sprite';
// export const T_VIDEO = 'Video';

/* mixin/mimic */
// export const MIMIC = 'mimic';
// export const START = 'start';
// export const T_CELL = 'Cell';

/* mixin/path */
// export const PATH = 'path';
// export const START = 'start';

/* mixin/pattern */
// export const MAT_POS = ['a', 'b', 'c', 'd', 'e', 'f'];
// export const MAT_REPEAT = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
// export const _A = 'a';
// export const _B = 'b';
// export const _C = 'c';
// export const _D = 'd';
// export const _E = 'e';
// export const _F = 'f';
// export const REPEAT = 'repeat';
// export const T_CELL = 'Cell';
// export const T_NOISE = 'Noise';
// export const BLANK = 'rgb(0 0 0 / 0)';

/* mixin/pivot */
// export const CORNER_LABELS = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
// export const PIVOT = 'pivot';
// export const START = 'start';
// export const T_BEZIER = 'Bezier';
// export const T_CELL = 'Cell';
// export const T_LINE = 'Line';
// export const T_POLYLINE = 'Polyline';
// export const T_QUADRATIC = 'Quadratic';

/* mixin/position */
// export const ALL = 'all';
// export const AUTO = 'auto';
// export const BOTTOM = 'bottom';
// export const CENTER = 'center';
// export const DIMENSIONS = 'dimensions';
// export const FILTER = 'filter';
// export const GROUP = 'group';
// export const HANDLE = 'handle';
// export const LEFT = 'left';
// export const MIMIC = 'mimic';
// export const MOUSE = 'mouse';
// export const OFFSET = 'offset';
// export const PARTICLE = 'particle';
// export const PATH = 'path';
// export const PIVOT = 'pivot';
// export const RIGHT = 'right';
// export const START = 'start';
// export const STARTX = 'startX';
// export const STARTY = 'startY';
// export const T_GROUP = 'Group';
// export const T_POLYLINE = 'Polyline';
// export const TOP = 'top';

/* mixin/shapeBasic */
// export const BEZIER = 'bezier';
// export const CLOSE = 'close';
// export const DESTINATION_OUT = 'destination-out';
// export const HALFTRANS = 'rgb(0 0 0 / 0.5)';
// export const LINEAR = 'linear';
// export const MOUSE = 'mouse';
// export const MOVE = 'move';
// export const PARTICLE = 'particle';
// export const QUADRATIC = 'quadratic';
// export const SOURCE_OVER = 'source-over';
// export const T_BEZIER = 'Bezier';
// export const T_LINE = 'Line';
// export const T_POLYLINE = 'Polyline';
// export const T_QUADRATIC = 'Quadratic';
// export const UNKNOWN = 'unknown';

/* mixin/shapeCurve */
// export const BEZIER = 'bezier';
// export const CONTROL = 'control';
// export const COORD = 'coord';
// export const END = 'end';
// export const END_CONTROL = 'endControl';
// export const END_PARTICLE = 'endParticle';
// export const END_PATH = 'endPath';
// export const END_PIVOT = 'endPivot';
// export const LINEAR = 'linear';
// export const MOUSE = 'mouse';
// export const PARTICLE = 'particle';
// export const PATH = 'path';
// export const PIVOT = 'pivot';
// export const QUADRATIC = 'quadratic';
// export const START_CONTROL = 'startControl';
// export const T_BEZIER = 'Bezier';
// export const T_LINE = 'Line';
// export const T_PARTICLE = 'Particle';
// export const T_PATH = 'Path';
// export const T_PIVOT = 'Pivot';
// export const T_QUADRATIC = 'Quadratic';

/* mixin/shapePathCalculation */
// export const BEZIER = 'bezier';
// export const CLOSE = 'close';
// export const GET_BEZIER = 'getBezierXY';
// export const GET_QUADRATIC = 'getQuadraticXY';
// export const LINEAR = 'linear';
// export const MOVE = 'move';
// export const QUADRATIC = 'quadratic';
// export const UNKNOWN = 'unknown';

/* mixin/styles */
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const BLANK = 'rgb(0 0 0 / 0)';
// export const BOTTOM = 'bottom';
// export const CENTER = 'center';
// export const COLORS = 'colors';
// export const END = 'end';
// export const LEFT = 'left';
// export const LINEAR = 'linear';
// export const NAME = 'name';
// export const RGB = 'RGB';
// export const RIGHT = 'right';
// export const START = 'start';
// export const T_PALETTE = 'Palette'
// export const TOP = 'top';
// export const UNDEFINED = 'undefined';
// export const WHITE = 'rgb(255 255 255 / 1)';

/* mixin/tween */
// export const FUNCTION = 'function';
// export const PC = '%';
// export const TARGET_SECTIONS = ['artefact', 'group', 'animation', 'animationtickers', 'world', 'tween', 'styles', 'filter'];
// export const UNKNOWN = 'unknown';
// export const UNNAMED = 'unnamed';

/* factory/action */
// export const FUNCTION = 'function';
// export const NAME = 'name';
// export const T_ACTION = 'Action';
// export const TWEEN = 'tween';
// export const UNDEF = 'undefined';

/* factory/anchor */
// export const _A = 'a';
// export const ANCHOR = 'anchor';
// export const BLUR = 'blur';
// export const CLICK = 'click';
// export const DOWNLOAD = 'download';
// export const FOCUS = 'focus';
// export const HREF = 'href';
// export const HREFLANG = 'hreflang';
// export const ONCLICK = 'onclick';
// export const PING = 'ping';
// export const REFERRERPOLICY = 'referrerpolicy';
// export const REL = 'rel';
// export const T_ANCHOR = 'Anchor';
// export const TARGET = 'target';
// export const TYPE = 'type';
// export const ZERO_STR = '';

/* factory/anchor */
// export const ANIMATION = 'animation';
// export const T_ANIMATION = 'Animation';

/* factory/animation */
// export const ANIMATION = 'animation';
// export const T_ANIMATION = 'Animation';

/* factory/bezier */
// export const BEZIER = 'bezier';
// export const COORD = 'coord';
// export const END_CONTROL = 'endControl';
// export const END_CONTROL_PARTICLE = 'endControlParticle';
// export const END_CONTROL_PATH = 'endControlPath';
// export const END_CONTROL_PIVOT = 'endControlPivot';
// export const ENTITY = 'entity';
// export const PATH = 'path';
// export const START_CONTROL = 'startControl';
// export const START_CONTROL_PARTICLE = 'startControlParticle';
// export const START_CONTROL_PATH = 'startControlPath';
// export const START_CONTROL_PIVOT = 'startControlPivot';
// export const T_BEZIER = 'Bezier';
// export const ZERO_PATH = 'M0,0';
// export const ZERO_STR = '';

/* factory/block */
// export const T_BLOCK = 'Block';
// export const ENTITY = 'entity';

/* factory/canvas */
// export const _2D = '2d';
// export const ABSOLUTE = 'absolute';
// export const ARIA_DESCRIBEDBY = 'aria-describedby';
// export const ARIA_LABELLEDBY = 'aria-labelledby';
// export const ARIA_LIVE = 'aria-live';
// export const CANVAS = 'canvas';
// export const CANVAS_QUERY = '[data-scrawl-canvas]';
// export const DATA_SCRAWL_GROUP = 'data-scrawl-group';
// export const DIV = 'div';
// export const FIT_DEFS = ['fill', 'contain', 'cover'];
// export const HIDDEN = 'hidden';
// export const IMG = 'img';
// export const NAME = 'name';
// export const NAV = 'nav';
// export const NONE = 'none';
// export const PC0 = '0%';
// export const PC100 = '100%';
// export const PC50 = '50%';
// export const POLITE = 'polite';
// export const PX0 = '0px';
// export const RELATIVE = 'relative';
// export const ROLE = 'role';
// export const ROOT = 'root';
// export const SUBSCRIBE = 'subscribe';
// export const T_CANVAS = 'Canvas';
// export const T_STACK = 'Stack';
// export const TITLE = 'title';
// export const ZERO_STR = '';

/* factory/cell-fragment */
// export const _2D = '2d';
// export const CANVAS = 'canvas';
// export const T_CELLFRAGMENT = 'CellFragment';

/* factory/cell */
// export const _2D = '2d';
// export const AUTO = 'auto';
// export const CANVAS = 'canvas';
// export const CELL = 'cell';
// export const CONTAIN = 'contain';
// export const COVER = 'cover';
// export const DIMENSIONS = 'dimensions';
// export const FILL = 'fill';
// export const GRAYSCALE = 'grayscale';
// export const HEIGHT = 'height';
// export const IMG = 'img';
// export const MOUSE = 'mouse';
// export const MOZOSX_FONT_SMOOTHING = 'mozOsxFontSmoothing';
// export const NEVER = 'never';
// export const NONE = 'none';
// export const SMOOTH_FONT = 'smoothFont';
// export const SOURCE_OVER = 'source-over';
// export const T_CELL = 'Cell';
// export const TRANSPARENT_VALS = ['rgb(0 0 0 / 0)', 'rgba(0 0 0 / 0)', 'rgba(0,0,0,0)', 'rgba(0, 0, 0, 0)', 'transparent', '#00000000', '#0000'];
// export const WEBKIT_FONT_SMOOTHING = 'webkitFontSmoothing';
// export const WIDTH = 'width';
// export const ZERO_STR = '';

/* factory/cog */
// export const BEZIER = 'bezier';
// export const ENTITY = 'entity';
// export const LINE = 'line';
// export const PERMITTED_CURVES = ['line', 'quadratic', 'bezier'];
// export const QUADRATIC = 'quadratic';
// export const T_COG = 'Cog';
// export const ZERO_PATH = 'M0,0';

/* factory/color */
// export const _0 = '0';
// export const _2D = '2d';
// export const _HSL = 'hsl';
// export const _HWB = 'hwb';
// export const _LAB = 'lab';
// export const _LCH = 'lch';
// export const _MAX = '_max';
// export const _MIN = '_min';
// export const _OKLAB = 'oklab';
// export const _OKLCH = 'oklch';
// export const _RGB = 'rgb';
// export const _XYZ = 'xyz';
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const BLACK_HEX = '#000000';
// export const BLANK = 'rgb(0 0 0 / 0)';
// export const CANVAS = 'canvas';
// export const DEG = 'deg';
// export const FUNCTION = 'function';
// export const GRAD = 'grad';
// export const HSL = 'HSL';
// export const HSL_HWB_ARRAY = ['HSL', 'HWB'];
// export const HWB = 'HWB';
// export const INT_COLOR_SPACES = ['RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'];
// export const LAB = 'LAB';
// export const LCH = 'LCH';
// export const LINEAR = 'linear';
// export const MAX = 'max';
// export const MIN = 'min';
// export const NAME = 'name';
// export const NONE = 'none';
// export const OKLAB = 'OKLAB';
// export const OKLCH = 'OKLCH';
// export const PC = '%';
// export const RAD = 'rad';
// export const RANDOM = 'random';
// export const RET_COLOR_SPACES = ['RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH'];
// export const RGB = 'RGB';
// export const SOURCE_OVER = 'source-over';
// export const SPACE = ' ';
// export const STYLES = 'styles';
// export const T_COLOR = 'Color';
// export const TURN = 'turn';
// export const UNDEF = 'undefined';
// export const WHITE = 'rgb(255 255 255 / 1)';
// export const XYZ = 'XYZ';
// export const ZERO_STR = '';

/* factory/conicGradient */
// export const PALETTE = 'palette';
// export const STYLES = 'styles';
// export const T_CONIC_GRADIENT = 'ConicGradient';

/* factory/coordinate */
// export const T_COORDINATE = 'Coordinate';
// export const T_QUATERNION = 'Quaternion';
// export const T_VECTOR = 'Vector';

/* factory/crescent */
// export const T_CRESCENT = 'Crescent';
// export const ENTITY = 'entity';
// export const DESTINATION_OUT = 'destination-out';

/* factory/dragZone */
// export const ACCEPTED_WRAPPERS = ['Canvas', 'Stack'];
// export const T_CANVAS = 'Canvas';
// export const T_GROUP = 'Group';
// export const DOWN = 'down';
// export const UP = 'up';
// export const TOUCH_START = 'touchstart';
// export const TOUCH_CANCEL = 'touchcancel';
// export const TOUCH_MOVE = 'touchmove';
// export const TOUCH_END = 'touchend';
// export const EXIT = 'exit';
// export const DROP = 'drop';
// export const $BODY = 'BODY';
// export const MOVE = 'move';

/* factory/element */
// export const T_ELEMENT = 'Element';
// export const ELEMENT = 'element';
// export const CORNER_SELECTOR = '[data-scrawl-corner-div="sc"]';
// export const CANVAS = 'canvas';
// export const ABSOLUTE = 'absolute';
// export const MIMIC = 'mimic';

/* factory/emitter */
// export const T_EMITTER = 'Emitter';
// export const T_WORLD = 'World';
// export const ENTITY = 'entity';
// export const EULER = 'euler';
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const MOUSE = 'mouse';
// export const PARTICLE = 'particle';

/* factory/filter */

/* factory/filterEngine-bluenoiseData */

/* factory/filterEngine */

/* factory/fontAttributes */
// export const _PC = 'pc';
// export const _Q = 'Q';
// export const BOLD = 'bold';
// export const BOLDER = 'bolder';
// export const CAP = 'cap';
// export const CH = 'ch';
// export const CM = 'cm';
// export const CONDENSED = 'condensed';
// export const DEFAULT_SIZE = '12px';
// export const EM = 'em';
// export const EX = 'ex';
// export const EXPANDED = 'expanded';
// export const EXTRA_CONDENSED = 'extra-condensed';
// export const EXTRA_EXPANDED = 'extra-expanded';
// export const FONT_ATTRIBUTE = 'fontattribute';
// export const IC = 'ic';
// export const IN = 'in';
// export const ITALIC = 'italic';
// export const LARGE = 'large';
// export const LARGER = 'larger';
// export const LH = 'lh';
// export const LIGHTER = 'lighter';
// export const MEDIUM = 'medium';
// export const MM = 'mm';
// export const NORMAL = 'normal';
// export const OBLIQUE = 'oblique';
// export const PC = '%';
// export const PT = 'pt';
// export const PX = 'px';
// export const REM = 'rem';
// export const RLH = 'rlh';
// export const SANS_SERIF = 'sans-serif';
// export const SEMI_CONDENSED = 'semi-condensed';
// export const SEMI_EXPANDED = 'semi-expanded';
// export const SIZE_SUFFIX = ['in', 'cm', 'mm', 'Q', 'pc', 'pt', 'px'];
// export const SMALL = 'small';
// export const SMALL_CAPS = 'small-caps';
// export const SMALLER = 'smaller';
// export const SPACE = ' ';
// export const STOP = '.';
// export const T_CELL = 'Cell';
// export const T_FONT_ATTRIBUTES = 'FontAttributes';
// export const ULTRA_CONDENSED = 'ultra-condensed';
// export const ULTRA_EXPANDED = 'ultra-expanded';
// export const VB = 'vb';
// export const VH = 'vh';
// export const VI = 'vi';
// export const VMAX = 'vmax';
// export const VMIN = 'vmin';
// export const VW = 'vw';
// export const X_LARGE = 'x-large';
// export const X_SMALL = 'x-small';
// export const XX_LARGE = 'xx-large';
// export const XX_SMALL = 'xx-small';
// export const XXX_LARGE = 'xxx-large';
// export const ZERO_STR = '';
// export const RFS_ARRAY_1 = ['italic','oblique','small-caps','normal','bold','lighter','bolder','ultra-condensed','extra-condensed','semi-condensed','condensed','ultra-expanded','extra-expanded','semi-expanded','expanded','xx-small','x-small','small','medium','xxx-large','xx-large','x-large','large'];
// export const RFS_ARRAY_2 = ['0','1','2','3','4','5','6','7','8','9'];

/* factory/gradient */
// export const BLANK = 'rgb(0 0 0 / 0)';
// export const STYLES = 'styles';
// export const T_GRADIENT = 'Gradient';

/* factory/grid */
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const CELL_GRADIENT = 'cellGradient';
// export const COLOR = 'color';
// export const ENTITY = 'entity';
// export const FILL = 'fill';
// export const GRAY = 'rgb(127 127 127 / 1)';
// export const GRID_GRADIENT = 'gridGradient';
// export const GRID_PICTURE = 'gridPicture';
// export const SOURCE_IN = 'source-in';
// export const SOURCE_OVER = 'source-over';
// export const T_GRID = 'Grid';
// export const TILE_PICTURE = 'tilePicture';
// export const WHITE = 'rgb(255 255 255 / 1)';

/* factory/group */
// export const ACCEPTED_OWNERS = ['Cell', 'Stack'];
// export const ADD_CLASSES = 'addClasses';
// export const ENTITY = 'entity';
// export const GROUP = 'group';
// export const REMOVE_CLASSES = 'removeClasses';
// export const REVERSE_BY_DELTA = 'reverseByDelta';
// export const SET = 'set';
// export const SET_DELTA = 'setDelta';
// export const SOURCE_IN = 'source-in';
// export const SOURCE_OVER = 'source-over';
// export const T_GROUP = 'Group';
// export const UPDATE_BY_DELTA = 'updateByDelta';

/* factory/imageAsset */
// export const ANONYMOUS = 'anonymous';
// export const ASSET = 'asset';
// export const BLOCK = 'block';
// export const ELEMENT = 'element';
// export const IMAGE_ELEMENTS = ['IMG', 'PICTURE'];
// export const IMG = 'img';
// export const INTRINSIC = 'intrinsic';
// export const NONE = 'none';
// export const SLASH = '/';
// export const T_CANVAS = 'Canvas';
// export const T_CELL = 'Cell';
// export const T_GROUP = 'Group';
// export const T_IMAGE = 'Image';
// export const ZERO = 'zero';
// export const ZERO_STR = '';

/* factory/keyboardZone */
// export const $BODY = 'BODY';
// export const ACCEPTED_WRAPPERS = ['Canvas', 'Stack'];
// export const KEY_DOWN = 'keydown';
// export const KEY_UP = 'keyup';
// export const keyGroupsArray = ['none', 'shiftOnly', 'altOnly', 'ctrlOnly', 'metaOnly', 'shiftAlt', 'shiftCtrl', 'shiftMeta', 'altCtrl', 'altMeta', 'ctrlMeta', 'shiftAltCtrl', 'shiftAltMeta', 'shiftCtrlMeta', 'altCtrlMeta', 'all'];
// export const NONE = 'none';
// export const T_ESCAPE = 'Escape';
// export const T_TAB = 'Tab';

/* factory/keyboardZone */
// export const T_LINE = 'Line';
// export const LINE = 'line';
// export const ENTITY = 'entity';
// export const ZERO_PATH = 'M0,0';
// export const PATH = 'path';

/* factory/lineSpiral */
// export const T_LINE_SPIRAL = 'LineSpiral';
// export const ENTITY = 'entity';
// export const ZERO_PATH = 'M0,0';
// export const LINE_SPIRAL = 'linespiral';

/* factory/loom */
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const DESTINATION_OUT = 'destination-out';
// export const ENTITY = 'entity';
// export const FILL = 'fill';
// export const GOOD_HOST = ['Cell', 'CellFragment'];
// export const NAME = 'name';
// export const SOURCE_OVER = 'source-over';
// export const T_GROUP = 'Group';
// export const T_LOOM = 'Loom';
// export const T_PICTURE = 'Picture';
// export const UNDEFINED = 'undefined';
// export const ZERO_STR = '';

/* factory/mesh */
// export const ARG_SPLITTER = ',';
// export const DESTINATION_OUT = 'destination-out';
// export const ENTITY = 'entity';
// export const FILL = 'fill';
// export const NAME = 'name';
// export const T_CELL = 'Cell';
// export const T_GROUP = 'Group';
// export const T_MESH = 'Mesh';
// export const T_NET = 'Net';
// export const T_PICTURE = 'Picture';
// export const UNDEFINED = 'undefined';
// export const ZERO_STR = '';

/* factory/net */
// export const BLACK = 'rgb(0 0 0 / 1)';
// export const BLANK = 'rgb(0 0 0 / 0)';
// export const ENTITY = 'entity';
// export const EULER = 'euler';
// export const FILL_STYLE = 'fillStyle';
// export const HUB_ARTEFACTS_1 = ['Bezier', 'Line', 'Oval', 'Polygon', 'Polyline', 'Quadratic', 'Rectangle', 'Shape', 'Spiral', 'Star', 'Tetragon'];
// export const HUB_ARTEFACTS_2 = ['Block', 'Cell', 'Element', 'Grid', 'Phrase', 'Picture', 'Stack'];
// export const HUB_ARTEFACTS_3 = ['Wheel'];
// export const HUB_SPOKE = 'hub-spoke';
// export const POSITION = 'position';
// export const SOURCE_OVER = 'source-over';
// export const STROKE_STYLE = 'strokeStyle';
// export const STRONG_NET = 'strong-net';
// export const STRONG_SHAPE = 'strong-shape';
// export const T_NET = 'Net';
// export const T_PARTICLE = 'Particle';
// export const T_POLYLINE = 'Polyline';
// export const T_WORLD = 'World';
// export const WEAK_NET = 'weak-net';
// export const WEAK_SHAPE = 'weak-shape';






















