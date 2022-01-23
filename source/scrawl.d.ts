// Type definitions for Scrawl-canvas 8.7.1



// HELPERS
// =====================================
type DefaultInputFunction = (item?: any) => void; 
type DefaultOutputFunction = (item?: any) => void; 

interface CommonObjectInput {
    [index: string]: any;
}

interface CommonHereObjectInput {
    x?: string | number;
    y?: string | number;
    [index: string]: any;
}

type CommonTwoElementArrayInput = [string | number, string | number];

type StringOrNumberInput = string | number;

type ColorSpacesValues = 'RGB' | 'HSL' | 'HWB' | 'XYZ' | 'LAB' | 'LCH';
type ReturnColorValues = 'RGB' | 'HSL' | 'HWB' | 'LAB' | 'LCH';


// MIXINS
// =====================================



// Anchor mixin
// -------------------------------------
interface AnchorMixinInputs {
    anchor?: AnchorFactoryInputs;
    anchorBlurAction?: boolean;
    anchorDescription?: string;
    anchorDownload?: string;
    anchorFocusAction?: boolean;
    anchorHref?: string;
    anchorHreflang?: string;
    anchorPing?: string;
    anchorReferrerPolicy?: string;
    anchorRel?: string;
    anchorTarget?: string;
    anchorType?: string;
}

interface AnchorMixinFunctions {
    clickAnchor?: () => void;
}


// Asset mixin
// -------------------------------------
interface AssetMixinInputs {}

interface AssetMixinFunctions {}



// AssetAdvancedFunctionality mixin
// -------------------------------------
interface AssetAdvancedFunctionalityMixinInputs {
    choke?: number;
    colors?: string[];
    colorSpace?: ColorSpacesValues;
    cyclePalette?: boolean;
    delta?: CommonObjectInput;
    easing?: string | DefaultInputFunction;
    paletteEnd?: number;
    paletteStart?: number;
    precision?: number;
    returnColorAs?: ReturnColorValues;
}

interface AssetAdvancedFunctionalityMixinFunctions {
    update: () => void;
}




// AssetConsumer mixin
// -------------------------------------
interface AssetConsumerMixinInputs {
    asset?: string | AssetInstance,
    removeAssetOnKill?: boolean;

    imageSource?: string;

    spriteForward?: boolean;
    spriteFrameDuration?: number;
    spriteSource?: string;
    spriteTrack?: string;
    spriteWillLoop?: boolean;

    videoSource?: string;
    video_autoPlay?: boolean;
    video_controller?: any;
    video_controls?: any;
    video_crossOrigin?: any;
    video_currentTime?: any;
    video_defaultMuted?: any;
    video_defaultPlaybackRate?: any;
    video_disableRemotePlayback?: any;
    video_loop?: boolean;
    video_mediaGroup?: any;
    video_muted?: boolean;
    video_playbackRate?: any;
    video_src?: any;
    video_srcObject?: any;
    video_volume?: any;
}

interface AssetConsumerMixinFunctions {
    videoAddTextTrack: (kind: any, label: any, language: any) => any | void;
    videoCaptureStream: () => any | void;
    videoCanPlayType: (item: string) => boolean;
    videoFastSeek: (item: number) => any | void;
    videoLoad: () => any | void;
    videoPause: () => any | void;
    videoPlay: () => any | void;
    videoSetMediaKeys: () => any | void;
    videoSetSinkId: () => any | void;
}



// Base mixin
// -------------------------------------
interface BaseMixinInputs {
    name?: string,
}

interface BaseMixinFunctions {
    actionPacket: (item: string) => any;
    get: (item: string) => any;
    importPacket: (item: string | string[]) => any;
    kill: (item?: any) => void;
}

interface BaseInstance {
    type: string;
    lib: string;
    isArtefact: boolean;
    isAsset: boolean;
}



// Cascade mixin
// -------------------------------------
interface CascadeMixinInputs {}

interface CascadeMixinFunctions {
    addArtefactClasses: (item?: CommonObjectInput) => any;
    getAllArtefactsAt: (item: any) => any;
    getArtefactAt: (item: any) => any;
    removeArtefactClasses: (item?: CommonObjectInput) => any;
    // reverseByDelta: (item?: CommonObjectInput) => any;
    setArtefacts: (item?: CommonObjectInput) => any;
    updateArtefacts: (item?: CommonObjectInput) => any;
    // updateByDelta: (item?: CommonObjectInput) => any;
}



// Delta mixin
// -------------------------------------
interface DeltaMixinInputs {
    checkDeltaConstraints?: boolean;
    delta?: CommonObjectInput;
    deltaConstraints?: CommonObjectInput;
    noDeltaUpdates?: boolean;
    performDeltaChecks?: boolean;
}

interface DeltaMixinFunctions {
    reverseByDelta: () => ArtefactInstance;
    setDeltaValues: (item?: CommonObjectInput) => ArtefactInstance;
    updateByDelta: () => ArtefactInstance;
}



// DisplayShape mixin
// -------------------------------------
interface DisplayShapeMixinInputs {
    actionBannerShape?: DefaultInputFunction,
    actionLandscapeShape?: DefaultInputFunction,
    actionLargerArea?: DefaultInputFunction,
    actionLargestArea?: DefaultInputFunction,
    actionPortraitShape?: DefaultInputFunction,
    actionRectangleShape?: DefaultInputFunction,
    actionRegularArea?: DefaultInputFunction,
    actionSkyscraperShape?: DefaultInputFunction,
    actionSmallerArea?: DefaultInputFunction,
    actionSmallestArea?: DefaultInputFunction,
    breakToBanner?: number;
    breakToLandscape?: number;
    breakToLarger?: number;
    breakToLargest?: number;
    breakToPortrait?: number;
    breakToSkyscraper?: number;
    breakToSmaller?: number;
    breakToSmallest?: number;
}

interface DisplayShapeMixinFunctions {
    setActionBannerShape: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionLandscapeShape: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionLargerArea: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionLargestArea: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionPortraitShape: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionRectangleShape: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionRegularArea: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionSkyscraperShape: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionSmallerArea: (item?: DefaultInputFunction) => ArtefactInstance;
    setActionSmallestArea: (item?: DefaultInputFunction) => ArtefactInstance;
    setDisplayShapeBreakpoints: (item?: CommonObjectInput) => ArtefactInstance;
    updateDisplay: () => void;
    updateDisplayArea: () => void;
    updateDisplayShape: () => void;
}



// Dom mixin
// -------------------------------------
interface DomMixinInputs extends PositionMixinInputs, DeltaMixinInputs, PivotMixinInputs, MimicMixinInputs, PathMixinInputs, AnchorMixinInputs {
        activePadding?: number;
        checkForResize?: boolean;
        classes?: string;
        colorSchemeDarkAction?: DefaultInputFunction;
        colorSchemeLightAction?: DefaultInputFunction;
        css?: CommonObjectInput;
        includeInTabNavigation?: boolean;
        noPreferenceDataAction?: DefaultInputFunction;
        noPreferenceMotionAction?: DefaultInputFunction;
        noPreferenceTransparencyAction?: DefaultInputFunction;
        offsetZ?: number;
        pitch?: number;
        position?: string;
        reduceDataAction?: DefaultInputFunction;
        reduceMotionAction?: DefaultInputFunction;
        reduceTransparencyAction?: DefaultInputFunction;
        smoothFont?: boolean;
        trackHere?: string;
        yaw?: number;
}

interface DomMixinFunctions extends BaseMixinFunctions, PositionMixinFunctions, DeltaMixinFunctions, PivotMixinFunctions, MimicMixinFunctions, PathMixinFunctions, AnchorMixinFunctions {}


// Entity mixin
// -------------------------------------
type MethodValues = 'draw' | 'fill' | 'drawAndFill' | 'fillAndDraw' | 'drawThenFill' | 'fillThenDraw' | 'clip' | 'clear' | 'none';

type WindingValues = 'nonzero' | 'evenodd';

interface EntityMixinInputs extends PositionMixinInputs, PivotMixinInputs, MimicMixinInputs, PathMixinInputs, AnchorMixinInputs, FilterMixinInputs, DeltaMixinInputs, StateFactoryInputs {

    flipReverse?: boolean;
    flipUpend?: boolean;
    lockFillStyleToEntity?: boolean;
    lockStrokeStyleToEntity?: boolean;
    method?: MethodValues;
    onDown?: DefaultInputFunction;
    onEnter?: DefaultInputFunction;
    onLeave?: DefaultInputFunction;
    onUp?: DefaultInputFunction;
    scaleOutline?: boolean;
    sharedState?: boolean;
    winding?: WindingValues;
}

