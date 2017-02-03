
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var statsEnabled = true;

var container, stats, loader;

var camera, scene, renderer;

var controls;

var mesh;

var spotLight;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	//

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 1000 );
	camera.position.z = 2;

	controls = new THREE.TrackballControls( camera );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x202020 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 3;

	var textureCube = new THREE.CubeTextureLoader()
		.setPath( 'textures/cube/pisa/' )
		.load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );

	scene = new THREE.Scene();
	scene.background = textureCube;

	// LIGHTS

	scene.add( new THREE.HemisphereLight( 0x443333, 0x222233, 4 ) );

	//

	var path = 'models/obj/cerberus/';

	var loader = new THREE.OBJLoader();
	var material = new THREE.MeshStandardMaterial();
	loader.load( path + 'Cerberus.obj', function ( group ) {

		// var material = new THREE.MeshBasicMaterial( { wireframe: true } );

		var loader = new THREE.TextureLoader();

		material.roughness = 1;
		material.metalness = 1;

		material.map = loader.load( path + 'Cerberus_A.jpg' );
		// roughness is in G channel, metalness is in B channel 
		material.metalnessMap = material.roughnessMap = loader.load( path + 'Cerberus_RM.jpg' );
		material.normalMap = loader.load( path + 'Cerberus_N.jpg' );

		material.map.wrapS = THREE.RepeatWrapping;
		material.roughnessMap.wrapS = THREE.RepeatWrapping;
		material.metalnessMap.wrapS = THREE.RepeatWrapping;
		material.normalMap.wrapS = THREE.RepeatWrapping;

		group.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = material;

			}

		} );

		group.position.x = - 0.45;
		group.rotation.y = - Math.PI / 2;
		scene.add( group );

	} );

	var genCubeUrls = function( prefix, postfix ) {
		return [
			prefix + 'px' + postfix, prefix + 'nx' + postfix,
			prefix + 'py' + postfix, prefix + 'ny' + postfix,
			prefix + 'pz' + postfix, prefix + 'nz' + postfix
		];
	};

	var hdrUrls = genCubeUrls( './textures/cube/pisaHDR/', '.hdr' );
	new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrUrls, function ( hdrCubeMap ) {

		var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
		pmremGenerator.update( renderer );

		var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
		pmremCubeUVPacker.update( renderer );

		hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

		material.envMap = hdrCubeRenderTarget.texture;
		material.needsUpdate = true;

	} );

	//

	if ( statsEnabled ) {

		stats = new Stats();
		container.appendChild( stats.dom );

	}

	window.addEventListener( 'resize', onWindowResize, false );

}

//

function onWindowResize( event ) {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

}

//

function animate() {

	requestAnimationFrame( animate );

	controls.update();

	renderer.render( scene, camera );

	if ( statsEnabled ) stats.update();

}
