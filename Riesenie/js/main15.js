var camera, scene, renderer;
var geometry, material, mesh, controls, group, sideMaterial;
var datasetData, datasetInfo, dataset;
var datasetVis, maxVisLayers;
var shownLayers = {
	'actual': undefined,
	'back': undefined,
	'front': undefined,
};
var selectedFooterSpan = undefined;
var footerElements = undefined;
var visOption = {
	selected: 'pocet',
	tagMinVideos: 100,
	tagMaxVideos: 100,
	tagMaxLikes: 0,
	tagMinLikes: 0,
	tagMaxDislikes: 0,
	tagMinDislikes: 0
};
var selectedCategory = undefined;
var wheelZoom = 0.2;
var maxLetterSize = 150;
var minLetterSize = 50;
var filterCat = 0;
var boundaries;
var height = 2,
	size = 20,
	hover = 0,
	movDelta = 10,
	curveSegments = 1,

	bevelThickness = 0.01,
	bevelSize = 0.001,
	bevelSegments = 1,
	bevelEnabled = true,

	font = undefined,
	jsonFileName = 'tags_100.json'
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
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
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
	var datGUI = new dat.GUI();
	datGUI.add(visOption, 'selected', {Videos: 'pocet', Dislikes: 'dislikes', Likes: 'likes'}).onChange(function(newValue) {
		console.log("Value changed to:  ", visOption.selected);
		initializeScene();
	});
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
		cameraMovement(camera.position.z - (e.wheelDelta * wheelZoom));
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
			resetSelected();
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