interface EntityMixinFunctions extends BaseMixinFunctions, PositionMixinFunctions, PivotMixinFunctions, MimicMixinFunctions, PathMixinFunctions, AnchorMixinFunctions, FilterMixinFunctions, DeltaMixinFunctions, StateFactoryFunctions {}



// Filter mixin
// -------------------------------------
interface FilterMixinInputs {
    filters?: Array<FilterInstance | string>;
    isStencil?: boolean;
    memoizeFilterOutput?: boolean;
}

interface FilterMixinFunctions {
    addFilters: (...items: Array<FilterInstance | string>) => EntityInstance;
    removeFilters: (...items: Array<FilterInstance | string>) => EntityInstance;
    clearFilters: () => EntityInstance;
}



// Mimic mixin
// -------------------------------------
interface MimicMixinInputs {
    addOwnDimensionsToMimic?: boolean;
    addOwnHandleToMimic?: boolean;
    addOwnOffsetToMimic?: boolean;
    addOwnRotationToMimic?: boolean;
    addOwnScaleToMimic?: boolean;
    addOwnStartToMimic?: boolean;
    mimic?: ArtefactInstance | string;
    useMimicDimensions?: boolean;
    useMimicFlip?: boolean;
    useMimicHandle?: boolean;
    useMimicOffset?: boolean;
    useMimicRotation?: boolean;
    useMimicScale?: boolean;
    useMimicStart?: boolean;
}

interface MimicMixinFunctions {}



// Path mixin
// -------------------------------------
interface PathMixinInputs {
    addPathHandle?: boolean;
    addPathOffset?: boolean;
    addPathRotation?: boolean;
    constantSpeedAlongPath?: boolean;
    path?: ShapeInstance | string;
    pathPosition?: number;
}

interface PathMixinFunctions {}



// Pattern mixin
// -------------------------------------
interface PatternMixinInputs {}

interface PatternMixinFunctions {}



// Pivot mixin
// -------------------------------------
type PivotCornerValues = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'; 

interface PivotMixinInputs {
    addPivotHandle?: boolean;
    addPivotOffset?: boolean;
    addPivotRotation?: boolean;
    pivot?: ArtefactInstance | string;
    pivotCorner?: PivotCornerValues;
    pivotPin?: number;
}

interface PivotMixinFunctions {}



// Position mixin
// -------------------------------------
type LockToValues = 'start' | 'pivot' | 'path' | 'mimic' | 'particle' | 'mouse';

type PurgeValues = 'pivot' | 'mimic' | 'path' | 'filter' | 'all' | string[];

interface PositionMixinInputs {
    bringToFrontOnDrag?: boolean;
    dimensions?: CommonTwoElementArrayInput;
    group?: GroupInstance | string;
    handle?: CommonTwoElementArrayInput;
    handleX?: StringOrNumberInput;
    handleY?: StringOrNumberInput;
    height?: StringOrNumberInput;
    ignoreDragForX?: boolean;
    ignoreDragForY?: boolean;
    lockTo?: LockToValues | [LockToValues, LockToValues];
    lockXTo?: LockToValues;
    lockYTo?: LockToValues;
    noCanvasEngineUpdates?: boolean;
    noFilters?: boolean;
    noPathUpdates?: boolean;
    noPositionDependencies?: boolean;
    noUserInteraction?: boolean;
    offset?: CommonTwoElementArrayInput;
    offsetX?: StringOrNumberInput;
    offsetY?: StringOrNumberInput;
    order?: number;
    purge?: PurgeValues;
    roll?: number;
    scale?: number;
    start?: CommonTwoElementArrayInput;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
    visibility?: boolean;
    width?: StringOrNumberInput;
}

interface HitOutput {
    artefact: ArtefactInstance;
    x: number;
    y: number;
}

type HitTests = CommonTwoElementArrayInput | CommonHereObjectInput | Array<CommonTwoElementArrayInput | CommonHereObjectInput>

interface PositionMixinFunctions {
    checkHit: (tests: HitTests, cell: any | null) => HitOutput | boolean;
    dropArtefact: () => void;
    pickupArtefact: (items: CommonTwoElementArrayInput | CommonHereObjectInput) => void;
    purgeArtefact: (item: string | string[]) => void;
}



// ShapeBasic mixin
// -------------------------------------
interface PathPositionObject {
    x: number;
    y: number;
    angle: number;
}

interface ShapeBasicMixinInputs extends EntityMixinInputs {
    boundingBoxColor?: string;
    constantPathSpeed?: boolean;
    minimumBoundingBoxDimensions?: number;
    pathDefinition?: string;
    precision?: number;
    showBoundingBox?: boolean;
    useAsPath?: boolean;
}

interface ShapeBasicMixinFunctions extends EntityMixinFunctions {
    getPathPositionData: (pos: number, constantSpeed?: boolean) => PathPositionObject;
}



// ShapeCurve mixin
// -------------------------------------
interface ShapeCurveMixinInputs extends ShapeBasicMixinInputs {
    addEndPathHandle?: boolean;
    addEndPathOffset?: boolean;
    addEndPivotHandle?: boolean;
    addEndPivotOffset?: boolean;
    end?: CommonTwoElementArrayInput;
    endLockTo?: LockToValues | [LockToValues, LockToValues];
    endParticle?: string;
    endPath?: ShapeInstance | string;
    endPathPosition?: number;
    endPivot?: ArtefactInstance | string;
    endPivotCorner?: PivotCornerValues;
    endPivotPin?: number;
    endX?: StringOrNumberInput;
    endY?: StringOrNumberInput;
    useStartAsControlPoint?: boolean;
}

interface ShapeCurveMixinFunctions extends ShapeBasicMixinFunctions {}



// Styles mixin
// -------------------------------------
type StyleColorsArray = [number, string]

interface StylesMixinInputs {
    colors?: StyleColorsArray[];
    colorSpace?: ColorSpacesValues;
    cyclePalette?: boolean;
    delta?: CommonObjectInput;
    easing?: string | DefaultInputFunction;
    end?: CommonTwoElementArrayInput;
    endX?: StringOrNumberInput;
    endY?: StringOrNumberInput;
    palette?: CommonObjectInput;
    paletteEnd?: number;
    paletteStart?: number;
    precision?: number;
    returnColorAs?: ReturnColorValues;
    start?: CommonTwoElementArrayInput;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
}

interface StylesMixinFunctions {
    removeColor: (index: number) => AnyGradientInstance;
    updateByDelta: () => AnyStyleInstance;
    updateColor: (index: number, color: string) => AnyGradientInstance;
}



// Tween mixin
// -------------------------------------
interface TweenMixinInputs {
    action?: DefaultInputFunction;
    order?: number;
    reverseOnCycleEnd?: boolean;
    targets?: TweenTargetInstance | TweenTargetInstance[];
    ticker?: string;
    time?: StringOrNumberInput;
}

interface TweenMixinFunctions {
    addToTargets: (item: any | any[]) => TweenAnimationInstance;
    addToTicker: (item: string) => TweenAnimationInstance;
    checkForTarget: (item: string) => TweenTargetInstance[];
    removeFromTargets: (item: any | any[]) => TweenAnimationInstance;
    removeFromTicker: (item: string) => TweenAnimationInstance;
    setTargets: (item: any | any[]) => TweenAnimationInstance;
}




// ADDITIONAL HELPERS
// =====================================
type ControlsShapeInstance = BezierInstance | LineInstance | QuadraticInstance;

type ShapeBasedInstance = ControlsShapeInstance | CogInstance | LineSpiralInstance | OvalInstance | PolygonInstance | PolylineInstance | RectangleInstance | ShapeInstance | SpiralInstance | StarInstance | TetragonInstance;

type EntityInstance = ShapeBasedInstance | BlockInstance | CrescentInstance | EmitterInstance | GridInstance | LoomInstance | MeshInstance | NetInstance | PhraseInstance | PictureInstance | TracerInstance | WheelInstance;

type ArtefactInstance = EntityInstance;

type TargetInstance = StackInstance | CanvasInstance | CellInstance;

type AnyGradientInstance = GradientInstance | RadialGradientInstance | ConicGradientInstance;

type AnyStyleInstance = AnyGradientInstance | CellInstance | PatternInstance;

