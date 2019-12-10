let WIDTH  = window.innerWidth;
let HEIGHT = window.innerHeight;
let keyboard = {};

//Scene objects
let scene, camera, renderer, ship, laserBeam, laserLight, asteroidArray = [], hearts = [];

//Time variables
let elapsedTime, startingTime, laserFireTime;

//Bounding boxes for physics collisions
let shipBoundingBoxHelper, asteroidBoundingBoxesHelper = [], asteroidBoundingBoxes = [];
let laserBoundingBoxHelper, laserBoundingBox, shipBoundingBox;

//Game Logic variables
let currentState;
let numAsteroids = 0;
let shipLives = 3;
let score = 0;

let fontLoader, font;

    /*                  */
    /* Heads Up Display */
    /*                  */

// crosshair init
let vert_geo = new THREE.PlaneGeometry( .5, 2, 0.1 );
let hor_geo = new THREE.PlaneGeometry( 2, .5, 0.1 );
let planeMaterial = new THREE.MeshBasicMaterial( {color: 0xCCCF11, side: THREE.DoubleSide} );
let cross_hair_up = new THREE.Mesh( vert_geo, planeMaterial );
let cross_hair_down = new THREE.Mesh( vert_geo, planeMaterial );
let cross_hair_left = new THREE.Mesh( hor_geo, planeMaterial );
let cross_hair_right = new THREE.Mesh( hor_geo, planeMaterial );
let scoreText = new THREE.PlaneGeometry();

// Keeps the HUD in always on screen
cross_hair_up.renderOrder = 999;
cross_hair_up.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_down.renderOrder = 999;
cross_hair_down.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_left.renderOrder = 999;
cross_hair_left.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_right.renderOrder = 999;
cross_hair_right.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
scoreText.renderOrder = 999;
scoreText.onBeforeRender = function( renderer ) { renderer.clearDepth(); };

    /*           */
    /* Constants */
    /*           */
const SHOWBOUNDINGBOXES = false;
const MAXASTEROIDS = 5;
const LASEREFFECTMILLISECONDS = 800;
const  GAMESTATES = {
    initState: 'initState',
    playState: 'playState',
    endGameState: 'endGameState'
}

const SPAWNPOINTS = [
    {
        positionX:'3000',
        positionY:'3000',
        positionZ:'3000'
    },
    {
        positionX:'-3000',
        positionY:'3000',
        positionZ:'3000'
    },
    {
        positionX:'3000',
        positionY:'-3000',
        positionZ:'3000'
    },
    {
        positionX:'3000',
        positionY:'3000',
        positionZ:'-3000'
    },
    {
        positionX:'-3000',
        positionY:'-3000',
        positionZ:'3000'
    },
    {
        positionX:'3000',
        positionY:'-3000',
        positionZ:'-3000'
    },
    {
        positionX:'-3000',
        positionY:'3000',
        positionZ:'-3000'
    },
    {
        positionX:'-3000',
        positionY:'-3000',
        positionZ:'-3000'
    }
]

    /*                      */
    /* Scene Initialization */
    /*                      */

function Init() {
    currentState = GAMESTATES.initState;
    startingTime = new Date();
    scene = new THREE.Scene();
    shipBoundingBox = new THREE.Box3();
    InitFontLoader();
    InitRenderer();
    InitSkyBox();
    InitScene();
    animate();
    AddEventListeners();
}

function InitFontLoader() {
    fontLoader = new THREE.FontLoader();
    fontLoader.load('./assets/helvetiker_regular.typeface.json', function(f) {
        scoreText = new THREE.TextGeometry( score, {
            font: f,
            size: 20,
            height: 5,
            curveSegments: 20
        });
        font = f;
        scoreText.renderOrder = 999;
        scoreText.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    })
    
    
}

function InitRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize ( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild( renderer.domElement );
}

function InitCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(100, 80, 0);
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
      cameraControls.addEventListener("change", function() {
        camera.updateProjectionMatrix();
        if(laserLight) laserLight.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
        if(ship) ship.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
        if(ship) shipBoundingBox.setFromObject(ship);
        if(shipBoundingBoxHelper != null) {
            shipBoundingBoxHelper.update();
        }
        InitHud();
		render();
  });
}

function InitSkyBox(){
  let materialArray = [];
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_lf.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_rt.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_up.jpg')}));
  materialArray.push(new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_dn.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_ft.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('../assets/skybox/cwd_bk.jpg')
  }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
  let skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
  let skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
  skybox.name = "Skybox";
  scene.add( skybox );
}

