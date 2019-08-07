var camera, scene, renderer;
var geometry, material, mesh;
var text = "JOZKOo.js",

	height = 15,
	size = 50,
	hover = 30,

	curveSegments = 4,

	bevelThickness = 1,
	bevelSize = 1,
	bevelSegments = 3,
	bevelEnabled = true,

	font = undefined,

	fontName = "gentilis", // helvetiker, optimer, gentilis, droid sans, droid serif
	fontWeight = "bold";
	textMesh1 = undefined;
init();
function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 0, 700 );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	//scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
	geometry = new THREE.BoxGeometry( 300, 300, 300 );
	material = new THREE.MeshNormalMaterial();
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.y = 0
	//scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	dirLight.position.set( 0, 0, 1 ).normalize();
	scene.add( dirLight );

	var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
	pointLight.position.set( 0, 100, 90 );
	scene.add( pointLight );
	materials = [
		new THREE.MeshPhongMaterial( { color: 0x0000ff, flatShading: true } ), // front
		new THREE.MeshPhongMaterial( { color: 0xff0000 } ) // side
	];
	loadFont();
}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	textMesh1.rotation.x +=0.02;
	//textMesh1.rotation.y +=0.02;
	renderer.render( scene, camera );

}
function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
	font = response;
	createText();
	animate();
	} );
}
function createText() {

	textGeo = new THREE.TextGeometry( text, {
		font: font,

		size: size,
		height: height,
		curveSegments: curveSegments,

		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,

		material: 0,
		extrudeMaterial: 1
	});

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();

	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

	if ( ! bevelEnabled ) {

		var triangleAreaHeuristics = 0.1 * ( height * size );

		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

			var face = textGeo.faces[ i ];

			if ( face.materialIndex == 1 ) {

				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();

				}

				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];

				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

				if ( s > triangleAreaHeuristics ) {

					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

						face.vertexNormals[ j ].copy( face.normal );

					}

				}

			}

		}
	}
	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	textMesh1 = new THREE.Mesh( textGeo, materials );
	textMesh1.position.x = centerOffset;
	textMesh1.position.y = hover;
	textMesh1.position.z = 0;
	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;
	scene.add(textMesh1)
}