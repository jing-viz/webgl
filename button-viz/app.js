var container = document.getElementById( 'container' );

var renderer, scene, camera, clock = new THREE.Clock(), fov = 50;
var mesh;
var controls;
var move = false;
var gui, guiElements = [];

var param = { example: 'translucent' };

var brick = new THREE.TextureLoader().load( '../assets/texture/brick_diffuse.jpg' );
var grass = new THREE.TextureLoader().load( '../assets/mesh/button/button.png' );
var grassNormal = new THREE.TextureLoader().load( '../assets/texture/terrain/grasslight-big-nm.jpg' );

var decalDiffuse = new THREE.TextureLoader().load( '../assets/texture/decal/decal-diffuse.png' );
// var decalDiffuse = new THREE.TextureLoader().load( 'obj/button/button.png' );
decalDiffuse.wrapS = decalDiffuse.wrapT = THREE.RepeatWrapping;

var cloud = new THREE.TextureLoader().load( '../assets/texture/lava/cloud.png' );
cloud.wrapS = cloud.wrapT = THREE.RepeatWrapping;

var cubemap = function() {

	var path = "../assets/texture/skybox/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = new THREE.CubeTextureLoader().load( urls );
	textureCube.format = THREE.RGBFormat;

	return textureCube;

}();

window.addEventListener( 'load', init );

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.x = 50;
	camera.position.z = - 50;
	camera.position.y = 30;
	camera.target = new THREE.Vector3();

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.minDistance = 50;
	controls.maxDistance = 200;

	scene.add( new THREE.AmbientLight( 0x464646 ) );

	var light = new THREE.DirectionalLight( 0xffddcc, 1 );
	light.position.set( 1, 0.75, 0.5 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xccccff, 1 );
	light.position.set( - 1, 0.75, - 0.5 );
	scene.add( light );

	// Skybox

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = cubemap;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide

	} );

	var skybox = new THREE.Mesh( new THREE.BoxGeometry( 100000, 100000, 100000 ), material );
	scene.add( skybox );

	var loader = new THREE.OBJLoader();
	loader.load( '../assets/mesh/button/button.obj', function ( object ) {

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				// child.material.map = texture;

			}

		} );
		// object.position.y = - 95;
		mesh = object;
		mesh.scale.setScalar(10);
		scene.add( mesh );


		updateMaterial();

	});

	window.addEventListener( 'resize', onWindowResize, false );


	onWindowResize();
	animate();

}

function clearGui() {

	if ( gui ) gui.destroy();

	gui = new dat.GUI();

	var example = gui.add( param, 'example', {
		'basic / standard (PBR)': 'standard',
		'basic / phong': 'phong',
		'basic / layers': 'layers',
		'basic / rim': 'rim',
		'adv / fresnel': 'fresnel',
		'adv / saturation': 'saturation',
		'adv / top-bottom': 'top-bottom',
		'adv / caustic': 'caustic',
		'adv / displace': 'displace',
		'adv / camera-depth': 'camera-depth',
		'adv / soft-body': 'soft-body',
		'adv / wave': 'wave',
		'adv / sss' : 'sss',
		'adv / translucent' : 'translucent',
		'misc / smoke' : 'smoke',
		'misc / firefly' : 'firefly'
	} ).onFinishChange( function() {

		updateMaterial();

	} );

	gui.open();

	// XXX: hide gui panel
	gui.__proto__.constructor.toggleHide()
}

function addGui( name, value, callback, isColor, min, max ) {

	var node;

	param[ name ] = value;

	if ( isColor ) {

		node = gui.addColor( param, name ).onChange( function() {

			callback( param[ name ] );

		} );

	}
	else if (typeof value == 'object') {

		node = gui.add( param, name, value ).onChange( function() {

			callback( param[ name ] );

		} );

	}
	else {

		node = gui.add( param, name, min, max ).onChange( function() {

			callback( param[ name ] );

		} );

	}

	return node;

}

