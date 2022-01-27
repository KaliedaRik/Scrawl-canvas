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



// MIXINS
// =====================================



// Anchor mixin
// -------------------------------------
interface AnchorMixinDeltaInputs {}

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
interface AssetMixinDeltaInputs {}

interface AssetMixinInputs {}

interface AssetMixinFunctions {}



// AssetAdvancedFunctionality mixin
// -------------------------------------
interface AssetAdvancedFunctionalityMixinDeltaInputs {
    paletteEnd?: number;
    paletteStart?: number;
}

interface AssetAdvancedFunctionalityMixinInputs {
    choke?: number;
    colors?: StyleColorsArray[];
    colorSpace?: ColorSpacesValues;
    cyclePalette?: boolean;
    // delta?: AssetAdvancedFunctionalityMixinDeltaInputs;
    easing?: string | DefaultInputFunction;
    precision?: number;
    returnColorAs?: ReturnColorValues;
}

interface AssetAdvancedFunctionalityMixinFunctions {
    update: () => void;
}




// AssetConsumer mixin
// -------------------------------------
interface AssetConsumerMixinDeltaInputs {}

interface AssetConsumerMixinInputs {
    asset?: string | AssetInstance,
    removeAssetOnKill?: string;

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

    playSprite: (speed?: number, loop?: boolean, track?: string, forward?: boolean, frame?: number) => void;
    haltSprite: (speed?: number, loop?: boolean, track?: string, forward?: boolean, frame?: number) => void;
}



// Base mixin
// -------------------------------------
interface BaseMixinDeltaInputs {}

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
interface CascadeMixinDeltaInputs {}

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
interface DeltaMixinDeltaInputs {}

interface DeltaMixinInputs {
    checkDeltaConstraints?: boolean;
    // delta?: CommonObjectInput;
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
interface DisplayShapeMixinDeltaInputs {}

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
interface DomMixinDeltaInputs extends PositionMixinDeltaInputs, DeltaMixinDeltaInputs, PivotMixinDeltaInputs, MimicMixinDeltaInputs, PathMixinDeltaInputs, AnchorMixinDeltaInputs {
    offsetZ?: number;
    pitch?: number;
    yaw?: number;
}

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
    position?: string;
    reduceDataAction?: DefaultInputFunction;
    reduceMotionAction?: DefaultInputFunction;
    reduceTransparencyAction?: DefaultInputFunction;
    smoothFont?: boolean;
    trackHere?: string;
}

interface DomMixinFunctions extends BaseMixinFunctions, PositionMixinFunctions, DeltaMixinFunctions, PivotMixinFunctions, MimicMixinFunctions, PathMixinFunctions, AnchorMixinFunctions {}


// Entity mixin
// -------------------------------------
type MethodValues = 'draw' | 'fill' | 'drawAndFill' | 'fillAndDraw' | 'drawThenFill' | 'fillThenDraw' | 'clip' | 'clear' | 'none';

type WindingValues = 'nonzero' | 'evenodd';

interface EntityMixinDeltaInputs extends PositionMixinDeltaInputs, PivotMixinDeltaInputs, MimicMixinDeltaInputs, PathMixinDeltaInputs, AnchorMixinDeltaInputs, FilterMixinDeltaInputs, DeltaMixinDeltaInputs, StateFactoryDeltaInputs {}

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
interface FilterMixinDeltaInputs {}

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
interface MimicMixinDeltaInputs {}

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
interface PathMixinDeltaInputs {
    pathPosition?: number;
}

interface PathMixinInputs {
    addPathHandle?: boolean;
    addPathOffset?: boolean;
    addPathRotation?: boolean;
    constantSpeedAlongPath?: boolean;
    path?: ShapeInstance | string;
}

interface PathMixinFunctions {}



// Pattern mixin
// -------------------------------------
interface PatternMatrix {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
}

interface PatternMixinDeltaInputs {
    matrixA?: number; 
    matrixB?: number; 
    matrixC?: number; 
    matrixD?: number; 
    matrixE?: number; 
    matrixF?: number; 
}

interface PatternMixinInputs {
    repeat?: string;
    patternMatrix?: PatternMatrix;
}

interface PatternMixinFunctions {}



// Pivot mixin
// -------------------------------------
type PivotCornerValues = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'; 

interface PivotMixinDeltaInputs {}

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

interface PositionMixinDeltaInputs {
    dimensions?: CommonTwoElementArrayInput;
    handle?: CommonTwoElementArrayInput;
    handleX?: StringOrNumberInput;
    handleY?: StringOrNumberInput;
    height?: StringOrNumberInput;
    offset?: CommonTwoElementArrayInput;
    offsetX?: StringOrNumberInput;
    offsetY?: StringOrNumberInput;
    roll?: number;
    scale?: number;
    start?: CommonTwoElementArrayInput;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
    width?: StringOrNumberInput;
}

interface PositionMixinInputs {
    bringToFrontOnDrag?: boolean;
    group?: GroupInstance | string;
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
    order?: number;
    purge?: PurgeValues;
    visibility?: boolean;
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

interface ShapeBasicMixinDeltaInputs extends EntityMixinDeltaInputs {}

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
    getBoundingBox: () => number[]
}



// ShapeCurve mixin
// -------------------------------------
interface ShapeCurveMixinDeltaInputs extends ShapeBasicMixinDeltaInputs {
    end?: CommonTwoElementArrayInput;
    endPathPosition?: number;
    endX?: StringOrNumberInput;
    endY?: StringOrNumberInput;
}

interface ShapeCurveMixinInputs extends ShapeBasicMixinInputs {
    addEndPathHandle?: boolean;
    addEndPathOffset?: boolean;
    addEndPivotHandle?: boolean;
    addEndPivotOffset?: boolean;
    endLockTo?: LockToValues | [LockToValues, LockToValues];
    endParticle?: string;
    endPath?: ShapeInstance | string;
    endPivot?: ArtefactInstance | string;
    endPivotCorner?: PivotCornerValues;
    endPivotPin?: number;
    useStartAsControlPoint?: boolean;
}

interface ShapeCurveMixinFunctions extends ShapeBasicMixinFunctions {}



// Styles mixin
// -------------------------------------
type StyleColorsArray = [number, string]

interface StylesMixinDeltaInputs {
    end?: CommonTwoElementArrayInput;
    endX?: StringOrNumberInput;
    endY?: StringOrNumberInput;
    paletteEnd?: number;
    paletteStart?: number;
    start?: CommonTwoElementArrayInput;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
}

interface StylesMixinInputs {
    colors?: StyleColorsArray[];
    colorSpace?: ColorSpacesValues;
    cyclePalette?: boolean;
    easing?: string | DefaultInputFunction;
    palette?: CommonObjectInput;
    precision?: number;
    returnColorAs?: ReturnColorValues;
}

interface StylesMixinFunctions {
    removeColor: (index: number) => AnyGradientInstance;
    updateByDelta: () => StylesInstance;
    updateColor: (index: number, color: string) => AnyGradientInstance;
}



// Tween mixin
// -------------------------------------
interface TweenMixinDeltaInputs {
    time?: StringOrNumberInput;
}