type TweenTargetInstance = AnyGradientInstance | ArtefactInstance | string;

type TweenAnimationInstance = TweenInstance | ActionInstance;

type AssetInstance = ImageAssetInstance | SpriteAssetInstance | VideoAssetInstance | NoiseAssetInstance | ReactionDiffusionAssetInstance | RawAssetInstance | CellInstance;



// FACTORIES
// =====================================



// Action factory
// -------------------------------------
interface ActionFactoryInputs extends BaseMixinInputs, TweenMixinInputs {}

interface ActionFactoryFunctions extends BaseMixinFunctions, TweenMixinFunctions {
    clone: (item?: ActionFactoryInputs) => ActionInstance;
    saveAsPacket: (item?: ActionFactoryInputs) => string;
    set: (item?: ActionFactoryInputs) => ActionInstance;
    setDelta: (item?: CommonObjectInput) => ActionInstance;
}

interface ActionInstance extends ActionFactoryInputs, ActionFactoryFunctions {}




// Anchor factory
// -------------------------------------
interface AnchorFactoryInputs extends BaseMixinInputs {
    blurAction?: boolean;
    clickAction?: () => string;
    description?: string;
    download?: string;
    focusAction?: boolean;
    href?: string;
    hreflang?: string;
    ping?: string;
    referrerPolicy?: string;
    rel?: string;
    target?: string;
    type?: string;
}

interface AnchorFactoryFunctions extends BaseMixinFunctions {}

interface AnchorInstance extends AnchorFactoryInputs, AnchorFactoryFunctions {}



// Animation factory
// -------------------------------------
interface AnimationFactoryInputs extends BaseMixinInputs {}

interface AnimationFactoryFunctions extends BaseMixinFunctions {}

interface AnimationInstance extends AnimationFactoryInputs, AnimationFactoryFunctions {}




// Bezier factory
// -------------------------------------
interface BezierFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs {
    addStartControlPathHandle?: boolean;
    addStartControlPathOffset?: boolean;
    addStartControlPivotHandle?: boolean;
    addStartControlPivotOffset?: boolean;
    startControl?: CommonTwoElementArrayInput;
    startControlLockTo?: LockToValues | [LockToValues, LockToValues];
    startControlParticle?: string;
    startControlPath?: ShapeInstance | string;
    startControlPathPosition?: number;
    startControlPivot?: ArtefactInstance | string;
    startControlPivotCorner?: PivotCornerValues;
    startControlPivotPin?: number;
    startControlX?: StringOrNumberInput;
    startControlY?: StringOrNumberInput;

    addEndControlPathHandle?: boolean;
    addEndControlPathOffset?: boolean;
    addEndControlPivotHandle?: boolean;
    addEndControlPivotOffset?: boolean;
    endControl?: CommonTwoElementArrayInput;
    endControlLockTo?: LockToValues | [LockToValues, LockToValues];
    endControlParticle?: string;
    endControlPath?: ShapeInstance | string;
    endControlPathPosition?: number;
    endControlPivot?: ArtefactInstance | string;
    endControlPivotCorner?: PivotCornerValues;
    endControlPivotPin?: number;
    endControlX?: StringOrNumberInput;
    endControlY?: StringOrNumberInput;
}

interface BezierFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: BezierFactoryInputs) => BezierInstance;
    saveAsPacket: (item?: BezierFactoryInputs) => string;
    set: (item?: BezierFactoryInputs) => BezierInstance;
    setDelta: (item?: CommonObjectInput) => BezierInstance;
}

interface BezierInstance extends BezierFactoryInputs, BezierFactoryFunctions {}




// Block factory
// -------------------------------------
interface BlockFactoryInputs extends BaseMixinInputs, EntityMixinInputs {}

interface BlockFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    clone: (item?: BlockFactoryInputs) => BlockInstance;
    saveAsPacket: (item?: BlockFactoryInputs) => string;
    set: (item?: BlockFactoryInputs) => BlockInstance;
    setDelta: (item?: CommonObjectInput) => BlockInstance;
}

interface BlockInstance extends BlockFactoryInputs, BlockFactoryFunctions {}




// Canvas factory
// -------------------------------------
type CanvasPositionValues = 'relative' | 'absolute';

type CanvasFitValues = 'none' | 'contain' | 'cover' | 'fill';

interface CanvasFactoryInputs extends BaseMixinInputs, DomMixinInputs, DisplayShapeMixinInputs {
    position?: CanvasPositionValues;
    fit?: CanvasFitValues;
    baseMatchesCanvasDimensions?: boolean;
    renderOnResize?: boolean;
    ignoreCanvasCssDimensions?: boolean;
    title?: string;
    label?: string;
    description?: string;
    role?: string;
    backgroundColor?: string;
    alpha?: number;
    composite?: GlobalCompositeOperationValues;
}

interface CanvasFactoryFunctions extends BaseMixinFunctions, DomMixinFunctions, DisplayShapeMixinFunctions {
    setAsCurrentCanvas: () => CanvasInstance;
    setBase: (items: CellFactoryInputs) => CanvasInstance;
    deltaSetBase: (items: CellFactoryInputs) => CanvasInstance;
    buildCell: (items: CellFactoryInputs) => CellInstance;
    addCell: (item: CellInstance | string) => CanvasInstance;
    removeCell: (item: CellInstance | string) => CanvasInstance;
    killCell: (item: CellInstance | string) => CanvasInstance;
    clear: () => void;
    compile: () => void;
    show: () => void;
    render: () => void;
}

interface CanvasInstance extends CanvasFactoryInputs, CanvasFactoryFunctions {}




// Cell factory
// -------------------------------------
interface CellFactoryInputs extends BaseMixinInputs, PositionMixinInputs, DeltaMixinInputs, PivotMixinInputs, MimicMixinInputs, PathMixinInputs, AnchorMixinInputs, CascadeMixinInputs, AssetMixinInputs, PatternMixinInputs, FilterMixinInputs {
    alpha: number;
    backgroundColor: string;
    clearAlpha: number;
    cleared: boolean;
    compiled: boolean;
    compileOrder: number;
    composite: GlobalCompositeOperationValues;
    filter: string;
    flipReverse: boolean;
    flipUpend: boolean;
    scale: number;
    shown: boolean;
    showOrder: number;
    smoothFont: boolean;
    stashHeight: StringOrNumberInput;
    stashWidth: StringOrNumberInput;
    stashX: StringOrNumberInput;
    stashY: StringOrNumberInput;
    useAsPattern: boolean;
}

interface CellFactoryFunctions extends BaseMixinFunctions, PositionMixinFunctions, DeltaMixinFunctions, PivotMixinFunctions, MimicMixinFunctions, PathMixinFunctions, AnchorMixinFunctions, CascadeMixinFunctions, AssetMixinFunctions, PatternMixinFunctions, FilterMixinFunctions {
    clear: () => void;
    compile: () => void;
    render: () => void;
    show: () => void;
    updateArtefacts: (items: CommonObjectInput) => void;
}

interface CellInstance extends CellFactoryInputs, CellFactoryFunctions {}




// Cog factory
// -------------------------------------
type CogCurves = 'line' | 'quadratic' | 'bezier';

interface CogFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    outerRadius?: StringOrNumberInput;
    innerRadius?: StringOrNumberInput;
    outerControlsDistance?: StringOrNumberInput;
    innerControlsDistance?: StringOrNumberInput;
    outerControlsOffset?: StringOrNumberInput
    innerControlsOffset?: StringOrNumberInput
    points?: number;
    twist?: number;
    curve?: CogCurves;
}

interface CogFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: CogFactoryInputs) => CogInstance;
    saveAsPacket: (item?: CogFactoryInputs) => string;
    set: (item?: CogFactoryInputs) => CogInstance;
    setDelta: (item?: CommonObjectInput) => CogInstance;
}

interface CogInstance extends CogFactoryInputs, CogFactoryFunctions {}




// Color factory
// -------------------------------------
interface ColorFactoryInputs extends BaseMixinInputs {}

interface ColorFactoryFunctions extends BaseMixinFunctions {}

interface ColorInstance extends ColorFactoryInputs, ColorFactoryFunctions {}




// ConicGradient factory
// -------------------------------------
interface ConicGradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs {}

interface ConicGradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: ConicGradientFactoryInputs) => ConicGradientInstance;
    saveAsPacket: (item?: ConicGradientFactoryInputs) => string;
    set: (item?: ConicGradientFactoryInputs) => ConicGradientInstance;
    setDelta: (item?: CommonObjectInput) => ConicGradientInstance;
}

