# Accessibility
The following summary has been stolen (with very minor formatting amendments) from the [Introduction to Web Accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/) page of the W3C Web Accessibility Initiative site (last stolen on 13 April 2025):

> Web accessibility means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. More specifically, people can: perceive, understand, navigate, and interact with the Web; and contribute to the Web.
> 
> Web accessibility encompasses all disabilities that affect access to the Web, including: auditory; cognitive; neurological; physical; speech; visual; etc.
> 
> Web accessibility also benefits people without disabilities, for example:
> 
> + People using mobile phones, smart watches, smart TVs, and other devices with small screens, different input modes, etc.
> + Older people with changing abilities due to ageing.
> + People with "temporary disabilities" such as a broken arm or lost glasses.
> + People with "situational limitations" such as in bright sunlight or in an environment where they cannot listen to audio.
> + People using a slow Internet connection, or who have limited or expensive bandwidth.

The purpose of this page in the SC Developer Runbook is to look at (some of) the best practice recommendations for creating accessible websites, in particular around how `<canvas>` elements in the web page can weaken the chances of meeting those recommendations. 

This page also considers the functionality repo-devs have built into Scrawl-canvas to help mitigate those weaknesses, and what further work can be done.

> **tl;dr:** SC does not solve the (many!) accessibility issues that `<canvas>` elements introduce into a web page; it only tries to make the work of solving those issues as easy as possible for designers and dev-users. ***A poorly conceived, designed and coded SC `<canvas>` display IS NOT an accessible `<canvas>` display!***

