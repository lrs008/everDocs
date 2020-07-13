function newScene() {
    var glbPath = "./assets/glTF/test_model/梯模 TAK1-CCM.glb"
    var scene, renderer, camera;
    var model;
    var xmaxRlt = -10000   // 保存所有使用相对地址的mesh中boundingBox的x最小值
    var xminRlt = 10000 
    var ymaxRlt = -10000
    var yminRlt = 10000
    var zmaxRlt = -10000
    var zminRlt = 10000
    var xMinMeshRlt  	// xmaxRlt对应的mesh
    var xMaxMeshRlt 
    var yMinMeshRlt  
    var yMaxMeshRlt  
    var zMinMeshRlt  
    var zMaxMeshRlt  

    var maxScaleX  = 1  // 如果模型中有mesh使用了相对坐标,则保存这些mesh的scale的最大值(X)



    var xmaxAbs = -10000   // 保存所有使用绝对地址的mesh的最小x
    var xminAbs = 10000    
    var ymaxAbs = -10000
    var yminAbs = 10000
    var zmaxAbs = -10000
    var zminAbs = 10000

    var xMinMeshAbs  	// 保存xminAbs对应的mesh
    var xMaxMeshAbs  
    var yMinMeshAbs   
    var yMaxMeshAbs   
    var zMinMeshAbs   
    var zMaxMeshAbs  
    const OPACITY = 0.87  // 透明度
    var axesHelper = new THREE.AxesHelper( 10 );   // The X axis is red. The Y axis is green. The Z axis is blue.
    var bbox   			// gltf的boundingBox框
    var mesh1Bbox 		// mesh1的boundingBox框

    var IsRelativeAxes  = undefined    // 载入的模型是用的相对坐标
    var IsAbsoluteAxes  = undefined   // 载入的模型是用的绝对坐标



    init();

    function init() {

        var container = document.getElementById( 'container' );
        // container.style.height = "500px";
        // container.style.width = "400px";

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
        dracoLoader.setDecoderPath( './assets/js/jsm/libs/draco/' );  /// set the path of draco_decoder.wasm
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
                        if(object.scale.x > maxScaleX) {
                            maxScaleX = object.scale.x
                        }
                        if(bMax.x > xmaxRlt){
                            xmaxRlt = bMax.x
                            xMaxMeshRlt = object
                        }
                        if(bMax.y > ymaxRlt){
                            ymaxRlt = bMax.y
                            yMaxMeshRlt = object
                        }
                        if(bMax.z > zmaxRlt){
                            zmaxRlt = bMax.z
                            zMaxMeshRlt = object
                        }
                        if(bMin.x < xminRlt){
                            xminRlt = bMin.x
                            xMinMeshRlt = object
                        }
                        if(bMin.y < yminRlt){
                            yminRlt = bMin.y
                            yMinMeshRlt = object
                        }
                        if(bMin.z< zminRlt){
                            zminRlt = bMin.z
                            zMinMeshRlt = object
                        }
    
                    }
                    else{       // 如果用的是绝对坐标,则按mesh的坐标计算即可。

                        IsAbsoluteAxes = true
                        if(object.position.x > xmaxAbs){
                            xmaxAbs = object.position.x
                            xMaxMeshAbs = object
                        }
                        if(object.position.y > ymaxAbs){
                            ymaxAbs = object.position.y
                            yMaxMeshAbs = object
                        }
                        if(object.position.z > zmaxAbs){
                            zmaxAbs = object.position.z
                            zMaxMeshAbs = object
                        }
                        if(object.position.x < xminAbs){
                            xminAbs = object.position.x
                            xMinMeshAbs = object
                        }
                        if(object.position.y < yminAbs){
                            yminAbs = object.position.y
                            yMinMeshAbs = object
                        }
                        if(object.position.z< zminAbs){
                            zminAbs = object.position.z
                            zMinMeshAbs = object
                        }
                    }
                }
            } );	
            console.log(" set gltf.scene.position before: ")
            console.log(model)
            console.log(model.position)
            printPositonInfo() // for debug 
            // set gltf.scene.position
            if(IsAbsoluteAxes){
                gltf.scene.position.x = -(xminAbs + xmaxAbs)/2 ; 
                gltf.scene.position.y = -(yminAbs + ymaxAbs)/2;		 
                gltf.scene.position.z = -(zminAbs + zmaxAbs)/2;  	  
            }else if(IsRelativeAxes){
                xminRlt = xminRlt * maxScaleX
                yminRlt = yminRlt * maxScaleX
                zminRlt = zminRlt * maxScaleX
                xmaxRlt = xmaxRlt * maxScaleX
                ymaxRlt = ymaxRlt * maxScaleX
                zmaxRlt = zmaxRlt * maxScaleX
                gltf.scene.position.x = -(xminRlt + xmaxRlt)/2 ;	 
                gltf.scene.position.y = 0;		 
                gltf.scene.position.z = (yminRlt + ymaxRlt)/2;  	//模型的y轴和Z轴相反了.所以这里用y的坐标
            }else{
                console.log(" 坐标错误!")
            }
            console.log(" set gltf.scene.position after: ")
            console.log(gltf.scene)
            console.log(gltf.scene.position)
            scene.add( model );
            bbox = new THREE.BoundingBoxHelper(gltf.scene, 0xDC143C);
            bbox.update();
            scene.add(bbox);
            // camera.position.set( model.position.x, model.position.y, model.position.z+6 );  
            // camera.position.set( 0, 1, 5 );  
            animate();

        } );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );

        window.innerWidth = window.innerWidth*.65;
        window.innerHeight = window.innerHeight*.65;
        renderer.setSize( window.innerWidth, window.innerHeight );
        
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        // camera
        //orthographic
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );
        // camera.position.set( 0, 80, 360 );  
        camera.position.set( 0, 3, 14 );  
        // camera.position.set( model.position.x, model.position.y, model.position.z+6 );  
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

    function printPositonInfo(){
          // for debug  begin
          console.log("[printPositonInfo]   IsRelativeAxes,IsAbsoluteAxes = ",IsRelativeAxes,IsAbsoluteAxes)
          if(IsAbsoluteAxes === true){
              if(IsRelativeAxes){
                  console.log("[printPositonInfo]  警告! 模型同时用了相对和绝对坐标。以绝对坐标为准!")
              }else{
                  console.log("[printPositonInfo]  只用了绝对坐标")
              }
              model.position.x = -(xminAbs + xmaxAbs)/2 ; 
              model.position.y = 0;		 
              model.position.z = -(zminAbs + zmaxAbs)/2;  	  // 绝对的坐标没有反
              var V3XYZ = new THREE.Vector3(xminAbs, yminAbs, zminAbs);
              console.log("[printPositonInfo]  Min.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxAbs, ymaxAbs, zmaxAbs));
              V3XYZ = new THREE.Vector3(xmaxAbs, ymaxAbs, zmaxAbs);
              console.log("[printPositonInfo]  Max.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxAbs, ymaxAbs, zmaxAbs));
              
              V3XYZ = new THREE.Vector3(xmaxAbs - xminAbs, ymaxAbs - yminAbs, zmaxAbs - zminAbs);
              console.log("[printPositonInfo]  Diff.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxAbs, ymaxAbs, zmaxAbs));
              
              console.log("[printPositonInfo]  xMaxMeshAbs",xMaxMeshAbs)
              console.log("[printPositonInfo]  xMinMeshAbs",xMinMeshAbs)
              console.log("[printPositonInfo]  yMaxMeshAbs",yMaxMeshAbs)
              console.log("[printPositonInfo]  yMinMeshAbs",yMinMeshAbs)
              console.log("[printPositonInfo]  zMaxMeshAbs",zMaxMeshAbs)
              console.log("[printPositonInfo]  zMinMeshAbs",zMinMeshAbs)
  
              console.log("[printPositonInfo]  (xminAbs + xmaxAbs)/2 = " + (xminAbs + xmaxAbs)/2)
              console.log("[printPositonInfo]  (yminAbs + ymaxAbs)/2= "+(yminAbs + ymaxAbs)/2)
              console.log("[printPositonInfo]  (zminAbs + zmaxAbs)/2="+(zminAbs + zmaxAbs)/2)
          }
          else{
              console.log("[printPositonInfo]  只用了相对坐标")
              var V3XYZ = new THREE.Vector3(xminRlt, yminRlt, zminRlt);
              console.log("[printPositonInfo]  Min.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxRlt, ymaxRlt, zmaxRlt));
              V3XYZ = new THREE.Vector3(xmaxRlt, ymaxRlt, zmaxRlt);
              console.log("[printPositonInfo]  Max.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxRlt, ymaxRlt, zmaxRlt));
              
              V3XYZ = new THREE.Vector3(xmaxRlt - xminRlt, ymaxRlt - yminRlt, zmaxRlt - zminRlt);
              console.log("[printPositonInfo]  Diff.XYZ: " , V3XYZ);  //THREE.Vector3(xmaxRlt, ymaxRlt, zmaxRlt));
  
              
              console.log("[printPositonInfo]  xMaxMeshRlt",xMaxMeshRlt)
              console.log("[printPositonInfo]  xMinMeshRlt",xMinMeshRlt)
              console.log("[printPositonInfo]  yMaxMeshRlt",yMaxMeshRlt)
              console.log("[printPositonInfo]  yMinMeshRlt",yMinMeshRlt)
              console.log("[printPositonInfo]  zMaxMeshRlt",zMaxMeshRlt)
              console.log("[printPositonInfo]  zMinMeshRlt",zMinMeshRlt)
  
              console.log("[printPositonInfo]  (xminRlt*maxScaleX + xmaxRlt*maxScaleX)/2 = " + (xminRlt*maxScaleX + xmaxRlt*maxScaleX)/2)
              console.log("[printPositonInfo]  (yminRlt*maxScaleX + ymaxRlt*maxScaleX)/2= "+(yminRlt*maxScaleX + ymaxRlt*maxScaleX)/2)
              console.log("[printPositonInfo]  (zminRlt*maxScaleX + zmaxRlt*maxScaleX)/2="+(zminRlt*maxScaleX + zmaxRlt*maxScaleX)/2)
          }
          console.log("[printPositonInfo] maxScaleX =  ",maxScaleX )

     
          // for debug  end
    }

}


function displayDate(){
    console.log("######## in newScene.js ######### ")
    document.getElementById("demo").innerHTML=Date();
  }