interface ConicGradientInstance extends ConicGradientFactoryInputs, ConicGradientFactoryFunctions {}




// Coordinate factory
// -------------------------------------
interface CoordinateFactoryFunctions extends CoordinateInstance {
    add: (item: CoordinateInstance | number[]) => CoordinateInstance;
    divide: (item: CoordinateInstance | number[]) => CoordinateInstance;
    getDotProduct: (coord: CoordinateInstance) => CoordinateInstance;
    getMagnitude: () => number;
    multiply: (item: CoordinateInstance | number[]) => CoordinateInstance;
    reverse: () => CoordinateInstance;
    rotate: (angle: number) => CoordinateInstance;
    scalarDivide: (item: number) => CoordinateInstance;
    scalarMultiply: (item: number) => CoordinateInstance;
    set: (items: QuaternionInstance | VectorInstance | CoordinateInstance | number[] | number | CommonHereObjectInput, y?: number) => CoordinateInstance;
    setFromArray: (item: CoordinateInstance | number[]) => CoordinateInstance;
    setFromVector: (item: VectorInstance | CommonHereObjectInput) => CoordinateInstance;
    subtract: (item: CoordinateInstance | number[]) => CoordinateInstance;
    vectorAdd: (item: VectorInstance | CommonHereObjectInput) => CoordinateInstance;
    vectorSubtract: (item: VectorInstance | CommonHereObjectInput) => CoordinateInstance;
    zero: () => CoordinateInstance;
}

type CoordinateInstance = [StringOrNumberInput, StringOrNumberInput]




// Crescent factory
// -------------------------------------
interface CrescentFactoryInputs extends BaseMixinInputs {}

interface CrescentFactoryFunctions extends BaseMixinFunctions {}

interface CrescentInstance extends CrescentFactoryInputs, CrescentFactoryFunctions {}




// Element factory
// -------------------------------------
interface ElementFactoryInputs extends BaseMixinInputs {}

interface ElementFactoryFunctions extends BaseMixinFunctions {}

interface ElementInstance extends ElementFactoryInputs, ElementFactoryFunctions {}




// Emitter factory
// -------------------------------------
interface EmitterFactoryInputs extends BaseMixinInputs {}

interface EmitterFactoryFunctions extends BaseMixinFunctions {}

interface EmitterInstance extends EmitterFactoryInputs, EmitterFactoryFunctions {}




// Filter factory
// -------------------------------------
interface FilterFactoryInputs extends BaseMixinInputs {
    actions?: CommonObjectInput[];
    alpha?: number | number[];
    angle?: number;
    areaAlphaLevels?: number[],
    asset?: string;
    blend?: string;
    blue?: number | number[];
    blueColor?: string;
    blueInBlue?: number;
    blueInGreen?: number;
    blueInRed?: number;
    channelX?: string;
    channelY?: string;
    clamp?: number;
    compose?: string;
    concurrent?: boolean;
    copyHeight?: number;
    copyWidth?: number;
    copyX?: number;
    copyY?: number;
    easing?: string;
    excludeAlpha?: boolean;
    excludeBlue?: boolean;
    excludeGreen?: boolean;
    excludeRed?: boolean;
    excludeTransparentPixels?: boolean;
    gradient?: string | GradientInstance;
    green?: number | number[];
    greenColor?: string;
    greenInBlue?: number;
    greenInGreen?: number;
    greenInRed?: number;
    gutterHeight?: number;
    gutterWidth?: number;
    height?: number;
    highAlpha?: number;
    highBlue?: number;
    highColor?: string;
    highGreen?: number;
    highRed?: number;
    includeAlpha?: boolean;
    includeBlue?: boolean;
    includeGreen?: boolean;
    includeRed?: boolean;
    innerRadius?: number;
    keepOnlyChangedAreas?: boolean;
    level?: number;
    lineIn?: string;
    lineMix?: string;
    lineOut?: string;
    lowAlpha?: number;
    lowBlue?: number;
    lowColor?: string;
    lowGreen?: number;
    lowRed?: number;
    method?: string;
    minimumColorDistance?: number;
    offsetAlphaMax?: number;
    offsetAlphaMin?: number;
    offsetAlphaX?:number;
    offsetAlphaY?: number;
    offsetBlueMax?: number;
    offsetBlueMin?: number;
    offsetBlueX?: number;
    offsetBlueY?: number;
    offsetGreenMax?: number;
    offsetGreenMin?: number;
    offsetGreenX?: number;
    offsetGreenY?: number;
    offsetMax?: number;
    offsetMin?: number;
    offsetRedMax?: number;
    offsetRedMin?: number;
    offsetRedX?: number;
    offsetRedY?: number;
    offsetX?: number;
    offsetY?: number;
    opacity?: number;
    opaqueAt?: number;
    operation?: string;
    outerRadius?: StringOrNumberInput;
    palette?: string | number;
    passes?: number;
    postProcessResults?: boolean;
    processHorizontal?: boolean;
    processVertical?: boolean;
    radius?: number;
    ranges?: any;
    red?: number | number[];
    redColor?: string;
    redInBlue?: number;
    redInGreen?: number;
    redInRed?: number;
    reference?: string;
    scaleX?: number;
    scaleY?: number;
    seed?: string;
    smoothing?: number;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
    staticSwirls?: any,
    step?: number;
    strength?: number;
    tileHeight?: number;
    tileWidth?: number;
    tolerance?: number;
    transparentAt?: number;
    transparentEdges?: boolean;
    useBluenoise?: boolean;
    useMixedChannel?: boolean;
    useNaturalGrayscale?: boolean;
    weights?: number[];
    width?: number;
}

interface FilterFactoryFunctions extends BaseMixinFunctions {
    clone: (item?: FilterFactoryInputs) => FilterInstance;
    saveAsPacket: (item?: FilterFactoryInputs) => string;
    set: (item?: FilterFactoryInputs) => FilterInstance;
    setDelta: (item?: CommonObjectInput) => FilterInstance;
}

interface FilterInstance extends FilterFactoryInputs, FilterFactoryFunctions {}




// Force factory
// -------------------------------------
interface ForceFactoryInputs extends BaseMixinInputs {}

interface ForceFactoryFunctions extends BaseMixinFunctions {}

interface ForceInstance extends ForceFactoryInputs, ForceFactoryFunctions {}




// Gradient factory
// -------------------------------------
interface GradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs {}

interface GradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: GradientFactoryInputs) => GradientInstance;
    saveAsPacket: (item?: GradientFactoryInputs) => string;
    set: (item?: GradientFactoryInputs) => GradientInstance;
    setDelta: (item?: CommonObjectInput) => GradientInstance;
}

interface GradientInstance extends GradientFactoryInputs, GradientFactoryFunctions {}




// Grid factory
// -------------------------------------
interface GridFactoryInputs extends BaseMixinInputs {}

interface GridFactoryFunctions extends BaseMixinFunctions {}

interface GridInstance extends GridFactoryInputs, GridFactoryFunctions {}




// Group factory
// -------------------------------------
type GroupHosts = CanvasInstance | StackInstance | CellInstance | string;

type GroupArtifactsInput = Array<ArtefactInstance | string>;

type GroupFiltersInput = Array<FilterInstance | string>;

interface GroupFactoryInputs extends BaseMixinInputs, FilterMixinInputs {
    artefacts?: string[];
    host?: GroupHosts;
    order?: number;
    regionRadius?: number;
    stashOutput?: boolean;
    stashOutputAsAsset?: boolean;
    visibility?: boolean;
}

interface GroupFactoryFunctions extends BaseMixinFunctions, FilterMixinFunctions {
    addArtefactClasses: (item: string) => GroupInstance;
    addArtefacts: (...args: GroupArtifactsInput) => GroupInstance;
    addFiltersToEntitys: (...args: GroupFiltersInput) => GroupInstance;
    clearArtefacts: () => GroupInstance;
    clearFiltersFromEntitys: () => GroupInstance;
    clone: (item?: GroupFactoryInputs) => GroupInstance;
    getAllArtefactsAt: (items: HitTests) => HitOutput[];
    getArtefact: (name: string) => ArtefactInstance;
    getArtefactAt: (items: HitTests) => HitOutput | boolean;
    moveArtefactsIntoGroup: (...args: GroupArtifactsInput) => GroupInstance;
    removeArtefactClasses: (item: string) => GroupInstance;
    removeArtefacts: (...args: GroupArtifactsInput) => GroupInstance;
    removeFiltersFromEntitys: (...args: GroupFiltersInput) => GroupInstance;
    reverseByDelta: () => GroupInstance;
    saveAsPacket: (item?: GroupFactoryInputs) => string;
    set: (item?: GroupFactoryInputs) => GroupInstance;
    setArtefacts: (items: CommonObjectInput) => GroupInstance;
    setDelta: (item?: CommonObjectInput) => GroupInstance;
    updateArtefacts: (items: CommonObjectInput) => GroupInstance;
    updateByDelta: () => GroupInstance;
}