function InitScene() {
    let objLoader = new THREE.OBJLoader();
    let mtlLoader = new THREE.MTLLoader();
    InitHearts();
    InitCamera();

    mtlLoader.setPath('./assets/');
    mtlLoader.load("Arc170.mtl",function (mtls){
        mtls.preload();
        objLoader.setMaterials(mtls);
        objLoader.setPath("./assets/");
        objLoader.load("Arc170.obj", function ( obj ) {
            
            obj.scale.set(0.1,0.1,0.1);
            obj.position.set(0,0,0);
            obj.rotation.set(0,-Math.PI/2,0)
            ship = obj;
            
            scene.add(ship);
            if(SHOWBOUNDINGBOXES) {
                shipBoundingBoxHelper = new THREE.BoundingBoxHelper( ship, 0xffff00 );
                scene.add(shipBoundingBoxHelper);
            }
            
            render();
        });
    });
    
    //Add low intensity lighting on entire scene
    let ambientLight = new THREE.AmbientLight(0xffffff, .1);
    ambientLight.position.set(0,0,0);
    scene.add(ambientLight);

    //Light from sun
    let sun = new THREE.PointLight(0xffffff, 2, 0, 2);
    sun.position.set(-500,2500,-125);
    sun.angle = (Math.PI / 2);
    sun.lookAt(0,0,0);
    
    sun.castShadow = true;
    sun.shadow.mapSize.width = 512;
    sun.shadow.mapSize.height = 512;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 5000;
    sun.shadow.camera.fov = 100;

    //Add lensflare to sun light
    let textureLoader = new THREE.TextureLoader();
    let textureFlare0 = textureLoader.load( "/assets/lensflare0.png" );
    let textureFlare1 = textureLoader.load( "/assets/lensflare2.png" );
    let textureFlare2 = textureLoader.load( "/assets/lensflare3.png" );
    let lensflare = new THREE.Lensflare();
    lensflare.addElement( new THREE.LensflareElement( textureFlare0, 1000, 0, new THREE.Color(0xFFC733)) );
    lensflare.addElement( new THREE.LensflareElement( textureFlare1, 256, 0.5 ) );
    lensflare.addElement( new THREE.LensflareElement( textureFlare2, 128, 0.2 ) );
    sun.add(lensflare);

    //Low-intensity light from earth
    let eart = new THREE.PointLight(0x1111ee, .5, 0, 2);
    eart.position.set(0,0,2500);
    eart.lookAt(0,0,0);
    eart.castShadow = true;
    eart.shadow.mapSize.width = 512;
    eart.shadow.mapSize.height = 512;
    eart.shadow.camera.near = 0.5;
    eart.shadow.camera.far = 5000;
    eart.shadow.camera.fov = 100;
    
    scene.add(sun);
    scene.add(eart);
    
    //Adujust crosshair rotation
    cross_hair_up.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
    cross_hair_down.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
    cross_hair_left.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
    cross_hair_right.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);

    scene.add( cross_hair_up );
    scene.add( cross_hair_down );
    scene.add( cross_hair_left );
    scene.add( cross_hair_right );

    laserLight = new THREE.SpotLight(0xff0000, 1, 0, 2);
    laserLight.position.set(0,0,0);
    laserLight.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);

    InitAsteroids();
}

function InitAsteroids() {
    for(let i = 0; i < MAXASTEROIDS; i++) {
        SpawnAsteroid();
    }
}

function InitHearts() {
    for (let i=0; i<3; i++ ) {
      let material = new THREE.MeshBasicMaterial();
      let objLoader = new THREE.OBJLoader();
      let mtlLoader = new THREE.MTLLoader();
  
      mtlLoader.setPath('./assets/');
      mtlLoader.load("12190_Heart_v1_L3.mtl",function (mtls){
          mtls.preload();
          objLoader.setMaterials(mtls);
          objLoader.setPath("./assets/");
          objLoader.load("12190_Heart_v1_L3.obj",function ( obj ) {
              obj.scale.set(.5,.5,.5);
              obj.castShadow = false;
              obj.receiveShadow = false;
              scene.add(obj);
              hearts.push(obj);
          });
      });

      InitHud();
    }
  
  }