interface TweenMixinInputs {
    action?: DefaultInputFunction;
    order?: number;
    reverseOnCycleEnd?: boolean;
    targets?: TweenTargetInstance | TweenTargetInstance[];
    ticker?: string;
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

type ArtefactInstance = EntityInstance | StackInstance | CanvasInstance | ElementInstance | UnstackedElementInstance;

type TargetInstance = StackInstance | CanvasInstance | CellInstance;

type AnyGradientInstance = GradientInstance | RadialGradientInstance | ConicGradientInstance;

type StylesInstance = AnyGradientInstance | CellInstance | PatternInstance | ColorInstance;

type TweenTargetInstance = AnyGradientInstance | ArtefactInstance | string;

type TweenAnimationInstance = TweenInstance | ActionInstance;

type AssetInstance = ImageAssetInstance | SpriteAssetInstance | VideoAssetInstance | NoiseAssetInstance | ReactionDiffusionAssetInstance | RawAssetInstance | CellInstance;



// FACTORIES
// =====================================



// ActionInstance factory
// -------------------------------------
interface ActionFactoryDeltaInputs extends BaseMixinDeltaInputs, TweenMixinDeltaInputs {}

interface ActionFactoryInputs extends BaseMixinInputs, TweenMixinInputs, ActionFactoryDeltaInputs {
    delta?: ActionFactoryDeltaInputs;
    revert?: DefaultInputFunction;
}

interface ActionFactoryFunctions extends BaseMixinFunctions, TweenMixinFunctions {
    clone: (item?: ActionFactoryInputs) => ActionInstance;
    saveAsPacket: (item?: ActionFactoryInputs) => string;
    set: (item?: ActionFactoryInputs) => ActionInstance;
    setDelta: (item?: ActionFactoryDeltaInputs) => ActionInstance;
}

interface ActionInstance extends ActionFactoryInputs, ActionFactoryFunctions {}




// AnchorInstance factory
// -------------------------------------
interface AnchorFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface AnchorFactoryInputs extends BaseMixinInputs, AnchorFactoryDeltaInputs {
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



// AnimationInstance factory
// -------------------------------------
interface AnimationFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface AnimationFactoryInputs extends BaseMixinInputs, AnimationFactoryDeltaInputs {
    order?: number;
    fn?: DefaultInputFunction;
    onRun?: DefaultInputFunction;
    onHalt?: DefaultInputFunction;
    onKill?: DefaultInputFunction;
}

interface AnimationFactoryFunctions extends BaseMixinFunctions {
    run: () => AnimationInstance;
    isRunning: () => boolean;
    halt: () => AnimationInstance;
}

interface AnimationInstance extends AnimationFactoryInputs, AnimationFactoryFunctions {}




// BezierInstance factory
// -------------------------------------
interface BezierFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeCurveMixinDeltaInputs {
    startControl?: CommonTwoElementArrayInput;
    startControlPathPosition?: number;
    startControlX?: StringOrNumberInput;
    startControlY?: StringOrNumberInput;
    endControl?: CommonTwoElementArrayInput;
    endControlPathPosition?: number;
    endControlX?: StringOrNumberInput;
    endControlY?: StringOrNumberInput;
}

interface BezierFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs, BezierFactoryDeltaInputs {
    addStartControlPathHandle?: boolean;
    addStartControlPathOffset?: boolean;
    addStartControlPivotHandle?: boolean;
    addStartControlPivotOffset?: boolean;
    startControlLockTo?: LockToValues | [LockToValues, LockToValues];
    startControlParticle?: string;
    startControlPath?: ShapeInstance | string;
    startControlPivot?: ArtefactInstance | string;
    startControlPivotCorner?: PivotCornerValues;
    startControlPivotPin?: number;

    addEndControlPathHandle?: boolean;
    addEndControlPathOffset?: boolean;
    addEndControlPivotHandle?: boolean;
    addEndControlPivotOffset?: boolean;
    endControlLockTo?: LockToValues | [LockToValues, LockToValues];
    endControlParticle?: string;
    endControlPath?: ShapeInstance | string;
    endControlPivot?: ArtefactInstance | string;
    endControlPivotCorner?: PivotCornerValues;
    endControlPivotPin?: number;

    delta?: BezierFactoryDeltaInputs;
}

interface BezierFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: BezierFactoryInputs) => BezierInstance;
    saveAsPacket: (item?: BezierFactoryInputs) => string;
    set: (item?: BezierFactoryInputs) => BezierInstance;
    setDelta: (item?: BezierFactoryDeltaInputs) => BezierInstance;
}

interface BezierInstance extends BezierFactoryInputs, BezierFactoryFunctions {}




// BlockInstance factory
// -------------------------------------
interface BlockFactoryDeltaInputs extends BaseMixinDeltaInputs, EntityMixinDeltaInputs {}

interface BlockFactoryInputs extends BaseMixinInputs, EntityMixinInputs, BlockFactoryDeltaInputs {
    delta?: BlockFactoryDeltaInputs;
}

interface BlockFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    clone: (item?: BlockFactoryInputs) => BlockInstance;
    saveAsPacket: (item?: BlockFactoryInputs) => string;
    set: (item?: BlockFactoryInputs) => BlockInstance;
    setDelta: (item?: BlockFactoryDeltaInputs) => BlockInstance;
}

interface BlockInstance extends BlockFactoryInputs, BlockFactoryFunctions {}




// CanvasInstance factory
// -------------------------------------
type CanvasPositionValues = 'relative' | 'absolute';

type CanvasFitValues = 'none' | 'contain' | 'cover' | 'fill';

interface CanvasFactoryDeltaInputs extends BaseMixinDeltaInputs, DomMixinDeltaInputs, DisplayShapeMixinDeltaInputs {
    alpha?: number;
}

interface CanvasFactoryInputs extends BaseMixinInputs, DomMixinInputs, DisplayShapeMixinInputs, CanvasFactoryDeltaInputs {
    position?: CanvasPositionValues;
    fit?: CanvasFitValues;
    baseMatchesCanvasDimensions?: boolean;
    delta?: CanvasFactoryDeltaInputs;
    renderOnResize?: boolean;
    ignoreCanvasCssDimensions?: boolean;
    title?: string;
    label?: string;
    description?: string;
    role?: string;
    backgroundColor?: string;
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




// CellInstance factory
// -------------------------------------
interface CellFactoryDeltaInputs extends BaseMixinDeltaInputs, PositionMixinDeltaInputs, DeltaMixinDeltaInputs, PivotMixinDeltaInputs, MimicMixinDeltaInputs, PathMixinDeltaInputs, AnchorMixinDeltaInputs, CascadeMixinDeltaInputs, AssetMixinDeltaInputs, PatternMixinDeltaInputs, FilterMixinDeltaInputs {
    alpha: number;
    clearAlpha: number;
    scale: number;
}

interface CellFactoryInputs extends BaseMixinInputs, PositionMixinInputs, DeltaMixinInputs, PivotMixinInputs, MimicMixinInputs, PathMixinInputs, AnchorMixinInputs, CascadeMixinInputs, AssetMixinInputs, PatternMixinInputs, FilterMixinInputs, CellFactoryDeltaInputs {
    backgroundColor: string;
    cleared: boolean;
    compiled: boolean;
    compileOrder: number;
    composite: GlobalCompositeOperationValues;
    delta?: CellFactoryDeltaInputs;
    filter: string;
    flipReverse: boolean;
    flipUpend: boolean;
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
    set: (item?: CellFactoryInputs) => CellInstance;
    setDelta: (item?: CellFactoryDeltaInputs) => CellInstance;
}

interface CellInstance extends CellFactoryInputs, CellFactoryFunctions {}




// CogInstance factory
// -------------------------------------
type CogCurves = 'line' | 'quadratic' | 'bezier';

interface CogFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    outerRadius?: StringOrNumberInput;
    innerRadius?: StringOrNumberInput;
    outerControlsDistance?: StringOrNumberInput;
    innerControlsDistance?: StringOrNumberInput;
    outerControlsOffset?: StringOrNumberInput
    innerControlsOffset?: StringOrNumberInput
    points?: number;
    twist?: number;
}

interface CogFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, CogFactoryDeltaInputs {
    curve?: CogCurves;
    delta?: CogFactoryDeltaInputs;
}

interface CogFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: CogFactoryInputs) => CogInstance;
    saveAsPacket: (item?: CogFactoryInputs) => string;
    set: (item?: CogFactoryInputs) => CogInstance;
    setDelta: (item?: CogFactoryDeltaInputs) => CogInstance;
}

interface CogInstance extends CogFactoryInputs, CogFactoryFunctions {}




// ColorInstance factory
// -------------------------------------
type ColorSpacesValues = 'RGB' | 'HSL' | 'HWB' | 'XYZ' | 'LAB' | 'LCH';
type ReturnColorValues = 'RGB' | 'HSL' | 'HWB' | 'LAB' | 'LCH';

interface ColorFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface ColorFactoryInputs extends BaseMixinInputs, ColorFactoryDeltaInputs {
    easing?: string | DefaultInputFunction;
    easingFunction?: string | DefaultInputFunction;
    colorSpace?: ColorSpacesValues;
    returnColorAs?: ReturnColorValues;
    color?: string;
    minimumColor?: string;
    maximumColor?: string;
}