interface GroupInstance extends GroupFactoryInputs, GroupFactoryFunctions {}




// ImageAsset factory
// -------------------------------------
interface ImageAssetFactoryInputs extends BaseMixinInputs {}

interface ImageAssetFactoryFunctions extends BaseMixinFunctions {}

interface ImageAssetInstance extends ImageAssetFactoryInputs, ImageAssetFactoryFunctions {}




// Line factory
// -------------------------------------
interface LineFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs {}

interface LineFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: LineFactoryInputs) => LineInstance;
    saveAsPacket: (item?: LineFactoryInputs) => string;
    set: (item?: LineFactoryInputs) => LineInstance;
    setDelta: (item?: CommonObjectInput) => LineInstance;
}

interface LineInstance extends LineFactoryInputs, LineFactoryFunctions {}




// LineSpiral factory
// -------------------------------------
interface LineSpiralFactoryInputs extends BaseMixinInputs {}

interface LineSpiralFactoryFunctions extends BaseMixinFunctions {}

interface LineSpiralInstance extends LineSpiralFactoryInputs, LineSpiralFactoryFunctions {}




// Loom factory
// -------------------------------------
interface LoomFactoryInputs extends BaseMixinInputs {}

interface LoomFactoryFunctions extends BaseMixinFunctions {}

interface LoomInstance extends LoomFactoryInputs, LoomFactoryFunctions {}




// Mesh factory
// -------------------------------------
interface MeshFactoryInputs extends BaseMixinInputs {}

interface MeshFactoryFunctions extends BaseMixinFunctions {}

interface MeshInstance extends MeshFactoryInputs, MeshFactoryFunctions {}




// Net factory
// -------------------------------------
interface NetFactoryInputs extends BaseMixinInputs {}

interface NetFactoryFunctions extends BaseMixinFunctions {}

interface NetInstance extends NetFactoryInputs, NetFactoryFunctions {}




// NoiseAsset factory
// -------------------------------------
type NoiseEngineValues = 'perlin' | 'improved-perlin' | 'simplex' | 'value' | 'stripes' | 'smoothed-stripes' | 'worley-euclidean' | 'worley-manhattan';

type WorleyOutputValues = 'X' | 'Y' | 'Z' | 'XminusY' | 'XminusZ' | 'YminusX' | 'YminusZ' | 'ZminusX' | 'ZminusY' | 'XaddY' | 'XaddZ' | 'YaddZ' | 'XaddYminusZ' | 'XaddZminusY' | 'YaddZminusX' | 'XmultiplyY' | 'XmultiplyZ' | 'YmultiplyZ' | 'XmultiplyYaddZ' | 'XmultiplyZaddY' | 'YmultiplyZaddX' | 'XmultiplyYminusZ' | 'XmultiplyZminusY' | 'YmultiplyZminusX' | 'sum' | 'average';

type SumFunctionValues = 'none' | 'sine-x' | 'sine-y' | 'sine' | 'modular';

type OctaveFunctionValues = 'none' | 'absolute';

interface NoiseAssetFactoryInputs extends BaseMixinInputs, AssetMixinInputs, AssetAdvancedFunctionalityMixinInputs, PatternMixinInputs {
    height?: number;
    lacunarity?: number;
    noiseEngine?: NoiseEngineValues;
    octaves?: number;
    octaveFunction?: OctaveFunctionValues;
    persistence?: number;
    scale?: number;
    seed?: string;
    sineFrequencyCoeff?: number;
    size?: number;
    smoothing?: string;
    sumAmplitude?: number;
    sumFunction?: SumFunctionValues;
    width?: number;
    worleyDepth?: number;
    worleyOutput?: WorleyOutputValues;
}

interface NoiseAssetFactoryFunctions extends BaseMixinFunctions, AssetMixinFunctions, AssetAdvancedFunctionalityMixinFunctions, PatternMixinFunctions {}

interface NoiseAssetInstance extends NoiseAssetFactoryInputs, NoiseAssetFactoryFunctions {}




// Oval factory
// -------------------------------------
interface OvalFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    radius?: StringOrNumberInput;
    radiusX?: StringOrNumberInput;
    radiusY?: StringOrNumberInput;
    intersectX?: number;
    intersectY?: number;
    offshootA?: number;
    offshootB?: number;
}

interface OvalFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: OvalFactoryInputs) => OvalInstance;
    saveAsPacket: (item?: OvalFactoryInputs) => string;
    set: (item?: OvalFactoryInputs) => OvalInstance;
    setDelta: (item?: CommonObjectInput) => OvalInstance;
}

interface OvalInstance extends OvalFactoryInputs, OvalFactoryFunctions {}




// Pattern factory
// -------------------------------------
interface PatternFactoryInputs extends BaseMixinInputs, PatternMixinInputs, AssetConsumerMixinInputs {}

interface PatternFactoryFunctions extends BaseMixinFunctions, PatternMixinFunctions, AssetConsumerMixinFunctions {
    clone: (item?: PatternFactoryInputs) => PatternInstance;
    saveAsPacket: (item?: PatternFactoryInputs) => string;
    set: (item?: PatternFactoryInputs) => PatternInstance;
    setDelta: (item?: CommonObjectInput) => PatternInstance;
}

interface PatternInstance extends PatternFactoryInputs, PatternFactoryFunctions {}




// Phrase factory
// -------------------------------------
type PhraseJustifyValues = 'left' | 'center' | 'right' | 'full';

type PhraseTextPathDirection = 'ltr' | 'rtl';

type PhraseStyle = 'normal' | 'italic' | 'oblique';

type PhraseVariant = 'normal' | 'small-caps';

type PhraseWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;

type PhraseStretch = 'normal' | 'semi-condensed' | 'condensed' | 'extra-condensed' | 'ultra-condensed' | 'semi-expanded' | 'expanded' | 'extra-expanded' | 'ultra-expanded';

type PhraseSize = 'xx-small' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'xx-large' | 'xxx-large' | 'smaller' | 'larger' | string;

type PhraseSizeMetric = 'em' | 'rem' | 'lh' | 'rlh' | 'ex' | 'cap' | 'ch' | 'ic' | '%'| 'vw' | 'vh' | 'vmax' | 'vmin' | 'vi' | 'vb' | 'in' | 'cm' | 'mm' | 'Q' | 'pc' | 'pt' | 'px';

type PhaseFamily = 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy' | 'system-ui' | 'math' | 'emoji' | 'fangsong' | string;

interface PhraseFactoryInputs extends BaseMixinInputs, EntityMixinInputs {
    addTextPathRoll?: boolean;
    boundingBoxColor?: string;
    exposeText?: boolean;
    family?: PhaseFamily;
    font?: string;
    highlightStyle?: string;
    justify?: PhraseJustifyValues;
    letterSpacing?: number;
    lineHeight?: number;
    overlinePosition?: number;
    overlineStyle?: string;
    sectionClassMarker?: string;
    showBoundingBox?: boolean;
    size?: PhraseSize;
    sizeMetric?: PhraseSizeMetric;
    sizeValue?: number;
    stretch?: PhraseStretch;
    style?: PhraseStyle;
    text?: string;
    textPath?: ShapeInstance | string;
    textPathDirection?: PhraseTextPathDirection;
    textPathLoop?: boolean;
    textPathPosition?: number;
    treatWordAsGlyph?: boolean;
    underlinePosition?: number;
    underlineStyle?: string;
    variant?: PhraseVariant;
    weight?: PhraseWeight;
}

interface PhraseFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    addSectionClass: (label: string, obj: CommonObjectInput) => PhraseInstance;
    clone: (item?: PhraseFactoryInputs) => PhraseInstance;
    removeSectionClass: (label: string) => PhraseInstance;
    saveAsPacket: (item?: PhraseFactoryInputs) => string;
    set: (item?: PhraseFactoryInputs) => PhraseInstance;
    setDelta: (item?: CommonObjectInput) => PhraseInstance;
}

