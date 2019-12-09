let WIDTH, HEIGHT;
let keyboard = {};
let scene, camera, renderer, ship, laserBeam, laserLight, asteroidArray = [], hearts = [];
let elapsedTime, startingTime, laserFireTime;

let shipBoundingBoxHelper, asteroidBoundingBoxesHelper = [], asteroidBoundingBoxes = [];
let laserBoundingBoxHelper, laserBoundingBox, shipBoundingBox;
let currentState;
let numAsteroids = 0;
let shipLives = 3;
let score = 0;

// crosshair init
var vert_geo = new THREE.PlaneGeometry( .5, 2, 0.1 );
var hor_geo = new THREE.PlaneGeometry( 2, .5, 0.1 );
var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xCCCF11, side: THREE.DoubleSide} );
var cross_hair_up = new THREE.Mesh( vert_geo, planeMaterial );
var cross_hair_down = new THREE.Mesh( vert_geo, planeMaterial );
var cross_hair_left = new THREE.Mesh( hor_geo, planeMaterial );
var cross_hair_right = new THREE.Mesh( hor_geo, planeMaterial );

// Keeps the crosshair in always on screen
cross_hair_up.renderOrder = 999;
cross_hair_up.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_down.renderOrder = 999;
cross_hair_down.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_left.renderOrder = 999;
cross_hair_left.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
cross_hair_right.renderOrder = 999;
cross_hair_right.onBeforeRender = function( renderer ) { renderer.clearDepth(); };

//////////////settings/////////
var movementSpeed = 80;
var totalObjects = 1000;
var objectSize = 100;
var sizeRandomness = 4000;
var colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];
/////////////////////////////////
var dirs = [];
var parts = [];

function ExplodeAnimation(x, y, z)
{
  var geometry = new THREE.Geometry();
  
  for (var i = 0; i < totalObjects; i ++) 
  {
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = z;
  
    geometry.vertices.push( vertex );
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  var material = new THREE.ParticleBasicMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)] });
  var particles = new THREE.ParticleSystem( geometry, material );
  
  this.object = particles;
  this.status = true;
  
  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  
  scene.add( this.object  ); 
  
  this.update = function(){
    if (this.status == true){
      var pCount = totalObjects;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount]
        particle.y += dirs[pCount].y;
        particle.x += dirs[pCount].x;
        particle.z += dirs[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  }
  
}

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

function init() {
    currentState = GAMESTATES.initState;
    startingTime = new Date();
    scene = new THREE.Scene();
    shipBoundingBox = new THREE.Box3();
    initRenderer();
    initSkyBox();
    initScene();
    animate();
    addEventListeners();
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize ( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild( renderer.domElement );
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(100, 80, 0);
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
      cameraControls.addEventListener("change", function() {
        camera.updateProjectionMatrix();
        laserLight.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
        ship.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
        shipBoundingBox.setFromObject(ship);
        if(shipBoundingBoxHelper != null) {
            shipBoundingBoxHelper.update();
        }
        InitHud();
		render();
  });
}

function initSkyBox(){
  var materialArray = [];
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/cwd_lf.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/cwd_rt.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/cwd_up.jpg')}));
  materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('images/cwd_dn.jpg')
}));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/cwd_ft.jpg')
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/cwd_bk.jpg')
  }));

  for (var i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
  var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
  var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
  skybox.name = "Skybox";
  scene.add( skybox );
}

function initScene() {
    let objLoader = new THREE.OBJLoader();
    let mtlLoader = new THREE.MTLLoader();
    initHearts();
    initCamera();
    

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
            
            ship.name = "ship";
            scene.add(ship);
            if(SHOWBOUNDINGBOXES) {
                shipBoundingBoxHelper = new THREE.BoundingBoxHelper( ship, 0xffff00 );
                shipBoundingBoxHelper.name = "ShipBoundingBox";
                scene.add(shipBoundingBoxHelper);
            }
            
            render();
        });
    });
    
    let ambientLight = new THREE.AmbientLight(0xffffff, .1);
    ambientLight.position.set(0,0,0);
    scene.add(ambientLight);

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

    var textureLoader = new THREE.TextureLoader();

    var textureFlare0 = textureLoader.load( "/assets/lensflare0.png" );
    var textureFlare1 = textureLoader.load( "/assets/lensflare2.png" );
    var textureFlare2 = textureLoader.load( "/assets/lensflare3.png" );

    var lensflare = new THREE.Lensflare();

    lensflare.addElement( new THREE.LensflareElement( textureFlare0, 1500, 0, new THREE.Color(0xFFC733)) );
    lensflare.addElement( new THREE.LensflareElement( textureFlare1, 512, 0 ) );
    lensflare.addElement( new THREE.LensflareElement( textureFlare2, 60, 0.3 ) );

    sun.add(lensflare);

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

    initialAsteroid();
}

function initHearts() {
    for (var i=0; i<3; i++ ) {
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
    }
  
  }