interface ColorFactoryFunctions extends BaseMixinFunctions {
    clone: (item?: ColorFactoryInputs) => ColorInstance;
    convertRGBtoHex: (red: number, green: number, blue: number) => string;
    extractRGBfromColor: (item: string) => number[];
    generateRandomColor: () => string;
    getCurrentColor: () => string;
    getMaximumColor: () => string;
    getMinimumColor: () => string;
    getRangeColor: (item: number, internalGradientBuild?: boolean) => string;
    saveAsPacket: (item?: ColorFactoryInputs) => string;
    set: (item?: ColorFactoryInputs) => ColorInstance;
    setColor: (item: string) => ColorInstance;
    setColorSpace: (item: ColorSpacesValues) => ColorInstance;
    setDelta: (item?: ColorFactoryDeltaInputs) => ColorInstance;
    setEasing: (item: string | DefaultInputFunction) => ColorInstance;
    setEasingFunction: (item: string | DefaultInputFunction) => ColorInstance;
    setMaximumColor: (item: string) => ColorInstance;
    setMinimumColor: (item: string) => ColorInstance;
    setReturnColorAs: (item: ReturnColorValues) => ColorInstance;
}

interface ColorInstance extends ColorFactoryInputs, ColorFactoryFunctions {}




// ConicGradientInstance factory
// -------------------------------------
interface ConicGradientFactoryDeltaInputs extends BaseMixinDeltaInputs, StylesMixinDeltaInputs {
    angle?: number;
}

interface ConicGradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs, ConicGradientFactoryDeltaInputs {
    delta?: ConicGradientFactoryDeltaInputs;
}

interface ConicGradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: ConicGradientFactoryInputs) => ConicGradientInstance;
    saveAsPacket: (item?: ConicGradientFactoryInputs) => string;
    set: (item?: ConicGradientFactoryInputs) => ConicGradientInstance;
    setDelta: (item?: ConicGradientFactoryDeltaInputs) => ConicGradientInstance;
}

interface ConicGradientInstance extends ConicGradientFactoryInputs, ConicGradientFactoryFunctions {}




// CoordinateInstance factory
// -------------------------------------
type CoordinateInstanceFormat = [StringOrNumberInput, StringOrNumberInput]
interface CoordinateInstance extends CoordinateInstanceFormat {
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





// CrescentInstance factory
// -------------------------------------
interface CrescentFactoryDeltaInputs extends BaseMixinDeltaInputs, EntityMixinDeltaInputs {
    outerRadius?: number;
    innerRadius?: number;
    displacement?: number;
}

interface CrescentFactoryInputs extends BaseMixinInputs, EntityMixinInputs, CrescentFactoryDeltaInputs {
    displayIntersect?: boolean;
}

interface CrescentFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    clone: (item?: CrescentFactoryInputs) => CrescentInstance;
    saveAsPacket: (item?: CrescentFactoryInputs) => string;
    set: (item?: CrescentFactoryInputs) => CrescentInstance;
    setDelta: (item?: CrescentFactoryDeltaInputs) => CrescentInstance;
}

interface CrescentInstance extends CrescentFactoryInputs, CrescentFactoryFunctions {}




// ElementInstance factory
// -------------------------------------
interface ElementFactoryDeltaInputs extends BaseMixinDeltaInputs, DomMixinDeltaInputs {}

interface ElementFactoryInputs extends BaseMixinInputs, DomMixinInputs, ElementFactoryDeltaInputs {
    text: string;
    content: string;
}

interface ElementFactoryFunctions extends BaseMixinFunctions, DomMixinFunctions {
    addCanvas: (items?: CanvasFactoryInputs) => CanvasInstance;
}

interface ElementInstance extends ElementFactoryInputs, ElementFactoryFunctions {}




// EmitterInstance factory
// -------------------------------------
interface EmitterFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface EmitterFactoryInputs extends BaseMixinInputs, EmitterFactoryDeltaInputs {}

interface EmitterFactoryFunctions extends BaseMixinFunctions {}

interface EmitterInstance extends EmitterFactoryInputs, EmitterFactoryFunctions {}




// FilterInstance factory
// -------------------------------------
interface FilterFactoryDeltaInputs extends BaseMixinDeltaInputs {
    angle?: number;
    blueInBlue?: number;
    blueInGreen?: number;
    blueInRed?: number;
    clamp?: number;
    copyHeight?: StringOrNumberInput;
    copyWidth?: StringOrNumberInput;
    copyX?: number;
    copyY?: number;
    greenInBlue?: number;
    greenInGreen?: number;
    greenInRed?: number;
    gutterHeight?: number;
    gutterWidth?: number;
    height?: number;
    highAlpha?: number;
    highBlue?: number;
    highGreen?: number;
    highRed?: number;
    innerRadius?: number;
    level?: number;
    lowAlpha?: number;
    lowBlue?: number;
    lowGreen?: number;
    lowRed?: number;
    minimumColorDistance?: number;
    offsetAlphaMax?: number;
    offsetAlphaMin?: number;
    offsetAlphaX?: number;
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
    passes?: number;
    outerRadius?: StringOrNumberInput;
    radius?: number;
    redInBlue?: number;
    redInGreen?: number;
    redInRed?: number;
    scaleX?: number;
    scaleY?: number;
    smoothing?: number;
    startX?: StringOrNumberInput;
    startY?: StringOrNumberInput;
    step?: number;
    strength?: number;
    tileHeight?: number;
    tileWidth?: number;
    tolerance?: number;
    transparentAt?: number;
    width?: number;
}

interface FilterFactoryInputs extends BaseMixinInputs, FilterFactoryDeltaInputs {
    actions?: CommonObjectInput[];
    alpha?: number | number[];
    areaAlphaLevels?: number[],
    asset?: string;
    blend?: string;
    blue?: number | number[];
    blueColor?: string;
    channelX?: string;
    channelY?: string;
    compose?: string;
    concurrent?: boolean;
    delta?: FilterFactoryDeltaInputs;
    easing?: string;
    excludeAlpha?: boolean;
    excludeBlue?: boolean;
    excludeGreen?: boolean;
    excludeRed?: boolean;
    excludeTransparentPixels?: boolean;
    gradient?: string | GradientInstance;
    green?: number | number[];
    greenColor?: string;
    highColor?: string;
    includeAlpha?: boolean;
    includeBlue?: boolean;
    includeGreen?: boolean;
    includeRed?: boolean;
    keepOnlyChangedAreas?: boolean;
    lineIn?: string;
    lineMix?: string;
    lineOut?: string;
    lowColor?: string;
    method?: string;
    operation?: string;
    palette?: string | number;
    postProcessResults?: boolean;
    processHorizontal?: boolean;
    processVertical?: boolean;
    ranges?: any;
    red?: number | number[];
    redColor?: string;
    reference?: string;
    seed?: string;
    staticSwirls?: any,
    transparentEdges?: boolean;
    useBluenoise?: boolean;
    useMixedChannel?: boolean;
    useNaturalGrayscale?: boolean;
    weights?: number[];
}

interface FilterFactoryFunctions extends BaseMixinFunctions {
    clone: (item?: FilterFactoryInputs) => FilterInstance;
    saveAsPacket: (item?: FilterFactoryInputs) => string;
    set: (item?: FilterFactoryInputs) => FilterInstance;
    setDelta: (item?: FilterFactoryDeltaInputs) => FilterInstance;
}

interface FilterInstance extends FilterFactoryInputs, FilterFactoryFunctions {}




// ForceInstance factory
// -------------------------------------
interface ForceFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface ForceFactoryInputs extends BaseMixinInputs, ForceFactoryDeltaInputs {}

interface ForceFactoryFunctions extends BaseMixinFunctions {}

interface ForceInstance extends ForceFactoryInputs, ForceFactoryFunctions {}




// GradientInstance factory
// -------------------------------------
interface GradientFactoryDeltaInputs extends BaseMixinDeltaInputs, StylesMixinDeltaInputs {}