interface PhraseInstance extends PhraseFactoryInputs, PhraseFactoryFunctions {}




// Picture factory
// -------------------------------------
interface PictureFactoryInputs extends BaseMixinInputs, EntityMixinInputs, AssetConsumerMixinInputs {
    checkHitIgnoreTransparency?: boolean;
    copyDimensions?: CommonTwoElementArrayInput;
    copyHeight?: StringOrNumberInput;
    copyStart?: CommonTwoElementArrayInput;
    copyStartX?: StringOrNumberInput;
    copyStartY?: StringOrNumberInput;
    copyWidth?: StringOrNumberInput;
}

interface PictureFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions, AssetConsumerMixinFunctions {
    clone: (item?: PictureFactoryInputs) => PictureInstance;
    saveAsPacket: (item?: PictureFactoryInputs) => string;
    set: (item?: PictureFactoryInputs) => PictureInstance;
    setDelta: (item?: CommonObjectInput) => PictureInstance;
}

interface PictureInstance extends PictureFactoryInputs, PictureFactoryFunctions {}




// Polygon factory
// -------------------------------------
interface PolygonFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    sides?: number;
    sideLength?: number;
}

interface PolygonFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: PolygonFactoryInputs) => PolygonInstance;
    saveAsPacket: (item?: PolygonFactoryInputs) => string;
    set: (item?: PolygonFactoryInputs) => PolygonInstance;
    setDelta: (item?: CommonObjectInput) => PolygonInstance;
}

interface PolygonInstance extends PolygonFactoryInputs, PolygonFactoryFunctions {}




// Polyline factory
// -------------------------------------
interface PolylineFactoryInputs extends BaseMixinInputs {}

interface PolylineFactoryFunctions extends BaseMixinFunctions {}

interface PolylineInstance extends PolylineFactoryInputs, PolylineFactoryFunctions {}




// Quadratic factory
// -------------------------------------
interface QuadraticFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs {
    addControlPathHandle?: boolean;
    addControlPathOffset?: boolean;
    addControlPivotHandle?: boolean;
    addControlPivotOffset?: boolean;
    control?: CommonTwoElementArrayInput;
    controlLockTo?: LockToValues | [LockToValues, LockToValues];
    controlParticle?: string;
    controlPath?: ShapeInstance | string;
    controlPathPosition?: number;
    controlPivot?: ArtefactInstance | string;
    controlPivotCorner?: PivotCornerValues;
    controlPivotPin?: number;
    controlX?: StringOrNumberInput;
    controlY?: StringOrNumberInput;
}

interface QuadraticFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: QuadraticFactoryInputs) => QuadraticInstance;
    saveAsPacket: (item?: QuadraticFactoryInputs) => string;
    set: (item?: QuadraticFactoryInputs) => QuadraticInstance;
    setDelta: (item?: CommonObjectInput) => QuadraticInstance;
}

interface QuadraticInstance extends QuadraticFactoryInputs, QuadraticFactoryFunctions {}




// Quaternion factory
// -------------------------------------
interface QuaternionFactoryFunctions {
    getAngle: (degree: boolean) => number;
    getMagnitude: () => number;
    normalize: () => QuaternionInstance;
    quaternionMultiply: (item: QuaternionInstance) => QuaternionInstance;
    quaternionRotate: (item: QuaternionInstance) => QuaternionInstance;
    set: (obj: QuaternionInstance | VectorInstance | CommonObjectInput) => QuaternionInstance;
    setFromEuler: (items: CommonObjectInput) => QuaternionInstance;
    setFromQuaternion: (item: QuaternionInstance) => QuaternionInstance;
    zero: () => QuaternionInstance;
}

interface QuaternionInstance extends QuaternionFactoryFunctions {
    n: number;
    name: string;
    v: VectorInstance;
}




// RadialGradient factory
// -------------------------------------
interface RadialGradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs {
    endRadius?: StringOrNumberInput;
    startRadius?: StringOrNumberInput;
}

interface RadialGradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: RadialGradientFactoryInputs) => RadialGradientInstance;
    saveAsPacket: (item?: RadialGradientFactoryInputs) => string;
    set: (item?: RadialGradientFactoryInputs) => RadialGradientInstance;
    setDelta: (item?: CommonObjectInput) => RadialGradientInstance;
}

interface RadialGradientInstance extends RadialGradientFactoryInputs, RadialGradientFactoryFunctions {}




// RawAsset factory
// -------------------------------------
interface RawAssetFactoryInputs extends BaseMixinInputs {}

interface RawAssetFactoryFunctions extends BaseMixinFunctions {}

interface RawAssetInstance extends RawAssetFactoryInputs, RawAssetFactoryFunctions {}




// ReactionDiffusionAsset factory
// -------------------------------------
interface ReactionDiffusionAssetFactoryInputs extends BaseMixinInputs {}

interface ReactionDiffusionAssetFactoryFunctions extends BaseMixinFunctions {}

interface ReactionDiffusionAssetInstance extends ReactionDiffusionAssetFactoryInputs, ReactionDiffusionAssetFactoryFunctions {}




// Rectangle factory
// -------------------------------------
interface RectangleFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    offshootA?: number;
    offshootB?: number;
    radius?: StringOrNumberInput;
    radiusB?: StringOrNumberInput;
    radiusBL?: StringOrNumberInput;
    radiusBLX?: StringOrNumberInput;
    radiusBLY?: StringOrNumberInput;
    radiusBR?: StringOrNumberInput;
    radiusBRX?: StringOrNumberInput;
    radiusBRY?: StringOrNumberInput;
    radiusBX?: StringOrNumberInput;
    radiusBY?: StringOrNumberInput;
    radiusL?: StringOrNumberInput;
    radiusLX?: StringOrNumberInput;
    radiusLY?: StringOrNumberInput;
    radiusR?: StringOrNumberInput;
    radiusRX?: StringOrNumberInput;
    radiusRY?: StringOrNumberInput;
    radiusT?: StringOrNumberInput;
    radiusTL?: StringOrNumberInput;
    radiusTLX?: StringOrNumberInput;
    radiusTLY?: StringOrNumberInput;
    radiusTR?: StringOrNumberInput;
    radiusTRX?: StringOrNumberInput;
    radiusTRY?: StringOrNumberInput;
    radiusTX?: StringOrNumberInput;
    radiusTY?: StringOrNumberInput;
    radiusX?: StringOrNumberInput;
    radiusY?: StringOrNumberInput;
    rectangleHeight?: StringOrNumberInput;
    rectangleWidth?: StringOrNumberInput;
}

interface RectangleFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: RectangleFactoryInputs) => RectangleInstance;
    saveAsPacket: (item?: RectangleFactoryInputs) => string;
    set: (item?: RectangleFactoryInputs) => RectangleInstance;
    setDelta: (item?: CommonObjectInput) => RectangleInstance;
}

interface RectangleInstance extends RectangleFactoryInputs, RectangleFactoryFunctions {}




// Render factory
// -------------------------------------
interface RenderFactoryInputs extends BaseMixinInputs {
    afterClear?: DefaultInputFunction;
    afterCompile?: DefaultInputFunction;
    afterCreated?: DefaultInputFunction;
    afterShow?: DefaultInputFunction;
    commence?: DefaultInputFunction;
    error?: DefaultInputFunction;
    onHalt?: DefaultInputFunction;
    onKill?: DefaultInputFunction;
    onRun?: DefaultInputFunction;
    order?: number;
    target?: string | TargetInstance | Array<string | TargetInstance>;
}

interface RenderFactoryFunctions extends BaseMixinFunctions {
    halt: () => void;
    isRunning: () => boolean;
    run: () => void;
}

interface RenderInstance extends RenderFactoryInputs, RenderFactoryFunctions {}




// Shape factory
// -------------------------------------
interface ShapeFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {}

interface ShapeFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: ShapeFactoryInputs) => ShapeInstance;
    saveAsPacket: (item?: ShapeFactoryInputs) => string;
    set: (item?: ShapeFactoryInputs) => ShapeInstance;
    setDelta: (item?: CommonObjectInput) => ShapeInstance;
}

interface ShapeInstance extends ShapeFactoryInputs, ShapeFactoryFunctions {
    length: number;
}




// Spiral factory
// -------------------------------------
interface SpiralFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    loops?: number;
    loopIncrement?: number;
    drawFromLoop?: number;
}

