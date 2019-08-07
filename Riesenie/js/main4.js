var camera, scene, renderer;
var geometry, material, mesh, controls;
var datasetData;
var boundaries;
var height = 5,
	size = 20,
	hover = 0,
	movDelta = 10,
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
var frontMaterials = {
	1: new THREE.MeshPhongMaterial( { color: 0x66ff33, flatShading: true } ),
	2: new THREE.MeshPhongMaterial( { color: 0x3333ff, flatShading: true } ),
	10: new THREE.MeshPhongMaterial( { color: 0x990099, flatShading: true } ),
	15: new THREE.MeshPhongMaterial( { color: 0xccffcc, flatShading: true } ),
	17: new THREE.MeshPhongMaterial( { color: 0xffff00, flatShading: true } ),
	18: new THREE.MeshPhongMaterial( { color: 0x666699, flatShading: true } ),
	19: new THREE.MeshPhongMaterial( { color: 0xff99ff, flatShading: true } ),
	20: new THREE.MeshPhongMaterial( { color: 0x003399, flatShading: true } ),
	21: new THREE.MeshPhongMaterial( { color: 0x66ffff, flatShading: true } ),
	22: new THREE.MeshPhongMaterial( { color: 0xff00ff, flatShading: true } ),
	23: new THREE.MeshPhongMaterial( { color: 0xffff1a, flatShading: true } ),
	24: new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ),
	25: new THREE.MeshPhongMaterial( { color: 0xffcc99, flatShading: true } ),
	26: new THREE.MeshPhongMaterial( { color: 0x669999, flatShading: true } ),
	27: new THREE.MeshPhongMaterial( { color: 0x333399, flatShading: true } ),
	28: new THREE.MeshPhongMaterial( { color: 0xccff66, flatShading: true } ),
	29: new THREE.MeshPhongMaterial( { color: 0xffffcc, flatShading: true } ),
	30: new THREE.MeshPhongMaterial( { color: 0x009933, flatShading: true } ),
	31: new THREE.MeshPhongMaterial( { color: 0x9966ff, flatShading: true } ),
	32: new THREE.MeshPhongMaterial( { color: 0xff0000, flatShading: true } ),
	33: new THREE.MeshPhongMaterial( { color: 0xcccc00, flatShading: true } ),
	34: new THREE.MeshPhongMaterial( { color: 0xff6f00, flatShading: true } ),
	35: new THREE.MeshPhongMaterial( { color: 0xAEEA00, flatShading: true } ),
	36: new THREE.MeshPhongMaterial( { color: 0xF4511E, flatShading: true } ),
	37: new THREE.MeshPhongMaterial( { color: 0x2962FF, flatShading: true } ),
	38: new THREE.MeshPhongMaterial( { color: 0x795548, flatShading: true } ),
	39: new THREE.MeshPhongMaterial( { color: 0xFFC107, flatShading: true } ),
	40: new THREE.MeshPhongMaterial( { color: 0x2979FF, flatShading: true } ),
	41: new THREE.MeshPhongMaterial( { color: 0xD4E157, flatShading: true } ),
	42: new THREE.MeshPhongMaterial( { color: 0x607D8B, flatShading: true } ),
	43: new THREE.MeshPhongMaterial( { color: 0xCFD8DC, flatShading: true } ),
	44: new THREE.MeshPhongMaterial( { color: 0xFFF176, flatShading: true } ),
}
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
	//var datGUI = new dat.GUI();
	//datGUI.add()

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
	//controls = new THREE.OrbitControls(camera);
	document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            camera.position.x -= movDelta;
            break;
        case 38:
            camera.position.z -= movDelta;
            break;
        case 39:
            camera.position.x += movDelta;
            break;
        case 40:
        	camera.position.z += movDelta;
            break;
    }
    camera.updateProjectionMatrix();
};
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

function getFrontMaterial(category){
	return frontMaterials[category];
}

function createText(positionoffset, text, materialFront, materialSide) {

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
	textMesh1 = new THREE.Mesh( textGeo, [materialFront, materialSide] );
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
	console.log(datasetData);
	console.log('MAXIMALNY POCET: '+ String(datasetData['MAX_POCET']);
	for (i = 0; i < Object.keys(datasetData).length; i++){
		key = Object.keys(datasetData)[i];
		matFront = getFrontMaterial(datasetData[key]['max_category']);
		result = createText([current_x, current_y, current_z], key,
		 matFront,
		  new THREE.MeshPhongMaterial( { color: 0xcc0000 }));
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