function GameOver() {
    let color = new THREE.Color(0xFD0000);

    let matLite = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: false,
        opacity: 0.1,
    });

	let geometry = new THREE.TextGeometry( 'GAME OVER', {
		font: font,
		size: 20,
        height: 4,
        curveSegments: 20
    });
    
    let text = new THREE.Mesh( geometry, matLite );
    text.rotation.copy(camera.rotation);
    text.position.copy(camera.position);
    text.updateMatrix();
    text.translateX(-90);
    // text.translateY(0);
    text.translateZ(-170);
    scene.add(text);
    render();
}

function InitHud() {

    if(camera ) {
        // keeps crosshair always in the center
        cross_hair_up.position.copy( camera.position );
        cross_hair_up.rotation.copy( camera.rotation );
        cross_hair_up.updateMatrix();
        cross_hair_up.translateX( 0 );
        cross_hair_up.translateY( 35 );
        cross_hair_up.translateZ( - 80 );
    
        cross_hair_down.position.copy( camera.position );
        cross_hair_down.rotation.copy( camera.rotation );
        cross_hair_down.updateMatrix();
        cross_hair_down.translateX( 0 );
        cross_hair_down.translateY( 29 );
        cross_hair_down.translateZ( - 80 );
    
        cross_hair_left.position.copy( camera.position );
        cross_hair_left.rotation.copy( camera.rotation );
        cross_hair_left.updateMatrix();
        cross_hair_left.translateX( -3 );
        cross_hair_left.translateY( 32 );
        cross_hair_left.translateZ( - 80 );
    
        cross_hair_right.position.copy(camera.position );
        cross_hair_right.rotation.copy( camera.rotation );
        cross_hair_right.updateMatrix();
        cross_hair_right.translateX( 3 );
        cross_hair_right.translateY( 32 );
        cross_hair_right.translateZ( - 80 );
    
        // hearts
        // makes sure hearts are always showing
        for(let i = 0; i<3; i++){
        hearts[i].renderOrder = 999;
        hearts[i].onBeforeRender = function( renderer ) { renderer.clearDepth(); };
        }
    
        hearts[2].position.copy( camera.position );
        hearts[2].rotation.copy( camera.rotation );
        hearts[2].updateMatrix();
        hearts[2].translateX( 105 );
        hearts[2].translateY( -50 );
        hearts[2].translateZ( - 80 );
        hearts[2].rotateX(-Math.PI/2);
    
        hearts[1].position.copy( camera.position );
        hearts[1].rotation.copy( camera.rotation );
        hearts[1].updateMatrix();
        hearts[1].translateX( 90 );
        hearts[1].translateY( -50 );
        hearts[1].translateZ( -80 );
        hearts[1].rotateX(-Math.PI/2);
    
        hearts[0].position.copy( camera.position );
        hearts[0].rotation.copy( camera.rotation );
        hearts[0].updateMatrix();
        hearts[0].translateX( 75 );
        hearts[0].translateY( -50 );
        hearts[0].translateZ( -80 );
        hearts[0].rotateX(-Math.PI/2);

        if(scoreText.rotation && scoreText.position && camera.rotation && camera.position) {
            scoreText.rotation.copy(camera.rotation);
            scoreText.position.copy(camera.position);
            scoreText.updateMatrix();
            scoreText.translateX(-110);
            scoreText.translateY(-50);
            scoreText.translateZ(-80);
        }
        

    }
}

function RenderScore() {
    if(scoreText != null) {
        scene.remove(scoreText);
    }

    let color = new THREE.Color(0xFD0000);

    let matLite = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: false,
        opacity: 0.1,
    });

	let geometry = new THREE.TextGeometry( JSON.stringify(score), {
		font: font,
		size: 15,
        height: 1,
    });
    
    let text = new THREE.Mesh( geometry, matLite );
    scoreText = text;
    InitHud();
    scene.add(text);
    render();
}

    /*                */
    /* Ship Functions */
    /*                */
function CheckForShipDamage() {
    let shipBoundingBox = new THREE.Box3();
    shipBoundingBox.setFromObject(ship);
    let shipDimensions = {
        minX: shipBoundingBox.min.x,
        minY: shipBoundingBox.min.y,
        minZ: shipBoundingBox.min.z,
        maxX: shipBoundingBox.max.x,
        maxY: shipBoundingBox.max.y,
        maxZ: shipBoundingBox.max.z,
    }
    CheckShipAsteroidCollisions(shipDimensions);
}
function UpdateShipHealth() {
    let numHearts = shipLives - 1;
    let heart = hearts[numHearts];
    scene.remove(heart);
    shipLives--;
    if(shipLives == 0) {
        console.log("Game Over!");
        currentState = GAMESTATES.endGameState;
        scene.remove(cross_hair_down);
        scene.remove(cross_hair_up);
        scene.remove(cross_hair_left);
        scene.remove(cross_hair_right);
    }
}

    /*            */
    /* Game Logic */
    /*            */