interface SpiralFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: SpiralFactoryInputs) => SpiralInstance;
    saveAsPacket: (item?: SpiralFactoryInputs) => string;
    set: (item?: SpiralFactoryInputs) => SpiralInstance;
    setDelta: (item?: CommonObjectInput) => SpiralInstance;
}

interface SpiralInstance extends SpiralFactoryInputs, SpiralFactoryFunctions {}




// Spring factory
// -------------------------------------
interface SpringFactoryInputs extends BaseMixinInputs {}

interface SpringFactoryFunctions extends BaseMixinFunctions {}

interface SpringInstance extends SpringFactoryInputs, SpringFactoryFunctions {}




// SpriteAsset factory
// -------------------------------------
interface SpriteAssetFactoryInputs extends BaseMixinInputs {}

interface SpriteAssetFactoryFunctions extends BaseMixinFunctions {}

interface SpriteAssetInstance extends SpriteAssetFactoryInputs, SpriteAssetFactoryFunctions {}




// Stack factory
// -------------------------------------
interface StackFactoryInputs extends BaseMixinInputs {}

interface StackFactoryFunctions extends BaseMixinFunctions {}

interface StackInstance extends StackFactoryInputs, StackFactoryFunctions {}




// Star factory
// -------------------------------------
interface StarFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    radius1?: StringOrNumberInput;
    radius2?: StringOrNumberInput;
    points?: number;
    twist?: number;
}

interface StarFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: StarFactoryInputs) => StarInstance;
    saveAsPacket: (item?: StarFactoryInputs) => string;
    set: (item?: StarFactoryInputs) => StarInstance;
    setDelta: (item?: CommonObjectInput) => StarInstance;
}

interface StarInstance extends StarFactoryInputs, StarFactoryFunctions {}




// State factory
// -------------------------------------
type GlobalCompositeOperationValues = 'source-over' | 'source-atop' | 'source-in' | 'source-out' | 'destination-over' | 'destination-atop' | 'destination-in' | 'destination-out' | 'lighter' | 'darker' | 'copy' | 'xor' | string;

type LineCapValues = 'butt' | 'round' | 'square';

type LineJoinValues = 'miter' | 'round' | 'bevel';

interface StateFactoryInputs {
    fillStyle?: any;
    filter?: string;
    font?: string;
    globalAlpha?: number;
    globalCompositeOperation?: GlobalCompositeOperationValues;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: string;
    lineCap?: LineCapValues;
    lineDash?: number[];
    lineDashOffset?: number;
    lineJoin?: LineJoinValues;
    lineWidth?: number;
    miterLimit?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    strokeStyle?: any;
}

interface StateFactoryFunctions extends BaseMixinFunctions {}

interface StateInstance extends StateFactoryInputs, StateFactoryFunctions {}



// Tetragon factory
// -------------------------------------
interface TetragonFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs {
    radius?: StringOrNumberInput;
    radiusX?: StringOrNumberInput
    radiusY?: StringOrNumberInput
    intersectX?: number;
    intersectY?: number;
}

interface TetragonFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: TetragonFactoryInputs) => TetragonInstance;
    saveAsPacket: (item?: TetragonFactoryInputs) => string;
    set: (item?: TetragonFactoryInputs) => TetragonInstance;
    setDelta: (item?: CommonObjectInput) => TetragonInstance;
}

interface TetragonInstance extends TetragonFactoryInputs, TetragonFactoryFunctions {}




// Ticker factory
// -------------------------------------
interface TickerFactoryInputs extends BaseMixinInputs {
    cycles?: number;
    duration?: StringOrNumberInput;
    eventChoke?: number;
    killOnComplete?: boolean;
    onComplete?: DefaultInputFunction;
    onHalt?: DefaultInputFunction;
    onReset?: DefaultInputFunction;
    onResume?: DefaultInputFunction;
    onReverse?: DefaultInputFunction;
    onRun?: DefaultInputFunction;
    onSeekFor?: DefaultInputFunction;
    onSeekTo?: DefaultInputFunction;
    order?: number;
}

interface TickerFactoryFunctions extends BaseMixinFunctions {
    clone: (item?: TickerFactoryInputs) => TickerInstance;
    complete: () => TickerInstance;
    halt: () => TickerInstance;
    isRunning: () => boolean;
    reset: () => TickerInstance;
    resume: () => TickerInstance;
    reverse: () => TickerInstance;
    run: () => TickerInstance;
    saveAsPacket: (item?: TickerFactoryInputs) => string;
    seekFor: (item: number) => TickerInstance;
    seekTo: (item: number) => TickerInstance;
    set: (item?: TickerFactoryInputs) => TickerInstance;
    setDelta: (item?: CommonObjectInput) => TickerInstance;
}

interface TickerInstance extends TickerFactoryInputs, TickerFactoryFunctions {}




// Tracer factory
// -------------------------------------
interface TracerFactoryInputs extends BaseMixinInputs {}

interface TracerFactoryFunctions extends BaseMixinFunctions {}

interface TracerInstance extends TracerFactoryInputs, TracerFactoryFunctions {}




// Tween factory
// -------------------------------------
type TweenEngineFunction = (start: number, change: number, position: number) => StringOrNumberInput; 

interface TweenDefinitionsObject {
    attribute: string;
    end: StringOrNumberInput;
    engine?: TweenEngineFunction | string;
    integer?: boolean;
    start: StringOrNumberInput;
}

interface TweenFactoryInputs extends BaseMixinInputs, TweenMixinInputs {
    commenceAction?: DefaultInputFunction;
    completeAction?: DefaultInputFunction;
    cycles?: number;
    definitions?: TweenDefinitionsObject[];
    duration?: StringOrNumberInput;
    eventChoke?: number;
    killOnComplete?: boolean;
    onHalt?: DefaultInputFunction;
    onResume?: DefaultInputFunction;
    onReverse?: DefaultInputFunction;
    onRun?: DefaultInputFunction;
    onSeekFor?: DefaultInputFunction;
    onSeekTo?: DefaultInputFunction;
    ticker?: string;
}

interface TweenFactoryFunctions extends BaseMixinFunctions, TweenMixinFunctions {
    clone: (item?: TweenFactoryInputs) => TweenInstance;
    halt: () => TweenInstance;
    isRunning: () => boolean;
    resume: () => TweenInstance;
    reverse: () => TweenInstance;
    run: () => TweenInstance;
    saveAsPacket: (item?: TweenFactoryInputs) => string;
    seekFor: (item: number) => TweenInstance;
    seekTo: (item: number) => TweenInstance;
    set: (item?: TweenFactoryInputs) => TweenInstance;
    setDelta: (item?: CommonObjectInput) => TweenInstance;
}

interface TweenInstance extends TweenFactoryInputs, TweenFactoryFunctions {}




// Vector factory
// -------------------------------------
interface VectorFactoryFunctions {
    getMagnitude: () => number;
    getXYCoordinate: () => [number, number];
    getXYZCoordinate: () => [number, number, number];
    normalize: () => VectorInstance;
    reverse: () => VectorInstance;
    rotate: (angle: number) => VectorInstance;
    scalarDivide: (item: number) => VectorInstance;
    scalarMultiply: (item: number) => VectorInstance;
    set: (x: VectorInstance | CoordinateInstance | number | number[] | CommonHereObjectInput, y?: number, z?: number) => VectorInstance;
    setFromArray: (args: number[] | CoordinateInstance) => VectorInstance;
    setFromVector: (item: VectorInstance | CommonHereObjectInput)  => VectorInstance;
    setX: (x: number) => VectorInstance;
    setXY: (x: number, y: number) => VectorInstance;
    setY: (y: number) => VectorInstance;
    setZ: (z: number) => VectorInstance;
    vectorAdd: (item: VectorInstance | CoordinateInstance | number[] | CommonHereObjectInput) => VectorInstance;
    vectorAddArray: (item: number[] | CoordinateInstance) => VectorInstance;
    vectorMultiply: (item: VectorInstance | CoordinateInstance | number[] | CommonHereObjectInput) => VectorInstance;
    vectorMultiplyArray: (item: number[] | CoordinateInstance) => VectorInstance;
    vectorSubtract: (item: VectorInstance | CoordinateInstance | number[] | CommonHereObjectInput) => VectorInstance;
    vectorSubtractArray: (item: number[] | CoordinateInstance) => VectorInstance;
    zero: () => VectorInstance;
}

interface VectorInstance extends VectorFactoryFunctions {
    x: number;
    y: number;
    z: number;
}




