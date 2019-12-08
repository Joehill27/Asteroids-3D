var WIDTH, HEIGHT;
var keyboard = {};
var scene, camera, renderer, ship, laserBeam, asteroidArray = [];
var elapsedTime, startingTime, laserFireTime;

var shipBoundingBoxHelper, asteroidBoundingBoxesHelper = [], asteroidBoundingBoxes = [];
var laserBoundingBoxHelper, laserBoundingBox, shipBoundingBox;
var currentState;
var numAsteroids = 0;
var shipLives = 3;

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
        ship.lookAt(-camera.position.x,-camera.position.y,-camera.position.z);
        shipBoundingBox.setFromObject(ship);
        if(shipBoundingBoxHelper != null) {
            shipBoundingBoxHelper.update();
        }
		
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
    let material = new THREE.MeshStandardMaterial();
    let objLoader = new THREE.OBJLoader();
    let mtlLoader = new THREE.MTLLoader();

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
            shipBoundingBox = new THREE.Box3();
            shipBoundingBox.setFromObject(ship);
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

    let sun = new THREE.PointLight(0xffffff, 10, 5000, 2);
    sun.position.set(0,2500,0);
    sun.angle = Math.PI /2;
    
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2500;
    sun.shadow.mapSize.height = 2500;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 5000;
    sun.shadow.camera.fov = 100000;

    let eart = new THREE.PointLight(0x1111ee, 2.5, 5000, 2);
    eart.position.set(0,0,2500);
    eart.angle = Math.PI /2;
    
    eart.castShadow = true;
    eart.shadow.mapSize.width = 5000;
    eart.shadow.mapSize.height = 5000;
    eart.shadow.camera.near = 0.1;
    eart.shadow.camera.far = 5000;
    eart.shadow.camera.fov = 100000;
    
    scene.add(sun);
    scene.add(eart);
    initCamera();
    initialAsteroid();
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
        } else {
            asteroid.position.x--;
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
        }
    }
}

    /*                    */
    /* Asteroid Functions */
    /*                    */
function DestroyAllAsteroids() {

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
}

    /*                */
    /* Ship Functions */
    /*                */

function UpdateShipHealth() {
    shipLives--;
    if(shipLives == 0) {
        console.log("Game Over!");
        currentState = GAMESTATES.endGameState;
        ShipDestruction();
    }
}

function ShipDestruction() {
    scene.remove(ship);
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