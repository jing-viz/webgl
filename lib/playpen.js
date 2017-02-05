
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

var playground = {};

function loadMeshFromFile(meshFilename, textureMaps) {
    var meshLoader;
    var hasSceneField = false;

    if (playground.textureLoader === undefined) {
        playground.textureLoader = new THREE.TextureLoader( manager );
    }

    if (meshFilename.endsWith('.obj')) {
        if (playground.objLoader === undefined && typeof THREE.OBJLoader !== "undefined") {
            playground.objLoader = new THREE.OBJLoader( manager );
        }
        meshLoader = playground.objLoader;
    }
    else if (meshFilename.endsWith('.gltf')){
        if (playground.gltfLoader === undefined && typeof THREE.GLTFLoader !== "undefined") {
            playground.gltfLoader = new THREE.GLTFLoader( manager );
        }
        hasSceneField = true;
        meshLoader = playground.gltfLoader;
    }
    else if (meshFilename.endsWith('.dae')){
        if (playground.colladaLoader === undefined && typeof THREE.ColladaLoader !== "undefined") {
            playground.colladaLoader = new THREE.ColladaLoader();
        }
        hasSceneField = true;
        meshLoader = playground.gltfLoader;
    }
    else if (meshFilename.endsWith('.babylon')){
        if (playground.babylonLoader === undefined && typeof THREE.BabylonLoader !== "undefined") {
            playground.babylonLoader = new THREE.BabylonLoader(manager);
        }
        meshLoader = playground.babylonLoader;
    }
    else if (meshFilename.endsWith('.pcd')){
        if (playground.pcdLoader === undefined && typeof THREE.PCDLoader !== "undefined") {
            playground.pcdLoader = new THREE.PCDLoader(manager);
        }
        meshLoader = playground.pcdLoader;
    }
    else if (meshFilename.endsWith('.pdb')){
        if (playground.pdbLoader === undefined && typeof THREE.PDBLoader !== "undefined") {
            playground.pdbLoader = new THREE.PDBLoader(manager);
        }
        meshLoader = playground.pdbLoader;
    }
    else if (meshFilename.endsWith('.md2')){
        if (playground.md2Loader === undefined && typeof THREE.MD2Loader !== "undefined") {
            playground.md2Loader = new THREE.MD2Loader(manager);
        }
        meshLoader = playground.md2Loader;
    }
    else if (meshFilename.endsWith('.ply')){
        if (playground.plyLoader === undefined && typeof THREE.PLYLoader !== "undefined") {
            playground.plyLoader = new THREE.PLYLoader(manager);
        }
        meshLoader = playground.plyLoader;
    }
    else if (meshFilename.endsWith('.fbx')){
        if (playground.fbxLoader === undefined && typeof THREE.FBXLoader2 !== "undefined") {
            playground.fbxLoader = new THREE.FBXLoader2(manager);
        }
        meshLoader = playground.fbxLoader;
    }
    else if (meshFilename.endsWith('.bvh')){
        if (playground.bvhLoader === undefined && typeof THREE.BVHLoader !== "undefined") {
            playground.bvhLoader = new THREE.BVHLoader(manager);
        }
        meshLoader = playground.bvhLoader;
    }
    else if (meshFilename.endsWith('.stl')){
        if (playground.stlLoader === undefined && typeof THREE.STLLoader !== "undefined") {
            playground.stlLoader = new THREE.STLLoader(manager);
        }
        meshLoader = playground.stlLoader;
    }
    else if (meshFilename.endsWith('.mmd')){
        if (playground.mmdLoader === undefined && typeof THREE.MMDLoader !== "undefined") {
            playground.mmdLoader = new THREE.MMDLoader(manager);
        }
        meshLoader = playground.mmdLoader;
    }

    if (meshLoader !== undefined) {
        meshLoader.load( meshFilename, function ( loadedObj ) {
            var object3d = loadedObj;
            if (hasSceneField) {
                object3d = object3d.scene;
            }
            var material = new THREE.MeshStandardMaterial();
            if (typeof textureMaps !== "undefined") {
                if (textureMaps.albedo !== undefined) {
                    material.map = playground.textureLoader.load( textureMaps.albedo );
                }
                if (textureMaps.roughness !== undefined) {
                    material.roughnessMap = playground.textureLoader.load( textureMaps.roughness );
                }
                if (textureMaps.normal !== undefined) {
                    material.metalnessMap = playground.textureLoader.load( textureMaps.normal );
                }
                if (textureMaps.metalness !== undefined) {
                    material.normalMap = playground.textureLoader.load( textureMaps.metalness );
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
}