interface GradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs, GradientFactoryDeltaInputs {
    delta?: GradientFactoryDeltaInputs;
}

interface GradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: GradientFactoryInputs) => GradientInstance;
    saveAsPacket: (item?: GradientFactoryInputs) => string;
    set: (item?: GradientFactoryInputs) => GradientInstance;
    setDelta: (item?: GradientFactoryDeltaInputs) => GradientInstance;
}

interface GradientInstance extends GradientFactoryInputs, GradientFactoryFunctions {}




// GridInstance factory
// -------------------------------------
interface GridFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface GridFactoryInputs extends BaseMixinInputs, GridFactoryDeltaInputs {}

interface GridFactoryFunctions extends BaseMixinFunctions {}

interface GridInstance extends GridFactoryInputs, GridFactoryFunctions {}




// GroupInstance factory
// -------------------------------------
type GroupHosts = CanvasInstance | StackInstance | CellInstance | string;

type GroupArtifactsInput = Array<ArtefactInstance | string>;

type GroupFiltersInput = Array<FilterInstance | string>;

interface GroupFactoryDeltaInputs extends BaseMixinDeltaInputs, FilterMixinDeltaInputs {
    regionRadius?: number;
}

interface GroupFactoryInputs extends BaseMixinInputs, FilterMixinInputs, GroupFactoryDeltaInputs {
    artefacts?: string[];
    delta?: GroupFactoryDeltaInputs;
    host?: GroupHosts;
    order?: number;
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
    sortArtefacts: () => void;
    setDelta: (item?: CommonObjectInput) => GroupInstance;
    updateArtefacts: (items: CommonObjectInput) => GroupInstance;
    updateByDelta: () => GroupInstance;
}

interface GroupInstance extends GroupFactoryInputs, GroupFactoryFunctions {}




// ImageAssetInstance factory
// -------------------------------------
interface ImageAssetFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface ImageAssetFactoryInputs extends BaseMixinInputs, ImageAssetFactoryDeltaInputs {}

interface ImageAssetFactoryFunctions extends BaseMixinFunctions {}

interface ImageAssetInstance extends ImageAssetFactoryInputs, ImageAssetFactoryFunctions {}




// LineInstance factory
// -------------------------------------
interface LineFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeCurveMixinDeltaInputs {}

interface LineFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs, LineFactoryDeltaInputs {
    delta?: LineFactoryDeltaInputs;
}

interface LineFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: LineFactoryInputs) => LineInstance;
    saveAsPacket: (item?: LineFactoryInputs) => string;
    set: (item?: LineFactoryInputs) => LineInstance;
    setDelta: (item?: LineFactoryDeltaInputs) => LineInstance;
}

interface LineInstance extends LineFactoryInputs, LineFactoryFunctions {}




// LineSpiralInstance factory
// -------------------------------------
interface LineSpiralFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    startRadius?: number;
    radiusIncrement?: number;
    radiusIncrementAdjust?: number;
    startAngle?: number;
    angleIncrement?: number;
    angleIncrementAdjust?: number;
    stepLimit?: number;
}

interface LineSpiralFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, LineSpiralFactoryDeltaInputs {}

interface LineSpiralFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: LineSpiralFactoryInputs) => LineSpiralInstance;
    saveAsPacket: (item?: LineSpiralFactoryInputs) => string;
    set: (item?: LineSpiralFactoryInputs) => LineSpiralInstance;
    setDelta: (item?: LineSpiralFactoryDeltaInputs) => LineSpiralInstance;
}

interface LineSpiralInstance extends LineSpiralFactoryInputs, LineSpiralFactoryFunctions {}




// LoomInstance factory
// -------------------------------------
interface LoomFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface LoomFactoryInputs extends BaseMixinInputs, LoomFactoryDeltaInputs {}

interface LoomFactoryFunctions extends BaseMixinFunctions {}

interface LoomInstance extends LoomFactoryInputs, LoomFactoryFunctions {}




// MeshInstance factory
// -------------------------------------
interface MeshFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface MeshFactoryInputs extends BaseMixinInputs, MeshFactoryDeltaInputs {}

interface MeshFactoryFunctions extends BaseMixinFunctions {}

interface MeshInstance extends MeshFactoryInputs, MeshFactoryFunctions {}




// NetInstance factory
// -------------------------------------
interface NetFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface NetFactoryInputs extends BaseMixinInputs, NetFactoryDeltaInputs {}

interface NetFactoryFunctions extends BaseMixinFunctions {}

interface NetInstance extends NetFactoryInputs, NetFactoryFunctions {}




// NoiseAssetInstance factory
// -------------------------------------
type NoiseEngineValues = 'perlin' | 'improved-perlin' | 'simplex' | 'value' | 'stripes' | 'smoothed-stripes' | 'worley-euclidean' | 'worley-manhattan';

type WorleyOutputValues = 'X' | 'Y' | 'Z' | 'XminusY' | 'XminusZ' | 'YminusX' | 'YminusZ' | 'ZminusX' | 'ZminusY' | 'XaddY' | 'XaddZ' | 'YaddZ' | 'XaddYminusZ' | 'XaddZminusY' | 'YaddZminusX' | 'XmultiplyY' | 'XmultiplyZ' | 'YmultiplyZ' | 'XmultiplyYaddZ' | 'XmultiplyZaddY' | 'YmultiplyZaddX' | 'XmultiplyYminusZ' | 'XmultiplyZminusY' | 'YmultiplyZminusX' | 'sum' | 'average';

type SumFunctionValues = 'none' | 'sine-x' | 'sine-y' | 'sine' | 'modular';

type OctaveFunctionValues = 'none' | 'absolute';

interface NoiseAssetFactoryDeltaInputs extends BaseMixinDeltaInputs, AssetMixinDeltaInputs, AssetAdvancedFunctionalityMixinDeltaInputs, PatternMixinDeltaInputs {
    height?: number;
    lacunarity?: number;
    persistence?: number;
    scale?: number;
    sineFrequencyCoeff?: number;
    size?: number;
    sumAmplitude?: number;
    width?: number;
    worleyDepth?: number;
}

interface NoiseAssetFactoryInputs extends BaseMixinInputs, AssetMixinInputs, AssetAdvancedFunctionalityMixinInputs, PatternMixinInputs, NoiseAssetFactoryDeltaInputs {
    delta?: NoiseAssetFactoryDeltaInputs;
    noiseEngine?: NoiseEngineValues;
    octaves?: number;
    octaveFunction?: OctaveFunctionValues;
    seed?: string;
    smoothing?: string;
    sumFunction?: SumFunctionValues;
    worleyOutput?: WorleyOutputValues;
}

interface NoiseAssetFactoryFunctions extends BaseMixinFunctions, AssetMixinFunctions, AssetAdvancedFunctionalityMixinFunctions, PatternMixinFunctions {
    clone: (item?: NoiseAssetFactoryInputs) => NoiseAssetInstance;
    saveAsPacket: (item?: NoiseAssetFactoryInputs) => string;
    set: (item?: NoiseAssetFactoryInputs) => NoiseAssetInstance;
    setDelta: (item?: NoiseAssetFactoryDeltaInputs) => NoiseAssetInstance;
}

interface NoiseAssetInstance extends NoiseAssetFactoryInputs, NoiseAssetFactoryFunctions {}




// OvalInstance factory
// -------------------------------------
interface OvalFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    radius?: StringOrNumberInput;
    radiusX?: StringOrNumberInput;
    radiusY?: StringOrNumberInput;
    intersectX?: number;
    intersectY?: number;
    offshootA?: number;
    offshootB?: number;
}

interface OvalFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, OvalFactoryDeltaInputs {
    delta?: OvalFactoryDeltaInputs;
}

interface OvalFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: OvalFactoryInputs) => OvalInstance;
    saveAsPacket: (item?: OvalFactoryInputs) => string;
    set: (item?: OvalFactoryInputs) => OvalInstance;
    setDelta: (item?: OvalFactoryDeltaInputs) => OvalInstance;
}

interface OvalInstance extends OvalFactoryInputs, OvalFactoryFunctions {}




