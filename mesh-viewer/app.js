var container;

var camera, scene, renderer;
var controls;
var stats;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

setup();
draw();

function setup() {

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    stats = new Stats();
    container.appendChild( stats.dom );

    // scene
    scene = new THREE.Scene();

    // lights

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );
                
    if (false) {
        playpen.loadMeshFromFile('../assets/mesh/cerberus/Cerberus.obj', {
                            'albedo': '../assets/mesh/cerberus/Cerberus_A.jpg',
                            'roughness': '../assets/mesh/cerberus/Cerberus_R.jpg',
                            'metalness': '../assets/mesh/cerberus/Cerberus_M.jpg',
                            'normal': '../assets/mesh/cerberus/Cerberus_N.jpg'
                        });
    }
    else {
        // loadMeshFromFile('../assets/mesh/duck/duck.gltf');
        playpen.loadMeshFromFile('../assets/mesh/astroboy_walk.dae/astroboy_walk.dae', {
                        'albedo': '../assets/mesh/astroboy_walk.dae/seymour.jpg'
                    });
    }

    //
    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


//

function draw() {

    requestAnimationFrame( draw );

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    stats.update();

    renderer.render( scene, camera );
}
