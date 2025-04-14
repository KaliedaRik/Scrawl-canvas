# Scrawl-canvas accessibility
The following summary has been stolen (with very minor formatting amendments) from the [Introduction to Web Accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/) page of the W3C Web Accessibility Initiative site (last stolen on 13 April 2025):

```
Web accessibility means that websites, tools, and technologies are designed and developed
so that people with disabilities can use them. More specifically, people can: perceive,
understand, navigate, and interact with the Web; and contribute to the Web.

Web accessibility encompasses all disabilities that affect access to the Web, including:
auditory; cognitive; neurological; physical; speech; visual; etc.

Web accessibility also benefits people without disabilities, for example:

→ People using mobile phones, smart watches, smart TVs, and other devices with small screens,
  different input modes, etc.

→ Older people with changing abilities due to ageing.

→ People with "temporary disabilities" such as a broken arm or lost glasses.

→ People with "situational limitations" such as in bright sunlight or in an environment where
  they cannot listen to audio.

→ People using a slow Internet connection, or who have limited or expensive bandwidth.
```

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

## Perceivable information and user interface
**Requirement:** Information and user interface components must be presentable to users in ways they can perceive. (14 Apr 2025)

Application to `<canvas>` elements:
+ A canvas-based display or animation is nothing more than a collection of graphical pixels in the browser viewport. It is, by itself, not accessible.
+ Canvas displays can include video output - either from an HTML `<video>` element, or from various video streams. While the `<video>` element itself may include accessible data (such as captions or subtitles), the `<canvas>` element cares only about the visual stream emitted by the `<video>` element.
+ The relationship between `<canvas>` elements and the wider web page content can, in general, be handled using appropriate ARIA and `role=` markup - but never assume that the browser will default to `role=img` for unmarked elements.
+ As for `<img>` elements, best practice is to describe the canvas display in the copy surrounding it, leaving ARIA `labelled-by` and `described-by` markup to the bare minimum copy necessary. Essential copy should never be shown only in the canvas display.
+ `<canvas>` elements are not naturally responsive, for example adapting their displays between portrait and landscape viewports.

### Text alternatives for non-text content
The purpose of this guideline is to ensure that all non-text content is also available in text. "Text" refers to electronic text, not an image of text. Electronic text has the unique advantage that it is presentation neutral. That is, it can be rendered visually, auditorily, tactilely, or by any combination. As a result, information rendered in electronic text can be presented in whatever form best meets the needs of the user. It can also be easily enlarged, spoken aloud so that it is easier for people with reading disabilities to understand, or rendered in whatever tactile form best meets the needs of a user. (14 Apr 2025)

#### 1.1.1 (A) - [Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)

The intent of this success criterion is to make information conveyed by non-text content accessible through the use of a text alternative. Text alternatives are a primary way for making information accessible because they can be rendered through any sensory modality (for example, visual, auditory or tactile) to match the needs of the user. Providing text alternatives allows the information to be rendered in a variety of ways by a variety of user agents. For example, people who cannot see a picture can have the text alternative read aloud using synthesized speech. People who cannot hear an audio file can have the text alternative displayed so that they can read it. In the future, text alternatives will also allow information to be more easily translated into sign language or into a simpler form of the same language. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ A canvas-based display or animation is nothing more than a collection of graphical pixels in the browser viewport. It is, by itself, not accessible. Browsers will often consider `<canvas>` elements to be images.
+ `<canvas>` elements can, with effort, present their display as an animation which is, in some ways, analagous to a `<video>` element. However there is no browser-based functionality specified for supplying such canvas displays with video-like controls to play or pause the animation.
+ `<canvas>` elements can, with effort, present their display as an user-interactive diagram which includes controls for the user to manipulate that display. Such graphical controls need to be accessible - including keyboard accessibility.
+ `<canvas>` elements can, with effort, display charts and maps - which may include interactive functionality. While static charts and maps can be treated as images for accessibility purposes, interactive charts and maps need to be accessible - including keyboard accessibility.
+ Any significant data used to create a canvas display - for example chart data - should also be supplied in alternative formats which an end-user can access (like a table, or a downloadable CSV file).
+ If a canvas display is being used purely for decorative purposes such as a space filler or background then it needs to be marked as such so assistive technologies can ignore it.
+ Canvas displays used as backgrounds will need to be checked to make sure the content above them remains legible - for example there remains sufficient contrast between the background canvas display and the text placed over it.

**Implications for Scrawl-canvas:**
+ [TODO]

### Captions and other alternatives for multimedia
The purpose of this guideline is to provide access to time-based and synchronized media. This includes media that is: audio-only; video-only; audio-video; and audio and/or video combined with interaction.

#### 1.2.1 (A) - [Audio-only and Video-only (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html)

The intent of this success criterion is to make information conveyed by prerecorded audio-only and prerecorded video-only content available to all users. Alternatives for time-based media that are text based make information accessible because text can be rendered through any sensory modality (for example, visual, auditory or tactile) to match the needs of the user. In the future, text could also be translated into symbols, sign language or simpler forms of the language (future).

