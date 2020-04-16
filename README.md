# ChordBoard
ChordBoard is a virtual MIDI controller.  It is the calculator of music production.  With ChordBoard, you can harnass the power of music theory without having to memorize a bunch of crap.  Ideal for music composers and producers.  This program is currently only compatible on Macs.

any questions email pyreta@gmail.com

![cb2-demologic](https://user-images.githubusercontent.com/15112854/39724365-96f4762e-5216-11e8-8df6-d972ea15cbdf.gif)

## Table of Contents

- [Setup](#setup)
  * [Add a virtual MIDI device](#add-a-virtual-midi-device-on-your-mac)
  * [Configure Logic Environment](#configure-logic-environment) *only if you want to use a MIDI keyboard*
  * [Installing ChordBoard](#installing-chordboard)
- [Instruction Manual](#instruction-manual)
  * [Basic Usage](#basic-usage)
  * [Features](#features)
    * [Change Key](#key-change)
    * [Change Chord Quality](#chord-quality)
    * [Settings Dropdown](#settings-dropdown-menu)
    * [Connect ChordBoard to your DAW (Logic, GarageBand, etc..)](#select-midi-devices)
    * [Connect a MIDI Keyboard](#select-midi-devices)
    * [Next Chord Probability](#next-chord-probability)
    * [Add new scale rows](#toggle-scales)
    * [Invert Chords](#chord-inversions)
    * [Secondary Functional Chords](#secondary-functional-chords)
------------------------------------------------------------

# Setup
## Add a virtual MIDI device on your Mac
To your DAW, there is no difference between `ChordBard` and a regular MIDI keyboard. We need to create a 'virtual' MIDI device that `ChordBoard` can use to send the MIDI to your DAW.  This only needs to be done once.

1) Spotlight search 'midi' and choose `Audio MIDI Setup`

![screen shot 2018-05-04 at 8 39 16 am](https://user-images.githubusercontent.com/15112854/39628698-e2748450-4f77-11e8-995a-935cea453a67.png)

2) Choose `Show MIDI Studio` from `Window` menu

![screen shot 2018-05-04 at 8 40 00 am](https://user-images.githubusercontent.com/15112854/39628803-2c795292-4f78-11e8-9153-5443b5845951.png)

3) Double click the red box that says `IAC`

![screen shot 2018-05-04 at 8 40 20 am](https://user-images.githubusercontent.com/15112854/39628860-5b17da6a-4f78-11e8-8875-9b971880b106.png)

4) Check `Device is online` box, and add a bus named `ChordBoard`.  Make sure to name the port `ChordBoard` (case sensitive) so ChordBoard can automatically connect to this port.  Also ensure the device name is `IAC`.

![virtualmididevice](https://user-images.githubusercontent.com/15112854/39628958-9e280668-4f78-11e8-821a-b10130c76074.gif)

## Configure Logic Environment
In order to use the ChordBoard with a physical MIDI keyboard, we need to make sure Logic is ignoring all MIDI signal inputs other than the ChordBoard.  This way Logic won't receive messages from the MIDI controller, and the ChordBoard at the same time. We only want Logic to use the notes that the `ChordBoard` outputs.  This step is completely unecessary if you don't want to use a MIDI keyboard with ChordBoard.  
*If you are using something other than Logic, just make sure the track you are using for the ChordBoard is only receiving input from ChordBoard.*

1) Select `Open MIDI Environment` from the `Window` menu (or press `command` + `0`):

![screen shot 2018-05-04 at 8 32 21 am](https://user-images.githubusercontent.com/15112854/39630248-ccad7d70-4f7c-11e8-96df-8158647f6ae8.png)

2) Select `Click & Ports` from the `Layer` dropdown in the top left corner of the window

![clickandports](https://user-images.githubusercontent.com/15112854/39630414-3b7a87fc-4f7d-11e8-92cf-660b2e409546.gif)

3) Disconnect the `sum` bus from the current setup by dragging the end of the connection back to the beginning of the connection (where the word 'sum' is).  Now drag a new connection from `ChordBoard` (or whatever you named your virtual port before) to the same place you removed that first connection from.

![logicenvironment](https://user-images.githubusercontent.com/15112854/39630598-c6ecce26-4f7d-11e8-8738-e1d3ae638931.gif)

## Installing ChordBoard
1) Download the `dmg` file and drag icon into your `Applications` folder
2) If you can't open the program because Apple doesn't recognize the developer, do use right click > open, instead of double clicking.

# Instruction Manual

## Basic Usage

The **ChordBoard** works as as a 2 dimensional matrix of squares representing various chords.  When clicking a chord, MIDI signals are sent to your DAW (nicely voiced), and could be recorded just like a physical MIDI keyboard can.  In fact, your DAW makes no distinction between ChordBoard and a generic MIDI keyboard.

Each row contains the 7 chords created by the given scale in the [selected key](#key-change).  Multiple rows can be dynamically stacked upon one another allowing [borrowed chords](https://en.wikipedia.org/wiki/Borrowed_chord) from other scales.

In addition to clicking each box, or pressing numbers 1-7 on your keypad, chords can also be played using a MIDI controller.  ChordBoard maps the [selected scale](#select-scale-to-be-routed-to-midi-controller) row to all the white keys on your MIDI keyboard.  All white keys below octave 5 will trigger full chords, and all the white keys above will play single notes corresponding to the [key](#key-change) and [scale](#select-scale-to-be-routed-to-midi-controller) currently set in ChordBoard.  This allows for the ability to play in any key and scale seemlessly, even if you don't play the piano.  This is one of the more powerful features of ChordBoard.

## Features

### Key Change
Change the key by selecting from the key menu, or navigating with the left and right arrow keys.
![cb2-keychange](https://user-images.githubusercontent.com/15112854/39736692-3be4dfb0-524f-11e8-90f8-af3c7fb3d269.gif)

## Chord Quality
Chord quality can be adjusted by clicking the chord quality buttons. Aside from using these buttons, the keys `z`, `x`, `c`, `v` and `b` are mapped to those buttons respectively.  This means all the chords will have a `seventh` quality while holding down the `v` key and then revert back to basic triads when the key is released.

![cb2-quality](https://user-images.githubusercontent.com/15112854/39755341-7c3004de-5293-11e8-938f-fb95a6a14465.gif)

### Settings Dropdown Menu
Access options and settings through dropdown menu by clicking on blue gear icon in the top left.

![cb2-dropdown](https://user-images.githubusercontent.com/15112854/39736576-af6d7d76-524e-11e8-9a79-8cbe3b25ba46.gif)
#### Dropdown Options:
- **Bypass Chord Board** - When this option is selected, all ChordBoard settings will be ignored by your MIDI keyboard.  All notes will be routed to your DAW unchanged.
- **[Roman Numeral Notation](#toggle-roman-numeral-chord-notation)** - When selected, all chords will display their relative Roman Numeral notation. When this is off, only the chord name will be shown.
- **[Show next chord probability](#next-chord-probability)** - This option displays a blue bar inside each chord, indicating the likelihood that it will work as the next chord, based on the last chord clicked.  Due to time and performance constraints, this option only works when chords are clicked with a mouse.
- **Add root bass note** - When this option is selected, and auto voicing is on, a root bass note will be added to the chord voicing, ignoring the inversion calculated by ChordBoard.
- **Add inverted bass note** - When this option is selected, and auto voicing is on, an inverted bass note will be added to the chord voicing, following the inversion calculated by ChordBoard.
- **Auto voicing** - This option voices all chords to one common chord, or to the previous chord when `Voice previous chord` is also selected
- **[Show scales](toggle-scales)** - Selecting this option reveals the scales which could then be added or removed from the displayed scale rows
- **[Output To DAW dropdown](#select-midi-devices)** - Connect to your DAW
- **[Input from keyboard](#select-midi-devices)** - Connect a MIDI keyboard

### Toggle Roman Numeral Chord Notation
Chords can be displayed showing their relative roman numeral notation n addition to the actual chord name by selecting `Roman Numeral Notation` from the [dropdown menu](#settings-dropdown-menu)

![cb2-roman](https://user-images.githubusercontent.com/15112854/39755205-ed139b94-5292-11e8-9c16-33466057b51e.gif)

### Select MIDI Devices
#### Output to DAW
To connect ChordBoard to your [virtual MIDI device](#add-a-virtual-midi-device-on-your-mac), select your virtual device from the `Output to DAW` dropdown in the [settings menu](#settings-dropdown-menu).  Make sure ChordBoard was started after this device has been created, otherwise it won't show up in the options.

#### Input from MIDI Keyboard
To connect a MIDI keyboard to ChordBoard, select it from the `Input from keyboard` dropdown in the [settings menu](#settings-dropdown-menu).  Make sure ChordBoard was started after this device has been connected, otherwise it won't show up in the options.

![cbmididevices](https://user-images.githubusercontent.com/15112854/39556024-4aaa701c-4e4b-11e8-8c23-4bf8771c41eb.gif)

### Select Scale to be routed to MIDI Controller
Select the scale to be routed to your keypad, and MIDI controller, if [one is connected](#select-midi-devices), by clicking on the scale name, or navigating with the up and down arrows.

![cb2-rowselect](https://user-images.githubusercontent.com/15112854/39737169-ba133ff6-5251-11e8-8efe-535e8f0a460f.gif)

### Toggle Scales
From the [options dropdown](#settings-dropdown-menu), select `Show scales` to reveal all scales.  Then click each scale to add or remove from the scale rows.

![cbscaleselect](https://user-images.githubusercontent.com/15112854/39556089-c2791d5a-4e4b-11e8-935b-c6c51e084a58.gif)

### Next Chord Probability
The blue bar that appears over certain chords represents the probability that this chord will nicely follow the chord last clicked.  The higher the bar, the more frequently the chord has followed the last chord played (in popular music).  This option could be toggled on and off by clicking `Show next chord probability` from the [options dropdown](#settings-dropdown-menu).

![cb2-demo](https://user-images.githubusercontent.com/15112854/39724044-a0dd21aa-5215-11e8-9d27-55884626000e.gif)

### Chord Inversions
The keys `q`, `w`, `e`, and `r` trigger *root position*, *first inversion*, *second inversion*, and *third inversion* (if applicable) of all chords.

![cbinversions](https://user-images.githubusercontent.com/15112854/39555986-14a1d370-4e4b-11e8-80a1-7dcf983b3aed.gif)

## Secondary Functional Chords

The keys `s`, `d`, and `f` trigger *relative IV*, *relative V*, and *relative vii°* of all chords.

![cbsecondary](https://user-images.githubusercontent.com/15112854/39556101-d53f6778-4e4b-11e8-94b1-35370ef6b59b.gif)