function GameOver() {
    var loader = new THREE.FontLoader();

    loader.load('./assets/helvetiker_regular.typeface.json', function ( font ) {

    var color = new THREE.Color(0xFD0000);

    var matLite = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: false,
        opacity: 0.1,
    });

	var geometry = new THREE.TextGeometry( 'GAME OVER', {
		font: font,
		size: 20,
        height: 5,
        curveSegments: 20
    });
    
    var text = new THREE.Mesh( geometry, matLite );
    text.rotation.copy(camera.rotation);
    text.position.copy(camera.position);
    text.updateMatrix();
    text.translateX(-90);
    // text.translateY(0);
    text.translateZ(-170);
    scene.add(text);
    render();
    });
}

function InitHud() {
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
     for(var i = 0; i<3; i++){
       hearts[i].renderOrder = 999;
       hearts[i].onBeforeRender = function( renderer ) { renderer.clearDepth(); };
     }
 
     hearts[2].position.copy( camera.position );
     hearts[2].rotation.copy( camera.rotation );
     hearts[2].updateMatrix();
     hearts[2].translateX( 100 );
     hearts[2].translateY( -50 );
     hearts[2].translateZ( - 80 );
     hearts[2].rotateX(-Math.PI/2);
 
     hearts[1].position.copy( camera.position );
     hearts[1].rotation.copy( camera.rotation );
     hearts[1].updateMatrix();
     hearts[1].translateX( 85 );
     hearts[1].translateY( -50 );
     hearts[1].translateZ( -80 );
     hearts[1].rotateX(-Math.PI/2);
 
     hearts[0].position.copy( camera.position );
     hearts[0].rotation.copy( camera.rotation );
     hearts[0].updateMatrix();
     hearts[0].translateX( 70 );
     hearts[0].translateY( -50 );
     hearts[0].translateZ( -80 );
     hearts[0].rotateX(-Math.PI/2);
}

    /*           */
    /* Game Loop */
    /*           */

var loop = new PhysicsLoop(60);

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

// updates asteroid position
function MoveAsteroids() {
    for(var i = 0; i < MAXASTEROIDS; i++) {
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

function animate() {
  requestAnimationFrame(animate);

  // Ship&Cam Rotation
  if(keyboard[32]) { //Space
    
    if(laserBeam == null && currentState == GAMESTATES.playState) {
        // console.log("Shoot laserz!");
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

function initialAsteroid() {
    for(var i = 0; i < MAXASTEROIDS; i++) {
        spawnAsteroid();
    }
}

function spawnAsteroid() {
    console.log("Spawning asteroid");
    var asteroid;
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
                var asteroidBoundingBoxHelper = new THREE.BoundingBoxHelper( asteroid, 0xffff00 );
                asteroidBoundingBoxHelper.name = "BoundingBoxHelper";
                scene.add(asteroidBoundingBoxHelper);
                asteroidBoundingBoxesHelper.push(asteroidBoundingBoxHelper);
            }

            var asteroidBoundingBox = new THREE.Box3();
            asteroidBoundingBox.setFromObject(asteroid);
            asteroidBoundingBoxes.push(asteroidBoundingBox);
            scene.add(asteroid);
            render();
        });
    });
    numAsteroids++;
    return asteroid;
}

function render() {
  renderer.render(scene, camera);
}

/* Object Spawning Functions */
function Laser() {
    var geometry = new THREE.CylinderBufferGeometry( 4, 1, 3500, 100 );
    var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    var laser = new THREE.Mesh( geometry, material );
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
    for(var i = 0; i < MAXASTEROIDS; i++) {
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

        if(checkBoxOverlap(boxDimensions, asteroidDimensions)) { 
            DeathOfAnAstroid(i);
        }
    }
}

function CheckShipAsteroidCollisions(boxDimensions) {
    
    for(var i = 0; i < MAXASTEROIDS; i++) {
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

        if(checkBoxOverlap(boxDimensions, asteroidDimensions)) { 
            DeathOfAnAstroid(i);
            UpdateShipHealth();
        }
    }
}

    /*                    */
    /* Asteroid Functions */
    /*                    */
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
    // parts.push(new ExplodeAnimation(asteroid.position.x, asteroid.position.y, asteroid.position.z));
    let position = SPAWNPOINTS[Math.floor(Math.random() * 8)];
    asteroid.position.set(position.positionX, position.positionY, position.positionZ);
    if(SHOWBOUNDINGBOXES) {
        let asteroidBoundingBoxHelper = asteroidBoundingBoxesHelper[a];
        asteroidBoundingBoxHelper.setFromObject(asteroid);
    }
    score++;
}

    /*                */
    /* Ship Functions */
    /*                */

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
    var now = new Date().getTime();
    var elapsedSinceLaserFire = now - laserFireTime;
    if(elapsedSinceLaserFire > LASEREFFECTMILLISECONDS){
        scene.remove(laserBeam);
        laserBeam = null;
        scene.remove(laserBoundingBoxHelper);
        laserBoundingBoxHelper = null;
        scene.remove(laserLight);
    }
}

/* Event Listeners */
function keyDown(event) {
    keyboard[event.keyCode] = true;
}
function keyUp(event) {
    keyboard[event.keyCode] = false;
}

function addEventListeners() {
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
    
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
}

//Start the Game!
init();
loop.start();