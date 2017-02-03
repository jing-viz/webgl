
var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {

    console.log( item, loaded, total );

};

var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
};

var onError = function ( xhr ) {
};

function loadMeshFromAssets(meshFilename, A, R, N, M) {
    var objLoader, gltfLoader, textureLoader;

    if (typeof THREE.OBJLoader !== "undefined") {
        objLoader = new THREE.OBJLoader( manager );
        objLoader.setPath( '../assets/' );
    }

    if (typeof THREE.GLTFLoader !== "undefined") {
        gltfLoader = new THREE.GLTFLoader( manager );
        gltfLoader.setPath( '../assets/' );
    }

    if (typeof THREE.TextureLoader !== "undefined") {
        textureLoader = new THREE.TextureLoader( manager );
        textureLoader.setPath( '../assets/' );
    }

    var meshLoader;
    if (meshFilename.endsWith('.obj')) meshLoader = objLoader;
    else if (meshFilename.endsWith('.gltf')) meshLoader = gltfLoader;
    if (meshLoader !== undefined) {
        meshLoader.load( meshFilename, function ( group ) {
            var material = new THREE.MeshStandardMaterial();
            material.map = textureLoader.load( A );
            material.roughnessMap = textureLoader.load( R );
            material.metalnessMap = textureLoader.load( N );
            material.normalMap = textureLoader.load( M );

            group.traverse( function ( child ) {

                if ( child instanceof THREE.Mesh ) {

                    child.material = material;
                    // child.material.map = material.map;
                }

            } );

            // group.position.y = - 95;
            scene.add( group );

        }, onProgress, onError );        
    }
}