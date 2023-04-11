# Xena - Draw Your Music

Xena is an interactive web application that allows you to create visual art and transform it into music. It is a freeform musical graphic notation inspired from Iannis Xenakis' UPIC

Visit the project at: [xena.spolialab.com](http://xena.spolialab.com)

## How It Works

Xena uses the HTML5 Canvas API to provide a drawing interface for users to create their artwork. As the user draws on the canvas, each point of the line is associated with a specific frequency based on its vertical position. The higher the position, the higher the frequency.

Tone.js, a powerful Web Audio framework, is utilized to generate and control the sounds corresponding to the drawn lines. The application provides a play button, which starts the "playhead" that scans through the canvas from left to right. As the playhead encounters a drawn line, it triggers the associated sound, creating a unique musical experience based on the user's artwork.

The application also features:

- An interactive color change of the lines being played, based on their position
- Reference lines for musical notes and timing signatures, which can be toggled on or off
- Instructions for first-time users, which can be hidden permanently

## Getting Started

To start creating your visual symphony, visit [xena.spolialab.com](http://xena.spolialab.com), draw on the canvas, and hit the play button to hear your drawings come to life.

## Credits

Xena was developed by Garrett Vercoe @ Spolia Lab.
