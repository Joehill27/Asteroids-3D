function loadObj( path, name) {
    var obj;
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );
    mtlLoader.load( name+".mtl", function( mat ) {
        mat.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( mat );
        objLoader.setPath( path );
        objLoader.load( name + ".obj", function( object ) {
            obj = object;
            obj.position.x = 2600;
            scene.add( obj );
        });
    });
    return obj;
}