//Load an object given the path and name
function LoadObj( path, name) {
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

//Checks overlap between two spheres
function CheckSphereOverlap(sphere1Radius, sphere1Center, sphere2Radius, sphere2Center) {
    var distance = Math.sqrt((sphere1Center.x - sphere2Center.x) * (sphere1Center.x - sphere2Center.x) +
    (sphere1Center.y - sphere2Center.y) * (sphere1Center.y - sphere2Center.y) +
    (sphere1Center.z - sphere2Center.z) * (sphere1Center.z - sphere2Center.z));

    return distance < (sphere1Radius + sphere2Radius)
}

//Checks overlap between two boxes
function CheckBoxOverlap(a, b) {
    var result = (a.minX <= b.maxX && a.maxX >= b.minX) &&
         (a.minY <= b.maxY && a.maxY >= b.minY) &&
         (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
    return result;
}

//Checks overlap between box and sphere
function CheckBoxSphereOverlap(box, sphere) {
    var x = Math.max(box.minX, Math.min(sphere.x, box.maxX));
    var y = Math.max(box.minY, Math.min(sphere.y, box.maxY));
    var z = Math.max(box.minZ, Math.min(sphere.z, box.maxZ));

    var distance = Math.sqrt((x - sphere.x) * (x - sphere.x) +
                            (y - sphere.y) * (y - sphere.y) +
                            (z - sphere.z) * (z - sphere.z));
    
    return distance < sphere.radius;
}