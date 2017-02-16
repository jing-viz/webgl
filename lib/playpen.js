var playpen = {};

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
    console.error(xhr);
};

playpen.loadMeshFromFile = function(meshFilename, textureMaps) {
    var meshLoader;
    var hasSceneField = false;

    if (playpen.textureLoader === undefined) {
        playpen.textureLoader = new THREE.TextureLoader( manager );
    }

    if (meshFilename.endsWith('.obj')) {
        if (playpen.objLoader === undefined && typeof THREE.OBJLoader !== "undefined") {
            playpen.objLoader = new THREE.OBJLoader( manager );
        }
        meshLoader = playpen.objLoader;
    }
    else if (meshFilename.endsWith('.gltf')){
        if (playpen.gltfLoader === undefined && typeof THREE.GLTFLoader !== "undefined") {
            playpen.gltfLoader = new THREE.GLTFLoader( manager );
        }
        hasSceneField = true;
        meshLoader = playpen.gltfLoader;
    }
    else if (meshFilename.endsWith('.dae')){
        if (playpen.colladaLoader === undefined && typeof THREE.ColladaLoader !== "undefined") {
            playpen.colladaLoader = new THREE.ColladaLoader();
        }
        hasSceneField = true;
        meshLoader = playpen.colladaLoader;
    }
    else if (meshFilename.endsWith('.babylon')){
        if (playpen.babylonLoader === undefined && typeof THREE.BabylonLoader !== "undefined") {
            playpen.babylonLoader = new THREE.BabylonLoader(manager);
        }
        meshLoader = playpen.babylonLoader;
    }
    else if (meshFilename.endsWith('.pcd')){
        if (playpen.pcdLoader === undefined && typeof THREE.PCDLoader !== "undefined") {
            playpen.pcdLoader = new THREE.PCDLoader(manager);
        }
        meshLoader = playpen.pcdLoader;
    }
    else if (meshFilename.endsWith('.pdb')){
        if (playpen.pdbLoader === undefined && typeof THREE.PDBLoader !== "undefined") {
            playpen.pdbLoader = new THREE.PDBLoader(manager);
        }
        meshLoader = playpen.pdbLoader;
    }
    else if (meshFilename.endsWith('.md2')){
        if (playpen.md2Loader === undefined && typeof THREE.MD2Loader !== "undefined") {
            playpen.md2Loader = new THREE.MD2Loader(manager);
        }
        meshLoader = playpen.md2Loader;
    }
    else if (meshFilename.endsWith('.ply')){
        if (playpen.plyLoader === undefined && typeof THREE.PLYLoader !== "undefined") {
            playpen.plyLoader = new THREE.PLYLoader(manager);
        }
        meshLoader = playpen.plyLoader;
    }
    else if (meshFilename.endsWith('.fbx')){
        if (playpen.fbxLoader === undefined && typeof THREE.FBXLoader !== "undefined") {
            playpen.fbxLoader = new THREE.FBXLoader(manager);
        }
        meshLoader = playpen.fbxLoader;
    }
    else if (meshFilename.endsWith('.bvh')){
        if (playpen.bvhLoader === undefined && typeof THREE.BVHLoader !== "undefined") {
            playpen.bvhLoader = new THREE.BVHLoader(manager);
        }
        meshLoader = playpen.bvhLoader;
    }
    else if (meshFilename.endsWith('.stl')){
        if (playpen.stlLoader === undefined && typeof THREE.STLLoader !== "undefined") {
            playpen.stlLoader = new THREE.STLLoader(manager);
        }
        meshLoader = playpen.stlLoader;
    }
    else if (meshFilename.endsWith('.mmd')){
        if (playpen.mmdLoader === undefined && typeof THREE.MMDLoader !== "undefined") {
            playpen.mmdLoader = new THREE.MMDLoader(manager);
        }
        meshLoader = playpen.mmdLoader;
    }

    if (meshLoader === undefined) {
        console.error("Invalid format: " + meshFilename);
    }

    meshLoader.load( meshFilename, function ( loadedObj ) {
        var object3d = loadedObj;
        if (hasSceneField) {
            object3d = object3d.scene;
        }
        var material = new THREE.MeshStandardMaterial();
        if (typeof textureMaps !== "undefined") {
            if (textureMaps.albedo !== undefined) {
                material.map = playpen.textureLoader.load( textureMaps.albedo );
            }
            if (textureMaps.roughness !== undefined) {
                material.roughnessMap = playpen.textureLoader.load( textureMaps.roughness );
            }
            if (textureMaps.normal !== undefined) {
                material.metalnessMap = playpen.textureLoader.load( textureMaps.normal );
            }
            if (textureMaps.metalness !== undefined) {
                material.normalMap = playpen.textureLoader.load( textureMaps.metalness );
            }
        }
        object3d.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                if (material !== undefined) {
                    child.material = material;
                }
                // child.material.map = material.map;
            }

        } );

        // object3d.position.y = - 95;
        scene.add( object3d );

    }, onProgress, onError );        
}


playpen.App = function( canvas ) {

    var camera, scene, renderer;

    function animate() {

        if ( camera === undefined ) {
            camera = new PerspectiveCamera( 75, canvas.clientWidth / canvas.clientHeight, 1, 1000 );
        }

        if ( scene === undefined ) {
            scene = new Scene(); 
        }

        if ( renderer === undefined ) {
            renderer = new WebGLRenderer( { canvas: canvas, antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( canvas.clientWidth, canvas.clientHeight, false );
        }

        renderer.render( scene, camera );
        requestAnimationFrame( animate );

    }

    requestAnimationFrame( animate );

    return {
        getCamera: function () { return camera; },
        setCamera: function ( value ) { camera = value; },
        getScene: function () { return scene; },
        setScene: function ( value ) { scene = value; },
        getRenderer: function () { return renderer; },
        setRenderer: function ( value ) { renderer = value; }
    }

}
