var camera, scene, renderer;
var geometry, material, mesh, controls;
var datasetData;
var boundaries;
var height = 5,
	size = 50,
	hover = 0,
	delta = 10,
	curveSegments = 1,

	bevelThickness = 0.1,
	bevelSize = 0.1,
	bevelSegments = 1,
	bevelEnabled = true,

	font = undefined,
	jsonFileName = 'tags_100.json'
	fontName = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
	fontWeight = "regular";
	textMesh1 = undefined;
init();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 0, 800 );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	scene.fog = new THREE.Fog( 0x000000, 850, 1000 );
	geometry = new THREE.BoxGeometry( 300, 300, 300 );
	material = new THREE.MeshNormalMaterial();
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.y = 0
	//scene.add( mesh );
	var light = new THREE.AmbientLight( 0xffffff); // soft white light
	scene.add( light );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	dirLight.position.set( 0, 0, 1 ).normalize();
	//scene.add( dirLight );

	var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
	pointLight.position.set( 0, 100, 90 );
	//scene.add( pointLight );
	materials = [
		//new THREE.MeshPhongMaterial( { color: 0x1a1aff, flatShading: true } ), // front
		//new THREE.MeshPhongMaterial( { color: 0xcc0000 } ) // side
		new THREE.MeshPhongMaterial( { color: 0xffff1a, flatShading: true } ), // front
		new THREE.MeshPhongMaterial( { color: 0xcc0000 } ) // side
	];
	boundaries = {
		'top': window.innerHeight - 200,
		'bottom': -window.innerHeight + 200,
		'left': -window.innerWidth + 200,
		'right': + window.innerWidth - 200
	};
	window.addEventListener('resize', function(){
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		//controls.update();
	});
	document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            camera.position.x -= delta;
            break;
        case 38:
            camera.position.z -= delta;
            break;
        case 39:
            camera.position.x += delta;
            break;
        case 40:
        	camera.position.z += delta;
            break;
    }
    camera.updateProjectionMatrix();
};
	//controls = new THREE.OrbitControls(camera);

	loadFont();
}

function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
		font = response;
		console.log('Initujem')
  		loadJSON(function(response) {
  		// Parse JSON string into object
    		datasetData = JSON.parse(response);
    		//console.log(datasetData);
    		console.log('Dlzka JSONU: '+ Object.keys(datasetData).length);
    		main();
 		});
	});
}

function loadJSON(callback) {
    console.log('JSON load')   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonFileName, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
}

function createText(positionoffset, text) {

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
	var centerOffset = positionoffset[0] - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	textMesh1 = new THREE.Mesh( textGeo, materials );
	//textMesh1.position.x = centerOffset;
	textMesh1.position.x = positionoffset[0];
	textMesh1.position.y = positionoffset[1] + hover;
	textMesh1.position.z = positionoffset[2];
	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;
	scene.add(textMesh1)
	var box = textGeo.boundingBox;
	return box;
}

function update(){

}

function render(){
	renderer.render( scene, camera );
}

function gameLoop() {
	requestAnimationFrame( gameLoop );
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;
	//textMesh1.rotation.x +=0.02;
	//textMesh1.rotation.y +=0.02;
	update();
	render();
}
function main(){
	console.log('Screenwidth: '+window.innerWidth + ' Screenheight: '+window.innerHeight);
	//console.log(boundaries);
	var current_y = boundaries['top'];
	var current_x = boundaries['left'];
	var current_z = 0;
	for (i = 0; i < 400; i++){
		result = createText([current_x, current_y, current_z], Object.keys(datasetData)[i]);
		var width = result.max.x - result.min.x + 30;
		var letter_size = result.max.y - result.min.y + 30;
		current_x += width;
		if (current_x > boundaries['right']){
			current_x = boundaries['left'];
			current_y -= letter_size;
			if (current_y < boundaries['bottom']){
				current_z -= 800;
				current_y = boundaries['top'];
			}
		}
	}
	//result = createText([boundaries['left'], boundaries['top'], 0], 'Jozko');
	//result = createText([boundaries['left'] + (result.max.x - result.min.x), boundaries['top'], 0], Object.keys(datasetData)[2]);
	console.log('Dokoncil som vykreslovanie');
	gameLoop();
}