// ParticleInstance factory
// -------------------------------------
interface ParticleFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface ParticleFactoryInputs extends BaseMixinInputs, ParticleFactoryDeltaInputs {}

interface ParticleFactoryFunctions extends BaseMixinFunctions {}

interface ParticleInstance extends ParticleFactoryInputs, ParticleFactoryFunctions {}




// PatternInstance factory
// -------------------------------------
interface PatternFactoryDeltaInputs extends BaseMixinDeltaInputs, PatternMixinDeltaInputs, AssetConsumerMixinDeltaInputs {}

interface PatternFactoryInputs extends BaseMixinInputs, PatternMixinInputs, AssetConsumerMixinInputs, PatternFactoryDeltaInputs {
    delta?: PatternFactoryDeltaInputs;
}

interface PatternFactoryFunctions extends BaseMixinFunctions, PatternMixinFunctions, AssetConsumerMixinFunctions {
    clone: (item?: PatternFactoryInputs) => PatternInstance;
    saveAsPacket: (item?: PatternFactoryInputs) => string;
    set: (item?: PatternFactoryInputs) => PatternInstance;
    setDelta: (item?: PatternFactoryDeltaInputs) => PatternInstance;
}

interface PatternInstance extends PatternFactoryInputs, PatternFactoryFunctions {}




// PhraseInstance factory
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

interface PhraseFactoryDeltaInputs extends BaseMixinDeltaInputs, EntityMixinDeltaInputs {
    letterSpacing?: number;
    lineHeight?: number;
    overlinePosition?: number;
    sizeValue?: number;
    textPathPosition?: number;
    underlinePosition?: number;
}

interface PhraseFactoryInputs extends BaseMixinInputs, EntityMixinInputs, PhraseFactoryDeltaInputs {
    addTextPathRoll?: boolean;
    boundingBoxColor?: string;
    delta?: PhraseFactoryDeltaInputs;
    exposeText?: boolean;
    family?: PhaseFamily;
    font?: string;
    highlightStyle?: string;
    justify?: PhraseJustifyValues;
    overlineStyle?: string;
    sectionClassMarker?: string;
    showBoundingBox?: boolean;
    size?: PhraseSize;
    sizeMetric?: PhraseSizeMetric;
    stretch?: PhraseStretch;
    style?: PhraseStyle;
    text?: string;
    textPath?: ShapeInstance | string;
    textPathDirection?: PhraseTextPathDirection;
    textPathLoop?: boolean;
    treatWordAsGlyph?: boolean;
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
    setDelta: (item?: PhraseFactoryDeltaInputs) => PhraseInstance;
}

interface PhraseInstance extends PhraseFactoryInputs, PhraseFactoryFunctions {}




// PictureInstance factory
// -------------------------------------
interface PictureFactoryDeltaInputs extends BaseMixinDeltaInputs, EntityMixinDeltaInputs, AssetConsumerMixinDeltaInputs {
    copyDimensions?: CommonTwoElementArrayInput;
    copyHeight?: StringOrNumberInput;
    copyStart?: CommonTwoElementArrayInput;
    copyStartX?: StringOrNumberInput;
    copyStartY?: StringOrNumberInput;
    copyWidth?: StringOrNumberInput;
}

interface PictureFactoryInputs extends BaseMixinInputs, EntityMixinInputs, AssetConsumerMixinInputs, PictureFactoryDeltaInputs {
    checkHitIgnoreTransparency?: boolean;
    delta?: PictureFactoryDeltaInputs;
}

interface PictureFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions, AssetConsumerMixinFunctions {
    clone: (item?: PictureFactoryInputs) => PictureInstance;
    saveAsPacket: (item?: PictureFactoryInputs) => string;
    set: (item?: PictureFactoryInputs) => PictureInstance;
    setDelta: (item?: PictureFactoryDeltaInputs) => PictureInstance;
}

interface PictureInstance extends PictureFactoryInputs, PictureFactoryFunctions {}




// PolygonInstance factory
// -------------------------------------
interface PolygonFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    sides?: number;
    sideLength?: number;
}

interface PolygonFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, PolygonFactoryDeltaInputs {
    delta?: PolygonFactoryDeltaInputs;
}

interface PolygonFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: PolygonFactoryInputs) => PolygonInstance;
    saveAsPacket: (item?: PolygonFactoryInputs) => string;
    set: (item?: PolygonFactoryInputs) => PolygonInstance;
    setDelta: (item?: PolygonFactoryDeltaInputs) => PolygonInstance;
}

interface PolygonInstance extends PolygonFactoryInputs, PolygonFactoryFunctions {}




// PolylineInstance factory
// -------------------------------------
type PolylinePinInput = StringOrNumberInput | ArtefactInstance | CommonHereObjectInput;

interface PolylineFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    tension?: number;
}

interface PolylineFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, PolylineFactoryDeltaInputs {
    pins?: PolylinePinInput[];
    closed?: boolean;
    mapToPins?: boolean;
    useParticlesAsPins?: boolean;
    delta?: PolylineFactoryDeltaInputs;
}

interface PolylineFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: PolylineFactoryInputs) => PolylineInstance;
    saveAsPacket: (item?: PolylineFactoryInputs) => string;
    set: (item?: PolylineFactoryInputs) => PolylineInstance;
    setDelta: (item?: PolylineFactoryDeltaInputs) => PolylineInstance;
    getPinAt: (item: number) => [number, number];
    updatePinAt: (pin: PolylinePinInput, index: number) => void;
    removePinAt: (index: number) => void;
}

interface PolylineInstance extends PolylineFactoryInputs, PolylineFactoryFunctions {}




// QuadraticInstance factory
// -------------------------------------
interface QuadraticFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeCurveMixinDeltaInputs {
    control?: CommonTwoElementArrayInput;
    controlPathPosition?: number;
    controlX?: StringOrNumberInput;
    controlY?: StringOrNumberInput;
}

interface QuadraticFactoryInputs extends BaseMixinInputs, ShapeCurveMixinInputs, QuadraticFactoryDeltaInputs {
    addControlPathHandle?: boolean;
    addControlPathOffset?: boolean;
    addControlPivotHandle?: boolean;
    addControlPivotOffset?: boolean;
    controlLockTo?: LockToValues | [LockToValues, LockToValues];
    controlParticle?: string;
    controlPath?: ShapeInstance | string;
    controlPivot?: ArtefactInstance | string;
    controlPivotCorner?: PivotCornerValues;
    controlPivotPin?: number;
    delta?: QuadraticFactoryDeltaInputs;
}

interface QuadraticFactoryFunctions extends BaseMixinFunctions, ShapeCurveMixinFunctions {
    clone: (item?: QuadraticFactoryInputs) => QuadraticInstance;
    saveAsPacket: (item?: QuadraticFactoryInputs) => string;
    set: (item?: QuadraticFactoryInputs) => QuadraticInstance;
    setDelta: (item?: QuadraticFactoryDeltaInputs) => QuadraticInstance;
}

interface QuadraticInstance extends QuadraticFactoryInputs, QuadraticFactoryFunctions {}




// QuaternionInstance factory
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




// RadialGradientInstance factory
// -------------------------------------
interface RadialGradientFactoryDeltaInputs extends BaseMixinDeltaInputs, StylesMixinDeltaInputs {
    endRadius?: StringOrNumberInput;
    startRadius?: StringOrNumberInput;
}

interface RadialGradientFactoryInputs extends BaseMixinInputs, StylesMixinInputs, RadialGradientFactoryDeltaInputs {
    delta?: RadialGradientFactoryDeltaInputs;
}

interface RadialGradientFactoryFunctions extends BaseMixinFunctions, StylesMixinFunctions {
    clone: (item?: RadialGradientFactoryInputs) => RadialGradientInstance;
    saveAsPacket: (item?: RadialGradientFactoryInputs) => string;
    set: (item?: RadialGradientFactoryInputs) => RadialGradientInstance;
    setDelta: (item?: RadialGradientFactoryDeltaInputs) => RadialGradientInstance;
}

interface RadialGradientInstance extends RadialGradientFactoryInputs, RadialGradientFactoryFunctions {}




