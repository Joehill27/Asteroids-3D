# Asteroids-3D
Computer graphics class project utilizing Three.js and WebGL to create a 3D asteroids game inspired by the retro game Asteroids made by Atari in 1979.

Asteroids 3D Game Project Proposal
Goal
To demonstrate the use of Three.js, WebGL, cannon.js, raytracing, realistic collision detection , realistic lighting,and other computer graphics concepts to create a 3D space shooter game. 
 
Resources
Libraries that we initially plan to use are Three.js, WebGL, and cannon.js.
3D Objects assets such as the spaceship, asteroids, and the environment will be obtained from https://free3d.com/ and https://itch.io/.
Sounds effects will be obtained from https://opengameart.org/ and http://soundbible.com/.
 
Plan Outline
The ship will be at the center of a three dimensional skybox that will be comprised of a space environment.
Asteroids will be moving towards the ship with different movement behaviors, such as zig-zag, spiraling, and a direct path. 
There will be lighting effects from a simulated space environment, such as sunlight or surrounding planets. 
The spaceship will be controlled by mouse and keypress events, with shooting being mouse click, and rotation using the keys ‘W’, ‘A’, ‘S’, and ‘D’.
The camera will be attached to the ship object. The camera will move according to where the players points their cursor. The field of view will be limited such that the player needs to turn in order to see objects directly behind them, below them, to their sides or on top of them.
The heads-up display will display the map, score, and health bar. The map will be displayed as a radar-style map display. It gives players an idea about where to look relative to their view to defend against asteroids approaching.

Contributions

Joseph Hill
- HUD (score)
- Collision/Laser
- Lighting/Lens Flare
- Shooting

Jay Adams
- Lighting
- Shadowing
- Asteroid physics (rotation)

Rodrigo Lopez
- HUD elements (crosshairs, health counter)
- Asteroids physics (approach players)
- Initial ship movement/Camera tracking
 
 
 
To run locally using python:

Open directory containing index.html

Use command: python -m http.server

Open project using local address: localhost:8000
