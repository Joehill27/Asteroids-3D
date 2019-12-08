function loadObj( path, name) {
    var obj;
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );
    mtlLoader.load( name+".mtl", function( material ) {
        material.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( material );
        objLoader.setPath( path );
        objLoader.load( name + ".obj", function( object ) {
            obj = object;
            obj.position.x = 2600;
            scene.add( obj );
        });
    });
    return obj;
}

function checkSphereOverlap(sphere1Radius, sphere1Center, sphere2Radius, sphere2Center) {
    var distance = Math.sqrt((sphere1Center.x - sphere2Center.x) * (sphere1Center.x - sphere2Center.x) +
    (sphere1Center.y - sphere2Center.y) * (sphere1Center.y - sphere2Center.y) +
    (sphere1Center.z - sphere2Center.z) * (sphere1Center.z - sphere2Center.z));

    return distance < (sphere1Radius + sphere2Radius)
}

function checkBoxOverlap(a, b) {
    var result = (a.minX <= b.maxX && a.maxX >= b.minX) &&
         (a.minY <= b.maxY && a.maxY >= b.minY) &&
         (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
         if(result) {
             console.log("Overlapping");
         }
    return result;
}