var camera, scene, renderer;
var geometry, material, mesh, controls, group, sideMaterial;
var datasetData, datasetInfo, dataset;
var wheelZoom = 0.2;
var tagMaxAmount = 100;
var tagMinAmount = 100;
var maxLetterSize = 60;
var filterCat = 0;
var boundaries;
var height = 5,
	size = 20,
	hover = 0,
	movDelta = 10,
	curveSegments = 1,

	bevelThickness = 0.001,
	bevelSize = 0.001,
	bevelSegments = 1,
	bevelEnabled = true,

	font = undefined,
	jsonFileName = 'testing_100.json'
	fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
	fontWeight = "regular";
	textMesh1 = undefined;
init();
var frontMaterials = {
	1:  {color: 0x66ff33, name: 'Film and Animation'},
	2:  {color: 0x3333ff, name: 'Cars and Vehicles'},
	10: {color: 0x990099, name: 'Music'},
	15: {color: 0xccffcc, name: 'Pets and Animals'},
	17: {color: 0xffff00, name: 'Sports'},
	18: {color: 0x666699, name: 'Short Movies'},
	19: {color: 0xff99ff, name: 'Travel and Events'},
	20: {color: 0x003399, name: 'Gaming'},
	21: {color: 0x66ffff, name: 'Videoblogging'},
	22: {color: 0xff00ff, name: 'People and Blogs'},
	23: {color: 0xffff1a, name: 'Comedy'},
	24: {color: 0xffffff, name: 'Entertainment'},
	25: {color: 0xffcc99, name: 'News and Politics'},
	26: {color: 0x669999, name: 'Howto and Style'},
	27: {color: 0x333399, name: 'Education'},
	28: {color: 0xccff66, name: 'Science and Technology'},
	29: {color: 0xffffcc, name: 'Nonprofits and Activism'},
	30: {color: 0x009933, name: 'Movies'},
	31: {color: 0x9966ff, name: 'Anime or Animation'},
	32: {color: 0xff0000, name: 'Action or Adventure'},
	33: {color: 0xcccc00, name: 'Classics'},
	34: {color: 0xff6f00, name: 'Comedy'},
	35: {color: 0xAEEA00, name: 'Documentary'},
	36: {color: 0xF4511E, name: 'Drama'},
	37: {color: 0x2962FF, name: 'Family'},
	38: {color: 0x795548, name: 'Foreign'},
	39: {color: 0xFFC107, name: 'Horror'},
	40: {color: 0x2979FF, name: 'Sci-Fi or Fantasy'},
	41: {color: 0xD4E157, name: 'Thriller'},
	42: {color: 0x607D8B, name: 'Shorts'},
	43: {color: 0xCFD8DC, name: 'Shows'},
	44: {color: 0xFFF176, name: 'Trailers'}
}
function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 0, 800 );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	scene.fog = new THREE.Fog( 0x000000, 850, 1000 );
	group = new THREE.Group();
	var light = new THREE.AmbientLight( 0xffffff); // soft white light
	sideMaterial = new THREE.MeshBasicMaterial( { color: 0xcc0000 } )
	scene.add( light );
	scene.add(group);
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	//var datGUI = new dat.GUI();
	//datGUI.add()
	addDivListeners();
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
	document.addEventListener("click", onDocumentMouseDown);
	document.addEventListener("wheel", function(e){
		camera.position.z -= e.wheelDelta * wheelZoom;
		//kod 
	});
	document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            camera.position.x -= movDelta;
            break;
        case 38:
            camera.position.y += movDelta;
            break;
        case 39:
            camera.position.x += movDelta;
            break;
        case 40:
        	camera.position.y -= movDelta;
            break;
        case 72:
        	toggleHelp();
        	break;
        case 70:
        	filterCat = 0;
        	initializeScene();
        	break;
    }
    camera.updateProjectionMatrix();
};
	loadFont();
}
function toggleHelp() {
    var x = document.getElementById("info");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
function addDivListeners(){
	var	catDiv = document.getElementById('categories');
	var categories = catDiv.getElementsByTagName("div");
	var currentDiv, spanColour;
	for (var i =0, max = categories.length; i < max; i++){
		currentDiv = categories[i];
		currentDiv.addEventListener('click', categoryFilter);
	}
}

function categoryFilter(event){
	console.log(event.srcElement.id);
	filterCat = event.srcElement.id;
	initializeScene();
}

function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
		font = response;
		console.log('Initujem')
  		loadJSON(function(response) {
  		// Parse JSON string into object
    		dataset = JSON.parse(response);
    		console.log(dataset);
    		datasetData = dataset['tags'];
    		datasetInfo = dataset['info'];
    		tagMaxAmount = datasetInfo['max'];
    		console.log(dataset);
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

function onDocumentMouseDown( e ){
    var mouseVector = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();
    var width = window.innerWidth;
    var  height = window.innerHeight;
    e.preventDefault();
    mouseVector.x = 2 * (e.clientX / width) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / height );
    raycaster.setFromCamera(mouseVector, camera);

    var intersects = raycaster.intersectObjects( group.children );
    //if(selectedObject != null){
     //   selectedObject.material.color.setHex(selectedColor);
    //}

    if(intersects.length > 0) {

        var intersection = intersects[0];
        selectedObject = intersection.object;
        //console.log('Stlacil si na: ');
        //console.log(selectedObject);
        //var materials = selectedObject.material;
        //var frontMat = materials[0];
        showDetail(selectedObject.userData);
     }
}

function showDetail(selectedObject){
	console.log('Tag: ' + selectedObject.name);
	console.log('Pocet Vyskytov: ' + selectedObject.pocet);
	console.log('Lajky: ' + selectedObject.likes);
	console.log('Dislajky: '+ selectedObject.dislikes);
	console.log('Popularita: '+ String(selectedObject.likes - selectedObject.dislikes));
	console.log('***********');
}

function getFrontMaterial(category){
	return new THREE.MeshBasicMaterial( { color: frontMaterials[category]['color']});
}

function createText(positionoffset, text, materialFront, materialSide, textSize) {

	textGeo = new THREE.TextGeometry( text, {
		font: font,

		size: textSize,
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
	textMesh1.userData = datasetData[key];
	textMesh1.userData.name = key;
	group.add(textMesh1)
	var box = textGeo.boundingBox;
	return box;
}

function calculateTextSize(tag_value){
	var normal;
	normal = (tag_value - tagMinAmount) / (tagMaxAmount - tagMinAmount);
	return (60 * normal) + 15; 
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
	gameLoop();
	initializeScene();

}

function initializeScene(){
	var current_y = boundaries['top'];
	var current_x = boundaries['left'];
	var current_z = 0;
	var textSize = 10;
	var tagCategory = undefined;
	camera.position.set( 0, 0, 800 );
	scene.remove(group);
	group = new THREE.Group();
	scene.add(group);
	console.log(datasetData);
	console.log('MAXIMALNY POCET: '+ String(datasetInfo['max']));
	//Object.keys(datasetData).length
	for (i = 0; i < Object.keys(datasetData).length / 2; i++){
		key = Object.keys(datasetData)[i];

		tagCategory = datasetData[key]['max_category'];
		if(filterCat != 0){
			if (filterCat != tagCategory){
				continue;
			}
		}
		frontMaterial = getFrontMaterial(datasetData[key]['max_category']);
		textSize = calculateTextSize(datasetData[key]['pocet']);

		result = createText([current_x, current_y, current_z], key,
		 					frontMaterial,
		  					sideMaterial,
		  					textSize);

		var width = result.max.x - result.min.x + 30;
		var letter_size = result.max.y - result.min.y + 30;
		current_x += width;
		if (current_x > boundaries['right']){
			current_x = boundaries['left'];
			current_y -= maxLetterSize;
			if (current_y < boundaries['bottom']){
				current_z -= 800;
				current_y = boundaries['top'];
			}
		}
	}
	//result = createText([boundaries['left'], boundaries['top'], 0], 'Jozko');
	//result = createText([boundaries['left'] + (result.max.x - result.min.x), boundaries['top'], 0], Object.keys(datasetData)[2]);
	console.log('Dokoncil som vykreslovanie');
}