// RawAssetInstance factory
// -------------------------------------
interface RawAssetFactoryDeltaInputs extends BaseMixinDeltaInputs, AssetMixinDeltaInputs {}

interface RawAssetFactoryInputs extends BaseMixinInputs, AssetMixinInputs, RawAssetFactoryDeltaInputs {
    data?: any;
    keytypes?: CommonObjectInput;
    updateSource?: DefaultInputFunction;
    userAttributes?: UserInput[];
}

interface RawAssetFactoryFunctions extends BaseMixinFunctions, AssetMixinFunctions {
    addAttribute: (items: UserInput) => RawAssetInstance;
    removeAttribute: (key: string) => RawAssetInstance;
    clone: (item?: CommonObjectInput) => RawAssetInstance;
    saveAsPacket: (item?: CommonObjectInput) => string;
    set: (item?: CommonObjectInput) => RawAssetInstance;
    setDelta: (item?: CommonObjectInput) => RawAssetInstance;
}

interface RawAssetInstance extends RawAssetFactoryInputs, RawAssetFactoryFunctions {}




// ReactionDiffusionAssetInstance factory
// -------------------------------------
interface ReactionDiffusionAssetFactoryDeltaInputs extends BaseMixinDeltaInputs, AssetMixinDeltaInputs, AssetAdvancedFunctionalityMixinDeltaInputs, PatternMixinDeltaInputs {
    width?: number;
    height?: number;
    diffusionRateA?: number;
    diffusionRateB?: number;
    feedRate?: number;
    killRate?: number;
    initialRandomSeedLevel?: number;
    drawEvery?: number;
    maxGenerations?: number;
}

interface ReactionDiffusionAssetFactoryInputs extends BaseMixinInputs, AssetMixinInputs, AssetAdvancedFunctionalityMixinInputs, PatternMixinInputs, ReactionDiffusionAssetFactoryDeltaInputs {
    initialSettingPreference?: string;
    randomEngineSeed?: string;
    initialSettingEntity?: EntityInstance | string;
    preset?: string;
}

interface ReactionDiffusionAssetFactoryFunctions extends BaseMixinFunctions, AssetMixinFunctions, AssetAdvancedFunctionalityMixinFunctions, PatternMixinFunctions {
    clone: (item?: ReactionDiffusionAssetFactoryInputs) => ReactionDiffusionAssetInstance;
    saveAsPacket: (item?: ReactionDiffusionAssetFactoryInputs) => string;
    set: (item?: ReactionDiffusionAssetFactoryInputs) => ReactionDiffusionAssetInstance;
    setDelta: (item?: ReactionDiffusionAssetFactoryDeltaInputs) => ReactionDiffusionAssetInstance;
}

interface ReactionDiffusionAssetInstance extends ReactionDiffusionAssetFactoryInputs, ReactionDiffusionAssetFactoryFunctions {}




// RectangleInstance factory
// -------------------------------------
interface RectangleFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
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

interface RectangleFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, RectangleFactoryDeltaInputs {
    delta?: RectangleFactoryDeltaInputs;
}

interface RectangleFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: RectangleFactoryInputs) => RectangleInstance;
    saveAsPacket: (item?: RectangleFactoryInputs) => string;
    set: (item?: RectangleFactoryInputs) => RectangleInstance;
    setDelta: (item?: RectangleFactoryDeltaInputs) => RectangleInstance;
}

interface RectangleInstance extends RectangleFactoryInputs, RectangleFactoryFunctions {}




// RenderInstance factory
// -------------------------------------
interface RenderFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface RenderFactoryInputs extends BaseMixinInputs, RenderFactoryDeltaInputs {
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
    observer?: boolean;
}

interface RenderFactoryFunctions extends BaseMixinFunctions {
    halt: () => void;
    isRunning: () => boolean;
    run: () => void;
}

interface RenderInstance extends RenderFactoryInputs, RenderFactoryFunctions {}




// ShapeInstance factory
// -------------------------------------
interface ShapeFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {}

interface ShapeFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, ShapeFactoryDeltaInputs {
    delta?: ShapeFactoryDeltaInputs;
}

interface ShapeFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: ShapeFactoryInputs) => ShapeInstance;
    saveAsPacket: (item?: ShapeFactoryInputs) => string;
    set: (item?: ShapeFactoryInputs) => ShapeInstance;
    setDelta: (item?: ShapeFactoryDeltaInputs) => ShapeInstance;
}

interface ShapeInstance extends ShapeFactoryInputs, ShapeFactoryFunctions {
    length: number;
}




// SpiralInstance factory
// -------------------------------------
interface SpiralFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    loops?: number;
    loopIncrement?: number;
    drawFromLoop?: number;
}

interface SpiralFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, SpiralFactoryDeltaInputs {
    delta?: SpiralFactoryDeltaInputs;
}

interface SpiralFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: SpiralFactoryInputs) => SpiralInstance;
    saveAsPacket: (item?: SpiralFactoryInputs) => string;
    set: (item?: SpiralFactoryInputs) => SpiralInstance;
    setDelta: (item?: SpiralFactoryDeltaInputs) => SpiralInstance;
}

interface SpiralInstance extends SpiralFactoryInputs, SpiralFactoryFunctions {}




// SpringInstance factory
// -------------------------------------
interface SpringFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface SpringFactoryInputs extends BaseMixinInputs, SpringFactoryDeltaInputs {}

interface SpringFactoryFunctions extends BaseMixinFunctions {}

interface SpringInstance extends SpringFactoryInputs, SpringFactoryFunctions {}




// SpriteAssetInstance factory
// -------------------------------------
interface SpriteAssetFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface SpriteAssetFactoryInputs extends BaseMixinInputs, SpriteAssetFactoryDeltaInputs {}

interface SpriteAssetFactoryFunctions extends BaseMixinFunctions {}

interface SpriteAssetInstance extends SpriteAssetFactoryInputs, SpriteAssetFactoryFunctions {}




// StackInstance factory
// -------------------------------------
interface StackFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface StackFactoryInputs extends BaseMixinInputs, StackFactoryDeltaInputs {}

interface StackFactoryFunctions extends BaseMixinFunctions {}

interface StackInstance extends StackFactoryInputs, StackFactoryFunctions {}




// StarInstance factory
// -------------------------------------
interface StarFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    radius1?: StringOrNumberInput;
    radius2?: StringOrNumberInput;
    points?: number;
    twist?: number;
}

interface StarFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, StarFactoryDeltaInputs {
    delta?: StarFactoryDeltaInputs;
}

interface StarFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: StarFactoryInputs) => StarInstance;
    saveAsPacket: (item?: StarFactoryInputs) => string;
    set: (item?: StarFactoryInputs) => StarInstance;
    setDelta: (item?: StarFactoryDeltaInputs) => StarInstance;
}

interface StarInstance extends StarFactoryInputs, StarFactoryFunctions {}




// StateInstance factory
// -------------------------------------
type GlobalCompositeOperationValues = 'source-over' | 'source-atop' | 'source-in' | 'source-out' | 'destination-over' | 'destination-atop' | 'destination-in' | 'destination-out' | 'lighter' | 'darker' | 'copy' | 'xor' | string;

type LineCapValues = 'butt' | 'round' | 'square';

type LineJoinValues = 'miter' | 'round' | 'bevel';

interface StateFactoryDeltaInputs {
    globalAlpha?: number;
    lineDashOffset?: number;
    lineWidth?: number;
    miterLimit?: number;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
}

interface StateFactoryInputs {
    fillStyle?: any;
    filter?: string;
    font?: string;
    globalCompositeOperation?: GlobalCompositeOperationValues;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: string;
    lineCap?: LineCapValues;
    lineDash?: number[];
    lineJoin?: LineJoinValues;
    shadowColor?: string;
    strokeStyle?: any;
}

interface StateFactoryFunctions extends BaseMixinFunctions {}

interface StateInstance extends StateFactoryInputs, StateFactoryDeltaInputs, StateFactoryFunctions {}