Key documentation links:
+ [Accessibility Fundamentals Overview](https://www.w3.org/WAI/fundamentals/)

Current guidelines documentation links:
+ [Web Content Accessibility Guidelines (WCAG) v2.1](https://www.w3.org/TR/WCAG21/)
+ [Web Content Accessibility Guidelines (WCAG) v2.2](https://www.w3.org/TR/WCAG22/)
+ [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
+ [Links to all WCAG 2.2 "Understanding" Docs](https://www.w3.org/WAI/WCAG22/Understanding/) - "Understanding" documents provide detailed explanations for Web Content Accessibility Guidelines (WCAG) guidelines and success criteria. They are informative, not part of the "normative" WCAG standard.
+ [Techniques for WCAG 2.2](https://www.w3.org/WAI/WCAG22/Techniques/) - "Techniques" are examples of ways to meet Web Content Accessibility Guidelines (WCAG). They are not required to meet WCAG.

For the future - WCAG 3 drafts links:
+ [Web Content Accessibility Guidelines (WCAG) v3.0 working draft](https://www.w3.org/TR/wcag-3.0/)
+ [WCAG 3 Introduction](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/)

Accessibility legislation links:
+ EU - [European accessibility act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en)
+ UK - [Meet the requirements of equality and accessibility regulations](https://www.gov.uk/guidance/meet-the-requirements-of-equality-and-accessibility-regulations)
+ UK - [Understanding WCAG 2.2](https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag)
+ USA - [Guidance on Web Accessibility and the ADA](https://www.ada.gov/resources/web-guidance/)
+ USA - [Fact Sheet: New Rule on the Accessibility of Web Content and Mobile Apps](https://www.ada.gov/resources/2024-03-08-web-rule/)

## Impact of WCAG requirements on `<canvas>` elements
No formal guidelines exist for making the HTML5 `<canvas>` element accessible. Yet the need to make canvas-based displays, animations and applications more accessible is widely accepted:
+ [Paul J. Adam's essay on `<canvas>` accessibility](https://pauljadam.com/demos/canvas.html) has been around for many years, and still remains accurate and relevant.
+ The [W3C community had lengthy discussions](https://www.w3.org/html/wg/wiki/AddedElementCanvas) around `<canvas>` accessibility while developing the specification.
+ Those discussions still continue, though intermittently. Fore example, these issues currently open on the [w3c/aria Github](https://github.com/w3c/aria/issues?q=is%3Aissue%20state%3Aopen%20canvas).
+ Research into `<canvas>` element accessibility seems limited, if [the results of this Google search](https://www.google.com/search?sca_esv=0e7d64b0605ffa6f&udm=14&q=%22research%22+into+making+the+html5+canvas+element+more+accessible&sa=X&ved=2ahUKEwikx6TRk-GMAxWAQUEAHaFgFigQ5t4CegQIGRAB&biw=1342&bih=795&dpr=1) can be trusted.

(Note that online searching for standards, essays and investigations around canvas accessibility is made harder by the existence of the [Canvas LMS](https://www.instructure.com/canvas) SAAS offering, used widely by schools and colleges. More recently [OpenAI launched a product called Canvas](https://openai.com/index/introducing-canvas/) which doesn't help the search for relevant information. Not forgetting, of course, the [Canva](https://www.canva.com/) design studio thing.)

Scrawl-canvas is a Javascript library for working with the HTML5 `<canvas>` element. The library:
+ Defines a set of factory functions for creating a wide range of graphic artefacts and effects, which can be drawn on a canvas.
+ Includes an easy-to-use protocol for positioning, displaying and animating artefacts and effects across the canvas.
+ Adds functionality to make `<canvas>` elements responsive, adapting their size to their surrounding environment while remaining fully interactive.
+ **Helps make `<canvas>` elements more accessible for both keyboard and AT users.**

Given that one of the stated aims of the SC library centres on making `<canvas>` elements more accessible, and accepting the dearth of guidance around how this can be achieved, it necessarily becomes the responsibility of repo-devs to identify those accessibility issues and make best effort to add functionality to the library to help address them.

> **tl;dr:** The following comments on the application of WCAG Requirements with respect to the `<canvas>` element are the (opinionated) views of the SC repo-devs, currently unsupported by evidence from researchers, experts and users of accessibility tools and technology. If these opinions are misguided or wrong, please [raise an issue in the SC GitHub repository](https://github.com/KaliedaRik/Scrawl-canvas/issues) for discussion and action.

### Text alternatives for non-text content
Text alternatives are equivalents for non-text content. Examples include:
+ Short equivalents for images, including icons, buttons, and graphics
+ Description of data represented on charts, diagrams, and illustrations
+ Brief descriptions of non-text content such as audio and video files
+ Labels for form controls, input, and other user interface components

Text alternatives convey the purpose of an image or function to provide an equivalent user experience. For instance, an appropriate text alternative for a search button would be “search” rather than “magnifying lens”.

Text alternatives can be presented in a variety of ways. For instance, they can be read aloud for people who cannot see the screen and for people with reading difficulties, enlarged to custom text sizes, or displayed on braille devices. Text alternatives serve as labels for controls and functionality to aid keyboard navigation and navigation by voice recognition (speech input). They also act as labels to identify audio, video, and files in other formats, as well as applications that are embedded as part of a website.

**1.1.1 (A) - [Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)**
+ A canvas-based display or animation is nothing more than a collection of graphical pixels in the browser viewport. It is, by itself, not accessible. Browsers will often consider `<canvas>` elements to be images.
+ `<canvas>` elements can, with effort, present their display as an animation which is, in some ways, analagous to a `<video>` element. However there is no browser-based functionality specified for supplying such canvas displays with video-like controls to play or pause the animation.
+ `<canvas>` elements can, with effort, present their display as an user-interactive diagram which includes controls for the user to manipulate that display. Such graphical controls need to be accessible - including keyboard accessibility.
+ `<canvas>` elements can, with effort, display charts and maps - which may include interactive functionality. While static charts and maps can be treated as images for accessibility purposes, interactive charts and maps need to be accessible - including keyboard accessibility.
+ Any significant data used to create a canvas display - for example chart data - should also be supplied in alternative formats which an end-user can access (like a table, or a downloadable CSV file).
+ If a canvas display is being used purely for decorative purposes such as a space filler or background then it needs to be marked as such so assistive technologies can ignore it.
+ Canvas displays used as backgrounds will need to be checked to make sure the content above them remains legible - for example there remains sufficient contrast between the background canvas display and the text placed over it.

#### SC and `<canvas>` element children
The HTML specification for the `<canvas>` element permits the element to contain mainly [phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#phrasing_content), though it [specifically excludes interactive content](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas#technical_summary) except for: `<a>` and `<button>` elements; and `<input>` elements whose type attribute is `checkbox`, `radio`, or `button`.

The HTML markup placed between the `<canvas>` element's opening and closing tags is known as its [fallback content](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage#accessible_content). This is the main approach to making the `<canvas>` element accessible. Decisions about what markup to include in this fallback content need to be made by the designer and dev-user as they develop the web page.

Designers and dev-users should consider supplying an image of the canvas display as minimal fallback content. Many of the SC test demos include example code for such approaches - for instance see test demo [Filters-006](../../demo/filters-006.html).

SC performs significant work when importing a `<canvas>` element into the SC system, which includes mutating the element's DOM markup and adding SC-specific child elements to its fallback content. This work has been documented in the [Canvas artefact notes](sc-dom-artefacts.html#canvas-artefact-notes) section of the Artefacts and the DOM page of this Runbook. These changes will not replace or modify any existing fallback content that has been defined for the element, nor do they prevent the dev-user from adding, manipulating or deleting such content after SC completes its import work.

To summarise, SC adds the following markup to the `<canvas>` element as part of the import functionality:
```
<canvas

  [... other existing attributes]

  style=[...SC styling markup string]
  title=[...SC title string, default: ""]
  role=[...SC role string, default: "img"]
  aria-labelledby=`${canvas.id}-ARIA-label`
  aria-describedby=`${canvas.id}-ARIA-description`
>

  [...Existing fallback content markup]

  <nav
    id=`${canvas.id}-navigation`
    aria-live="polite"
    aria-busy=[...Update status boolean]
  >
    [...SC-generated navigation-related content]
  </nav>

  <div
    id=`${canvas.id}-text-hold`
    aria-live="polite"
    aria-busy=[...Update status boolean]
  >
    [...SC-generated graphical text content]
  </div>

  <div
    id=`${canvas.id}-canvas-hold`
    aria-hidden="true"
    style="display: none;"
  >
    [...Reserved by SC for various purposes eg: text measurement]
  </div>

  <div
    id=`${canvas.id}-ARIA-label`
    aria-live="polite"
  >
    [...SC-generated label content, default: `${canvas.id} canvas element`]
  </div>

  <div
    id=`${canvas.id}-ARIA-description`
    aria-live="polite"
  >
    [...SC-generated description content, default: ""]
  </div>

</canvas>
```

#### Canvas label, description and title
`<canvas>` elements should always be provided with meaningful labels (via `aria-label` or, preferably, `aria-labelledby` attributes); consider these to be the canvas equivalent of the `<img alt="accessible summary of image">` markup.

Descriptions can add supplementary details about what the canvas does, such as a summary of the data contained in a chart, or keyboard shortcuts for interactive canvas functionality. However a better approach would be to supply such information in the text surrounding the `<canvas>` element as this allows end-users not using accessible technologies to also see/read the information.

The [title attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title) is defined in the HTML specification as global, thus available on all HTML elements. However the attribute comes with [significant accessibility concerns](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title#accessibility_concerns) - the general advice is to avoid using it to convey information to the end-user.

Dev-users can tell SC to add labels, descriptions and titles to a `<canvas>` element by adding the following attributes to the element's HTML markup:

```
<canvas
  id=[...canvas element's unique id string]
  width=[...canvas width]
  height=[...canvas height]

  data-scrawl-canvas

  data-label=[...accessible label string]
  data-description=[...accessible description]

  title=[...title string]
>
  [...fallback content markup]
</canvas
```

Once SC has finished importing the `<canvas>` element into the SC system, dev-users can change the values of the `<div>` elements containing the `label` and `description` strings using normal SC `set()` functionality. When the update occurs in the DOM the affected `<div>` element's `aria-busy` attribute will be set to `true`, then set back to `false` when the update completes. The change will be announced to the end-user politely:

```
<script>
  [...other code]

  canvas.set({
    label: [...new label string]
    description: [...new description string]
  });
</script>
```

> **WARNING:** Dev-users should never attempt to set or update the label and description `<div>` elements directly! Nor should these elements be removed from the DOM - do not be tempted to update the `<canvas>` element's contents using `.innerHTML=[...new markup]` or similar functionality.

#### Canvas roles
The [role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) of a `<canvas>` element can vary depending on how it is being used in the web page. 

SC, by default, will assign an imported `<canvas>` element to the [ARIA `img` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role). For the most part this seems to work reasonably well with screen reader technology. This is because while most screen readers will consider the element with `role="img"` set on it to be like a black box (and not access the individual elements inside it), they are far more likely to just disregard the `<canvas>` element when they encounter it and process its fallback content instead.

However `<canvas>` elements are eminently adaptable; dev-users can find many use cases for them. Thus it is important for designers and dev-users to carefully consider the role being played by each canvas display in the web page and adapt the element's role accordingly:
+ Static canvas displays should keep the **`img`** role if the display is relevant (but not essential) to understanding the surrounding text.
+ Static or animated canvas displays that don't contribute to the user's understanding of the surrounding text - for instance background or decorative artwork - should use the [ARIA `presentation` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/presentation_role), or its synonym **`none`**.
+ Chart and graph canvas displays should probably be given the [ARIA `figure` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/figure_role).
+ Similarly, interactive image displays - such as a carousel or before-after component - may benefit from taking the **`figure`** role.
+ If the entire `<canvas>` element (not just part of it) is being used as a button, best practice is to wrap it in a `<button>` (or `<input type="button">`) element, in which case set its role to **`presentation`**. If that is not possible, then the element must take the [ARIA `button` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role). At the same time, the element's [tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex) attribute should be explicitly set to `0`.
+ If the entire `<canvas>` element (not just part of it) is being used as a navigation link, best practice is to wrap it in an `<a href=[...URL]>` element, in which case set its role to **`presentation`**. If that is not possible, then the element must take the [ARIA `link` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/link_role). At the same time, the element's [tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex) attribute should be explicitly set to `0`.
+ If the entire `<canvas>` element (not just part of it) is being used as a visual progress bar, or conveying timer information (for instance a video playback progress bar, or a clock readout) then it might be appropriate to give the element an [ARIA `progressbar` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role) or [ARIA `timer` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/timer_role).
+ Highly interactive `<canvas>` elements need to be given the [ARIA `application` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/application_role) - but use this role with care! The **`application`** role should be reserved for app-like canvas displays such as: spreadsheets; monitoring/analytic consoles; image or video editing studios; design suites; (collaborative) whiteboard experiences; etc.

Dev-users can set a `<canvas>` element's `role` attribute in the normal way. While SC includes functionality to update the attribute after the canvas import completes, this is (almost certainly) not best practice:

```
<canvas
  id=[...canvas element's unique id string]
  width=[...canvas width]
  height=[...canvas height]

  data-scrawl-canvas

  role=[...ARIA role string]
>
  [...fallback content markup]
</canvas
```

### Captions and other alternatives for multimedia
People who cannot hear audio or see video need alternatives. Examples include:
+ Text transcripts and captions for audio content, such as recordings of a radio interview
+ Audio descriptions, which are narrations to describe important visual details in a video
+ Sign language interpretation of audio content, including relevant auditory experiences

Well-written text transcripts containing the correct sequence of any auditory or visual information provide a basic level of accessibility and facilitate the production of captions and audio descriptions.

**1.2.1 (A) - [Audio-only and Video-only (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying audio data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**1.2.2 (A) - [Captions (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying caption data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**1.2.3 (A) - [Audio Description or Media Alternative (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying alternative text data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible manner.

**1.2.4 (AA) - [Captions (Live)](https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html)**
+ With considerable effort, developers can display live media streams in a `<canvas>` element by capturing the stream in a  `<video>` element, which can then act as a source for the `<canvas>` element's display data.
+ If the media stream includes caption data, which is captured by the `<video>` element, then the `<canvas>` element will ignore it - though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible manner.

**1.2.5 (AA) - [Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying audio data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**1.2.6 (AAA) - [Sign Language (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html)**
+ Adding human-based or AI generated sign language interpretation to video is a developing field of technology - see (for instance) [signapse.ai](https://www.signapse.ai/), [signfordeaf.com](https://www.signfordeaf.com/solutions/video-sign-language), etc.
+ Given that `<canvas>` elements can use `<video>` elements as a source for their display data, including signed interpretation in the canvas display should not be difficult. However, if chosen solutions include the ability to show/hide the signer then developers will need to find a way to emulate that control for the canvas display.

**1.2.7 (AAA) - [Extended Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying extended audio data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**1.2.8 (AAA) - [Media Alternative (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes any accompanying data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**1.2.9 (AAA) - [Audio-only (Live)](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html)**
+ Not applicable - `<canvas>` elements are entirely visual in nature.

#### SC and accessible multimedia
> **tl;dr:** Many of the above requirements are best met during audio-visual production and post-production, long before the resulting files are supplied to the developer for inclusion in a web page. This includes generating subtitle and caption data in [Web Video Text Tracks Format](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format) rather than adding them directly to the video as graphical text - which is entirely inaccessible!

SC makes it reasonably easy for dev-users to add video playback to a canvas scene. It achieves this using a set of [Asset objects](sc-assets.html), which load animatable or streamed assets into the SC system and then serve them to [Picture entitys](sc-image-based-entitys.html) and [Pattern objects](sc-styles.html) for display in the `<canvas>` element:
+ SC **sprite assets** take a series of images, or a spritesheet image, and - with the help of a manifest file or definition object - creates small animation loops for display.
+ SC **noise assets** and **reaction-diffusion assets** use images generated by the SC system for various purposes; given that these images can be animated in various ways they need to be considered as in-scope for accessibility purposes.
+ SC includes **raw assets** as a means to interact with, and display, third-party-generated `<canvas>` elements which may themselves be animated.
+ SC **video assets** define and control:
  - File-based audio-visual sources, either already present in the web page, or from a remote server;
  - Media streams generated by device cameras;
  - Screen capture streams generated by the user's screen.
+ SC **Cell objects** can also be used as an asset which means they, too, may need to meet these requirements (where appropriate).

The requirements listed above are all concerned with making sure a web page can supply aural, visual and textual alternatives for various combinations of animated/streamed media assets. The need to meet these requirements depends on how important the asset is to the user's understanding of the web page's content:
+ Text alternatives to supply either verbatim copy of, or additional detail around, a video- or audio-based asset, in particular when the asset supplies the end-user with additional information not mentioned in the text surrounding the `<canvas>` element.
+ Descriptive speech and text (and sign?) for otherwise silent animated assets.
+ Additional visual, sign-based recitation and/or commentary on video- or audio-based assets. Given the recent improvements in machine learning and AI computing functionality in this space, this requirement may become easier to meet going forward - in particular by combining video and AI-generated sign language animation in a `<canvas>` element.

#### Managing audio assets
SC does not (at this time) include any functionality to import `<audio>` elements as SC assets. It is up to the dev-user to find ways to import and make use of such files within the context of an SC-managed canvas display. 

For the intrepid developer, check out the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) page on MDN. If that feels too overwhelming, then the [awesome-webaudio](https://github.com/notthetup/awesome-webaudio) page on GitHub has links to many Javascript libraries that may help a web page meet a designer's audio-related demands.

#### Managing video asset captions and subtitles
SC functionality for importing video into the SC system as an asset, for use in Picture entitys and Pattern style objects, can be found in the [assets page](sc-assets.html) of this Runbook.

SC does not (at this time) include functionality to access or display [HTMLTrackElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTrackElement) data. The native `<video>` element expects to find `<track>` element children placed between its opening and closing tags. The text supplied in those text tracks are not part of the video stream data itself. Instead the text tends to be displayed in normal HTML elements displayed over the `<video>` element's display.

If dev-users want to play a user-controlled video in an SC-managed `<canvas>` element, then they need to implement the video controls themselves. The control inputs and buttons should (ideally!) be created using normal HTML `<button>` and `<input>` elements, though SC does not prevent the dev-user from creating them using SC entitys - see test demo [Canvas-027](../../demo/canvas-027.html) for a proof-of-concept example.

Similarly, dev-users can - once they have built the functionality to capture change events emitted by the video's `<track>` element - display those captions near to (or over) the `<canvas>` element, preferable in normal HTML elements or, alternatively, in SC Label and EnhancedLabel entitys.

### Content can be presented in different ways
For users to be able to change the presentation of content, it is necessary that:
+ Headings, lists, tables, input fields, and content structures are marked-up properly
+ Sequences of information or instructions are independent of any presentation
+ Browsers and assistive technologies provide settings to customize the presentation

Meeting this requirement allows content to be correctly read aloud, enlarged, or adapted to meet the needs and preferences of different people. For instance, it can be presented using custom color combinations, text size, or other styling to facilitate reading. This requirement also facilitates other forms of adaptation, including automatic generation of page outlines and summaries to help people get an overview and to focus on particular parts more easily.

**1.3.1 (A) - [Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)**
+ `<canvas>` elements should never replace the web page.
+ Where a `<canvas>` element is part of a web page, and it is not merely decorative, then developers need to make best effort to describe the contents of the canvas display - ideally through ARIA `labelled-by` and `described-by` markup.
+ Any relevant graphical text contained in the canvas display should be reflected in some way back into the web page DOM so it can be accessed by assistive technologies. Ideally, that text should be part of the surrounding copy so that if the `<canvas>` element fails to render for any reason, the information displayed in the graphical text is not lost.

**1.3.2 (A) - [Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)**
+ For any relevant graphical text contained in the canvas display, that text should be reflected back into the web page DOM in a way so that it makes sense - both in itself, and in the wider context of the surrounding text - to end users accessing that text using assistive technology.

**1.3.3 (A) - [Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html)**
+ Probably not applicable - `<canvas>` elements that are more likely to be the control elements rather than the describers of control elements.

**1.3.4 (AA) - [Orientation](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)**
+ `<canvas>` elements are not naturally responsive; developers will need to apply some effort towards making the element fit appropriately into its environment's orientation without distorting the canvas display.

**1.3.5 (AA) - [Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)**
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**1.3.6 (AAA) - [Identify Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html)**
+ It is unlikely that a `<canvas>` element will represent an entire [region](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11) of a web page. Doing so is not advised!

#### Making `<canvas>` elements responsive with SC
TODO

### Content is easier to see and hear
Distinguishable content is easier to see and hear. Such content includes:
+ Color is not used as the only way of conveying information or identifying content
+ Default foreground and background color combinations provide sufficient contrast
+ When users resize text up to 400% or change text spacing, no information is lost
+ Text reflows in small windows (“viewports”) and when users make the text larger
+ Images of text are resizable, replaced with actual text, or avoided where possible
+ Users can pause, stop, or adjust the volume of audio that is played on a website
+ Background audio is low or can be turned off, to avoid interference or distraction

Meeting this requirement helps separate foreground from background, to make important information more distinguishable. This includes considerations for people who do not use assistive technologies and for people using assistive technologies who may observe interference from prominent audio or visual content in the background. For instance, many people with color blindness do not use any particular tools and rely on a proper design that provides sufficient color contrast between text and its surrounding background. For others, audio that is automatically played could interfere with text-to-speech or with assistive listening devices (ALDs).

**1.4.1 (A) - [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)**
+ This is a design issue. Canvas displays and animations should be designed alongside the rest of the web page on which the `<canvas>` elements appear.
+ Websites should pay attention to user preferences - in particular to: `prefers-contrast`, `prefers-color-scheme`, `prefers-reduced-transparency`, `forced-colors`, `inverted-colors`. Canvas displays and animations should adapt to these user preferences in line with the rest of the web page. Again, this is a design issue which developers then need to implement.

**1.4.2 (A) - [Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying audio data then the `<canvas>` element will ignore it. Developers will need to present the video's audio controls to end-users in an accessible way.

**1.4.3 (AA) - [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)**
+ This is a design issue. Canvas displays and animations should be designed alongside the rest of the web page on which the `<canvas>` elements appear.
+ Websites should pay attention to user preferences - in particular to: `prefers-contrast`. Canvas displays and animations should adapt to this user preference in line with the rest of the web page.

**1.4.4 (AA) - [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)**
+ `<canvas>` elements should react in the same way as any other element when the user zooms - ***not*** *pinch-zooms, which is an entirely different sort of zoom* - their browser displays. 
+ Developers need to make sure their canvas displays zoom in the appropriate manner - including making any graphical text appropriately larger.

**1.4.5 (AA) - [Images of Text](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html)**
+ This requirement only applies to `<canvas>` elements whose display includes large amounts of graphical text.
+ In general, canvas displays should only contain the minimum amount of graphical text to help users make sense of the display. Additional explanatory text should be supplied either in the surrounding web page text, or in the `<canvas>` element's ARIA `labelled-by` and `described-by` markup.

**1.4.6 (AAA) - [Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)**
+ This is a design issue. Canvas displays and animations should be designed alongside the rest of the web page on which the `<canvas>` elements appear.
+ Websites should pay attention to user preferences - in particular to: `prefers-contrast`. Canvas displays and animations should adapt to this user preference in line with the rest of the web page.

**1.4.7 (AAA) - [Low or No Background Audio](https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html)**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying audio data then the `<canvas>` element will ignore it. Developers will need to present the video's audio controls to end-users in an accessible way.

**1.4.8 (AAA) - [Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)**
+ This requirement only applies to `<canvas>` elements whose display includes large amounts of graphical text.
+ In general, canvas displays should only contain the minimum amount of graphical text to help users make sense of the display. Additional explanatory text should be supplied either in the surrounding web page text, or in the `<canvas>` element's ARIA `labelled-by` and `described-by` markup.

**1.4.9 (AAA) - [Images of Text (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html)**
+ In general, canvas displays should only contain the minimum amount of graphical text to help users make sense of the display. Additional explanatory text should be supplied either in the surrounding web page text, or in the `<canvas>` element's ARIA `labelled-by` and `described-by` markup.

**1.4.10 (AA) - [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)**
+ In general, canvas displays should only contain the minimum amount of graphical text to help users make sense of the display. Additional explanatory text should be supplied either in the surrounding web page text, or in the `<canvas>` element's ARIA `labelled-by` and `described-by` markup.
+ This requirement can (arguably) apply to any `<canvas>` element containing graphical text. It is up to the designer and developer to develop canvas displays that work appropriately with larger and smaller representations of that graphical text.

**1.4.11 (AA) - [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)**
+ Designers using `<canvas>` elements to convey graphical information should make an effort to give sufficient contrast between that information and the canvs display background.
+ If the canvas display includes any graphical controls - links, buttons, draggable controls, etc - then there should be sufficient contrast between those elements and their surrounding graphics and background.

**1.4.12 (AA) - [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)**
+ In general, canvas displays should only contain the minimum amount of graphical text to help users make sense of the display.
+ If the canvas display is text-heavy, then that graphical text should make a best effort to respect the surrounding page's CSS markup when it comes to text spacing requirements.

**1.4.13 (AA) - [Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)**
+ If a `<canvas>` element is animated and includes behaviour such as adding or removing additional content as a result of a hover or focus interaction, then the designer needs to take this accessibility requirement into consideration when designing those interactions.

#### SC Color space support 
TODO

#### SC function hooks to adapt to color-based user preferences settings
TODO

#### SC support for browser zoom (not pinch zoom)
TODO

### Functionality is available from a keyboard
Many people do not use the mouse and rely on the keyboard to interact with the Web. This requires keyboard access to all functionality, including form controls, input, and other user interface components.

Keyboard accessibility includes:
+ All functionality that is available by mouse is also available by keyboard
+ Keyboard focus does not get trapped in any part of the content
+ Web browsers, authoring tools, and other tools provide keyboard support

Meeting this requirement helps keyboard users, including people using alternative keyboards such as keyboards with ergonomic layouts, on-screen keyboards, or switch devices. It also helps people using voice recognition (speech input) to operate websites and to dictate text through the keyboard interface.

**2.1.1 (A) - [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)**
+ If a `<canvas>` element includes interactive content driven by mouse or touch events, then those interactions should also be actionable through the user's keyboard or other input device.

**2.1.2 (A) - [No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)**
+ If a `<canvas>` element includes focusable content, then the element's functionality should also include standard methods for moving focus away from the element.

**2.1.3 (AAA) - [Keyboard (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html)**
+ If a `<canvas>` element includes interactive content driven by mouse or touch events, then those interactions should also be actionable through the user's keyboard or other input device.

**2.1.4 (A) - [Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)**
+ The work of meeting this requirement lies with the designer and UX developer. `<canvas>` elements that include interactive content should not be ignored in any work to assign keyboard shortcuts, or reassigning those shortcuts to different key strokes.

#### Keyboard event management for SC Canvas artefacts
TODO

### Users have enough time to read and use the content
Some people need more time than others to read and use the content. For instance, some people require more time to type text, understand instructions, operate controls, or to otherwise complete tasks on a website.

Examples of providing enough time include providing mechanisms to:
+ Stop, extend, or adjust time limits, except where necessary
+ Pause, stop, or hide moving, blinking, or scrolling content
+ Postpone or suppress interruptions, except where necessary
+ Re-authenticate when a session expires without losing data

**2.2.1 (A) - [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)**
+ `<canvas>` elements that have animated displays should also include user-accessble controls to halt the animation at will.

**2.2.2 (A) - [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)**
+ `<canvas>` elements that have animated displays should also include user-accessble controls to halt/resume the animation at will. The user should also be able to hide the `<canvas>` element if they so desire.
+ Websites should pay attention to user preferences - in particular to: `prefers-reduced-motion`. Canvas displays and animations should adapt to these user preferences in line with the rest of the web page - in this case to halt any animation if it runs for more than five seconds.

**2.2.3 (AAA) - [No Timing](https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html)**
+ `<canvas>` elements that have animated displays should also include user-accessble controls to halt/resume the animation at will. The user should also be able to hide the `<canvas>` element if they so desire.

**2.2.4 (AAA) - [Interruptions](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html)**
+ This is a user session and/or web page concern, thus not applicable specifically to `<canvas>` elements.

**2.2.5 (AAA) - [Re-authenticating](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html)**
+ This is a user session and/or web page concern, thus not applicable specifically to `<canvas>` elements.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**2.2.6 (AAA) - [Timeouts](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html)**
+ This is a user session and/or web page concern, thus not applicable specifically to `<canvas>` elements.

#### Managing SC Animations
TODO

### Content does not cause seizures and physical reactions
Content that flashes at certain rates or patterns can cause photosensitive reactions, including seizures. Flashing content is ideally avoided entirely or only used in a way that does not cause known risks. Also animations and moving content can cause discomfort and physical reactions.

Examples of avoiding causing seizures and physical reactions:
+ Do not include content that flashes at particular rates and patterns
+ Warn users before flashing content is presented, and provide alternatives
+ Provide mechanisms to switch off animations, unless they are essential

**2.3.1 (A) - [Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)**
+ This is a design issue. If a canvas display includes flashing animation then the user must be made aware of that before the animation plays. 
+ Explicit user consent for the canvas animation to play is advisable. 

**2.3.2 (AAA) - [Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html)**
+ This is a design issue. If a canvas display includes flashing animation then the user must be made aware of that before the animation plays. 
+ Explicit user consent for the canvas animation to play is required. 

**2.3.3 (AAA) - [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)**
+ Websites should pay attention to user preferences - in particular to: `prefers-reduced-motion`. Canvas displays and animations should adapt to these user preferences in line with the rest of the web page - in this case to suppress unnecessary animations arising from user interactions with the `<canvas>` element.

#### SC function hooks to adapt to motion-based user preferences settings
TODO

### Users can easily navigate, find content, and determine where they are
Well organized content helps users to orient themselves and to navigate effectively. Such content includes:
+ Pages have clear titles and are organized using descriptive section headings
+ There is more than one way to find relevant pages within a set of web pages
+ Users are informed about their current location within a set of related pages
+ There are ways to bypass blocks of content that are repeated on multiple pages
+ The keyboard focus is visible, and the focus order follows a meaningful sequence
+ The purpose of a link is evident, ideally even when the link is viewed on its own

Meeting this requirement helps people to navigate through web pages in different ways, depending on their particular needs and preferences. For instance, while some people rely on hierarchical navigation structures such as menu bars to find specific web pages, others rely on search functions on websites instead. Some people may be seeing the content while others may be hearing it or seeing and hearing it at the same time. Some people may be using the content with only a mouse or a keyboard, while others may be using both.

**2.4.1 (A) - [Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)**
+ Not applicable to `<canvas>` elements - the expectation should be that the element, if used for such purposes, should be part of a wider header or navigation component to which the requirement applies.

**2.4.2 (A) - [Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)**
+ Not applicable to `<canvas>` elements.

**2.4.3 (A) - [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ For these `<canvas>` elements, or the regions within them, all efforts should be made to ensure they respect the web page's focus order.
+ In particular, the HTML specification allows `<a>` and `<button>` elements to be placed between the `<canvas>` element's opening and closing tags. Any navigation or action caused by user interaction should be triggered on those elements, not emulated by the `<canvas>` element.

**2.4.4 (A) - [Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as links, or which include regions within their display which act as links.
+ The HTML specification allows `<a>` elements to be placed between the `<canvas>` element's opening and closing tags. Any navigation cause by user interaction should be triggered on those elements, not emulated by the `<canvas>` element.
+ `<a>` elements contained within the `<canvas>` element should comply with this requirement.

**2.4.5 (AA) - [Multiple Ways](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html)**
+ Not applicable to `<canvas>` elements.

**2.4.6 (AA) - [Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)**
+ Using `<canvas>` elements to act as web page headings and labels is not advisable. They could be used as decorative accompaniments to headings and labels, in which case their application should be consistent and should not obscure those elements in any way.

**2.4.7 (AA) - [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ When the user focuses on the element, or the graphical region within the display acting as a button or link, then that focussing action should be visibly conveyed to the user.
+ This extends to keyboard navigation - when the user focusses on the `<a>` or `<button>` elements contained by the canvas, that action should be visibly indicated to the user in some way.

**2.4.8 (AAA) - [Location](https://www.w3.org/WAI/WCAG22/Understanding/location.html)**
+ Not applicable to `<canvas>` elements.

**2.4.9 (AAA) - [Link Purpose (Link Only)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as links, or which include regions within their display which act as links.
+ The HTML specification allows `<a>` elements to be placed between the `<canvas>` element's opening and closing tags. Any navigation cause by user interaction should be triggered on those elements, not emulated by the `<canvas>` element.
+ `<a>` elements contained within the `<canvas>` element should comply with this requirement.

**2.4.10 (AAA) - [Section Headings](https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html)**
+ Using `<canvas>` elements to act as web page headings and labels is not advisable. They could be used as decorative accompaniments to headings and labels, in which case their application should be consistent and should not obscure those elements in any way.

**2.4.11 (AA) - [Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ When the user keyboard focusses on the `<a>` or `<button>` elements contained by the canvas, then the `<canvas>` element should become visible in the browser viewport. If the focussed element is tied to a particular region of the canvas display then that part of the `<canvas>` element should be entirely visible in the browser viewport.

**2.4.12 (AAA) - [Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ When the user keyboard focusses on the `<a>` or `<button>` elements contained by the canvas, then the `<canvas>` element should become visible in the browser viewport. If the focussed element is tied to a particular region of the canvas display then that part of the `<canvas>` element should be entirely visible in the browser viewport.

**2.4.13 (AAA) - [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ When the user keyboard focusses on the `<a>` or `<button>` elements contained by the canvas, then the `<canvas>` element, or the region within the canvas display tied to that button or link, should change its appearance to meet the requirements of this criterion.

#### Button and link functionality in SC Canvas artefact displays
TODO

#### Focus management for interactive SC entitys
TODO

#### Apply canvas decoration to HTML headers using SC Snippet functionality
TODO

### Users can use different input modalities beyond keyboard
Input modalities beyond keyboard, such as touch activation, voice recognition (speech input), and gestures make content easier to use for many people. Yet not everyone can use each of these input modalities, and to the same degree. Particular design considerations maximize the benefit of these input modalities. This includes:
+ Gestures that require dexterity or fine movement have alternatives that do not require high dexterity
+ Components are designed to avoid accidental activation, for example by providing undo functionality
+ Labels presented to users match corresponding object names in the code, to support activation by voice
+ Functionality that is activated by movement can also be activated through user interface components
+ Buttons, links, and other active components are large enough to make them easier to activate by touch

Meeting this requirement makes the content easier to use for many people with a wide range of abilities using a wide range of devices. This includes content used on mobile phones, tablet computers, and self-service terminals such as ticketing machines.

Note that most of the requirements below need to be managed at the design stage of website development.

**2.5.1 (A) - [Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)**
+ This should be handled at the level of the web page.
+ Canvas displays and interactions should be designed to take into account the limitiations of various input devices.

**2.5.2 (A) - [Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)**
+ This should be handled at the level of the web page.

**2.5.3 (A) - [Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ The HTML specification allows `<a>` and `<button>` elements to be placed between the `<canvas>` element's opening and closing tags. These elements should be given a programmatic name.
+ Designers should then make best efforts to display the label as graphical text (which is not reflected back into the web page DOM) to meet the requirements of this criterion, should it apply.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**2.5.4 (A) - [Motion Actuation](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html)**
+ This is a web page design issue. `<canvas>` elements will be affected alongside all other components in the web page.

**2.5.5 (AAA) - [Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ Such `<canvas>` elements or graphical regions within the canvas display should make best efforts to meet these minimum target dimensions.

**2.5.6 (AAA) - [Concurrent Input Mechanisms](https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html)**
+ Interactive `<canvas>` elements are not exempt from this requirement.

**2.5.7 (AA) - [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)**
+ Developers can create - with some effort - interactive `<canvas>` elements which include draggable regions within their display which act as action buttons or links.
+ For such `<canvas>` elements, developers should make best effort to create user interaction methods that do not rely solely on mouse or touch manipulations.

**2.5.8 (AA) - [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links.
+ Such `<canvas>` elements or graphical regions within the canvas display should make best efforts to meet these minimum target dimensions.

### Text is readable and understandable
Content authors need to ensure that text content is readable and understandable to the broadest audience possible, including when it is read aloud by text-to-speech. Such content includes:
+ Identifying the primary language of a web page, such as Arabic, Dutch, or Korean
+ Identifying the language of text passages, phrases, or other parts of a web page
+ Providing definitions for any unusual words, phrases, idioms, and abbreviations
+ Using the clearest and simplest language possible, or providing simplified versions

Meeting this requirement helps software, including assistive technology, to process text content correctly. For instance, this requirement helps software to read the content aloud, to generate page summaries, and to provide definitions for unusual words such as technical jargon. It also helps people who have difficulty understanding more complex sentences, phrases, and vocabulary. In particular, it helps people with different types of cognitive disabilities.

**3.1.1 (A) - [Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

**3.1.2 (AA) - [Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

**3.1.3 (AAA) - [Unusual Words](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

**3.1.4 (AAA) - [Abbreviations](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

**3.1.5 (AAA) - [Reading Level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

**3.1.6 (AAA) - [Pronunciation](https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html)**
+ This is a web page design and development issue. `<canvas>` elements, which can include graphical text in their displays,  will be affected alongside all other components in the web page.

#### SC text management functionality
TODO

### Content appears and operates in predictable ways
Many people rely on predictable user interfaces and are disoriented or distracted by inconsistent appearance or behavior. Examples of making content more predictable include:
+ Navigation mechanisms that are repeated on multiple pages appear in the same place each time
+ User interface components that are repeated on web pages have the same labels each time
+ Significant changes on a web page do not happen without the consent of the user

Meeting this requirement helps people to quickly learn the functionality and navigation mechanisms provided on a website, and to operate them according to their specific needs and preferences. For instance, some people assign personalized shortcut keys to functions they frequently use to enhance keyboard navigation. Others memorize the steps to reach certain pages or to complete processes on a website. Both rely on predictable and consistent functionality.

Note that most of the requirements below need to be managed at the design stage of website development.

**3.2.1 (A) - [On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)**
+ Developers can create - with some effort - `<canvas>` elements that act as action buttons or links, or which include regions within their display which act as action buttons or links, that can be focussed.
+ Such interactive `<canvas>` elements should make best effort to comply with this requirement.

**3.2.2 (A) - [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)**
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.2.3 (AA) - [Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)**
+ This is a web page design issue.

**3.2.4 (AA) - [Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html)**
+ This is a web page design issue.

**3.2.5 (AAA) - [Change on Request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html)**
+ This is a web page design issue.

**3.2.6 (A) - [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html)**
+ This is a web page design issue.

### Users are helped to avoid and correct mistakes
Forms and other interaction can be confusing or difficult to use for many people, and, as a result, they may be more likely to make mistakes. Examples of helping users to avoid and correct mistakes include:
+ Descriptive instructions, error messages, and suggestions for correction
+ Context-sensitive help for more complex functionality and interaction
+ Opportunity to review, correct, or reverse submissions if necessary

Meeting this requirement helps people who do not see or hear the content, and may not recognize implicit relationships, sequences, and other cues. It also helps people who do not understand the functionality, are disoriented or confused, forget, or make mistakes using forms and interaction for any other reason.

Note that most of the requirements below need to be managed at the design stage of website development.

**3.3.1 (A) - [Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.2 (A) - [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.3 (AA) - [Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.4 (AA) - [Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.5 (AAA) - [Help](https://www.w3.org/WAI/WCAG22/Understanding/help.html)**
+ This is a web page design issue.

**3.3.6 (AAA) - [Error Prevention (All)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.7 (A) - [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.8 (AA) - [Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**3.3.9 (AAA) - [Accessible Authentication (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html)**
+ This is a web page design issue.
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

### Content is compatible with current and future user tools
Robust content is compatible with different browsers, assistive technologies, and other user agents. Examples of how this can be achieved include:
+ Ensuring markup can be reliably interpreted, for instance by ensuring it is valid
+ Providing a name, role, and value for non-standard user interface components

Meeting this requirement helps maximize compatibility with current and future user agents, including assistive technologies. In particular, it enables assistive technologies to process the content reliably, and to present or to operate it in different ways. This includes non-standard (scripted) buttons, input fields, and other controls.

Note that the issues raised below, as they relate to SC Canvas artefacts, have already been discussed above.

**4.1.1 Parsing (Obsolete and removed)**
+ No longer applicable, thus no impact on `<canvas>` elements.

**4.1.2 (A) - [Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)**
+ Any `<canvas>` element adapted to perform a purpose other than displaying a static, non-interactive scene in the web page needs to comply with this requirement.

**4.1.3 (AA) - [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)**
+ Any `<canvas>` element adapted to perform a purpose other than displaying a static, non-interactive scene in the web page needs to comply with this requirement. 
+ Updates to information that the `<canvas>` element makes available to the web page about changes in its display should be done in a way to make sense to the user (within the wider context of the page content) while at the same time not overwhelming the user with updated content.