let loop = new PhysicsLoop(60);

loop.add(function(delta) {
    UpdateTime();
    switch(currentState) {
        case GAMESTATES.initState:
            if(ship != null ) {
                currentState = GAMESTATES.playState;
            }
            break;

        case GAMESTATES.playState:
            MoveAsteroids();
            if(laserBeam != null) {
                CheckLaserBeamTime();
            }
            CheckForShipDamage();
            break;

        case GAMESTATES.endGameState:
            DestroyAllAsteroids();
            ShipDestruction();
            GameOver();
            render();
            loop.stop();
            break;
    }
    
});

function UpdateScore() {
    score++;
    RenderScore();
}

function animate() {
  requestAnimationFrame(animate);

  // Ship&Cam Rotation
  if(keyboard[32]) { //Space
    
    if(laserBeam == null && currentState == GAMESTATES.playState) {
        scene.add(laserLight);
        laserBeam	= Laser();
        laserFireTime = new Date();
        scene.add(laserBeam);
        
        laserBoundingBox = new THREE.Box3();
        laserBoundingBox.setFromObject(laserBeam);
        let laserBoundingBoxDimensions = {
            minX: laserBoundingBox.min.x,
            minY: laserBoundingBox.min.y,
            minZ: laserBoundingBox.min.z,
            maxX: laserBoundingBox.max.x,
            maxY: laserBoundingBox.max.y,
            maxZ: laserBoundingBox.max.z
        };

        CheckLaserAsteroidCollisions(laserBoundingBoxDimensions);
        if(SHOWBOUNDINGBOXES) {
            laserBoundingBoxHelper = new THREE.BoundingBoxHelper( laserBeam, 0xffff00 );
            scene.add(laserBoundingBoxHelper);
        }

    }
  }
}

function render() {
  renderer.render(scene, camera);
}

function Laser() {
    let geometry = new THREE.CylinderBufferGeometry( 4, 1, 3500, 100 );
    let material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    let laser = new THREE.Mesh( geometry, material );
    laser.position.copy(ship.position);
    laser.rotation.copy(camera.rotation);
    laser.updateMatrix();
    laser.rotateX(5 * Math.PI/8);
    laser.translateZ(-13);
    laser.translateY(-1750);
    return laser;
}

/*                     */
/* Collision Functions */
/*                     */

function CheckLaserAsteroidCollisions(boxDimensions) {
    for(let i = 0; i < MAXASTEROIDS; i++) {
        let asteroid = asteroidArray[i];
        if(asteroid == null)
            continue;
        let asteroidBoundingBox = new THREE.Box3();
        asteroidBoundingBox.setFromObject(asteroid);
        let asteroidDimensions = {
            minX: asteroidBoundingBox.min.x,
            minY: asteroidBoundingBox.min.y,
            minZ: asteroidBoundingBox.min.z,
            maxX: asteroidBoundingBox.max.x,
            maxY: asteroidBoundingBox.max.y,
            maxZ: asteroidBoundingBox.max.z,
        };

        if(CheckBoxOverlap(boxDimensions, asteroidDimensions)) { 
            DeathOfAnAstroid(i);
        }
    }
}

function CheckShipAsteroidCollisions(boxDimensions) {
    
    for(let i = 0; i < MAXASTEROIDS; i++) {
        let asteroid = asteroidArray[i];
        if(asteroid == null)
            continue;
        let asteroidBoundingBox = new THREE.Box3();
        asteroidBoundingBox.setFromObject(asteroid);
        let asteroidDimensions = {
            minX: asteroidBoundingBox.min.x,
            minY: asteroidBoundingBox.min.y,
            minZ: asteroidBoundingBox.min.z,
            maxX: asteroidBoundingBox.max.x,
            maxY: asteroidBoundingBox.max.y,
            maxZ: asteroidBoundingBox.max.z,
        };

        if(CheckBoxOverlap(boxDimensions, asteroidDimensions)) { 
            DeathOfAnAstroid(i);
            UpdateShipHealth();
        }
    }
}

    /*                    */
    /* Asteroid Functions */
    /*                    */