// TetragonInstance factory
// -------------------------------------
interface TetragonFactoryDeltaInputs extends BaseMixinDeltaInputs, ShapeBasicMixinDeltaInputs {
    radius?: StringOrNumberInput;
    radiusX?: StringOrNumberInput
    radiusY?: StringOrNumberInput
    intersectX?: number;
    intersectY?: number;
}

interface TetragonFactoryInputs extends BaseMixinInputs, ShapeBasicMixinInputs, TetragonFactoryDeltaInputs {
    delta?: TetragonFactoryDeltaInputs;
}

interface TetragonFactoryFunctions extends BaseMixinFunctions, ShapeBasicMixinFunctions {
    clone: (item?: TetragonFactoryInputs) => TetragonInstance;
    saveAsPacket: (item?: TetragonFactoryInputs) => string;
    set: (item?: TetragonFactoryInputs) => TetragonInstance;
    setDelta: (item?: TetragonFactoryDeltaInputs) => TetragonInstance;
}

interface TetragonInstance extends TetragonFactoryInputs, TetragonFactoryFunctions {}




// TickerInstance factory
// -------------------------------------
interface TickerFactoryDeltaInputs extends BaseMixinDeltaInputs {
    cycles?: number;
    duration?: StringOrNumberInput;
}

interface TickerFactoryInputs extends BaseMixinInputs, TickerFactoryDeltaInputs {
    delta?: TickerFactoryDeltaInputs;
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
    seekTo: (milliseconds: number, resume?: boolean) => TickerInstance;
    set: (item?: TickerFactoryInputs) => TickerInstance;
    setDelta: (item?: TickerFactoryDeltaInputs) => TickerInstance;
}

interface TickerInstance extends TickerFactoryInputs, TickerFactoryFunctions {}




// TracerInstance factory
// -------------------------------------
interface TracerFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface TracerFactoryInputs extends BaseMixinInputs, TracerFactoryDeltaInputs {}

interface TracerFactoryFunctions extends BaseMixinFunctions {}

interface TracerInstance extends TracerFactoryInputs, TracerFactoryFunctions {}




// TweenInstance factory
// -------------------------------------
type TweenEngineFunction = (start: number, change: number, position: number) => StringOrNumberInput;

interface TweenDefinitionsObject {
    attribute: string;
    end: StringOrNumberInput;
    engine?: TweenEngineFunction | string;
    integer?: boolean;
    start: StringOrNumberInput;
}

interface TweenFactoryDeltaInputs extends BaseMixinDeltaInputs, TweenMixinDeltaInputs {
    duration?: StringOrNumberInput;
}

interface TweenFactoryInputs extends BaseMixinInputs, TweenMixinInputs, TweenFactoryDeltaInputs {
    commenceAction?: DefaultInputFunction;
    completeAction?: DefaultInputFunction;
    cycles?: number;
    delta?: TweenFactoryDeltaInputs;
    definitions?: TweenDefinitionsObject[];
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
    seekTo: (milliseconds: number, resume?: boolean) => TweenInstance;
    set: (item?: TweenFactoryInputs) => TweenInstance;
    setDelta: (item?: TweenFactoryDeltaInputs) => TweenInstance;
}

interface TweenInstance extends TweenFactoryInputs, TweenFactoryFunctions {}




// UnstackedElementInstance factory
// -------------------------------------
interface UnstackedElementFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface UnstackedElementFactoryInputs extends BaseMixinInputs, UnstackedElementFactoryDeltaInputs {}

interface UnstackedElementFactoryFunctions extends BaseMixinFunctions {}

interface UnstackedElementInstance extends UnstackedElementFactoryInputs, UnstackedElementFactoryFunctions {}




// VectorInstance factory
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




// VideoAssetInstance factory
// -------------------------------------
interface VideoAssetFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface VideoAssetFactoryInputs extends BaseMixinInputs, VideoAssetFactoryDeltaInputs {}

interface VideoAssetFactoryFunctions extends BaseMixinFunctions {}

interface VideoAssetInstance extends VideoAssetFactoryInputs, VideoAssetFactoryFunctions {}




// WheelInstance factory
// -------------------------------------
interface WheelFactoryDeltaInputs extends BaseMixinDeltaInputs, EntityMixinDeltaInputs {
    endAngle?: number;
    radius?: StringOrNumberInput;
    startAngle?: number;
}

interface WheelFactoryInputs extends BaseMixinInputs, EntityMixinInputs, WheelFactoryDeltaInputs {
    clockwise?: boolean;
    closed?:  boolean;
    delta?: WheelFactoryDeltaInputs;
    includeCenter?:  boolean;
}

interface WheelFactoryFunctions extends BaseMixinFunctions, EntityMixinFunctions {
    clone: (item?: WheelFactoryInputs) => WheelInstance;
    saveAsPacket: (item?: WheelFactoryInputs) => string;
    set: (item?: WheelFactoryInputs) => WheelInstance;
    setDelta: (item?: WheelFactoryDeltaInputs) => WheelInstance;
}

interface WheelInstance extends WheelFactoryInputs, WheelFactoryFunctions {}




// WorldInstance factory
// -------------------------------------
interface UserInput {
    key: string; 
    defaultValue: any; 
    setter?: DefaultInputFunction;
    deltaSetter?: DefaultInputFunction;
    getter?: DefaultInputFunction;
}

interface WorldFactoryDeltaInputs extends BaseMixinDeltaInputs {}

interface WorldFactoryInputs extends BaseMixinInputs, WorldFactoryDeltaInputs {
    gravity?: number[];
    keytypes?: CommonObjectInput;
    tickMultiplier?: number;
    userAttributes?: UserInput[];
}

interface WorldFactoryFunctions extends BaseMixinFunctions {
    addAttribute: (items: UserInput) => WorldInstance;
    removeAttribute: (key: string) => WorldInstance;
    clone: (item?: WorldFactoryInputs) => WorldInstance;
    saveAsPacket: (item?: WorldFactoryInputs) => string;
    set: (item?: WorldFactoryInputs) => WorldInstance;
    setDelta: (item?: WorldFactoryDeltaInputs) => WorldInstance;
}

interface WorldInstance extends WorldFactoryInputs, WorldFactoryFunctions {}





// observeAndUpdate factory (not stored in library)
type ObserveAndUpdateStrings = 'float' | 'int' | 'round' | 'roundDown' | 'roundUp' | 'raw' | 'string' | 'boolean' | '%' | string;

