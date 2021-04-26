## What's New in Version 2.8.0?

In addition to some small security updates, this update brings improvements to note space rendering, more intelligent handling of whole rests, and a handful of additional simple meter time signatures!

### New Simple Meter Time Signatures

Three new simple meter time signatures have been introduced in this version: 5/4, 6/4, and 7/4 time, allowing generated rhythms with 5, 6, and 7 beats per measure respectively. A new Common Time (C) time signature is also available. This behaves the same as the 4/4 time signature.

### Improved Whole Rest Handling

The behavior of the whole rest has changed a bit in this new version. The whole rest will now be an available note selection for all time signatures. The whole rest will also always fill an entire measure, meaning its duration is dependent on the time signature. For example, in 4/4 time, the whole rest is 4 beats long, but in 7/4 time, it is 7 beats long.

### Improved Note Spacing

The note formatting settings have been tweaked a bit so that longer notes don't receive quite as much space in comparison to shorter notes. This will avoid some of the crowding that occurred with beamed notes in measures that also had half notes or larger in them.

### New Issues and Milestones Section on GitHub

The Rhythm Randomizer is an open-source project, meaning it's code is available publicly on [GitHub](https://github.com/bobderrico80/rhythm-randomizer-v2). GitHub also offers tools for tracking current and upcoming work. Moving forward, all planned upcoming work and features will be documented as GitHub Issues and organized into GitHub Milestones. This will provide an easy way to see upcoming features to be added to The Rhythm Randomizer. If you have a GitHub account, you can even create issues to report bugs or suggest features. And since The Rhythm Randomizer is open-source, if you are tech savvy and know how to write code in React and Typescript, you could even get involved with adding features or fixing bugs on your own!

