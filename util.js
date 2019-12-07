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