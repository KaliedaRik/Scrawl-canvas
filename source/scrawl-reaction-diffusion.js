// TODO: Future consideration for SC v9.0.0+
//
// Currently there's no way to tree shake SC code, because of the way we import/export everything in scrawl.js file. We can solve this issue by dividing the code base into parts, each part served by a separate top-level Import/Export file like this.
//
// One possible separation could be:
// + Core stuff + entitys
// + RD asset (as done in this file)
// + Noise asset
// + Everything non-core to do with particles/physics
// + Everything non-core to do with filters
// + Everything non-core to do with snippets
// + Could we even separate out the DOM-related stuff (stack, element)?
// + How about tween/timeline/action?

import { 
    makeReactionDiffusionAsset as _makeReactionDiffusionAsset,
} from './factory/rdAsset.js';
export const makeReactionDiffusionAsset = _makeReactionDiffusionAsset;


// ## Export selected functionalities that users can use in their scripts
export default {
    makeReactionDiffusionAsset: _makeReactionDiffusionAsset,
};