To see a list of upcoming versions of The Rhythm Randomizer, and the features to be included in each version, see the Github [Milestones](https://github.com/bobderrico80/rhythm-randomizer-v2/milestones) page.

## What's New in Version 2.7.0?

Complex compound meter options!

After much delay, part 2 of compound meter has arrived! Included with the compound meter note selections is a new category called 'Compound Complex Combinations.' These note selections behave a little bit differently than other note selections in that selecting one will cause a number of different patterns to potentially generate in the rhythm. These special kind of selections are denoted with an ellipsis (`...`) in the icon. The icons represent the types of rhythms patterns one can expect to see when using this selection.

Care was taken to ensure that complex patterns do not also duplicate other note selections. For example, selecting the 8th note/rest combination will not cause a simple three-8th-note pattern to generate, as this is already covered by a separate note group. To use these note selections effectively, it is best to layer several on top of each other (or if you want a real challenge, select only the 8th note/rest and 16th note/rest one!).

## What's New in Version 2.6.0?

German language support!

Thank you very much to Rhythm Randomizer users Sebastian Dorok and Michael Fromm for providing the German language translations!

The app should automatically detect the correct language to use based on locale. Alternatively, the language can be switched by selecting the 'German' link at the bottom of the main menu panel.

If you would like to help translate The Rhythm Randomizer into another language, please reach out on the [Facebook Page](https://www.facebook.com/TheRhythmRandomizer/) to find out how you can help!

## What's New in Version 2.5.0?

In addition to some small security updates, this version lays the groundwork to support multiple languages in The Rhythm Randomizer! In the footer of the main menu, you'll now see a language indicator. As support for alternate languages is added, those languages will appear as links in the footer, allowing you to easily switch between languages. In addition, your default language will be automatically detected, and the display will update to that language, if supported.

If you are using The Rhythm Randomizer and would like to contribute translations for another language, please reach out on the [Facebook Page](https://www.facebook.com/TheRhythmRandomizer/) to find out how you can help!

## What's New in Version 2.4.1?

- Accessibility improvements
- Security updates

## What's New in Version 2.4.0?

Metronome functionality! Two configurable metronome modes are now available on The Rhythm Randomizer:

### Playback Metronome

The Playback Settings area of the Settings Menu now includes a Metronome Settings area. Checking in 'Play metronome during playback' will cause a metronome to play during the rhythm playback. There are additional settings here for controlling the metronome, including settings to play a special click at the start of the measure and/or subdivisions, and an optional 1- or 2-measure count-off click before playback.

These new metronome settings are included in Share Links, allowing users to post links that include playback with the metronome on or off, etc.

### Standalone Metronome

The header navigation area now contains a 'Start/Stop Metronome' button. Clicking this button will start (or stop) a continuous metronome, which will respect the current tempo, time signature, and metronome settings. This mode is useful for reading and practicing the rhythm prior to playback, or for just using as a general-purpose metronome!

## What's New in Version 2.3.0?

Compound time signatures! At long last, 6/8, 9/8, and 12/8 time signatures have arrived! These are available in the 'Time Signature Settings' section of the score settings menu. When switching over to the new compound time signatures, the available notes under 'Note Selection' will feature a new set of note combinations suitable for compound time signatures. Like the simple time signatures, rhythms generated for compound time signatures will play back as expected. Compound time signatures are also included in the 'Share Settings' link as well.

With this release, there are a limited number of possible note combinations for compound time signatures. More will be made available (patterns with 8th rests and 16th notes, for example) in future releases.

In addition to compound time signature, this release also includes a security patch as well.

## What's New in Version 2.2.3?

Security updates.

## What's New in Version 2.2.2?

Fixes issue where sharing settings with a non-three-digit value for the tempo did not work.

## What's New in Version 2.2.1?

Fixes issue where playback would freeze when attempting to playback a previously-generated rhythm prior to version 2.2.0.

## What's New in Version 2.2.0?

Playback functionality! This oft-requested feature is finally available! Click the 'Play' button in the header navigation area to start playback. Note heads and rests will highlight along with the playback.

The settings menu now contains a new section for adjusting playback settings including both the tempo and the pitch of the playback tone.

The 'Share Settings' button also shares the current pitch and tempo settings allowing easy sharing and saving of the playback settings in addition to other settings.

## What's New in Version 2.1.2?

- Fixed broken time signature icons

## What's New in Version 2.1.1?

- Security updates

## What's New in Version 2.1.0?

### 'Share Settings' functionality

This update adds a 'Share Settings' button to the settings menu. Clicking this button will copy a share link to the clipboard. This share link is encoded with all of the current score settings, allowing you to easily share the current score configuration with another user.

This feature is useful for sharing specific configurations with different groups of people. For example, a teacher might want to post a link to similar rhythms for younger students, and more complicated rhythms for older students.

Another useful way to use this feature is to bookmark share links. This allows users to quickly get back to a specific configuration.

### Other updates

- Improved keyboard accessibility

## What's New in Version 2.0.3?

- Fixed issue of the app not loading on older versions of Safari (below version 14)
- Ensured that when an error occurs, users are not presented with a blank screen, but with an error message containing a link to the Facebook page.

## What's New in Version 2.0.2?

- Increased maximum width of score, which inherently increases the size of the notation and more closely mimics the look of the version 1 site.
- Increased the size of the header buttons on mobile

## What's New in Version 2.0.1?

- Fixed bug where main menu could be scrolled into view on mobile devices
- Added Google Analytics tracking script
- Setup a link to the "old" Rhythm Randomizer: [http://v1.rhythmrandomizer.com](http://v1.rhythmrandomizer.com)

## What's New in Version 2.0.0?

Welcome to Rhythm Randomizer version 2! This version is a complete rebuild of the original version that was created in 2014, and hasn't been updated since. This new version is more stable, easier to maintain, and easier to update and add new features. There are many exciting features planned for version 2. Be sure to check the main menu for news about updates and new features, or even better, follow my [Facebook Page](https://fb.me/TheRhythmRandomizer)!

Here are some of the new things introduced with this version:

### New user interface

All configuration options are now located in the left slide-out pane, which can be accessed by clicking or tapping the gear icon on the left. A main menu slide-out is available on the right, and for now will feature release notes, contact information, and version information.

A toolbar now exists in the header, and currently just has a button to generate a new rhythm, but keep an eye on this area of the app, as new features will be added here in the future!

The main score area is now less cluttered, with the options hidden away in the slide-out.

### New note rendering engine

The Rhythm Randomizer now uses [VexFlow](https://www.vexflow.com/) for rendering music notation. This improved note rendering API will make it much easier to add other score elements aside from basic notation to generated rhythms.

### Syncopated note combinations

Three new note selections have been added for 8th-quarter-8th syncopated rhythms.

### Persistent options

Selected options will now be persisted locally. This means that if you close the browser tab or refresh the page, the options (selected notes, time signature, and measure count) will remain the same, rather than resetting to the default as before.

### New Facebook page

During the last six years, I've had several people attempt to reach out to me about feature requests and bug fixes. Since I created this project (and in all honesty, kinda forgot about it), the email address was outdated. Most people were able to track me down on Facebook. In the future, I want to make this process easier, so I've set up a dedicated [Facebook page](https://fb.me/TheRhythmRandomizer) for The Rhythm Randomizer. Follow the page to get news about updates and post feedback, feature requests, or bugs that you might find.

### Thank you!

Lastly, I want to say thank you to those who are still making use of this tool, and are finding it useful, whether on their own or in their classrooms. I built the original version of The Rhythm Randomizer in 2014 while I was still teaching music. I built it because I couldn't find a similar tool, and felt I had the technical knowledge to build it myself. This project helped me discover my love and passion for web development and software engineering, and helped launch a whole new career in that field.

While I had mostly forgotten about the project after I stopped teaching, I was always excited when someone would reach out with feature requests or bug reports, and was touched to know that others were finding this tool useful.

With the global pandemic sending many music teachers to have to adapt to virtual instruction, I felt that The Rhythm Randomizer would fit nicely into that commitment, and decided to dust it off again and clean it up. I have lots of ideas for new features that I'll be adding in the coming months. Please also continue to send me your feedback, and let me know how you are using The Rhythm Randomizer! Thank you!!

~ Bob