interface ObserveAndUpdateInputs {
    event: string | string[];
    origin: any;
    target: any;
    targetLibrarySection?: string;
    useNativeListener?: boolean;
    preventDefault?: boolean;
    updates: {
        [index: string]: [string, ObserveAndUpdateStrings];
    };
    setup?: DefaultInputFunction;
    callback?: DefaultInputFunction;
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

interface AssetImportObject {
    name?: string;
    src?: string;
    parent?: string;
    isVisible?: boolean;
    className?: string;
    imageSrc?: string | string[];
    manifestSrc?: string | CommonObjectInput;
}

type AssetImports = string | AssetImportObject | Array<string | AssetImportObject>

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


interface SeededRandomNumberGeneratorFunctions {
    random: () => number;
}

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
export function importImage(items: AssetImports): void;
export function importMediaStream(items: CommonObjectInput): Promise<VideoAssetInstance>;
export function importSprite(items: AssetImports): void;
export function importVideo(items: AssetImports): void;
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
export function requestCoordinate(x: any, y?: StringOrNumberInput): CoordinateInstance;
export function requestQuaternion(): QuaternionInstance;
export function requestVector(x: any, y?: number, z?: number): VectorInstance;
export function seededRandomNumberGenerator(seed?: string): SeededRandomNumberGeneratorFunctions;
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





// export namespace scrawl {

//     export function addListener(
//         evt: string | string[], 
//         fn: DefaultInputFunction, 
//         targ: string | object | Array<string | object>
//     ): DefaultOutputFunction;

//     export function removeListener(
//         evt: string | string[], 
//         fn: DefaultInputFunction, 
//         targ: string | object | Array<string | object>
//     ): DefaultOutputFunction;

//     export function addNativeListener(
//         evt: string | string[], 
//         fn: DefaultInputFunction, 
//         targ: string | object | Array<string | object>
//     ): DefaultOutputFunction;

//     export function removeNativeListener(
//         evt: string | string[], 
//         fn: DefaultInputFunction, 
//         targ: string | object | Array<string | object>
//     ): DefaultOutputFunction;



//     export function addCanvas(): void;
//     export function addStack(): void;
//     export function clear(): void;
//     export function compile(): void;
//     export function createImageFromCell(item: CellInstance | CanvasInstance | string, stashAsAsset: boolean): void;
//     export function createImageFromEntity(item: EntityInstance | string, stashAsAsset: boolean): void;
//     export function createImageFromGroup(item: GroupInstance | CellInstance | CanvasInstance | string, stashAsAsset: boolean): void;
//     export function getCanvas(): void;
//     export function getIgnorePixelRatio(): void;
//     export function getPixelRatio(): void;
//     export function getStack(): void;
//     export function getTouchActionChoke(): number;
//     export function importDomImage(query: string): void;
//     export function importDomVideo(query: string): void;
//     export function importImage(): void;
//     export function importMediaStream(items: CommonObjectInput): Promise<VideoAssetInstance>;
//     export function importSprite(): void;
//     export function importVideo(): void;
//     export function init(): void;
//     export function makeAction(items: ActionFactoryInputs): ActionInstance;
//     export function makeAnimation(items: AnimationFactoryInputs): AnimationInstance;
//     export function makeAnimationObserver(): void;
//     export function makeBezier(items: BezierFactoryInputs): BezierInstance;
//     export function makeBlock(items: BlockFactoryInputs): BlockInstance;
//     export function makeCog(items: CogFactoryInputs): CogInstance;
//     export function makeColor(items: ColorFactoryInputs): ColorInstance;
//     export function makeConicGradient(items: ConicGradientFactoryInputs): ConicGradientInstance;
//     export function makeCrescent(items: CrescentFactoryInputs): CrescentInstance;
//     export function makeDragZone(items: MakeDragZoneInputs): DefaultOutputFunction | DragZoneOutput;
//     export function makeEmitter(items: EmitterFactoryInputs): EmitterInstance;
//     export function makeFilter(items: FilterFactoryInputs): FilterInstance;
//     export function makeForce(items: ForceFactoryInputs): ForceInstance;
//     export function makeGradient(items: GradientFactoryInputs): GradientInstance;
//     export function makeGrid(items: GridFactoryInputs): GridInstance;
//     export function makeGroup(items: GroupFactoryInputs): GroupInstance;
//     export function makeLine(items: LineFactoryInputs): LineInstance;
//     export function makeLineSpiral(items: LineSpiralFactoryInputs): LineSpiralInstance;
//     export function makeLoom(items: LoomFactoryInputs): LoomInstance;
//     export function makeMesh(items: MeshFactoryInputs): MeshInstance;
//     export function makeNet(items: NetFactoryInputs): NetInstance;
//     export function makeNoise(items: NoiseAssetFactoryInputs): NoiseAssetInstance;
//     export function makeNoiseAsset(items: NoiseAssetFactoryInputs): NoiseAssetInstance;
//     export function makeOval(items: OvalFactoryInputs): OvalInstance;
//     export function makePattern(items: PatternFactoryInputs): PatternInstance;
//     export function makePhrase(items: PhraseFactoryInputs): PhraseInstance;
//     export function makePicture(items: PictureFactoryInputs): PictureInstance;
//     export function makePolygon(items: PolygonFactoryInputs): PolygonInstance;
//     export function makePolyline(items: PolylineFactoryInputs): PolylineInstance;
//     export function makeQuadratic(items: QuadraticFactoryInputs): QuadraticInstance;
//     export function makeRadialGradient(items: RadialGradientFactoryInputs): RadialGradientInstance;
//     export function makeRawAsset(items: RawAssetFactoryInputs): RawAssetInstance;
//     export function makeReactionDiffusionAsset(items: ReactionDiffusionAssetFactoryInputs): ReactionDiffusionAssetInstance;
//     export function makeRectangle(items: RectangleFactoryInputs): RectangleInstance;
//     export function makeRender(items: RenderFactoryInputs): RenderInstance;
//     export function makeShape(items: ShapeFactoryInputs): ShapeInstance;
//     export function makeSnippet(): void;
//     export function makeSpiral(items: SpiralFactoryInputs): SpiralInstance;
//     export function makeSpring(items: SpringFactoryInputs): SpringInstance;
//     export function makeStar(items: StarFactoryInputs): StarInstance;
//     export function makeTetragon(items: TetragonFactoryInputs): TetragonInstance;
//     export function makeTicker(items: TickerFactoryInputs): TickerInstance;
//     export function makeTracer(items: TracerFactoryInputs): TracerInstance;
//     export function makeTween(items: TweenFactoryInputs): TweenInstance;
//     export function makeWheel(items: WheelFactoryInputs): WheelInstance;
//     export function makeWorld(items: WorldFactoryInputs): WorldInstance;
//     export function observeAndUpdate(items: ObserveAndUpdateInputs): DefaultOutputFunction;
//     export function releaseCoordinate(item: CoordinateInstance): void;
//     export function releaseQuaternion(item: QuaternionInstance): void;
//     export function releaseVector(item: VectorInstance): void;
//     export function render(): void;
//     export function requestCoordinate(): CoordinateInstance;
//     export function requestQuaternion(): QuaternionInstance;
//     export function requestVector(): VectorInstance;
//     export function seededRandomNumberGenerator(): void;
//     export function setCurrentCanvas(): void;
//     export function setFilterMemoizationChoke(): void;
//     export function setIgnorePixelRatio(item: boolean): void;
//     export function setPixelRatioChangeAction(): void;
//     export function setTouchActionChoke(item: number): void;
//     export function show(): void;
//     export function startCoreAnimationLoop(): void;
//     export function startCoreListeners(): void;
//     export function stopCoreAnimationLoop(): void;
//     export function stopCoreListeners(): void;

//     export const library: CommonObjectInput;
// }


















// export const library: CommonObjectInput;
// export const scrawl: CommonObjectInput;


// export namespace library {
//     export type version = string;
//     export type anchor = {[index: string]: AnchorInstance};
//     export type anchornames = string[];
//     export type animation = {[index: string]: AnimationInstance};
//     export type animationnames = string[];
//     export type animationtickers = {[index: string]: TickerInstance};
//     export type animationtickersnames = string[];
//     export type artefact = {[index: string]: ArtefactInstance};
//     export type artefactnames = string[];
//     export type asset = {[index: string]: AssetInstance};
//     export type assetnames = string[];
//     export type canvas = {[index: string]: CanvasInstance};
//     export type canvasnames = string[];
//     export type cell = {[index: string]: CellInstance};
//     export type cellnames = string[];
//     export type element = {[index: string]: ElementInstance};
//     export type elementnames = string[];
//     export type entity = {[index: string]: EntityInstance};
//     export type entitynames = string[];
//     export type filter = {[index: string]: FilterInstance};
//     export type filternames = string[];
//     export type fontattribute = {[index: string]: any};
//     export type fontattributenames = string[];
//     export type group = {[index: string]: GroupInstance};
//     export type groupnames = string[];
//     export type palette = {[index: string]: any};
//     export type palettenames = string[];
//     export type particle = {[index: string]: ParticleInstance};
//     export type particlenames = string[];
//     export type force = {[index: string]: ForceInstance};
//     export type forcenames = string[];
//     export type spring = {[index: string]: SpringInstance};
//     export type springnames = string[];
//     export type world = {[index: string]: WorldInstance};
//     export type worldnames = string[];
//     export type sectionClasses = {[index: string]: any};
//     export type stack = {[index: string]: StackInstance};
//     export type stacknames = string[];
//     export type tween = {[index: string]: TweenAnimationInstance};
//     export type tweennames = string[];
//     export type styles = {[index: string]: StylesInstance};
//     export type stylesnames = string[];
//     export type unstackedelement = {[index: string]: UnstackedElementInstance};
//     export type unstackedelementnames = string[];
//     export type constructors = {[index: string]: any};
//     export type radian = number;
//     export type css = string[];
//     export type xcss = string[];
// }


