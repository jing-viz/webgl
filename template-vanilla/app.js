var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
	camera.position.x = 100;
	camera.position.y = 100;
	camera.position.z = 100;

	scene = new THREE.Scene();

	var gridHelper = new THREE.GridHelper(1000, 20);
	scene.add(gridHelper);
	
	geometry = new THREE.BoxGeometry( 10, 10, 10 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

function animate() {

	requestAnimationFrame( animate );
	camera.lookAt(scene.position);

	renderer.render( scene, camera );
}
