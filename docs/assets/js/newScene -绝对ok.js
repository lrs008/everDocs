
function newScene(glbPath) {
    var scene, renderer, camera;
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
    var yMaxMesh  
    var zMinMesh  
    var zMaxMesh  


    var xmaxAbs = -10000   // 保存所有mesh中绝对地址的边界
    var xminAbs = 10000    
    var ymaxAbs = -10000
    var yminAbs = 10000
    var zmaxAbs = -10000
    var zminAbs = 10000

    // var xMinMeshAbs  	// 保存所有mesh中绝对地址的边界
    // var xMaxMeshAbs  
    // var yMinMeshAbs   
    // var yMaxMeshAbs   
    // var zMinMeshAbs   
    // var zMaxMeshAbs  
    const  OPACITY = 0.5  // 透明度
    var axesHelper = new THREE.AxesHelper( 10 );   // The X axis is red. The Y axis is green. The Z axis is blue.
    var bbox   			// gltf的boundingBox框
    var mesh1Bbox 		// mesh1的boundingBox框

    var IsRelativeAxes  = undefined    // 载入的模型是用的相对坐标
    var IsAbsoluteAxes  = undefined   // 载入的模型是用的绝对坐标

    init();

    function init() {

        var container = document.getElementById( 'container' );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x606060 );
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 2020 );

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
        dracoLoader.setDecoderPath( '../assets/js/jsm/libs/draco/' );  /// set the path of draco_decoder.wasm
        loader.setDRACOLoader( dracoLoader );
        // process draco end 

        // loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {
        // loader.load( 'gltf/kr-Cm-rdu.gltf', function ( gltf ) {
        // loader.load( 'glTF/a2.5_out/a2.5.gltf', function ( gltf ) {
        loader.load( glbPath, function ( gltf ) {
            model = gltf.scene;
            console.log("gltf.scene.position = ",gltf.scene.position)
            model.traverse( function ( object ) {

                if ( object.isMesh ) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                    object.material.opacity = OPACITY;
                    object.material.transparent = true;
                    // 遍历所有mesh，找出最小和最大的boundingBox.position.x ,y,z 极其对于的mesh
                    var  bMax = object.geometry.boundingBox.max
                    var bMin = object.geometry.boundingBox.min
                    // console.log("bMin.xyz = ",bMin.x ,bMin.y,bMin.z)
                    // console.log("bMax.xyz = ",bMax.x ,bMax.y,bMax.z)
                    console.log("objectname ,object.position.x,y,z =  ",object.name,object.position.x,object.position.y,object.position.z)
                    console.log("object.geometry.boundingBox =  ",object.geometry.boundingBox)
                    if(object.position.x === 0 && object.position.y === 0 && object.position.z === 0){  // MEsh用的是相对坐标.则用Boundbox来计算
                        IsRelativeAxes = true
                        if(bMax.x > xmax){
                            xmax = bMax.x
                            xMaxMesh = object
                        }
                        if(bMax.y > ymax){
                            ymax = bMax.y
                            yMaxMesh = object
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
    
                    }
                    else{       // 如果用的是绝对坐标,则按mesh的坐标计算即可。

                        IsAbsoluteAxes = true
                        if(object.position.x > xmaxAbs){
                            xmaxAbs = object.position.x
                        }
                        if(object.position.y > ymaxAbs){
                            ymaxAbs = object.position.y
                        }
                        if(object.position.z > zmaxAbs){
                            zmaxAbs = object.position.z
                        }
                        if(object.position.x < xminAbs){
                            xminAbs = object.position.x
                        }
                        if(object.position.y < yminAbs){
                            yminAbs = object.position.y
                        }
                        if(object.position.z< zminAbs){
                            zminAbs = object.position.z
                        }
                    }
                }
            } );	

            // for debug 
            // console.log("Min: x, y, z: ", xmin, ymin, zmin);
            if(IsRelativeAxes === true && IsAbsoluteAxes === true){
                console.log("警告!模型同时用了相对和绝对坐标。以绝对坐标为准")
            }
            else if(IsRelativeAxes){
                xmin = xmin*30
                ymin = ymin*30
                zmin = zmin*30
                xmax = xmax*30
                ymax = ymax*30
                zmax = zmax*30
            }
            else if(IsAbsoluteAxes){
                // do nothing , 不需要乘以30 
            }

            var V3XYZ = new THREE.Vector3(xmin, ymin, zmin);
            console.log("Min.XYZ: " , V3XYZ);  //THREE.Vector3(xmax, ymax, zmax));
            V3XYZ = new THREE.Vector3(xmax, ymax, zmax);
            console.log("Max.XYZ: " , V3XYZ);  //THREE.Vector3(xmax, ymax, zmax));
            
            V3XYZ = new THREE.Vector3(xmax - xmin, ymax - ymin, zmax - zmin);
            console.log("Diff.XYZ: " , V3XYZ);  //THREE.Vector3(xmax, ymax, zmax));

            
            console.log("xMaxMesh",xMaxMesh)
            console.log("xMinMesh",xMinMesh)
            console.log("yMaxMesh",yMaxMesh)
            console.log("yMinMesh",yMinMesh)
            console.log("zMaxMesh",zMaxMesh)
            console.log("zMinMesh",zMinMesh)


            console.log("(xmin + xmax)/2 = " + (xmin + xmax)/2)
            console.log("(ymin + ymax)/2= "+(ymin + ymax)/2)
            console.log("(zmin + zmax)/2="+(zmin + zmax)/2)
            console.log(gltf.scene)
            console.log(gltf.scene.position)
            console.log(" set gltf.scene after ")
            console.log("IsRelativeAxes,IsAbsoluteAxes = ",IsRelativeAxes,IsAbsoluteAxes)
            if(IsRelativeAxes === true && IsAbsoluteAxes === true){
                console.log("警告!模型同时用了相对和绝对坐标")
                gltf.scene.position.x = -(xminAbs + xmaxAbs)/2 ; 
                gltf.scene.position.y = 0;		 
                gltf.scene.position.z = -(zminAbs + zmaxAbs)/2;  	  // 警告!模型同时用了相对和绝对坐标.则使用绝对坐标
            }
            else if(IsRelativeAxes){
                console.log("只用了相对坐标。")
                gltf.scene.position.x = -(xmin + xmax)/2 ;	//-(xmin + xmax)/2     
                gltf.scene.position.y = 0;		//-(ymin + ymax)/2
                gltf.scene.position.z = (ymin + ymax)/2;  	//模型的y轴和Z轴相反了
            }
            else if(IsAbsoluteAxes){
                console.log("只用了绝对坐标。")
                gltf.scene.position.x = -(xminAbs + xmaxAbs)/2 ; 
                gltf.scene.position.y = 0;		 
                gltf.scene.position.z = -(zminAbs + zmaxAbs)/2;  	  // 绝对的坐标没有反
            }

        

            // gltf.scene.position.x = -8.93825817108154;	//-(xmin + xmax)/2     
            // gltf.scene.position.y = 0;		//-(ymin + ymax)/2
            // gltf.scene.position.z = 12.1;  	//模型的y轴和Z轴相反了

            console.log(gltf.scene)
            console.log(gltf.scene.position)
            scene.add( model );
            bbox = new THREE.BoundingBoxHelper(gltf.scene, 0xDC143C);
            bbox.update();
            scene.add(bbox);
            animate();

        } );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        // camera
        //orthographic
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        // camera.position.set( 0, 80, 360 );  
        camera.position.set( 0, 3, 14 );  
        console.log("camera = ")
        console.log(camera)

        var controls = new THREE.OrbitControls( camera, renderer.domElement );
        // controls.enablePan = false;
        // controls.enableZoom = false;
        // controls.target.set( 0, 1, 0 );
        controls.update();
        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }
}
