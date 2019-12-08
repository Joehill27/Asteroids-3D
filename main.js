var WIDTH;
var HEIGHT;
var scene, camera, renderer, ship;
var keyboard = {}, ship, laserBeam, laserBoundingBoxHelper, laserBoundingBox, asteroidArray = [];
var numAsteroids = 0, maxAsteroids = 5;
var elapsedTime, startingTime, laserEffectMilliseconds = 800, laserFireTime;
var shipBoundingBoxHelper, asteroidBoundingBoxesHelper = [], asteroidBoundingBoxes = [];
var cameraRotation;
var showBoundingBoxes = true;

var states = {
    initState: 'initState',
    playState: 'playState',
    endGameState: 'endGameState'
}
var currentState = states.initState;
var spawnPoints = [
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
    }]

init();

function init() {
    startingTime = new Date();
    scene = new THREE.Scene();
    initRenderer();
    initSkyBox();
    initScene();
    animate();
    handleResize();
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
	cameraRotation = {x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z};
      cameraControls.addEventListener("change", function() {
		camera.updateProjectionMatrix();
		cameraRotation = {x: camera.rotation.x, y: camera.rotation.y + Math.PI, z:  Math.abs(camera.rotation.z)};
		ship.lookAt(-camera.position.x,-camera.position.y,-camera.position.z)
		shipBoundingBoxHelper.update();
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
            if(showBoundingBoxes) {
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



var loop = new PhysicsLoop(60);

loop.add(function(delta){
    MoveAsteroids();
    UpdateTime();
    if(laserBeam != null) CheckLaserBeam();
});

loop.start();

// updates asteroid position
function MoveAsteroids() {
    var count = 0;
    asteroidArray.forEach(function(asteroid)
    {
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
        if(asteroidBoundingBoxesHelper[count] != null) {
            asteroidBoundingBoxesHelper[count].update();
            asteroidBoundingBoxesHelper[count].setFromObject(asteroid);
        }
        
        count++;
    })
	
    render();
}

function animate() {
  requestAnimationFrame(animate);

  // Ship&Cam Rotation
  if(keyboard[32]) { //Space
    
    if(laserBeam == null) {
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
            maxZ: laserBoundingBox.max.z,
        };

        CheckLaserCollisions(laserBoundingBoxDimensions);
        if(showBoundingBoxes) {
            laserBoundingBoxHelper = new THREE.BoundingBoxHelper( laserBeam, 0xffff00 );
            scene.add(laserBoundingBoxHelper);
        }
        
        // var position = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
        // var position = new THREE.Vector3(laserBeam.position.x, laserBeam.position.y, laserBeam.position.z);
        // position = position.normalize();
        // var direction = new THREE.Vector3(0.9,0.9,0.9);

        // console.log(position);
        // var raycaster = new THREE.Raycaster(ship.position, direction);
        // // raycaster.linePrecision
        // var intersects = raycaster.intersectObjects( scene.children );
        // for ( var i = 0; i < intersects.length; i++ ) {
        //     // intersects[ i ].object.material.color.set( 0xff0000 );
        //     if(intersects[i].object.name != "Skybox" 
        //         && intersects[i].object.name != "ShipBoundingBox")
        //     {
        //         scene.remove(intersects[i].object);
        //         console.log("Destroying " + intersects[i].object.name);
        //     }
            
            
        // }
    }
  }
}

function initialAsteroid() {
    for(var i = 0; i < maxAsteroids; i++) {
        spawnAsteroid();
    }
}

//TODO choose random type when asteroid types are implemented
function spawnAsteroid() {
    var asteroid;
    let objLoader = new THREE.OBJLoader();
    let mtlLoader = new THREE.MTLLoader();
    let position = spawnPoints[Math.floor(Math.random() * 8)];
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
            var asteroidBoundingBoxHelper = new THREE.BoundingBoxHelper( asteroid, 0xffff00 );
            asteroidBoundingBoxHelper.name = "BoundingBoxHelper";
            scene.add(asteroidBoundingBoxHelper);
            asteroidBoundingBoxesHelper.push(asteroidBoundingBoxHelper);

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

function keyDown(event) {
    keyboard[event.keyCode] = true;
}
function keyUp(event) {
    keyboard[event.keyCode] = false;
}

function CheckLaserBeam() {
    var now = new Date().getTime();
    var elapsedSinceLaserFire = now - laserFireTime;
    if(elapsedSinceLaserFire > laserEffectMilliseconds){
        scene.remove(laserBeam);
        laserBeam = null;
        scene.remove(laserBoundingBoxHelper);
        laserBoundingBoxHelper = null;
    }

}

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

function CheckLaserCollisions(laserDimensions) {
    
    for(var i = 0; i < maxAsteroids; i++) {
        let asteroid = asteroidArray[i];
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

        if(checkBoxOverlap(laserDimensions, asteroidDimensions)) { 
            deathOfAnAstroid(i);
        }
    }
    asteroidArray.forEach(function(asteroid) {
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
        if(checkBoxOverlap(laserDimensions, asteroidDimensions)) {
            scene.remove(asteroid);
        }
    });
}
    

// will remove astroidArray[a] from the array and scene
function deathOfAnAstroid(a) {
    let asteroid = asteroidArray[a];
    let asteroidBoundingBoxHelper = asteroidBoundingBoxesHelper[a];
    scene.remove(asteroid);
    scene.remove(asteroidBoundingBoxHelper);
    asteroidBoundingBoxesHelper[a] = null;
    asteroid[a] = null;
}

function UpdateTime() {
    elapsedTime = new Date() - startingTime;
}

function handleResize() {
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
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);