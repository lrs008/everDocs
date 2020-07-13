const { copyFileSync } = require("fs");

function A2_5Scene() {
	var scene, renderer, camera, controls;
	var model;
	var xmax = -10000
	var xmin = 10000 // 保存所有mesh中boundingBox的x最小的mesh的x值
	var ymax = -10000
	var ymin = 10000
	var zmax = -10000
	var zmin = 10000
	var xMinMesh  	// 保存所有mesh中boundingBox的x最小的mesh
	var xMaxMesh 
	var yMinMesh  
	var yMaxmesh  
	var zMinMesh  
	var zMaxMesh  
	const  OPACITY = 0.5  // 透明度
	var axesHelper = new THREE.AxesHelper( 500 );
	var bbox   			// gltf的boundingBox框
	var mesh1Bbox 		// mesh1的boundingBox框

	var clock = new THREE.Clock();
	var speed = 2; //units a second
	var delta = 0;
	
	function LambertMaterial( mColor, bOpacity = true ) {
				// mColor = 0x040404;
				var material = new THREE.MeshLambertMaterial({color: mColor});	//0xFF0505
				if(bOpacity) {
					material.opacity = OPACITY;
					material.transparent = true;
				}
				return material;
			}
	function SetMaterial(object) {
		if ( object.isMesh ) {
			if(object.name.indexOf("管") != -1) {	// && object.name.indexOf("盒") == -1
				object.material = LambertMaterial( 0xFF0505, false );
			}
			else if(object.name.indexOf("芯板墙80") != -1) {	//|| object.name.indexOf("骨") != -1
				object.material = LambertMaterial( 0xA00505 );
			}
			else if(object.name.indexOf("梁") != -1 || object.name.indexOf("柱") != -1) {
				object.material = LambertMaterial( 0x258025, false );
			}
			else if(object.name.indexOf("Object") != -1 || object.name.indexOf("__") != -1) {
				object.material = LambertMaterial( 0x808025, false );
			}
			else if(object.name.indexOf("窗") != -1 || object.name.indexOf("玻璃") != -1) {
				object.material = LambertMaterial( 0x80A0FF );
			}
			else if(object.name.indexOf("梯") != -1 || object.name.indexOf("栏") != -1) {
				object.material = LambertMaterial( 0x080808 );
			}
			else if(object.name.indexOf("顶角件") != -1) {	//顶角件
				object.material = LambertMaterial( 0x000000, false );	//0xE8E8F5
				object.material.emissive = new THREE.Color(0.5, 0.5, 1.35);
				// console.log(" =============== " + object.name);
			}
			// else {
			// 	object.material = LambertMaterial( 0x080808 );
			// }
		}
	}

	init();
	
	function init() {
		
		clock.start();
		var container = document.getElementById( 'container' );
		console.log("######### container = ")
		console.log(container)
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x606060 );
		scene.fog = new THREE.Fog( 0xa0a0a0, 10, 4020 );

		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		hemiLight.position.set( 0, 20, 0 );
		scene.add( hemiLight );

		var dirLight = new THREE.DirectionalLight( 0xffffff );
		dirLight.position.set( - 20, 10, - 10 );
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = - 2;
		dirLight.shadow.camera.left = - 2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;
		scene.add( dirLight );

		// ground

		var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		mesh.receiveShadow = true;
		scene.add( mesh );

		scene.add( axesHelper );
		// 只有模型通过draco压缩后的才需要这段代码,否则直接注释掉即可。  process draco begin 
		var loader = new THREE.GLTFLoader();
		var dracoLoader = new THREE.DRACOLoader();
		dracoLoader.setDecoderPath( '../assets/js/jsm/libs/draco/' );
		loader.setDRACOLoader( dracoLoader );
		// process draco end 

		// loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {
		// loader.load( 'gltf/kr-Cm-rdu.gltf', function ( gltf ) {
		// loader.load( 'glTF/a2.5_out/a2.5.gltf', function ( gltf ) {  glTF/
		// loader.load( 'glTF/a2.5_out/a2.5.glb', function ( gltf ) {
		// loader.load( 'glTF/a2.5_out/1591239592917.glb', function ( gltf ) {
		loader.load( '../assets/glTF/A2-5-4楼0603-三维视图-{三维}.glb', function ( gltf ) {
			model = gltf.scene;
			// 显示gltf.scene的Boundbox 
			bbox = new THREE.BoundingBoxHelper(gltf.scene, 0xffffff);
			bbox.update();
			// scene.add(bbox);

			var objectIndex = 0;

			var alpha, beta, gamma = 0.5;
			// var diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 );
			var diffuseColor = new THREE.Color(1.0, 0.35, 0.35);
			var material = new THREE.MeshBasicMaterial( {
				// map: imgTexture,
				color: diffuseColor,
				reflectivity: beta,
				envMap: alpha < 0.5 ? reflectionCube : null
			} );
			// LambertMaterial.emissive = new THREE.Color(1.0, 0.35, 0.35);

			// var mesh = new THREE.Mesh( geometry, material );
			
			model.traverse( function ( object ) {

				if ( object.isMesh ) {
					object.castShadow = true;
					object.receiveShadow = true;
					object.material.opacity = OPACITY;
					object.material.transparent = true;
					// 遍历所有mesh，找出最小和最大的boundingBox.position.x ,y,z 极其对于的mesh
					var  bMax = object.geometry.boundingBox.max
					var bMin = object.geometry.boundingBox.min
					if(bMax.x > xmax){
						xmax = bMax.x
						xMaxMesh = object
					}
					if(bMax.y > ymax){
						ymax = bMax.y
						xMaxMesh = object
					}
					if(bMax.z > zmax){
						zmax = bMax.z
						zMaxMesh = object
					}
					if(bMin.x < xmin){
						xmin = bMin.x
						xMinMesh = object
					}
					if(bMin.y < ymin){
						ymin = bMin.y
						yMinMesh = object
					}
					if(bMin.z< zmin){
						zmin = bMin.z
						zMinMesh = object
					}

					//显示Mesh1的Boundbox
					if(object.name === 'Mesh1'){
						mesh1Bbox = new THREE.BoundingBoxHelper(object, 0xDC143C);
						mesh1Bbox.update();
						scene.add(mesh1Bbox);
					}
				}
				if(object.name.indexOf("梁") == -1 && object.name.indexOf("柱") == -1 && object.name.indexOf("管") == -1 && object.name.indexOf("芯板墙80") == -1 && object.name.indexOf("窗") == -1 && object.name.indexOf("龙骨") == -1 && object.name.indexOf("板") == -1 && object.name.indexOf("梯") == -1 && object.name.indexOf("栏") == -1 && object.name.indexOf("Object") == -1 && object.name.indexOf("__") == -1) {
					console.log(objectIndex + " = " + object.name);
				}
				SetMaterial(object);
				objectIndex++;
			} );	
			// console.log("gltf.scene.computeBoundingBox = " + gltf.scene.computeBoundingBox());

			// for debug 
			console.log("xmin = " + xmin);
			console.log("xmax = " + xmax);
			console.log("ymin = " + ymin);
			console.log("ymax = " + ymax);
			console.log("zmin = " + zmin);
			console.log("zmax = " + zmax);
			// console.log(xMinMesh)
			// console.log(xMaxMesh)
			// console.log(yMinMesh)
			// console.log(yMinMesh)
			// console.log(zMinMesh)
			// console.log(zMaxMesh)
			// console.log((xmin + xmax)/2)
			// console.log((ymin + ymax)/2)
			// console.log((zmin + zmax)/2)
			// console.log(gltf.scene)
			gltf.scene.position.x = -6;	//-256;	//-(xmin + xmax)/2     
			gltf.scene.position.y = 0;		//-(ymin + ymax)/2
			gltf.scene.position.z = 6;	//160;  	//(zmin + zmax)/2
			console.log(gltf.scene)
			scene.add( model );
			animate();

		} );
		// console.log("--------------------------------")  // 这里为什么就被清空了，作用域 ?
		// console.log(xmin)
		// console.log(xmax)
		// console.log(ymin)
		// console.log(ymax)
		// console.log(zmin)
		// console.log(zmax)

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.shadowMap.enabled = true;
		container.appendChild( renderer.domElement );

		// camera
		//orthographic
		camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 4000 );
		// camera = new THREE.OrthographicCamera( -window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, 1, 1000 );
		// camera.position.set( 0, 80, 360 );	//1591239592917.glb
		// camera.position.set( 1400, 20, -260 );	// A2-5-4F_0603.glb
		camera.position.set( 42, 14, 56 );
		createControls( camera );

		console.log("camera = ")
		console.log(camera)

		// var controls = new OrbitControls( camera, renderer.domElement );
		// controls.enablePan = false;
		// // controls.enableZoom = false;
		// // controls.target.set( 0, 1, 0 );
		// controls.autoRotate(true);
		// controls.update();
		window.addEventListener( 'resize', onWindowResize, false );

	}

	//TubesOver()
	var BL = document.getElementById("buttonL") 
	console.log("############### BL  ")
	console.log(BL)
	document.getElementById("buttonL").onmouseover = function() {
		console.log("###### BL  onmouseover")
		model.traverse( function ( object ) {
			if(object.name.indexOf("顶角件") == -1) {	//顶角件
				object.material = LambertMaterial( 0x000000 );	//0xE8E8F5
				// object.material.emissive = new THREE.Color(0.5, 0.5, 1.35);
				// console.log(objectIndex + " =============== " + object.name);
			}
		});
	};
	document.getElementById("buttonL").onmouseout = function() {
		console.log("###### BL  onmouseout")
		model.traverse( function ( object ) {
			SetMaterial(object);
		});
	};

	function HighlightThings (sThing){
		model.traverse( function ( object ) {
			if(sThing == "Null") {
				SetMaterial(object);
			}
			else if(object.name.indexOf(sThing) == -1) {	//顶角件
				object.material = LambertMaterial( 0x000000 );	//0xE8E8F5
				// object.material.emissive = new THREE.Color(0.5, 0.5, 1.35);
				// console.log(objectIndex + " =============== " + object.name);
			}
			else {
				object.material.emissive = new THREE.Color(1.5, 1.5, 1.35);
			}
		});
	};
	//LaddersOver()
	document.getElementById("buttonR").onmouseover = function() {
		HighlightThings ("盒");
	};
	document.getElementById("buttonR").onmouseout = function() {
		model.traverse( function ( object ) {
			SetMaterial(object);
		});
	};
	
	// byTime: async ()=>{
	// 	;
	// }

	const durationToGo = 1.0;
	const halfToGo = durationToGo/2.0;
	const nMode = 3;
	var bChanged = false;
	var iChangeMode = 0;
	var aHighlightArray = ["顶角件", "盒", "Null"];
	function ChangebyTime() {
		// delta = clock.getDelta();
		// clock.oldTime;
		// console.log("clock.elapsedTime = " + clock.getElapsedTime());
		if(clock.getElapsedTime()%durationToGo > halfToGo){
			if(bChanged == false) {
				bChanged = true;
				HighlightThings (aHighlightArray[iChangeMode]);
				iChangeMode++;
				iChangeMode %= nMode;
			}
		}
		else {
			bChanged = false;
		}
		// object.position.z += speed * delta;
	}

	function loadXMLDoc() {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
			document.getElementById("demo").innerHTML =
			this.responseText;
			}
		};
		xhttp.open("GET", "xmlhttp_info.txt", true);
		xhttp.send();
	}
	function onDocumentMouseDown(e) {
		e.preventDefault();
		
		//将鼠标点击位置的屏幕坐标转成threejs中的标准坐标,具体解释见代码释义
		mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
		//新建一个三维单位向量 假设z方向就是0.5
		//根据照相机，把这个向量转换到视点坐标系
		var vector = new THREE.Vector3(mouse.x, mouse.y,0.5).unproject(camera);

		//在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

		//射线和模型求交，选中一系列直线
		var intersects = raycaster.intersectObjects(objects);
		console.log('imtersrcts=' + intersects)

		if (intersects.length > 0) {
			//选中第一个射线相交的物体
			SELECTED = intersects[0].object;
			var intersected = intersects[0].object;
			console.log(intersects[0].object)
		}


	}
	
	function createControls( camera ) {

		// controls = new TrackballControls( camera, renderer.domElement );
		// controls.rotateSpeed = 4.0;
		// controls.zoomSpeed = 1.2;
		// controls.panSpeed = 0.3;

		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enablePan = false;

		// controls.target.set( 0, 65, 0 );
		controls.target.set( 0, 6, 0 );
		// controls.autoRotate(true);

		controls.keys = [ 65, 83, 68 ];

	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );

		// controls.handleResize();
	}

	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );

		// ChangebyTime();
		var r = Date.now() * 0.0005;
		var rAxis = new THREE.Vector3(0,1,0);
		scene.rotateOnWorldAxis(rAxis, .002);
		// model.rotation.y += 0.002;
		// model.rotateY(r);

		controls.update();
	}


}
