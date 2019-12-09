# Asteroids-3D
Computer graphics class project utilizing Three.js and WebGL to create a 3D asteroids game inspired by the retro game Asteroids made by Atari in 1979.

Asteroids 3D Game Project Proposal
Goal
To demonstrate the use of Three.js, WebGL, cannon.js, raytracing, realistic collision detection , realistic lighting,and other computer graphics concepts to create a 3D space shooter game. 
 
Resources
Libraries that we initially plan to use are Three.js, WebGL, and cannon.js.
3D Objects assets such as the spaceship, asteroids, and the environment will be obtained from https://free3d.com/
 
Plan Outline
The ship is at the center of a three dimensional skybox that will be comprised of a space environment.
Asteroids move towards the ship with a slight rotation;
There will be lighting effects from a simulated space environment, such as sunlight or surrounding planets. 
Spaceship rotation is controlled by left clicking on the mouse and moving the mouse around.
Laser shooting is controlled by the space key.
The camera will be attached to the ship object. The camera will move according to where the players points their cursor. The field of view will be limited such that the player needs to turn in order to see objects directly behind them, below them, to their sides or on top of them.
The heads-up display will display the score and health bar. 

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