An example of pre-recorded video with no audio information or user interaction is a silent movie. The purpose of the transcript is to provide an equivalent to what is presented visually. For prerecorded video content, authors have the option to provide an audio track. The purpose of the audio alternative is to be an equivalent to the video. This makes it possible for users with and without vision impairment to review content simultaneously. The approach can also make it easier for those with cognitive, language and learning disabilities to understand the content because it would provide parallel presentation. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying audio data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.2 (A) - [Captions (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html)

The intent of this success criterion is to enable people who are deaf or hard of hearing to watch synchronized media presentations. Captions provide the part of the content available via the audio track. Captions not only include dialogue, but identify who is speaking and include non-speech information conveyed through sound, including meaningful sound effects. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying caption data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible way.

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.3 (A) - [Audio Description or Media Alternative (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html)

The intent of this success criterion is to provide people who are blind or visually impaired access to the visual information in a synchronized media presentation. This success criterion describes two approaches, either of which can be used.

[...]

The second approach involves providing all of the information in the synchronized media (both visual and auditory) in text form. An alternative for time-based media provides a running description of all that is going on in the synchronized media content. The alternative for time-based media reads something like a screenplay or book. Unlike audio description, the description of the video portion is not constrained to just the pauses in the existing dialogue. Full descriptions are provided of all visual information, including visual context, actions and expressions of actors, and any other visual material. In addition, non-speech sounds (laughter, off-screen voices, etc.) are described, and transcripts of all dialogue are included. The sequence of description and dialogue transcripts are the same as the sequence in the synchronized media itself. As a result, the alternative for time-based media can provide a much more complete representation of the synchronized media content than audio description alone. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ `<canvas>` elements can use `<video>` elements as a source for their display data. If a `<video>` element includes accompanying alternative text data then the `<canvas>` element will ignore it, though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible manner.

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.4 (AA) - [Captions (Live)](https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html)

The intent of this success criterion is to enable people who are deaf or hard of hearing to watch real-time presentations. Captions provide the part of the content available via the audio track. Captions not only include dialogue, but also identify who is speaking and notate sound effects and other significant audio.

This success criterion was intended to apply to broadcast of synchronized media and is not intended to require that two-way multimedia calls between two or more individuals through web apps must be captioned regardless of the needs of users. Responsibility for providing captions would fall to the content providers (the callers) or the “host” caller, and not the application. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ With considerable effort, developers can display live media streams in a `<canvas>` element by capturing the stream in a  `<video>` element, which can then act as a source for the `<canvas>` element's display data.
+ If the media stream includes caption data, which is captured by the `<video>` element, then the `<canvas>` element will ignore it - though that data will still be available to developers who will need to find a novel way to supply it to end-users in an accessible manner.

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.5 (AA) - [Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)

The intent of this success criterion is to provide people who are blind or visually impaired access to the visual information in a synchronized media presentation. The audio description augments the audio portion of the presentation with the information needed when the video portion is not available. During existing pauses in dialogue, audio description provides information about actions, characters, scene changes, and on-screen text that are important and are not described or spoken in the main sound track. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.6 (AAA) - [Sign Language (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html)

The intent of this success criterion is to enable people who are deaf or hard of hearing and who are fluent in a sign language to understand the content of the audio track of synchronized media presentations. Written text, such as that found in captions, is often a second language. Because sign language provides the ability to provide intonation, emotion and other audio information that is reflected in sign language interpretation, but not in captions, sign language interpretation provides richer and more equivalent access to synchronized media. People who communicate extensively in sign language are also faster in sign language and synchronized media is a time-based presentation. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.7 (AAA) - [Extended Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html)

The intent of this success criterion is to provide people who are blind or visually impaired access to a synchronized media presentation beyond that which can be provided by standard audio description. This is done by periodically freezing the synchronized media presentation and playing additional audio description. The synchronized media presentation is then resumed.

Because it disrupts viewing for those who do not need the additional description, techniques that allow you to turn the feature on and off are often provided. Alternately, versions with and without the additional description can be provided. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.8 (AAA) - [Media Alternative (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html)

The intent of this success criterion is to make audio visual material available to individuals whose vision is too poor to reliably read captions and whose hearing is too poor to reliably hear dialogue and audio description. This is done by providing an alternative for time-based media.

This approach involves providing all of the information in the synchronized media (both visual and auditory) in text form. An alternative for time-based media provides a running description of all that is going on in the synchronized media content. [...]

If there is any interaction as part of the synchronized media presentation (e.g., "press now to answer the question") then the alternative for time-based media would provide hyperlinks or whatever is needed to provide parallel functionality.

Individuals whose vision is too poor to reliably read captions and whose hearing is too poor to reliably hear dialogue can access the alternative for time-based media by using a refreshable braille display. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.2.9 (AAA) - [Audio-only (Live)](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html)

The intent of this success criterion is to make information conveyed by live audio, such as web-based audio conferencing, live speeches and radio Webcasts, accessible through the use of a text alternative. A live text caption service will enable live audio to be accessible to people who are deaf or hard of hearing, or who cannot otherwise hear the audio. [...]

This success criterion was intended to apply to broadcast of audio and is not intended to require that two-way audio calls between two or more individuals through web apps must be captioned regardless of the needs of users. Responsibility for providing captions would fall to the content providers (the callers) or the “host” caller, and not the application. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Content can be presented in different ways
Create content that can be presented in different ways (for example simpler layout) without losing information or structure.

#### 1.3.1 (A) - [Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

The intent of this success criterion is to ensure that information and relationships that are implied by visual or auditory formatting are preserved when the presentation format changes. For example, the presentation format changes when the content is read by a screen reader or when a user style sheet is substituted for the style sheet provided by the author.

Sighted users perceive structure and relationships through various visual cues — headings are often in a larger, bold font separated from paragraphs by blank lines; list items are preceded by a bullet and perhaps indented; paragraphs are separated by a blank line; items that share a common characteristic are organized into tabular rows and columns; form fields may be positioned as groups that share text labels; a different background color may be used to indicate that several items are related to each other; words that have special status are indicated by changing the font family and /or bolding, italicizing, or underlining them; items that share a common characteristic are organized into a table where the relationship of cells sharing the same row or column and the relationship of each cell to its row and/or column header are necessary for understanding; and so on. Having these structures and these relationships programmatically determined or available in text ensures that information important for comprehension will be perceivable to all. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.3.2 (A) - [Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)

The intent of this success criterion is to enable a user agent to provide an alternative presentation of content while preserving the reading order needed to understand the meaning. It is important that it be possible to programmatically determine at least one sequence of the content that makes sense. Content that does not meet this Success Criterion may confuse or disorient users when assistive technology reads the content in the wrong order, or when alternate style sheets or other formatting changes are applied.

[...]

For clarity:
+ Providing a particular linear order is only required where it affects meaning.
+ There may be more than one order that is "correct" (according to the WCAG 2.0 definition).
+ Only one correct order needs to be provided. (14 Apr 2025)


**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.3.3 (A) - [Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html)

The intent of this success criterion is to ensure that all users can access instructions for using the content, even when they cannot perceive shape or size or use information about spatial location or orientation. Some content relies on knowledge of the shape or position of objects that are not available from the structure of the content (for example, "round button" or "button to the right"). Some users with disabilities are not able to perceive shape or position due to the nature of the assistive technologies they use. This success criterion requires that additional information be provided to clarify instructions that are dependent on this kind of information. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.3.4 (AA) - [Orientation](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)

The intent of this success criterion is to ensure that content displays in the orientation (portrait or landscape) preferred by the user. Some websites and applications automatically set and restrict the screen to a particular display orientation and expect that users will respond by rotating their device to match, but this can create problems. Some users have their devices mounted in a fixed orientation (e.g. on the arm of a power wheelchair). Therefore, websites and applications need to support both orientations by not restricting the orientation. Changes in content or functionality due to the size of display are not covered by this criterion which is focused on restrictions of orientation.

Historically, devices tended to have a fixed-orientation display, and all content was created to match that display orientation. Today, most handhelds and many other devices (e.g., monitors) have a hardware-level ability to dynamically adjust default display orientation based on sensor information. The goal of this success criterion is that authors should never restrict content's orientation, thus ensuring that it always match the device display orientation. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.3.5 (AA) - [Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)

The intent of this success criterion is to ensure that the purpose of a form input collecting information about the user can be programmatically determined, so that user agents can extract and present this purpose to users using different modalities. The ability to programmatically declare the specific kind of data expected in a particular field makes filling out forms easier, especially for people with certain cognitive disabilities. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ `<canvas>` elements should NEVER be used as a replacement for form elements!

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.3.6 (AAA) - [Identify Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html)

The intent of this success criterion is to ensure that the purpose of many elements on a page can be programmatically determined, so that user agents can extract and present that purpose to users using different modalities.

Many users with limited vocabularies rely on familiar terms or symbols in order to use the web. However, what is familiar to one user may not be familiar to another. When authors indicate the purpose, users can take advantage of personalization and user preferences to load a set of symbols or vocabulary familiar to them. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Content is easier to see and hear
Make it easier for users to see and hear content including separating foreground from background.

#### 1.4.1 (A) - [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

The intent of this success criterion is to ensure that all sighted users can access information that is conveyed by color differences, that is, by the use of color where each color has a meaning assigned to it. If the information is conveyed through color differences in an image (or other non-text format), the color may not be seen by users with color deficiencies. In this case, providing the information conveyed with color through another visual means ensures users who cannot see color can still perceive the information.

Color is an important asset in the design of web content, enhancing its aesthetic appeal, its usability, and its accessibility. However, some users have difficulty perceiving color. People with partial sight often experience limited color vision, and many older users do not see color well. In addition, people using limited-color or monochrome displays and browsers will be unable to access information that is presented only in color.

Examples of information conveyed by color differences: “required fields are red", “error is shown in red", and “Mary's sales are in red, Tom's are in blue". Examples of indications of an action include: using color to indicate that a link will open in a new window or that a database entry has been updated successfully. An example of prompting a response would be: using highlighting on form fields to indicate that a required field had been left blank. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.2 (A) - [Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)

Individuals who use screen reading software can find it hard to hear the speech output if there is other audio playing at the same time. This difficulty is exacerbated when the screen reader's speech output is software based (as most are today) and is controlled via the same volume control as the sound. Therefore, it is important that the user be able to turn off the background sound. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.3 (AA) - [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

The intent of this success criterion is to provide enough contrast between text and its background, so that it can be read by people with moderately low vision or impaired contrast perception, without the use of contrast-enhancing assistive technology.

[...]

Text that is decorative and conveys no information is excluded. For example, if random words are used to create a background and the words could be rearranged or substituted without changing meaning, then it would be decorative and would not need to meet this criterion. 

[...]

Although this success criterion only applies to text, similar issues occur for content presented in charts, graphs, diagrams, and other non-text-based information, which is covered by Success Criterion 1.4.11 Non-Text Contrast. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.4 (AA) - [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

The intent of this success criterion is to ensure that visually rendered text, including controls and labels using text, can be made larger so that it can be read more easily by people with milder visual impairments, without requiring the use of assistive technology (such as a screen magnifier). Users may benefit from scaling all content on the web page, but text is most critical.

[...]

Content satisfies the success criterion if it can be scaled up to 200% using at least one text scaling mechanism supported by user agents. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.5 (AA) - [Images of Text](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html)

The intent of this success criterion is to encourage authors, who are using technologies which are capable of achieving their desired default visual presentation, to enable people who require a particular visual presentation of text to be able to adjust the text presentation as needed. This includes people who require the text in a particular font size, foreground and background color, font family, line spacing or alignment.

[...]

The definition of images of text contains the note: This does not include text that is part of a picture that contains significant other visual content. Examples of such pictures include graphs, screenshots, and diagrams which visually convey important information through more than just text. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.6 (AAA) - [Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)

The intent of this success criterion is to provide enough contrast between text and its background so that it can be read by people with moderately low vision (who do not use contrast-enhancing assistive technology).

[...]

Text that is decorative and conveys no information is excluded. For example, if random words are used to create a background and the words could be rearranged or substituted without changing meaning, then it would be decorative and would not need to meet this criterion.

[...]

Although this success criterion only applies to text, similar issues occur for content presented in charts, graphs, diagrams, and other non-text-based information, which is covered by Success Criterion 1.4.11 Non-Text Contrast. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.7 (AAA) - [Low or No Background Audio](https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html)

The intent of this success criterion is to ensure that any non-speech sounds are low enough that a user who is hard of hearing can separate the speech from background sounds or other noise foreground speech content. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.8 (AAA) - [Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)

The intent of this success criterion is to ensure that visually rendered text is presented in such a manner that it can be perceived without its layout interfering with its readability. People with some cognitive, language and learning disabilities and some low vision users cannot perceive the text and/or lose their reading place if the text is presented in a manner that is difficult for them to read.

+ People with some visual or cognitive disabilities need to be able to select the color of text and the color of the background.
+ Long lines of text can become a significant barrier. Lines should not exceed 80 characters or glyphs (40 if CJK), where glyphs are the element of writing in the writing system for the text.
+ People with some cognitive disabilities find it difficult to track text where the lines are close together.
+ People with certain cognitive disabilities have problems reading text that is both left and right justified. The uneven spacing between words in fully justified text can cause "rivers of white" space to run down the page making reading difficult and in some cases impossible. 
+ The resizing provision ensures that visually rendered text, including controls and labels using text, can be made larger without requiring the user to then scroll left and right to see all of the content. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.9 (AAA) - [Images of Text (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html)

The intent of this success criterion is to enable people who require a particular visual presentation of text to be able to adjust the text presentation as required. This includes people who require the text in a particular font size, foreground and background color, font family, line spacing or alignment [...] (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.10 (AA) - [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

The intent of this success criterion is to let users enlarge text and other related content without having to scroll in two dimensions to read. When lines of text extend beyond the edge of a viewport, users will be forced to scroll back-and-forth to read line by line. This can cause them to lose their place and can significantly increase both physical and cognitive effort. Therefore, most sections of content are expected to reflow within the appropriate sizing requirement defined by this success criterion.

A section of content that requires two-dimensional layout for understanding or functionality, such as a table or map, has an exception to this success criterion. However, sections of content within the two-dimensional layout, such as each cell within a table, would still need to meet this success criterion. Although there is an exception for sections of content that require two-dimensional layout for understanding or functionality, authors can improve the user's experience by making efforts to reduce scrolling for that type of content. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.11 (AA) - [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

The intent of this success criterion is to ensure that user interface components (i.e., controls) and meaningful graphics are distinguishable by people with moderately low vision. The requirements and rationale are similar to those for large text in 1.4.3 Contrast (Minimum). Note that this requirement does not apply to inactive user interface components.

Low contrast controls are more difficult to perceive, and may be completely missed by people with a visual impairment. Similarly, if a graphic is needed to understand the content or functionality of the web page then it should be perceivable by people with low vision or other impairments without the need for contrast-enhancing assistive technology. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.12 (AA) - [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

The intent of this success criterion (SC) is to ensure that when people override author-specified text spacing to improve their reading experience, content is still readable and operable. [...] This SC focuses on the adaptability of content to a change in spacing between lines, words, letters, and paragraphs. Any combination of these may assist a user with effectively reading text. As well, ensuring that content correctly adapts when users override author settings for spacing also significantly increases the likelihood other style preferences can be set by the user. For example, a user may need to change to a wider font family than the author has set in order to effectively read text. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 1.4.13 (AA) - [Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

Additional content that appears and disappears in coordination with keyboard focus or pointer hover often leads to accessibility issues. Reasons for such issues include: the user may not have intended to trigger the interaction; the user may not know new content has appeared; the new content may intefere with a user's ability to do a task.

Examples of such interactions can include custom tooltips, sub-menus and other nonmodal popups which display on hover and focus. The intent of this success criterion is to ensure that authors who cause additional content to appear and disappear in this manner must design the interaction in such a way that users can: perceive the additional content; and dismiss it without disrupting their page experience.

There are usually more predictable and accessible means of adding content to the page, which authors are recommended to employ. If an author does choose to make additional content appear and disappear in coordination with hover and keyboard focus, this success criterion specifies three conditions that must be met: dismissable; hoverable; persistent. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

## Operable user interface and navigation
**Requirement:** User interface components and navigation must be operable.

Application to `<canvas>` elements:
+ Some people may think it's a clever idea to mix `<canvas>` elements and form-related HTML elements: do not be one of those people!
+ Using a `<canvas>` element for some form of page control (emulating an `<a>` link or `<button>` control) requires the developer to mark the `<canvas>` element as such using relevant ARIA and `role=` markup.
+ Canvas-based link and button controls need to play nicely with the browser's tab order functionality. In particular, developers need to make sure that tabbing to a control displayed in a `<canvas>` element leads to an acceptable change in that control's appearance.
+ `<canvas>` element based page links in particular need to emulate normal `<a>` link behaviour (some of which may be browser-dependent).
+ By default, a canvas display is static; it takes effort on the part of the developer to create an animated canvas display. When this happens, the developer must also include ways for the end-user to control that animation - both slowing it down so some end-users can follow the animation at their preferred speed, and stopping it when requested.
+ The `<canvas>` element only shows what it instructed to show by the developer; if the (animated) display includes repeated flashing imagery, then it is the developer's responsibility to warn end-users, and to allow end-users to disable the animation.
+ Making sure the canvas-display complies with contrast requirements should be the designer's responsibility.

### Functionality is available from a keyboard
Make all functionality available from a keyboard.

#### 2.1.1 (A) - [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

The intent of this success criterion is to ensure that, wherever possible, content can be operated through a keyboard or keyboard interface (so an alternate keyboard can be used). When content can be operated through a keyboard or alternate keyboard, it is operable by people with no vision (who cannot use devices such as mice that require eye-hand coordination) as well as by people who must use alternate keyboards or input devices that act as keyboard emulators. Keyboard emulators include speech input software, sip-and-puff software, on-screen keyboards, scanning software and a variety of assistive technologies and alternate keyboards. Individuals with low vision also may have trouble tracking a pointer and find the use of software much easier (or only possible) if they can control it from the keyboard. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.1.2 (A) - [No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)

If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.

Note: since any content that does not meet this success criterion can interfere with a user's ability to use the whole page, all content on the web page (whether it is used to meet other success criteria or not) must meet this success criterion. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.1.3 (AAA) - [Keyboard (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html)

The intent of this success criterion is to ensure that all content is operable from the keyboard. This is the same as Success Criterion 2.1.1, except that no exceptions are allowed. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.1.4 (A) - [Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)

The intent of this success criterion is to reduce accidental activation of keyboard shortcuts. Character key shortcuts work well for many keyboard users. However, they can be inappropriate and frustrating for speech input users, whose dictation is interpreted as strings of letters, and for keyboard users who are prone to accidentally hit keys. To rectify this issue, authors need to allow users to turn off or reconfigure shortcuts that are made up of only character keys. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Users have enough time to read and use the content
Provide users enough time to read and use content.

#### 2.2.1 (A) - [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

The intent of this success criterion is to ensure that users with disabilities are given adequate time to interact with web content whenever possible. People with disabilities such as blindness, low vision, dexterity impairments, and cognitive limitations may require more time to read content or to perform functions such as filling out on-line forms. If Web functions are time-dependent, it will be difficult for some users to perform the required action before a time limit occurs. This may render the service inaccessible to them. Designing functions that are not time-dependent will help people with disabilities succeed at completing these functions. Providing options to disable time limits, customize the length of time limits, or request more time before a time limit occurs helps those users who require more time than expected to successfully complete tasks. These options are listed in the order that will be most helpful for the user. Disabling time limits is better than customizing the length of time limits, which is better than requesting more time before a time limit occurs. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.2.2 (A) - [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

For moving, blinking, scrolling, or auto-updating information, all of the following are true:
+ Moving, blinking, scrolling - For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential; and
+ Auto-updating - For any auto-updating information that (1) starts automatically and (2) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless the auto-updating is part of an activity where it is essential. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.2.3 (AAA) - [No Timing](https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html)

The intent of this success criterion is to minimize the occurrence of content that requires timed interaction. This enables people with blindness, low vision, cognitive limitations, or motor impairments to interact with content. This differs from the Level A success criterion in that the only exception is for real-time events. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.2.4 (AAA) - [Interruptions](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html)

The intent of this success criterion is to allow users to turn off updates from the author/server except in emergencies. Emergencies would include civil emergency alert messages or any other messages that warn of danger to health, safety, or property, including data loss, loss of connection, etcetera.

This allows access by people with cognitive limitations or attention disorders by enabling them to focus on the content. It also allows users who are blind or have low vision to keep their "viewing" focus on the content they are currently reading. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.2.5 (AAA) - [Re-authenticating](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html)

The intent of this success criterion is to allow all users to complete authenticated transactions that have inactivity time limits or other circumstances that would cause a user to be logged out while in the midst of completing the transaction. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.2.6 (AAA) - [Timeouts](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html)

The intent of this success criterion is to ensure that when a timeout is used, users know what duration of inactivity will cause the page to time out and result in lost data. The use of timed events can present significant barriers for users with cognitive disabilities, as these users may require more time to read content or to perform functions, such as completing an online form. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Content does not cause seizures and physical reactions
Do not design content in a way that is known to cause seizures or physical reactions.

#### 2.3.1 (A) - [Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)

Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.

Note: Since any content that does not meet this success criterion can interfere with a user's ability to use the whole page, all content on the web page (whether it is used to meet other success criteria or not) must meet this success criterion. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.3.2 (AAA) - [Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html)

The purpose of this success criterion is to further reduce the chance of seizures. Seizures cannot be completely eliminated since some people are so sensitive. However, by eliminating all 3-per-second flashing over any area of the screen, the chances of a person having a seizure are further reduced than when just meeting the measures ordinarily used today in standards internationally, as we do at Level A. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.3.3 (AAA) - [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.

The intent of this success criterion is to allow users to prevent animation from being displayed on web pages. Some users experience distraction or nausea from animated content. For example, if scrolling a page causes elements to move (other than the essential movement associated with scrolling) it can trigger vestibular disorders. Vestibular (inner ear) disorder reactions include dizziness, nausea and headaches. Another animation that is often non-essential is parallax scrolling. Parallax scrolling occurs when backgrounds move at a different rate to foregrounds. Animation that is essential to the functionality or information of a web page is allowed by this success criterion. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Users can easily navigate, find content, and determine where they are
Provide ways to help users navigate, find content, and determine where they are.

#### 2.4.1 (A) - [Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)

The intent of this success criterion is to allow people who navigate sequentially through content more direct access to the primary content of the web page. web pages and applications often have content that appears on other pages or screens. Examples of repeated blocks of content include but are not limited to navigation links, header content, and advertising frames. Small repeated sections such as individual words, phrases or single links are not considered blocks for the purposes of this provision. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.2 (A) - [Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)

The intent of this success criterion is to help users find content and orient themselves within it by ensuring that each web page has a descriptive title. Titles identify the current location without requiring users to read or interpret page content. When titles appear in site maps or lists of search results, users can more quickly identify the content they need. User agents make the title of the page easily available to the user for identifying the page. For instance, a user agent may display the page title in the window title bar or as the name of the tab containing the page. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.3 (A) - [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

The intent of this success criterion is to ensure that when users navigate sequentially through content, they encounter information in an order that is consistent with the meaning of the content and can be operated from the keyboard. This reduces confusion by letting users form a consistent mental model of the content. There may be different orders that reflect logical relationships in the content. For example, moving through components in a table one row at a time or one column at a time both reflect the logical relationships in the content. Either order may satisfy this success criterion.

The way that sequential navigation order is determined in web content is defined by the technology of the content. For example, simple HTML defines sequential navigation via the notion of tabbing order. Dynamic HTML may modify the navigation sequence using scripting along with the addition of a tabindex attribute to allow focus to additional elements. If no scripting or tabindex attributes are used, the navigation order is the order that components appear in the content stream. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.4 (A) - [Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)

The intent of this success criterion is to help users understand the purpose of each link so they can decide whether they want to follow the link. Whenever possible, provide link text that identifies the purpose of the link without needing additional context. Assistive technology has the ability to provide users with a list of links that are on the web page. Link text that is as meaningful as possible will aid users who want to choose from this list of links. Meaningful link text also helps those who wish to tab from link to link. Meaningful links help users choose which links to follow without requiring complicated strategies to understand the page. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.5 (AA) - [Multiple Ways](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html)

More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process. The intent of this success criterion is to make it possible for users to locate content in a manner that best meets their needs. Users may find one technique easier or more comprehensible to use than another.

Even small sites should provide users some means of orientation. For a three or four page site, with all pages linked from the home page, it may be sufficient simply to provide links from and to the home page where the links on the home page can also serve as a site map. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.6 (AA) - [Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)

The intent of this success criterion is to help users understand what information is contained in web pages and how that information is organized. When headings are clear and descriptive, users can find the information they seek more easily, and they can understand the relationships between different parts of the content more easily. Descriptive labels help users identify specific components within the content.

Labels and headings do not need to be lengthy. A word, or even a single character, may suffice if it provides an appropriate cue to finding and navigating content. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.7 (AA) - [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.8 (AAA) - [Location](https://www.w3.org/WAI/WCAG22/Understanding/location.html)

Information about the user's location within a set of web pages is available. The intent of this success criterion is to provide a way for the user to orient herself within a set of web pages, a website, or a web application and find related information. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.9 (AAA) - [Link Purpose (Link Only)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html)

The intent of this success criterion is to help users understand the purpose of each link in the content, so they can decide whether they want to follow it. Best practice is that links with the same destination would have the same descriptions, but links with different purposes and destinations would have different descriptions (see also Success Criterion 3.2.4 which calls for consistency in identifying components that have the same functionality). Because the purpose of a link can be identified from its link text, links can be understood when they are out of context, such as when the user agent provides a list of all the links on a page. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.10 (AAA) - [Section Headings](https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html)

The intent of this success criterion is to provide headings for sections of a Web page, when the page is organized into sections. For instance, long documents are often divided into a variety of chapters, chapters have subtopics, etc. When such sections exist, they need to have headings that introduce them. This clearly indicates the organization of the content, facilitates navigation within the content, and provides mental "handles" that aid in comprehension of the content. Other page elements may complement headings to improve presentation (e.g., horizontal rules and boxes), but visual presentation is not sufficient to identify document sections. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.11 (AA) - [Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)

The intent of this success criterion is to ensure that the item receiving keyboard focus is always partially visible in the user's viewport. For sighted people who rely on a keyboard (or on a device that operates through the keyboard interface, such as a switch or voice input), knowing the current point of focus is critical. The component with focus signals the interaction point on the page. Where users cannot see the item with focus, they may not know how to proceed, or may even think the system has become unresponsive.

In recognition of the complex responsive designs common today, this AA criterion allows for the component receiving focus to be partially obscured by other author-created content. A partly obscured component can still be very visible, although the more of it that is obscured, the less easy it is to see. For that reason, authors should attempt to design interactions to reduce the degree and frequency with which the item receiving focus is partly obscured. For best visibility, none of the component receiving focus should be obscured. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.12 (AAA) - [Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)

The intent of this success criterion is to ensure that the item receiving keyboard focus is always visible in the user's viewport. For sighted people who rely on a keyboard (or on a device that operates through the keyboard interface, such as a switch or voice input), knowing the current point of focus is critical. The component with focus signals the interaction point on the page. Where users cannot see the item with focus, they may not know how to proceed, or may even think the system has become unresponsive.

Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs. As a user tabs through the page, these layers of content can hide the item receiving focus, along with its focus indicator. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.4.13 (AAA) - [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

When the keyboard focus indicator is visible, an area of the focus indicator meets all the following:
+ is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component or sub-component, and
+ has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states.

The purpose of this success criterion is to ensure a keyboard focus indicator is clearly visible and discernible. Focus Appearance is closely related to 2.4.7 Focus Visible and 1.4.11 Non-text Contrast. Focus Visible requires that a visible focus indicator exists while a component has keyboard focus; Focus Appearance defines a minimum level of visibility. Where Non-text Contrast requires a component to have adequate contrast against the background in each of its states, Focus Appearance requires sufficient contrast for the focus indicator itself. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Users can use different input modalities beyond keyboard
Make it easier for users to operate functionality through various inputs beyond keyboard.

#### 2.5.1 (A) - [Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)

All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential.

The intent of this success criterion is to ensure that content can be controlled with a range of pointing devices, abilities, and assistive technologies. Some people cannot perform gestures in a precise manner, or they may use a specialized or adapted input device such as a head pointer, eye-gaze system, or speech-controlled mouse emulator. Some pointing methods lack the capability or accuracy to perform multipoint or path-based gestures. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.2 (A) - [Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)

The intent of this success criterion is to make it easier for users to prevent accidental or erroneous pointer input. People with various disabilities can inadvertently initiate touch or mouse events with unwanted results. Each of the following subsections roughly aligns with the bullets of this Success Criterion, and outlines a means of allowing users to cancel pointer operations. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.3 (A) - [Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)

The intent of this success criterion is to ensure that the words which visually label a component are also the words associated with the component programmatically. This helps ensure that people with disabilities can rely on visible labels as a means to interact with the components.

Most controls are accompanied by a visible text label. Those same controls have a programmatic name, also known as the accessible name. Users typically have a much better experience if the words and characters in the visible label of a control match or are contained within the accessible name. When these match, speech-input users (i.e., users of speech recognition applications) can navigate by speaking the visible text labels of components, such as menus, links, and buttons, that appear on the screen. Sighted users who use text-to-speech (e.g., screen readers) will also have a better experience if the text they hear matches the text they see on the screen.

Note that where a visible text label does not exist for a component, this success criterion does not apply to that component. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.4 (A) - [Motion Actuation](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html)

The intent of this success criterion is to ensure that functions triggered by moving a device (for example, shaking or tilting) or by gesturing towards the device (so that sensors like a camera can pick up and interpret the gesturing), can also be operated by more conventional user interface components.

Devices often have sensors that can act as inputs, such as accelerometer and gyroscope sensors on a phone or tablet device. These sensors can allow the user to control something by simply changing the orientation or moving the device in particular ways. In other situations, web content can interpret user gestures via the camera or other sensors to actuate functions. For example, shaking the device might issue an "Undo" command, or a gentle hand wave might be used to move forward or backward in a sequence of pages. Some users with disabilities are not able to operate these device sensors (either not at all, or not precisely enough) because the device is on a fixed mount (perhaps a wheelchair) or due to motor impairments. Therefore, functionality offered through motion must also be available by another mechanism. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.5 (AAA) - [Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

The size of the target for pointer inputs is at least 44 by 44 CSS pixels except when:
+ Equivalent - The target is available through an equivalent link or control on the same page that is at least 44 by 44 CSS pixels;
+ Inline - The target is in a sentence or block of text;
+ User Agent Control - The size of the target is determined by the user agent and is not modified by the author;
+ Essential - A particular presentation of the target is essential to the information being conveyed.

The intent of this success criterion is to help users who may have trouble activating a small target because of hand tremors, limited dexterity or other reasons. If the target is too small, it may be difficult to aim at the target. Mice and similar pointing devices can be hard to use for these users, and a larger target will help them greatly in having positive outcomes on the web page. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.6 (AAA) - [Concurrent Input Mechanisms](https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html)

The intent of this success criterion is to ensure that people can use and switch between different modes of input when interacting with web content. Users may employ a variety of input mechanisms when interacting with web content. These may be a combination of mechanisms such as a keyboard or keyboard-like interfaces and pointer devices like a mouse, stylus or touchscreen. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.7 (AA) - [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

The intent of this success criterion is to ensure functionality that uses a dragging movement has another single pointer mode of operation without the need for the dexterity required to drag elements.

Some people cannot perform dragging movements in a precise manner. Others use a specialized or adapted input device, such as a trackball, head pointer, eye-gaze system, or speech-controlled mouse emulator, which may make dragging cumbersome and error-prone.

When an interface implements functionality that uses dragging movements, users perform four discrete actions:
+ tap or click to establish a starting point, then
+ press and hold that contact while...
+ performing a repositioning of the pointer, before...
+ releasing the pointer at the end point.

Not all users can accurately press and hold that contact while also repositioning the pointer. An alternative method must be provided so that users with mobility impairments who use a pointer (mouse, pen, or touch contact) can use the functionality.

This requirement is separate from keyboard accessibility because people using a touch screen device may not use a physical keyboard. Keyboard specific interactions such as tabbing or arrow keys may not be possible when encountering a drag and drop control. Note, however, that providing a text input can be an acceptable single-pointer alternative to dragging. For example, an input beside a slider could allow any user to enter a precise value for the slider. In such a situation, the on-screen keyboard that appears for touch users offers a single-pointer means of entering an alphanumeric value. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 2.5.8 (AA) - [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

The intent of this success criterion is to help ensure targets can be easily activated without accidentally activating an adjacent target. Users with dexterity limitations and those who have difficulty with fine motor movement find it difficult to accurately activate small targets when there are other targets that are too close. Providing sufficient size, or sufficient spacing between targets, will reduce the likelihood of accidentally activating the wrong control. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

## Understandable information and user interface
**Requirement:** Information and the operation of the user interface must be understandable.

Application to `<canvas>` elements:
+ `<canvas>` elements are capable of displaying copy in any text font (and thus language) loaded into the web page.
+ It is entirely possible for developers to create complex applications in a canvas display - for instance a control panel, or spreadsheet. It is their responsibility to include instructions on how to navigate and use such applications.
+ Interacting with `<canvas>` element controls is entirely the responsibility of the developer. This includes making the controls responsive to touch/mouse interactions (including drag-and-drop).
+ Any text included in a canvas display is nothing more than pixels; the words are not accessible to any commonly used browser-based technology. It is up to developers to expose canvas-embedded text to the page DOM in a way that both doesn't overwhelm the end-user with unnecessary or repeated content, and also makes sense to the end-user.
+ `<canvas>` elements will scale/zoom like other elements, though the canvas display may degrade at larger zoom levels; making sure the display remains legible at high zooms is the developer's responsibility.
+ Because `<canvas>` elements present their display "as-is", it is up to the developer to make sure the canvas display can accommodate user preferences eg: `prefers-contrast`, `prefers-color-scheme`, etc.

### Text is readable and understandable
Make text content readable and understandable.

#### 3.1.1 (A) - [Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html)

The intent of this success criterion is to ensure that content developers provide information in the web page that user agents need to present text and other linguistic content correctly. Both assistive technologies and conventional user agents can render text more accurately when the language of the web page is identified. Screen readers can load the correct pronunciation rules. Visual browsers can display characters and scripts correctly. Media players can show captions correctly. As a result, users with disabilities will be better able to understand the content. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.1.2 (AA) - [Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)

The intent of this success criterion is to ensure that user agents can correctly present phrases, passages, and in some cases words written in multiple languages. This makes it possible for user agents and assistive technologies to present content according to the presentation and pronunciation rules for that language. This applies to graphical browsers as well as screen readers, braille displays, and other voice browsers. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.1.3 (AAA) - [Unusual Words](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html)

Certain disabilities make it difficult to understand nonliteral word usage and specialized words or usage. Certain disabilities make it difficult to understand figurative language or specialized usage. Providing such mechanisms is vital for these audiences. Specialized information intended for non-specialist readers is encouraged to satisfy this Success Criterion, even when claiming only Single-A or Double-A conformance. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.1.4 (AAA) - [Abbreviations](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html)

The intent of this success criterion is to ensure that users can access the expanded form of abbreviations. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.1.5 (AAA) - [Reading Level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html)

When text requires reading ability more advanced than the lower secondary education level after removal of proper names and titles, supplemental content, or a version that does not require reading ability more advanced than the lower secondary education level, is available.

Difficult or complex text may be appropriate for most members of the intended audience (that is, most of the people for whom the content has been created). But there are people with disabilities, including reading disabilities, even among highly educated users with specialized knowledge of the subject matter. It may be possible to accommodate these users by making the text more readable. If the text cannot be made more readable, then supplemental content is needed. Supplemental content is required when text demands reading ability more advanced than the lower secondary education level—that is, more than nine years of school. Such text presents severe obstacles to people with reading disabilities and is considered difficult even for people without disabilities who have completed upper secondary education. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.1.6 (AAA) - [Pronunciation](https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html)

The intent of this success criterion is to help people who are blind, people who have low vision, and people with reading disabilities to understand content in cases where meaning depends on pronunciation. Often words or characters have different meanings, each with its own pronunciation. The meaning of such words or characters can usually be determined from the context of the sentence. However, for more complex or ambiguous sentences, or for some languages, the meaning of the word cannot be easily determined or determined at all without knowing the pronunciation. When the sentence is read aloud and the screen reader reads the word using the wrong pronunciation, it can be even more difficult to understand than when read visually. When words are ambiguous or indeterminate unless the pronunciation is known, then providing some means of determining the pronunciation is needed. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Content appears and operates in predictable ways
Make web pages appear and operate in predictable ways.

#### 3.2.1 (A) - [On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)

The intent of this success criterion is to ensure that functionality is predictable as visitors navigate their way through a document. Any component that is able to trigger an event when it receives focus must not change the context. Examples of changing context when a component receives focus include, but are not limited to:
+ forms submitted automatically when a component receives focus;
+ new windows launched when a component receives focus;
+ focus is changed to another component when that component receives focus.  (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.2.2 (A) - [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)

The intent of this success criterion is to ensure that entering data or selecting a form control has predictable effects. Changing the setting of any user interface component is changing some aspect in the control that will persist when the user is no longer interacting with it. So checking a checkbox, entering text into a text field, or changing the selected option in a list control changes its setting, but activating a link or a button does not. Changes in context can confuse users who do not easily perceive the change or are easily distracted by changes. Changes of context are appropriate only when it is clear that such a change will happen in response to the user's action. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.2.3 (AA) - [Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)

The intent of this success criterion is to encourage the use of consistent presentation and layout for users who interact with repeated content within a set of web pages and need to locate specific information or functionality more than once. Individuals with low vision who use screen magnification to display a small portion of the screen at a time often use visual cues and page boundaries to quickly locate repeated content. Presenting repeated content in the same order is also important for visual users who use spatial memory or visual cues within the design to locate repeated content.

It is important to note that the use of the phrase "same order" in this section is not meant to imply that subnavigation menus cannot be used or that blocks of secondary navigation or page structure cannot be used. Instead, this success criterion is intended to assist users who interact with repeated content across web pages to be able to predict the location of the content they are looking for and find it more quickly when they encounter it again. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.2.4 (AA) - [Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html)

The intent of this success criterion is to ensure consistent identification of functional components that appear repeatedly within a set of web pages. A strategy that people who use screen readers use when operating a website is to rely heavily on their familiarity with functions that may appear on different web pages. If identical functions have different labels (or, more generally, a different accessible name) on different web pages, the site will be considerably more difficult to use. It may also be confusing and increase the cognitive load for people with cognitive limitations. Therefore, consistent labeling will help.

This consistency extends to the text alternatives. If icons or other non-text items have the same functionality, then their text alternatives should be consistent as well. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.2.5 (AAA) - [Change on Request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html)

The intent of this success criterion is to encourage design of web content that gives users full control of changes of context. This success criterion aims to eliminate potential confusion that may be caused by unexpected changes of context such as automatic launching of new windows, automatic submission of forms after selecting an item from a list, etcetera. Such unexpected changes of context may cause difficulties for people with motor impairments, people with low vision, people who are blind, and people with certain cognitive limitations. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.2.6 (A) - [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html)

The intent of this success criterion is to ensure users can find help for completing tasks on a website, when it is available. When the placement of the help mechanism is kept consistent across a set of pages, users looking for help will find it easier to identify. This is distinct from interface-level help, such as contextual help, features like spell checkers, and instructional text in a form. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

### Users are helped to avoid and correct mistakes
Help users avoid and correct mistakes.

#### 3.3.1 (A) - [Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)

The intent of this success criterion is to ensure that users are aware that an error has occurred and can determine what is wrong. In the case of an unsuccessful form submission, it is not sufficient to only re-display the form without providing any hint that the submission failed. The error must be indicated in text. (14 Apr 2025) 

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.2 (A) - [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)

The intent of this success criterion is to have content authors present instructions or labels that identify the controls in a form so that users know what input data is expected. In the case of radio buttons, checkboxes, comboboxes, or similar controls that provide users with options, each option must have an appropriate label so that users know what they are actually selecting. Instructions or labels may also specify data formats for data entry fields, especially if they are out of the customary formats or if there are specific rules for correct input. Content authors may also choose to make such instructions available to users only when the individual control has focus especially when instructions are long and verbose. (14 Apr 2025) 

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.3 (AA) - [Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)

The intent of this success criterion is to ensure that users receive appropriate suggestions for correction of an input error if it is possible. The definition of "input error" says that it is "information provided by the user that is not accepted" by the system. Some examples of information that is not accepted include information that is required but omitted by the user and information that is provided by the user but that falls outside the required data format or allowed values. (14 Apr 2025) 

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.4 (AA) - [Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)

The intent of this success criterion is to help users with disabilities avoid serious consequences as the result of a mistake when performing an action that cannot be reversed. For example, purchasing non-refundable airline tickets or submitting an order to purchase stock in a brokerage account are financial transactions with serious consequences. If users have made a mistake on the date of air travel, they could end up with a ticket for the wrong day that cannot be exchanged. If users made a mistake on the number of stock shares to be purchased, they could end up purchasing more stock than intended. Both of these types of mistakes involve transactions that take place immediately and cannot be altered afterwards, and can be very costly. Likewise, it may be an unrecoverable error if users unintentionally modify or delete data stored in a database that they later need to access, such as their entire travel profile in a travel services website. When referring to modification or deletion of 'user controllable' data, the intent is to prevent mass loss of data such as deleting a file or record. It is not the intent to require a confirmation for each save command or the simple creation or editing of documents, records or other data. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.5 (AAA) - [Help](https://www.w3.org/WAI/WCAG22/Understanding/help.html)

The intent of this success criterion is to help users avoid making mistakes. Some users with disabilities may be more likely to make mistakes than users without disabilities. Using context-sensitive help, users find out how to perform an operation without losing track of what they are doing.

Context-sensitive help only needs to be provided when the label is not sufficient to describe all functionality. The existence of context-sensitive help should be obvious to the user and they should be able to obtain it whenever they require it. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.6 (AAA) - [Error Prevention (All)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html)

The intent of this success criterion is to help users with disabilities avoid consequences that may result from making a mistake when submitting form data. This criterion builds on Success Criterion 3.3.4 in that it applies to all forms that require users to submit information. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.7 (A) - [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)

The intent of this success criterion is to ensure that users can successfully complete multi-step processes. It reduces cognitive effort where information is asked for more than once during a process. It also reduces the need to recall information provided in a previous step. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.8 (AA) - [Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)

The purpose of this success criterion is to ensure there is an accessible, easy-to-use, and secure method for users to authenticate when logging into an existing account. As the most prevalent form of authentication, websites commonly rely on usernames and passwords to log in. However, memorizing a username and password places a very high or impossible burden upon people with certain cognitive disabilities, as do additional steps often added to authentication processes. For instance, the need to transcribe a one-time verification code or requiring a puzzle to be solved. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 3.3.9 (AAA) - [Accessible Authentication (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html)

The purpose of this success criterion is to ensure there is an accessible, easy-to-use, and secure method to log in, access content, and undertake tasks. This criterion is the same as Accessible Authentication (Minimum) but without the exceptions for objects and user-provided content.

Any required step of the authentication process:
+ cannot display a selection of images, videos, or audio clips, where users must choose which image they provided;
+ cannot display a selection of images, where users must choose the images which contain a specific object, such as a car. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

## Robust content and reliable interpretation
**Requirement:** Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.

Application to `<canvas>` elements:
+ Nothing in particular beyond making sure the `<canvas>` element includes appropriate ARIA and `role=` markup.
+ `<canvas>` elements can include content between their opening and closing tags - this content will be displayed in javascript-disabled environments (good for progressive enhancement) and will be accessed by (most) modern screen readers.
+ Testing web pages that include `<canvas>` elements against a range of different assistive technologies (eg: screen readers) is essential!

### Content is compatible with current and future user tools
Maximize compatibility with current and future user agents, including assistive technologies.

#### *4.1.1 Parsing (Obsolete and removed)*
+ No longer applicable, thus no impact on `<canvas>` elements.

#### 4.1.2 (A) - [Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)

The intent of this success criterion is to ensure that Assistive Technologies (AT) can gather appropriate information about, activate (or set) and keep up to date on the status of user interface controls in the content.

When standard controls from accessible technologies are used, this process is straightforward. If the user interface elements are used according to specification the conditions of this provision will be met. (See examples of Success Criterion 4.1.2 below)

If custom controls are created, however, or interface elements are programmed (in code or script) to have a different role and/or function than usual, then additional measures need to be taken to ensure that the controls provide important and appropriate information to assistive technologies and allow themselves to be controlled by assistive technologies.

What roles and states are appropriate to convey to assistive technology will depend on what the control represents. Specifics about such information are defined by other specifications, such as WAI-ARIA, or the relevant platform standards. Another factor to consider is whether there is sufficient accessibility support with assistive technologies to convey the information as specified.

A particularly important state of a user interface control is whether or not it has focus. The focus state of a control can be programmatically determined, and notifications about change of focus are sent to user agents and assistive technology. Other examples of user interface control states are whether or not a checkbox or radio button has been selected, or whether a collapsible tree view or accordion is expanded or collapsed. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

#### 4.1.3 (AA) - [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

The intent of this success criterion is to make users aware of important changes in content that are not given focus, and to do so in a way that doesn't unnecessarily interrupt their work.

The intended beneficiaries are blind and low vision users of assistive technologies with screen reader capabilities. An additional benefit is that assistive technologies for users with cognitive disabilities may achieve an alternative means of indicating (or even delaying or supressing) status messages, as preferred by the user. (14 Apr 2025)

**Application to `<canvas>` elements:**
+ [TODO]

**Implications for Scrawl-canvas:**
+ [TODO]

## Stuff from the lessons page
The responsibility for [making web pages accessible](https://www.w3.org/WAI/fundamentals/accessibility-intro/) lies with the dev-user, working closely with the page designer and product manager. If the page design calls for the use of `<canvas>` elements, then SC can help deliver a more accessible solution for those canvases.

We can break down the accessibility issues that need to be addressed as follows:
+ Respect, and adapt to, [user preference media features](https://www.smashingmagazine.com/2023/08/css-accessibility-inclusion-user-choice/)
  - prefers-contrast
  - prefers-reduced-motion
  - prefers-color-scheme
  - prefers-reduced-transparency
  - prefers-reduced-data
  - forced-colors (not yet handled by SC)
  - inverted-colors (not yet handled by SC)
+ Include readable markup and details about the canvas scene - `role`, `aria-label`, `aria-description`, etc
+ Add clearly visible accessible (tab-able) controls to start/stop stack and canvas display animations
+ Include controls in canvas displays for accessible (tab-able) navigation links and other user interactions with the canvas
+ Expose canvas-based graphical text to the DOM - in a sensible and meaningful way - that doesn't annoy the end-users who have to consume that information
+ Allow less common patterns for user interactions with graphical links (as far as possible) such as right-clicking on them or dragging them to the browser address bar to open the new page