// updates all asteroids position to ship
function MoveAsteroids() {
    for(let i = 0; i < MAXASTEROIDS; i++) {
        let asteroid = asteroidArray[i];
        if(asteroid == null)
            continue;
        if (asteroid.position.x < 0) {
            asteroid.position.x++;
            asteroid.rotation.x+=.005;
        } else {
            asteroid.position.x--;
            asteroid.rotation.x+=.005;
        }

        if (asteroid.position.y < 0) {
            asteroid.position.y++;
        } else {
            asteroid.position.y--;
        }

        if (asteroid.position.z < 0) {
            asteroid.position.z++;
        } else {
            asteroid.position.z--;
        }

        if(asteroidBoundingBoxesHelper[i] != null) {
            asteroidBoundingBoxesHelper[i].update();
            asteroidBoundingBoxesHelper[i].setFromObject(asteroid);
        }
    }
    render();
}

function SpawnAsteroid() {
    let asteroid;
    let objLoader = new THREE.OBJLoader();
    let mtlLoader = new THREE.MTLLoader();
    let position = SPAWNPOINTS[Math.floor(Math.random() * 8)];
    mtlLoader.setPath('./assets/');
    mtlLoader.load( "asteroid1.mtl", function (mtls){
        mtls.preload();
        objLoader.setMaterials(mtls);
        objLoader.setPath("./assets/");
    
        objLoader.load("asteroid1.obj", function ( obj ) {
            obj.scale.set(0.5,0.5,0.5);
            obj.position.set(position.positionX,position.positionY,position.positionZ);
            obj.rotation.set(0,-Math.PI/2,0)

            asteroid = obj;
            asteroid.name = "Asteroid" + numAsteroids + 1;
            asteroidArray.push(asteroid);
            if(SHOWBOUNDINGBOXES) {
                let asteroidBoundingBoxHelper = new THREE.BoundingBoxHelper( asteroid, 0xffff00 );
                asteroidBoundingBoxHelper.name = "BoundingBoxHelper";
                scene.add(asteroidBoundingBoxHelper);
                asteroidBoundingBoxesHelper.push(asteroidBoundingBoxHelper);
            }

            let asteroidBoundingBox = new THREE.Box3();
            asteroidBoundingBox.setFromObject(asteroid);
            asteroidBoundingBoxes.push(asteroidBoundingBox);
            scene.add(asteroid);
            render();
        });
    });
    numAsteroids++;
    return asteroid;
}

function DestroyAllAsteroids() {
    for(let i = 0; i < MAXASTEROIDS; i++)
    {
        let asteroid = asteroidArray[i];
        if(asteroid == null)
            continue;
        scene.remove(asteroid);
    }
}

// will remove astroidArray[a] from the array and scene
function DeathOfAnAstroid(a) {
    let asteroid = asteroidArray[a];
    let position = SPAWNPOINTS[Math.floor(Math.random() * 8)];
    asteroid.position.set(position.positionX, position.positionY, position.positionZ);
    if(SHOWBOUNDINGBOXES) {
        let asteroidBoundingBoxHelper = asteroidBoundingBoxesHelper[a];
        asteroidBoundingBoxHelper.setFromObject(asteroid);
    }
    UpdateScore();
}

function ShipDestruction() {
    scene.remove(ship);
    // parts.push(new ExplodeAnimation(0, 0, 0));
    if(SHOWBOUNDINGBOXES) {
        scene.remove(shipBoundingBoxHelper);
    }
}

    /*                        */
    /* Time-Related Functions */
    /*                        */
function UpdateTime() {
    elapsedTime = new Date() - startingTime;
}

function CheckLaserBeamTime() {
    let now = new Date().getTime();
    let elapsedSinceLaserFire = now - laserFireTime;
    if(elapsedSinceLaserFire > LASEREFFECTMILLISECONDS){
        scene.remove(laserBeam);
        laserBeam = null;
        scene.remove(laserBoundingBoxHelper);
        laserBoundingBoxHelper = null;
        scene.remove(laserLight);
    }
}

    /*                 */
    /* Event Listeners */
    /*                 */
function KeyDown(event) {
    keyboard[event.keyCode] = true;
}
function KeyUp(event) {
    keyboard[event.keyCode] = false;
}

function AddEventListeners() {
    window.addEventListener (
        "resize",
        function () {
            WIDTH = window.innerWidth ;
            HEIGHT = window.innerHeight;
            renderer.setSize(WIDTH,HEIGHT);
            camera.aspect = WIDTH/HEIGHT;
            camera.updateProjectionMatrix();
            render();
        }
    );
    
    window.addEventListener('keydown', KeyDown);
    window.addEventListener('keyup', KeyUp);
}

//Start the Game!
Init();
loop.start();