// VideoAsset factory
// -------------------------------------
interface VideoAssetFactoryInputs extends BaseMixinInputs {}

interface VideoAssetFactoryFunctions extends BaseMixinFunctions {}

interface VideoAssetInstance extends VideoAssetFactoryInputs, VideoAssetFactoryFunctions {}




// Wheel factory
// -------------------------------------
interface WheelFactoryInputs extends BaseMixinInputs, EntityMixinInputs {
    clockwise?: boolean;
    closed?:  boolean;
    endAngle?: number;
    includeCenter?:  boolean;
    radius?: StringOrNumberInput;
    startAngle?: number;
}

interface WheelFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    clone: (item?: WheelFactoryInputs) => WheelInstance;
    saveAsPacket: (item?: WheelFactoryInputs) => string;
    set: (item?: WheelFactoryInputs) => WheelInstance;
    setDelta: (item?: CommonObjectInput) => WheelInstance;
}

interface WheelInstance extends WheelFactoryInputs, WheelFactoryFunctions {}




// World factory
// -------------------------------------
interface WorldFactoryInputs extends BaseMixinInputs {}

interface WorldFactoryFunctions extends BaseMixinFunctions {}

interface WorldInstance extends WorldFactoryInputs, WorldFactoryFunctions {}





// observeAndUpdate factory (not stored in library)
type ObserveAndUpdateStrings = 'float' | 'int' | 'round' | 'roundDown' | 'roundUp' | 'raw' | 'string' | 'boolean' | '%' | string;

interface ObserveAndUpdateInputs {
    event: string | string[];
    origin: any;
    target: any;
    useNativeListener?: boolean;
    preventDefault?: boolean;
    updates: {
        [index: string]: [string, ObserveAndUpdateStrings];
    };
}

// makeDragZone factory (not stored in library)
interface MakeDragZoneInputs {
    zone: any;
    coordinateSource?: any;
    collisionGroup?: any;
    startOn?: string | string[];
    endOn?: string | string[];
    updateOnStart?: {
        [index: string]: any;
    } | DefaultInputFunction;
    updateOnEnd?: {
        [index: string]: any;
    } | DefaultInputFunction;
    updateWhileMoving?: DefaultInputFunction;
    exposeCurrentArtefact?: boolean;
    preventTouchDefaultWhenDragging?: boolean;
    resetCoordsToZeroOnTouchEnd?: boolean;
}


type DragZoneOutput = () => HitOutput | boolean;


export function addListener(
    evt: string | string[], 
    fn: DefaultInputFunction, 
    targ: string | object | Array<string | object>
): DefaultOutputFunction;

export function removeListener(
    evt: string | string[], 
    fn: DefaultInputFunction, 
    targ: string | object | Array<string | object>
): DefaultOutputFunction;

export function addNativeListener(
    evt: string | string[], 
    fn: DefaultInputFunction, 
    targ: string | object | Array<string | object>
): DefaultOutputFunction;

export function removeNativeListener(
    evt: string | string[], 
    fn: DefaultInputFunction, 
    targ: string | object | Array<string | object>
): DefaultOutputFunction;



export function addCanvas(): void;
export function addStack(): void;
export function clear(): void;
export function compile(): void;
export function createImageFromCell(item: CellInstance | CanvasInstance | string, stashAsAsset: boolean): void;
export function createImageFromEntity(item: EntityInstance | string, stashAsAsset: boolean): void;
export function createImageFromGroup(item: GroupInstance | CellInstance | CanvasInstance | string, stashAsAsset: boolean): void;
export function getCanvas(): void;
export function getIgnorePixelRatio(): void;
export function getPixelRatio(): void;
export function getStack(): void;
export function getTouchActionChoke(): number;
export function importDomImage(query: string): void;
export function importDomVideo(query: string): void;
export function importImage(): void;
export function importMediaStream(items: CommonObjectInput): Promise<VideoAssetInstance>;
export function importSprite(): void;
export function importVideo(): void;
export function init(): void;
export function makeAction(items: ActionFactoryInputs): ActionInstance;
export function makeAnimation(items: AnimationFactoryInputs): AnimationInstance;
export function makeAnimationObserver(): void;
export function makeBezier(items: BezierFactoryInputs): BezierInstance;
export function makeBlock(items: BlockFactoryInputs): BlockInstance;
export function makeCog(items: CogFactoryInputs): CogInstance;
export function makeColor(items: ColorFactoryInputs): ColorInstance;
export function makeConicGradient(items: ConicGradientFactoryInputs): ConicGradientInstance;
export function makeCrescent(items: CrescentFactoryInputs): CrescentInstance;
export function makeDragZone(items: MakeDragZoneInputs): DefaultOutputFunction | DragZoneOutput;
export function makeEmitter(items: EmitterFactoryInputs): EmitterInstance;
export function makeFilter(items: FilterFactoryInputs): FilterInstance;
export function makeForce(items: ForceFactoryInputs): ForceInstance;
export function makeGradient(items: GradientFactoryInputs): GradientInstance;
export function makeGrid(items: GridFactoryInputs): GridInstance;
export function makeGroup(items: GroupFactoryInputs): GroupInstance;
export function makeLine(items: LineFactoryInputs): LineInstance;
export function makeLineSpiral(items: LineSpiralFactoryInputs): LineSpiralInstance;
export function makeLoom(items: LoomFactoryInputs): LoomInstance;
export function makeMesh(items: MeshFactoryInputs): MeshInstance;
export function makeNet(items: NetFactoryInputs): NetInstance;
export function makeNoise(items: NoiseAssetFactoryInputs): NoiseAssetInstance;
export function makeNoiseAsset(items: NoiseAssetFactoryInputs): NoiseAssetInstance;
export function makeOval(items: OvalFactoryInputs): OvalInstance;
export function makePattern(items: PatternFactoryInputs): PatternInstance;
export function makePhrase(items: PhraseFactoryInputs): PhraseInstance;
export function makePicture(items: PictureFactoryInputs): PictureInstance;
export function makePolygon(items: PolygonFactoryInputs): PolygonInstance;
export function makePolyline(items: PolylineFactoryInputs): PolylineInstance;
export function makeQuadratic(items: QuadraticFactoryInputs): QuadraticInstance;
export function makeRadialGradient(items: RadialGradientFactoryInputs): RadialGradientInstance;
export function makeRawAsset(items: RawAssetFactoryInputs): RawAssetInstance;
export function makeReactionDiffusionAsset(items: ReactionDiffusionAssetFactoryInputs): ReactionDiffusionAssetInstance;
export function makeRectangle(items: RectangleFactoryInputs): RectangleInstance;
export function makeRender(items: RenderFactoryInputs): RenderInstance;
export function makeShape(items: ShapeFactoryInputs): ShapeInstance;
export function makeSnippet(): void;
export function makeSpiral(items: SpiralFactoryInputs): SpiralInstance;
export function makeSpring(items: SpringFactoryInputs): SpringInstance;
export function makeStar(items: StarFactoryInputs): StarInstance;
export function makeTetragon(items: TetragonFactoryInputs): TetragonInstance;
export function makeTicker(items: TickerFactoryInputs): TickerInstance;
export function makeTracer(items: TracerFactoryInputs): TracerInstance;
export function makeTween(items: TweenFactoryInputs): TweenInstance;
export function makeWheel(items: WheelFactoryInputs): WheelInstance;
export function makeWorld(items: WorldFactoryInputs): WorldInstance;
export function observeAndUpdate(items: ObserveAndUpdateInputs): DefaultOutputFunction;
export function releaseCoordinate(item: CoordinateInstance): void;
export function releaseQuaternion(item: QuaternionInstance): void;
export function releaseVector(item: VectorInstance): void;
export function render(): void;
export function requestCoordinate(): CoordinateInstance;
export function requestQuaternion(): QuaternionInstance;
export function requestVector(): VectorInstance;
export function seededRandomNumberGenerator(): void;
export function setCurrentCanvas(): void;
export function setFilterMemoizationChoke(): void;
export function setIgnorePixelRatio(item: boolean): void;
export function setPixelRatioChangeAction(): void;
export function setTouchActionChoke(item: number): void;
export function show(): void;
export function startCoreAnimationLoop(): void;
export function startCoreListeners(): void;
export function stopCoreAnimationLoop(): void;
export function stopCoreListeners(): void;


export const library: CommonObjectInput;
export const scrawl: CommonObjectInput;
