var scene, camera, renderer;
var keyboard = {}, ship, asteroidArray = [];
var states = {
    initState: 'initState',
    playState: 'playState',
    endGameState: 'endGameState'
}
var spawnPoints = [
    {
        positionX:'2400',
        positionY:'2400',
        positionZ:'2400'
    },
    {
        positionX:'-2400',
        positionY:'2400',
        positionZ:'2400'
    },
    {
        positionX:'2400',
        positionY:'-2400',
        positionZ:'2400'
    },
    {
        positionX:'2400',
        positionY:'2400',
        positionZ:'-2400'
    },
    {
        positionX:'-2400',
        positionY:'-2400',
        positionZ:'2400'
    },
    {
        positionX:'2400',
        positionY:'-2400',
        positionZ:'-2400'
    },
    {
        positionX:'-2400',
        positionY:'2400',
        positionZ:'-2400'
    },
    {
        positionX:'-2400',
        positionY:'-2400',
        positionZ:'-2400'
    } 
]
var numAsteroids = 0;
var maxAsteroids = 5;
var currentState = states.initState;

init();

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
    ship.rotation.set(camera.rotation.x, camera.rotation.y + Math.PI, Math.abs(camera.rotation.z))

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
    scene.add( skybox );
}

function initScene() {
    let material = new THREE.MeshStandardMaterial();
    ship = loadObj('./assets/', "Arc170l");
    ship.position.set(0,0,0);
    render();
    
    let ambientLight = new THREE.AmbientLight(0x2222ff, .2);
    scene.add(ambientLight);

    let sun = new THREE.PointLight(0xffffff, 10, 5000, 100);
    sun.position.set(0,100,0);

    sun.castShadow = true;
    sun.shadow.mapSize.width = 5000;
    sun.shadow.mapSize.height = 5000;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 5000;
    sun.shadow.camera.fov = 100;

    scene.add(sun);
    initCamera();
    spawnAsteroid();
}

function init() {
    scene = new THREE.Scene();
    initRenderer();
    initSkyBox();
    initScene();
    animate();
}

var loop = new PhysicsLoop(60);

loop.add(function(delta){
    MoveAsteroids();
});

loop.start();

// updates asteroid position
function MoveAsteroids() {
    // var asteroid = asteroidArray[0];
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
    })
    render();
}

function animate() {
    requestAnimationFrame(animate);

    // Keybinding
    if(keyboard[32]) { //Space
    console.log("Shoot laserz!");
    var laserBeam	= new AnimateLaser();
    laserBeam.position.set(0,0,0);
    laserBeam.scale.set(1000, 10, 10);
    scene.add(laserBeam);
    scene.remove(laserBeam);
    }

    /*
    var keepLooping = true;
    while(keepLooping)
    {
    switch(currentState)
    {
        case states.initState:
            break;
        case states.playState:
            break;
        case states.endGameState:
            keepLooping = false;
            break;
        default:
            console.log("Should not enter here");
            break;
    }

    }
    */

    // Meteor Spawner

    // Game Over

    render();
}

//TODO choose random type when asteroid types are implemented
function spawnAsteroid() {
    let position = spawnPoints[Math.floor(Math.random() * 11)];
    let astroid = loadObj('./assets/', "asteroid1");
}

function render() {
    renderer.render(scene, camera);
}

function keyDown(event){
    keyboard[event.keyCode] = true;
}
function keyUp(event){
    keyboard[event.keyCode] = false;
}

function AnimateLaser(){
    var object3d	= new THREE.Object3D()
    // generate the texture
    var canvas	= generateLaserBodyCanvas()
    var texture	= new THREE.Texture( canvas )
    texture.needsUpdate	= true;
    // do the material	
    var material	= new THREE.MeshBasicMaterial({
        map		: texture,
        blending	: THREE.AdditiveBlending,
        color		: 0x4444aa,
        side		: THREE.DoubleSide,
        depthWrite	: false,
        transparent	: true
    })
    var geometry	= new THREE.PlaneGeometry(1, 0.1)
    var nPlanes	= 16;
    for(var i = 0; i < nPlanes; i++){
        var mesh	= new THREE.Mesh(geometry, material)
        mesh.position.x	= 1/2
        mesh.rotation.x	= i/nPlanes * Math.PI
        object3d.add(mesh)
    }
    return object3d;
    
    function generateLaserBodyCanvas(){
        // init canvas
        var canvas	= document.createElement( 'canvas' );
        var context	= canvas.getContext( '2d' );
        canvas.width	= 1;
        canvas.height	= 64;
        // set gradient
        var gradient	= context.createLinearGradient(0, 0, canvas.width, canvas.height);		
        gradient.addColorStop( 0  , 'rgba(  0,  0,  0,0.1)' );
        gradient.addColorStop( 0.1, 'rgba(160,160,160,0.3)' );
        gradient.addColorStop( 0.5, 'rgba(255,255,255,0.5)' );
        gradient.addColorStop( 0.9, 'rgba(160,160,160,0.3)' );
        gradient.addColorStop( 1.0, 'rgba(  0,  0,  0,0.1)' );
        // fill the rectangle
        context.fillStyle	= gradient;
        context.fillRect(0,0, canvas.width, canvas.height);
        // return the just built canvas 
        return canvas;	
    }
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);