function resetSelected(){
	if (selectedCategory != undefined){
	//kod pre revert
	console.log(selectedCategory);
	selectedCategory.parent.style.backgroundColor = '#424242';
	selectedCategory.tag.style.color = 'white';
	selectedCategory = undefined;
	}
	if (selectedFooterSpan != undefined){
		selectedFooterSpan.classList.remove('selected');
		selectedFooterSpan = undefined;
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
	var tag, key;

	if (selectedCategory != undefined){
		//kod pre revert
		console.log(selectedCategory);
		selectedCategory.parent.style.backgroundColor = '#424242';
		selectedCategory.tag.style.color = 'white';
	}
	selectedCategory = {
		tag: event.srcElement,
		parent: event.srcElement.parentNode
	}
	console.log(event.srcElement.id);
	filterCat = parseInt(event.srcElement.id);
	event.srcElement.parentNode.style.backgroundColor = "lightblue";
	selectedCategory.tag.style.color = 'black';
	var newDataset = {};
	for (var i = 0; i < Object.keys(datasetData).length; i++) {
		key = Object.keys(datasetData)[i];
		tag = datasetData[key];
		if (tag.max_category === filterCat){
			newDataset[key] = tag;
		}
	};
	console.log(Object.keys(newDataset).length);
	datasetChanged(newDataset);
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
    		visOption.tagMaxVideos = datasetInfo['max_count'];
    		visOption.tagMaxLikes = datasetInfo['max_likes'];
    		visOption.tagMaxDislikes = datasetInfo['max_dislikes'];
    		visOption.tagMinVideos = datasetInfo['min_count'];
    		visOption.tagMinLikes = datasetInfo['min_likes'];
    		visOption.tagMinDislikes = datasetInfo['min_dislikes'];
    		console.log(visOption);
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
    var actualGroup;
    var width = window.innerWidth;
    var  height = window.innerHeight;
    e.preventDefault();
    mouseVector.x = 2 * (e.clientX / width) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / height );
    raycaster.setFromCamera(mouseVector, camera);
    for (var i = 0; i < group.children.length; i++) {
    	if (shownLayers['actual'] == group.children[i].userData){
    		actualGroup = group.children[i];
    		break;
    	}
    };
    var intersects = raycaster.intersectObjects( actualGroup.children );
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

function prependZeroes(number){
	while (number.length != 3){
		number = '0'+ number;
	}
	return number;
}

function bigNumbertoString(number){
	var milions = Math.floor(number / 1000000);
	var thousands = Math.floor((number % 1000000) / 1000);
	var hundreds = Math.floor(number % 1000);
	var result;
	//console.log('Transformujem cislo: '+ number);
	//console.log(milions);
	//console.log(thousands);
	//console.log(hundreds);
	if (milions > 0)
		result = String(milions)+','+prependZeroes(String(thousands))+','+prependZeroes(String(hundreds));
	else
		if (thousands > 0)
			result = String(thousands)+','+prependZeroes(String(hundreds));
		else
			result = String(hundreds);
	return result;
}

function showDetail(selectedObject){
	console.log(selectedObject);
	var modalBody = document.getElementsByClassName('modal-body')[0];
	var vidDiv = modalBody.getElementsByClassName('in-videos')[0];
	var likeDiv = modalBody.getElementsByClassName('likes')[0];
	var dislikeDiv = modalBody.getElementsByClassName('dislikes')[0];
	var positivDiv = modalBody.getElementsByClassName('positiveness')[0];
	var categoriesDiv = modalBody.getElementsByClassName('categories')[0];
	var tagDiv = document.getElementsByClassName('modal-title')[0];
	console.log(selectedObject.likes);
	tagDiv.innerText = 'Tag: '+ String(selectedObject.name);
	vidDiv.innerText = 'In Videos: '+ bigNumbertoString(selectedObject.pocet);
	likeDiv.innerText = 'Likes: ' + bigNumbertoString(selectedObject.likes);
	dislikeDiv.innerText = 'Dislikes: ' + bigNumbertoString(selectedObject.dislikes);
	positivDiv.innerText = 'Positiveness: ' + bigNumbertoString(selectedObject.likes - selectedObject.dislikes);
	categoriesDiv.innerText = 'Categories: ' + bigNumbertoString(selectedObject.numCategories);
	$('#myModal').modal({
    		show: true
    });
}

function getFrontMaterial(category){
	return new THREE.MeshBasicMaterial( { color: frontMaterials[category]['color']});
}

function createText(positionoffset, text, materialFront, materialSide, textSize, key, bewThick) {

	textGeo = new THREE.TextGeometry( text, {
		font: font,

		size: textSize,
		height: height,
		curveSegments: curveSegments,

		bevelThickness: bewThick,
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
	textMesh1.userData.likes = datasetVis[key].likes;
	textMesh1.userData.dislikes = datasetVis[key].dislikes;
	textMesh1.userData.pocet = datasetVis[key].pocet;
	textMesh1.userData.name = key;
	textMesh1.userData.numCategories = Object.keys(datasetVis[key].categories).length;
	console.log('jozko');
	update();
	render();
	var box = textGeo.boundingBox;
	return {'box': box, 'mesh': textMesh1};
}

function calculateTextSize(tag_value, maxVal, minVal){
	var normal, result;
	//normal = (tag_value - minVal) / (maxVal - minVal);
	//return (maxLetterSize * normal) + minLetterSize;
	result = ( (( tag_value - minVal) * (maxLetterSize - minLetterSize)) / (maxVal-minVal) ) + minLetterSize;
	return Math.min(result, maxLetterSize);
}

function update(){

}

function render(){
	renderer.render( scene, camera );
}

function gameLoop() {
	requestAnimationFrame( gameLoop );
	update();
	render();
}

function cameraMovement(newPosition){
	var oldPosition = camera.position.z;
	var result;
	if (oldPosition > newPosition){
		console.log('Dopredu');
		result = checkLayerChange(newPosition, 'front');
		if (result){
			console.log("Presiel si cez vrstvu idem update");
			if (shownLayers.actual != shownLayers.front)
				actualizeLayers('forward');
		}
	}else{
		console.log('Dozadu');
		result = checkLayerChange(newPosition, 'back');
		if (result){
			console.log("Presiel si za vrstvu idem update");
			if (shownLayers.actual != shownLayers.back)
				actualizeLayers('back');
		}
	}
}

function checkLayerChange(newPosition, direction){
	var actualLayPos = shownLayers.actual * - 800 - 10;
	if (direction == 'back'){
		if (newPosition >= actualLayPos + 800)
			return true
		return false
	}else{
		if (newPosition <= actualLayPos)
			return true
		return false
	}
}

function datasetChanged(newDataset){
	for (var i = group.children.length - 1; i >= 0; i--) {
		concreteGroup = group.children[i];
		deleteGroupMeshes(concreteGroup);
		group.remove(concreteGroup);
	}
	console.log(renderer.info);
	renderer.dispose();
	camera.position.set( 0, 0, 800 );
	datasetVis = newDataset;
	console.log('Novy dataset dlzka: ' + Object.keys(datasetVis).length);
	maxVisLayers = Math.floor(Object.keys(datasetVis).length / 100);
	if (Object.keys(datasetVis).length % 100 != 0){
		maxVisLayers += 1;
	}
	console.log('Pocet Vrstiev' + maxVisLayers);
	if (maxVisLayers == 1)
		shownLayers.front = 0;
	else
		shownLayers.front = 1;
	shownLayers.actual = 0;
	shownLayers.back = 0;
	console.log(shownLayers);
	visualiseLayer(shownLayers.actual);
	visualiseLayer(shownLayers.front);
	calculateFooterElements(maxVisLayers);
}

function main(){
	//console.log('Screenwidth: '+window.innerWidth + ' Screenheight: '+window.innerHeight);
	//console.log(boundaries);
	gameLoop();
	initializeScene();
}

function initializeScene(){
	datasetChanged(datasetData);
}

function actualizeLayers(playerMovement){
	if (playerMovement == 'back'){
		//back kod
		console.log('Idem dozadu');
		if (shownLayers['back'] != 0){
			if(shownLayers['front'] != shownLayers['actual'])
				removeLayer(shownLayers['front']);
			shownLayers['front'] = shownLayers['actual'];
			shownLayers['actual'] = shownLayers['back'];
			shownLayers['back'] = shownLayers['back'] - 1;
			visualiseLayer(shownLayers['back']);
		}else{
			removeLayer(shownLayers['front']);
			shownLayers['front'] = shownLayers['actual'];
			shownLayers['actual'] = shownLayers['back'];
		}
	}else{
		//front kod
		console.log('Idem dopredu');
		if (shownLayers['front'] + 1 != maxVisLayers){
			if(shownLayers['back'] != shownLayers['actual'])
				removeLayer(shownLayers['back']);
			shownLayers['back'] = shownLayers['actual'];
			shownLayers['actual'] = shownLayers['front'];
			shownLayers['front'] = shownLayers['front'] + 1;
			visualiseLayer(shownLayers['front']);
		}else{
			removeLayer(shownLayers['back']);
			shownLayers['back'] = shownLayers['actual'];
			shownLayers['actual'] = shownLayers['front'];
		}
	}
	console.log('Som na : ' + shownLayers['actual']);
}

function visualiseLayers(n){
}

function removeLayer(n){
	var layerGroup;
	for (var i = 0; i < group.children.length; i++) {
		if (group.children[i].userData == n){
			console.log('Mazem grupu: '+ n);
			layerGroup = group.children[i];
			deleteGroupMeshes(layerGroup);
			group.remove(layerGroup);
			break;
		}
	}
}

function visualiseLayer(n){
	var mesh, width, letter_size, key, frontMaterial, textSize, results, result, num_categories, bewThick;
	var current_y = boundaries['top'];	
	var current_x = boundaries['left'];
	var current_z = -1 * (n * 800);
	var layerGroup = new THREE.Group();
	var tagIndex = n * 100;
	var tagAmount = 0;
	var maxAmount, minAmount, category;
	console.log('Vizualizujem vrstvu: '+ n);
	layerGroup.userData = n;
	if (visOption.selected == 'pocet'){
		category = 'pocet';
		maxAmount = visOption.tagMaxVideos;
		minAmount = visOption.tagMinVideos;
	}else if (visOption.selected == 'likes'){
		category = 'likes';
		maxAmount = visOption.tagMaxLikes;
		minAmount = visOption.tagMinLikes;
	}else{
		category = 'dislikes';
		maxAmount = visOption.tagMaxDislikes;
		minAmount = visOption.tagMinDislikes;
	}
	while ( (tagIndex + tagAmount < Object.keys(datasetVis).length) && (tagAmount < 100)){
		key = Object.keys(datasetVis)[tagIndex + tagAmount];

		frontMaterial = getFrontMaterial(datasetVis[key]['max_category']);
		textSize = calculateTextSize(datasetVis[key][category], maxAmount, minAmount);
		//console.log(textSize);
		num_categories = Object.keys(datasetVis[key].categories).length;
		bewThick = 0.01 + num_categories * 1;
		results = createText([current_x, current_y, current_z], key,
		 					 frontMaterial,
		  					 new THREE.MeshBasicMaterial( { color: 0xcc0000 } ),
		  					 textSize,
		  					 key,
		  					 bewThick);
		result = results.box;
		mesh = results.mesh;
		layerGroup.add(mesh);
		width = result.max.x - result.min.x + 20;
		current_x += width;
		if (current_x > boundaries['right']){
			current_x = boundaries['left'];
			current_y -= Math.floor(maxLetterSize/2);
		}
		tagAmount += 1;
	}
	group.add(layerGroup);
	console.log('Renderer faces: ');
	console.log(renderer.info.render.faces);
}

function deleteGroupMeshes(delGroup){
	for (var i = delGroup.children.length - 1; i >= 0; i--) {
		var child = delGroup.children[i];
		var materials = child.material;
		//console.log(child);
		materials[0].dispose();
		materials[1].dispose();
		child.material = null;
		child.geometry.dispose();
		child.geometry = null;
		delGroup.remove(delGroup.children[i]);
	}
	delGroup.children = [];
	//console.log("Zmazana Grupa ma deti: ");
	//console.log(delGroup.children);
}

function addSpanToElement(spanName, parent, i){
	var para = document.createElement('span');
	//console.log(para);
	var node = document.createTextNode(spanName);
	para.appendChild(node);
	para.className = 'footer-content';
	para.addEventListener('click', layerChange);
	parent.appendChild(para);
	footerElements[spanName] = i;
}

function calculateFooterElements(numberOfLayers){
	var footer = document.getElementsByClassName('custom-footer')[0];
	console.log('Vypocitavam footer');
	footerElements = {};
	footer.innerHTML = null;
	for (var i = 0; i < numberOfLayers; i++) {
		addSpanToElement(Object.keys(datasetVis)[100 * i], footer, i);
	};
	//footer.innerHTML = "<div id=jozkooo>Jozko</div><div>Jozko</div>";
	//console.log(footer);
}

function layerChange(event){
	console.log('Menim Poziciu na vrstu: ');
	console.log(footerElements);
	removeLayer(shownLayers.front);
	removeLayer(shownLayers.actual);
	removeLayer(shownLayers.back);
	if (selectedFooterSpan != undefined){
		console.log('halo hahaha');
		selectedFooterSpan.classList.remove('selected');
	}
	event.srcElement.classList.add('selected');
	selectedFooterSpan = event.srcElement;
	console.log(footerElements[event.srcElement.innerText]);
	shownLayers.actual = footerElements[event.srcElement.innerText];
	shownLayers.back = shownLayers.actual - 1;
	shownLayers.front = shownLayers.actual + 1;
	if (shownLayers.back == -1)
		shownLayers.back = 0
	if (shownLayers.front == maxVisLayers)
		shownLayers.front -= 1
	visualiseLayer(shownLayers.actual);
	if (shownLayers.actual != shownLayers.back)
		visualiseLayer(shownLayers.back);
	if (shownLayers.actual != shownLayers.front)
		visualiseLayer(shownLayers.front);
	camera.position.set( 0, 0, (shownLayers.actual * - 800) + 750);
}