function updateMaterial() {

	move = false;

	if ( mesh.material ) mesh.material.dispose();

	var name = param.example;
	var mtl;

	clearGui();

	switch ( name ) {

		case 'phong':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			//mtl.color = // albedo color
			//mtl.alpha = // opacity (0 at 1)
			//mtl.specular = // specular color
			//mtl.shininess = // shininess (float)
			//mtl.normal = // normalmap
			//mtl.normalScale = // normalmap scale
			//mtl.emissive = // emissive color
			//mtl.ambient = // ambient color
			//mtl.shadow = // shadowmap
			//mtl.ao = // ambient occlusion
			//mtl.environment = // reflection map (CubeMap recommended)
			//mtl.environmentAlpha = // environment alpha
			//mtl.transform = // vertex transformation

			var mask = new THREE.SwitchNode( new THREE.TextureNode( decalDiffuse ), 'w' );

			mtl.color = new THREE.TextureNode( grass );
			mtl.specular = new THREE.FloatNode( .5 );
			mtl.shininess = new THREE.FloatNode( 15 );
			mtl.environment = new THREE.CubeTextureNode( cubemap );
			mtl.environmentAlpha = mask;
			mtl.normal = new THREE.TextureNode( grassNormal );
			mtl.normalScale = new THREE.Math1Node( mask, THREE.Math1Node.INVERT );

			break;

		case 'standard':

			// MATERIAL

			mtl = new THREE.StandardNodeMaterial();

			//mtl.color = // albedo color
			//mtl.alpha = // opacity (0 at 1)
			//mtl.roughness = // roughness (float)
			//mtl.metalness = // metalness (float)
			//mtl.normal = // normalmap
			//mtl.normalScale = // normalmap scale
			//mtl.emissive = // emissive color
			//mtl.ambient = // ambient color
			//mtl.shadow = // shadowmap
			//mtl.ao = // ambient occlusion
			//mtl.environment = // reflection map (CubeMap recommended)
			//mtl.environmentAlpha = // environment alpha
			//mtl.transform = // vertex transformation

			var mask = new THREE.SwitchNode( new THREE.TextureNode( decalDiffuse ), 'w' );

			var normalScale = new THREE.FloatNode( .3 );

			var roughnessA = new THREE.FloatNode( .5 );
			var metalnessA = new THREE.FloatNode( .5 );

			var roughnessB = new THREE.FloatNode( 0 );
			var metalnessB = new THREE.FloatNode( 1 );

			var roughness = new THREE.Math3Node(
				roughnessA,
				roughnessB,
				mask,
				THREE.Math3Node.MIX
			);

			var metalness = new THREE.Math3Node(
				metalnessA,
				metalnessB,
				mask,
				THREE.Math3Node.MIX
			);

			var normalMask = new THREE.OperatorNode(
				new THREE.Math1Node( mask, THREE.Math1Node.INVERT ),
				normalScale,
				THREE.OperatorNode.MUL
			);

			// mtl.color = new THREE.ColorNode( 0xFFFFFF );
			mtl.color = new THREE.TextureNode( grass );
			// mtl.alpha = 0.5;
			mtl.roughness = roughness;
			mtl.metalness = metalness;
			mtl.environment = new THREE.CubeTextureNode( cubemap );
			mtl.normal = new THREE.TextureNode( grassNormal );
			mtl.normalScale = normalMask;

			// GUI

			// addGui( 'color', mtl.color.value.getHex(), function( val ) {

			// 	mtl.color.value.setHex( val );

			// }, true );

			addGui( 'roughnessA', roughnessA.number, function( val ) {

				 roughnessA.number = val;

			}, false, 0, 1 );

			addGui( 'metalnessA', metalnessA.number, function( val ) {

				metalnessA.number = val;

			}, false, 0, 1 );

			addGui( 'roughnessB', roughnessB.number, function( val ) {

				 roughnessB.number = val;

			}, false, 0, 1 );

			addGui( 'metalnessB', metalnessB.number, function( val ) {

				metalnessB.number = val;

			}, false, 0, 1 );

			addGui( 'normalScale', normalScale.number, function( val ) {

				normalScale.number = val;

			}, false, 0, 1 );

			break;

		case 'wave':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var time = new THREE.TimerNode();
			var speed = new THREE.FloatNode( 5 );
			var scale = new THREE.FloatNode( 1 );
			var worldScale = new THREE.FloatNode( .4 );
			var colorA = new THREE.ColorNode( 0xFFFFFF );
			var colorB = new THREE.ColorNode( 0x0054df );

			var uv = new THREE.UVNode();

			var timeScale = new THREE.OperatorNode(
				time,
				speed,
				THREE.OperatorNode.MUL
			);

			var worldScl = new THREE.OperatorNode(
				new THREE.PositionNode(),
				worldScale,
				THREE.OperatorNode.MUL
			);

			var posContinuous = new THREE.OperatorNode(
				worldScl,
				timeScale,
				THREE.OperatorNode.ADD
			);

			var wave = new THREE.Math1Node( posContinuous, THREE.Math1Node.SIN );
			wave = new THREE.SwitchNode( wave, 'x' );

			var waveScale = new THREE.OperatorNode(
				wave,
				scale,
				THREE.OperatorNode.MUL
			);

			var displaceY = new THREE.JoinNode(
				new THREE.FloatNode(),
				waveScale,
				new THREE.FloatNode()
			);

			var displace = new THREE.OperatorNode(
				new THREE.NormalNode(),
				displaceY,
				THREE.OperatorNode.MUL
			);

			var blend = new THREE.OperatorNode(
				new THREE.PositionNode(),
				displaceY,
				THREE.OperatorNode.ADD
			);

			var color = new THREE.Math3Node(
				colorB,
				colorA,
				wave,
				THREE.Math3Node.MIX
			);

			mtl.color = color;
			mtl.transform = blend;

			// GUI

			addGui( 'speed', speed.number, function( val ) {

				speed.number = val;

			}, false, 0, 10 );

			addGui( 'scale', scale.number, function( val ) {

				scale.number = val;

			}, false, 0, 3 );

			addGui( 'worldScale', worldScale.number, function( val ) {

				worldScale.number = val;

			}, false, 0, 1 );

			addGui( 'colorA', colorA.value.getHex(), function( val ) {

				colorA.value.setHex( val );

			}, true );

			addGui( 'colorB', colorB.value.getHex(), function( val ) {

				colorB.value.setHex( val );

			}, true );

			addGui( 'useNormals', false, function( val ) {

				blend.b = val ? displace : displaceY;

				mtl.build();

			} );

			break;

		case 'rim':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var intensity = 1.3;
			var power = new THREE.FloatNode( 3 );
			var color = new THREE.ColorNode( 0xFFFFFF );

			var viewZ = new THREE.Math2Node(
				new THREE.NormalNode( THREE.NormalNode.VIEW ),
				new THREE.Vector3Node( 0, 0, - intensity ),
				THREE.Math2Node.DOT
			);

			var rim = new THREE.OperatorNode(
				viewZ,
				new THREE.FloatNode( intensity ),
				THREE.OperatorNode.ADD
			);

			var rimPower = new THREE.Math2Node(
				rim,
				power,
				THREE.Math2Node.POW
			);

			var rimColor = new THREE.OperatorNode(
				rimPower,
				color,
				THREE.OperatorNode.MUL
			);

			mtl.color = new THREE.ColorNode( 0x111111 );
			mtl.emissive = rimColor;

			// GUI

			addGui( 'color', color.value.getHex(), function( val ) {

				color.value.setHex( val );

			}, true );

			addGui( 'intensity', intensity, function( val ) {

				intensity = val;

				viewZ.b.z = - intensity;
				rim.b.number = intensity;


			}, false, 0, 3 );

			addGui( 'power', power.number, function( val ) {

				power.number = val;

			}, false, 0, 6 );

			addGui( 'xray', false, function( val ) {

				if ( val ) {

					mtl.emissive = color;
					mtl.alpha = rimPower;
					mtl.blending = THREE.AdditiveBlending;
					mtl.depthWrite = false;

				}
				else {

					mtl.emissive = rimColor;
					mtl.alpha = null;
					mtl.blending = THREE.NormalBlending;
					mtl.depthWrite = true;

				}

				mtl.build();

			} );

			break;

		case 'fresnel':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var reflectance = new THREE.FloatNode( 1.3 );
			var power = new THREE.FloatNode( 1 );
			var color = new THREE.CubeTextureNode( cubemap );

			var viewZ = new THREE.Math2Node(
				new THREE.NormalNode( THREE.NormalNode.VIEW ),
				new THREE.Vector3Node( 0, 0, - 1 ),
				THREE.Math2Node.DOT
			);

			var theta = new THREE.OperatorNode(
				viewZ,
				new THREE.FloatNode( 1 ),
				THREE.OperatorNode.ADD
			);

			var thetaPower = new THREE.Math2Node(
				theta,
				power,
				THREE.Math2Node.POW
			);

			var fresnel = new THREE.OperatorNode(
				reflectance,
				thetaPower,
				THREE.OperatorNode.MUL
			);

			mtl.color = new THREE.ColorNode( 0x3399FF );
			mtl.environment = color;
			mtl.environmentAlpha = new THREE.Math1Node( fresnel, THREE.Math1Node.SAT );

			// GUI

			addGui( 'reflectance', reflectance.number, function( val ) {

				reflectance.number = val;

			}, false, 0, 3 );

			addGui( 'power', power.number, function( val ) {

				power.number = val;

			}, false, 0, 5 );

			break;

		case 'layers':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var tex1 = new THREE.TextureNode( grass );
			var tex2 = new THREE.TextureNode( brick );

			var offset = new THREE.FloatNode( 0 );
			var scale = new THREE.FloatNode( 1 );
			var uv = new THREE.UVNode();

			var uvOffset = new THREE.OperatorNode(
				offset,
				uv,
				THREE.OperatorNode.ADD
			);

			var uvScale = new THREE.OperatorNode(
				uvOffset,
				scale,
				THREE.OperatorNode.MUL
			);

			var mask = new THREE.TextureNode( decalDiffuse, uvScale );
			var maskAlphaChannel = new THREE.SwitchNode( mask, 'w' );

			var blend = new THREE.Math3Node(
				tex1,
				tex2,
				maskAlphaChannel,
				THREE.Math3Node.MIX
			);

			mtl.color = blend;

			// GUI

			addGui( 'offset', offset.number, function( val ) {

				offset.number = val;

			}, false, 0, 1 );

			addGui( 'scale', scale.number, function( val ) {

				scale.number = val;

			}, false, 0, 10 );

			break;

		case 'saturation':

			// MATERIAL

			mtl = new THREE.StandardNodeMaterial();

			var tex = new THREE.TextureNode( brick );
			var sat = new THREE.FloatNode( 0 );

			var satrgb = new THREE.FunctionNode( [
			"vec3 satrgb(vec3 rgb, float adjustment) {",
				//"const vec3 W = vec3(0.2125, 0.7154, 0.0721);", // LUMA
				"vec3 intensity = vec3(dot(rgb, LUMA));",
				"return mix(intensity, rgb, adjustment);",
			"}"
			].join( "\n" ) );

			var saturation = new THREE.FunctionCallNode( satrgb );
			saturation.inputs.rgb = tex;
			saturation.inputs.adjustment = sat;

			// or try

			//saturation.inputs[0] = tex;
			//saturation.inputs[1] = sat;

			mtl.color = saturation;
			mtl.environment = new THREE.CubeTextureNode( cubemap ); // optional

			// GUI

			addGui( 'saturation', sat.number, function( val ) {

				sat.number = val;

			}, false, 0, 2 );

			break;

		case 'top-bottom':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var top = new THREE.TextureNode( grass );
			var bottom = new THREE.TextureNode( brick );

			var normal = new THREE.NormalNode( THREE.NormalNode.WORLD );
			var normalY = new THREE.SwitchNode( normal, 'y' );

			var hard = new THREE.FloatNode( 9 );
			var offset = new THREE.FloatNode( - 2.5 );

			var hardClamp = new THREE.OperatorNode(
				normalY,
				hard,
				THREE.OperatorNode.MUL
			);

			var offsetClamp = new THREE.OperatorNode(
				hardClamp,
				offset,
				THREE.OperatorNode.ADD
			);

			var clamp0at1 = new THREE.Math1Node( offsetClamp, THREE.Math1Node.SAT );

			var blend = new THREE.Math3Node( top, bottom, clamp0at1, THREE.Math3Node.MIX );

			mtl.color = blend;

			// GUI

			addGui( 'hard', hard.number, function( val ) {

				hard.number = val;

			}, false, 0, 20 );

			addGui( 'offset', offset.number, function( val ) {

				offset.number = val;

			}, false, - 10, 10 );

			break;

		case 'displace':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var time = new THREE.TimerNode();
			var scale = new THREE.FloatNode( 2 );
			var speed = new THREE.FloatNode( .2 );
			var colorA = new THREE.ColorNode( 0xFFFFFF );
			var colorB = new THREE.ColorNode( 0x0054df );

			var uv = new THREE.UVNode();

			var timeScl = new THREE.OperatorNode(
				time,
				speed,
				THREE.OperatorNode.MUL
			);

			var displaceOffset = new THREE.OperatorNode(
				timeScl,
				uv,
				THREE.OperatorNode.ADD
			);

			var tex = new THREE.TextureNode( cloud, displaceOffset );
			var texArea = new THREE.SwitchNode( tex, 'w' );

			var displace = new THREE.OperatorNode(
				new THREE.NormalNode(),
				texArea,
				THREE.OperatorNode.MUL
			);

			var displaceScale = new THREE.OperatorNode(
				displace,
				scale,
				THREE.OperatorNode.MUL
			);

			var blend = new THREE.OperatorNode(
				new THREE.PositionNode(),
				displaceScale,
				THREE.OperatorNode.ADD
			);

			var color = new THREE.Math3Node(
				colorB,
				colorA,
				texArea,
				THREE.Math3Node.MIX
			);

			mtl.color = mtl.specular = new THREE.ColorNode( 0 );
			mtl.emissive = color;
			mtl.transform = blend;

			// GUI

			addGui( 'speed', speed.number, function( val ) {

				speed.number = val;

			}, false, 0, 1 );

			addGui( 'scale', scale.number, function( val ) {

				scale.number = val;

			}, false, 0, 10 );

			addGui( 'colorA', colorA.value.getHex(), function( val ) {

				colorA.value.setHex( val );

			}, true );

			addGui( 'colorB', colorB.value.getHex(), function( val ) {

				colorB.value.setHex( val );

			}, true );

			break;

		case 'smoke':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var time = new THREE.TimerNode();
			var uv = new THREE.UVNode();

			var timeSpeedA = new THREE.OperatorNode(
				time,
				new THREE.Vector2Node( 0.3, 0.1 ),
				THREE.OperatorNode.MUL
			);

			var timeSpeedB = new THREE.OperatorNode(
				time,
				new THREE.Vector2Node( 0.15, 0.4 ),
				THREE.OperatorNode.MUL
			);

			var uvOffsetA = new THREE.OperatorNode(
				timeSpeedA,
				uv,
				THREE.OperatorNode.ADD
			);

			var uvOffsetB = new THREE.OperatorNode(
				timeSpeedB,
				uv,
				THREE.OperatorNode.ADD
			);

			var cloudA = new THREE.TextureNode( cloud, uvOffsetA );
			var cloudB = new THREE.TextureNode( cloud, uvOffsetB );

			var clouds = new THREE.OperatorNode(
				cloudA,
				cloudB,
				THREE.OperatorNode.ADD
			);

			mtl.environment = new THREE.ColorNode( 0xFFFFFF );
			mtl.alpha = clouds;

			// GUI

			addGui( 'color', mtl.environment.value.getHex(), function( val ) {

				mtl.environment.value.setHex( val );

			}, true );

			break;

		case 'camera-depth':

			// MATERIAL

			var colorA = new THREE.ColorNode( 0xFFFFFF );
			var colorB = new THREE.ColorNode( 0x0054df );

			var depth = new THREE.CameraNode( THREE.CameraNode.DEPTH );
			depth.near.number = 1;
			depth.far.number = 200;

			var colors = new THREE.Math3Node(
				colorB,
				colorA,
				depth,
				THREE.Math3Node.MIX
			);

			mtl = new THREE.PhongNodeMaterial();
			mtl.color = colors;

			// GUI

			addGui( 'near', depth.near.number, function( val ) {

				depth.near.number = val;

			}, false, 1, 1200 );

			addGui( 'far', depth.far.number, function( val ) {

				depth.far.number = val;

			}, false, 1, 1200 );

			addGui( 'nearColor', colorA.value.getHex(), function( val ) {

				colorA.value.setHex( val );

			}, true );

			addGui( 'farColor', colorB.value.getHex(), function( val ) {

				colorB.value.setHex( val );

			}, true );

			break;

		case 'caustic':

			// MATERIAL

			mtl = new THREE.StandardNodeMaterial();

			var hash2 = new THREE.FunctionNode( [
			"vec2 hash2(vec2 p) {",
				"return fract(sin(vec2(dot(p, vec2(123.4, 748.6)), dot(p, vec2(547.3, 659.3))))*5232.85324);",
			"}"
			].join( "\n" ) );

			var voronoi = new THREE.FunctionNode( [
			// Based off of iq's described here: http://www.iquilezles.org/www/articles/voronoili
			"float voronoi(vec2 p, in float time) {",
				"vec2 n = floor(p);",
				"vec2 f = fract(p);",
				"float md = 5.0;",
				"vec2 m = vec2(0.0);",
				"for (int i = -1; i <= 1; i++) {",
					"for (int j = -1; j <= 1; j++) {",
						"vec2 g = vec2(i, j);",
						"vec2 o = hash2(n + g);",
						"o = 0.5 + 0.5 * sin(time + 5.038 * o);",
						"vec2 r = g + o - f;",
						"float d = dot(r, r);",
						"if (d < md) {",
							"md = d;",
							"m = n+g+o;",
						"}",
					"}",
				"}",
				"return md;",
			"}"
			].join( "\n" ), [ hash2 ] ); // define hash2 as dependencies

			var voronoiLayers = new THREE.FunctionNode( [
			// based on https://www.shadertoy.com/view/4tXSDf
			"float voronoiLayers(vec2 p, in float time) {",
				"float v = 0.0;",
				"float a = 0.4;",
				"for (int i = 0; i < 3; i++) {",
					"v += voronoi(p, time) * a;",
					"p *= 2.0;",
					"a *= 0.5;",
				"}",
				"return v;",
			"}"
			].join( "\n" ), [ voronoi ] ); // define voronoi as dependencies

			var time = new THREE.TimerNode();
			var timeScale = new THREE.FloatNode( 2 );

			var alpha = new THREE.FloatNode( 1 );
			var scale = new THREE.FloatNode( .1 );
			var intensity = new THREE.FloatNode( 1.5 );

			var color = new THREE.ColorNode( 0xFFFFFF );
			var colorA = new THREE.ColorNode( 0xFFFFFF );
			var colorB = new THREE.ColorNode( 0x0054df );

			var worldPos = new THREE.PositionNode( THREE.PositionNode.WORLD );
			var worldPosTop = new THREE.SwitchNode( worldPos, 'xz' );

			var worldNormal = new THREE.NormalNode( THREE.NormalNode.WORLD );

			var mask = new THREE.SwitchNode( worldNormal, 'y' );

			// clamp0at1
			mask = new THREE.Math1Node( mask, THREE.Math1Node.SAT );

			var timeOffset = new THREE.OperatorNode(
				time,
				timeScale,
				THREE.OperatorNode.MUL
			);

			var uvPos = new THREE.OperatorNode(
				worldPosTop,
				scale,
				THREE.OperatorNode.MUL
			);

			var voronoi = new THREE.FunctionCallNode( voronoiLayers );
			voronoi.inputs.p = uvPos;
			voronoi.inputs.time = timeOffset;

			var maskCaustic = new THREE.OperatorNode(
				alpha,
				mask,
				THREE.OperatorNode.MUL
			);

			var voronoiIntensity = new THREE.OperatorNode(
				voronoi,
				intensity,
				THREE.OperatorNode.MUL
			);

			var voronoiColors = new THREE.Math3Node(
				colorB,
				colorA,
				new THREE.Math1Node( voronoiIntensity, THREE.Math1Node.SAT ), // mix needs clamp
				THREE.Math3Node.MIX
			);

			var caustic = new THREE.Math3Node(
				color,
				voronoiColors,
				maskCaustic,
				THREE.Math3Node.MIX
			);

			var causticLights = new THREE.OperatorNode(
				voronoiIntensity,
				maskCaustic,
				THREE.OperatorNode.MUL
			);

			mtl.color = caustic;
			mtl.ambient = causticLights;

			// GUI

			addGui( 'timeScale', timeScale.number, function( val ) {

				timeScale.number = val;

			}, false, 0, 5 );

			addGui( 'intensity', intensity.number, function( val ) {

				intensity.number = val;

			}, false, 0, 3 );

			addGui( 'scale', scale.number, function( val ) {

				scale.number = val;

			}, false, 0, 1 );

			addGui( 'alpha', alpha.number, function( val ) {

				alpha.number = val;

			}, false, 0, 1 );

			addGui( 'color', color.value.getHex(), function( val ) {

				color.value.setHex( val );

			}, true );

			addGui( 'colorA', colorA.value.getHex(), function( val ) {

				colorA.value.setHex( val );

			}, true );

			addGui( 'colorB', colorB.value.getHex(), function( val ) {

				colorB.value.setHex( val );

			}, true );

			break;

		case 'soft-body':

			// MATERIAL

			move = true;

			mtl = new THREE.StandardNodeMaterial();

			var scale = new THREE.FloatNode( 2 );
			var colorA = new THREE.ColorNode( 0xFF6633 );
			var colorB = new THREE.ColorNode( 0x3366FF );

			var pos = new THREE.PositionNode();
			var posNorm = new THREE.Math1Node( pos, THREE.Math1Node.NORMALIZE );

			var mask = new THREE.SwitchNode( posNorm, 'y' );

			var velocity = new THREE.VelocityNode( mesh, {
				type: 'elastic',
				spring: .8,
				friction: .9
			} );

			var velocityArea = new THREE.OperatorNode(
				mask,
				scale,
				THREE.OperatorNode.MUL
			);

			var softVelocity = new THREE.OperatorNode(
				velocity,
				velocityArea,
				THREE.OperatorNode.MUL
			);

			var softPosition = new THREE.OperatorNode(
				new THREE.PositionNode(),
				softVelocity,
				THREE.OperatorNode.ADD
			);

			var colors = new THREE.Math3Node(
				colorB,
				colorA,
				mask,
				THREE.Math3Node.MIX
			);

			mtl.color = colors;
			mtl.transform = softPosition;

			// GUI

			addGui( 'spring', velocity.params.spring, function( val ) {

				velocity.params.spring = val;

			}, false, 0, .9 );

			addGui( 'friction', velocity.params.friction, function( val ) {

				velocity.params.friction = val;

			}, false, 0, .9 );

			addGui( 'scale', scale.number, function( val ) {

				scale.number = val;

			}, false, 0, 3 );

			addGui( 'softBody', colorA.value.getHex(), function( val ) {

				colorA.value.setHex( val );

			}, true );

			addGui( 'hardBody', colorB.value.getHex(), function( val ) {

				colorB.value.setHex( val );

			}, true );

			break;

		case 'firefly':

			// MATERIAL

			mtl = new THREE.PhongNodeMaterial();

			var time = new THREE.TimerNode();
			var speed = new THREE.FloatNode( .5 );

			var color = new THREE.ColorNode( 0x98ff00 );

			var timeSpeed = new THREE.OperatorNode(
				time,
				speed,
				THREE.OperatorNode.MUL
			);

			var sinCycleInSecs = new THREE.OperatorNode(
				timeSpeed,
				new THREE.ConstNode( THREE.ConstNode.PI2 ),
				THREE.OperatorNode.MUL
			);

			var cycle = new THREE.Math1Node( sinCycleInSecs, THREE.Math1Node.SIN );

			var cycleColor = new THREE.OperatorNode(
				cycle,
				color,
				THREE.OperatorNode.MUL
			);

			var cos = new THREE.Math1Node( cycleColor, THREE.Math1Node.SIN );

			mtl.color = new THREE.ColorNode( 0 );
			mtl.emissive = cos;

			// GUI

			addGui( 'speed', speed.number, function( val ) {

				speed.number = val;

			}, false, 0, 3 );

			break;

	case 'sss':
	case 'translucent':

		// DISTANCE FORMULA

		var modelPos = new THREE.Vector3Node();

		var viewPos = new THREE.PositionNode( THREE.PositionNode.VIEW );
		var cameraPosition = new THREE.CameraNode( THREE.CameraNode.POSITION );

		var cameraDistance = new THREE.Math2Node(
			modelPos,
			cameraPosition,
			THREE.Math2Node.DISTANCE
		);

		var viewPosZ = new THREE.SwitchNode( viewPos, 'z' );

		var distance = new THREE.OperatorNode(
			cameraDistance,
			viewPosZ,
			THREE.OperatorNode.SUB
		);

		var distanceRadius = new THREE.OperatorNode(
			distance,
			new THREE.FloatNode( 70 ),
			THREE.OperatorNode.ADD
		);

		var objectDepth = new THREE.Math3Node(
			distanceRadius,
			new THREE.FloatNode( 0 ),
			new THREE.FloatNode( 50 ),
			THREE.Math3Node.SMOOTHSTEP
		);

		// RTT ( get back distance )

		rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

		var distanceMtl = new THREE.PhongNodeMaterial();
		distanceMtl.environment = objectDepth;
		distanceMtl.side = THREE.BackSide;
		distanceMtl.build();

		rtMaterial = distanceMtl;

		// MATERIAL

		mtl = new THREE.StandardNodeMaterial();

		var backSideDepth = new THREE.TextureNode( rtTexture, new THREE.ScreenUVNode( new THREE.ResolutionNode( renderer ) ) );

		var difference = new THREE.OperatorNode(
			objectDepth,
			backSideDepth,
			THREE.OperatorNode.SUB
		);

		var sss = new THREE.Math3Node(
			new THREE.FloatNode( - .1 ),
			new THREE.FloatNode( .5 ),
			difference,
			THREE.Math3Node.SMOOTHSTEP
		);

		var sssAlpha = new THREE.Math1Node( sss, THREE.Math1Node.SAT );

		var frontColor = new THREE.ColorNode( 0x0c0504 );
		var backColor = new THREE.ColorNode( 0x341b27 );

		if ( name == 'sss' ) {

			var sssOut = new THREE.Math2Node(
				objectDepth,
				sssAlpha,
				THREE.Math2Node.MIN
			);

			var color = new THREE.Math3Node(
				backColor,
				frontColor,
				sssOut,
				THREE.Math3Node.MIX
			);

			var light = new THREE.OperatorNode(
				new THREE.LightNode(),
				color,
				THREE.OperatorNode.ADD
			);

			mtl.color = frontColor;

			mtl.light = light;
			mtl.environment = color;

		}
		else {

			var color = new THREE.Math3Node(
				frontColor,
				backColor,
				sssAlpha,
				THREE.Math3Node.MIX
			);

			var light = new THREE.OperatorNode(
				new THREE.LightNode(),
				color,
				THREE.OperatorNode.ADD
			);

			mtl.color = new THREE.ColorNode( 0xffffff );

			mtl.light = light;
			mtl.environment = color;

		}

		mtl.roughness = new THREE.FloatNode( .1 );
		mtl.metalness = new THREE.FloatNode( .5 );

		// GUI
		addGui( 'roughness', mtl.roughness.number, function( val ) {

			 mtl.roughness.number = val;

		}, false, 0, 1 );

		addGui( 'metalness', mtl.metalness.number, function( val ) {

			mtl.metalness.number = val;

		}, false, 0, 1 );


		addGui( 'frontColor', frontColor.value.getHex(), function( val ) {

			frontColor.value.setHex( val );

		}, true );

		addGui( 'backColor', backColor.value.getHex(), function( val ) {

			backColor.value.setHex( val );

		}, true );

		addGui( 'area', sss.b.number, function( val ) {

			sss.b.number = val;

		}, false, 0, 1 );

		break;		
	}

	// build shader
	mtl.build();

	// set material
	mesh.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = mtl;
		}
	} );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	var delta = clock.getDelta();

	// if ( move ) {

	// 	var time = Date.now() * 0.005;

	// 	mesh.position.z = Math.cos( time ) * 10;
	// 	mesh.position.y = Math.sin( time ) * 10;

	// }
	// else {

	// 	mesh.position.z = mesh.position.y = 0;

	// }

	//mesh.rotation.z += .01;

	// update material animation and/or gpu calcs (pre-renderer)
	// mesh.material.updateAnimation( delta );

	renderer.render( scene, camera );

	requestAnimationFrame( animate );

}