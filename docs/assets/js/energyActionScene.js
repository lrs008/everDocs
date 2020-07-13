const { convertCompileOnSaveOptionFromJson } = require("typescript");


/*
    breif       :  能源交互3D展示
    history     :  renbin.guo created 20200616
                   renbin.guo modified 20200619  用射线代替THREEx实现鼠标事件
                                                ref : https://blog.csdn.net/zhulx_sz/article/details/79374129
                 
    detail      :  基于newScene.js修改，主要修改为：
                    1.  模型位置不正，修改gltf.scene.position.x = -(xmin + xmax)/2  等3行
                    2.  摄像机太远  修改camera.position.set( 0, 10, 10 );  
                    3.  yMaxmesh在newScene.js没有用到,修改这个bug
                    4.  模型由地钉钉群"空调知识体系"提供VE150机组.STEP文件，通过CAD assistant直接另存为glb(未压缩)
                    5.  去掉处理压缩的代码，因为此模型没有压缩
                    6:  加标签  ref :   https://threejs.org/examples/#css2d_label
                        有个问题:
                        objectdiv.style.display = "none"; 官网用的display不起作用
                        必须用visibility来代替
                        objectdiv.style.visibility = "hidden";  // visible
                    7. 适配手机触屏  ref : https://www.codicode.com/art/easy_way_to_add_touch_support_to_your_website.aspx
*/ 
function energyActionScene(infoList) {
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
    var yMaxmesh  
    var zMinMesh  
    var zMaxMesh  
    const  OPACITY = 1 // 1  // 透明度
    var bbox   			// gltf的boundingBox框
    var objectBBox
    var meshCount = 0
    var textMesh
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var listMesh = [];
    var selectedObject; // 当前单击的对象
    var hoveringObject  // 当前悬停的对象
    var labelRenderer = new THREE.CSS2DRenderer();
    var pointInformationPopupBox 
    // 保存上次点击对象与属性
    var previousGroup;
    var previousMeshMaterials = [];
    var axesHelper = new THREE.AxesHelper( 2);  // for debug 辅助

     

    init();

    function init() {

        infoList.push({key:'长度(m)',value: 5.0 })
        infoList.push({key:'宽度(m)',value: 1.3 })
        infoList.push({key:'高度(m)',value: 2.0 })


        var container = document.getElementById( 'container' );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x606060 );
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 2020 );
        scene.add(axesHelper)

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


        // 文字标签
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none'; // 这个必须加上，不然模型无法移动了
        container.appendChild(labelRenderer.domElement);

        // ground
        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        // scene.add( axesHelper );
        // 只有模型通过draco压缩后的才需要这段代码,否则直接注释掉即可。  process draco begin 
        var loader = new THREE.GLTFLoader();
        // var dracoLoader = new THREE.DRACOLoader();
        // dracoLoader.setDecoderPath( '../assets/js/jsm/libs/draco/' );  /// set the path of draco_decoder.wasm
        // loader.setDRACOLoader( dracoLoader );
        // process draco end 

        // loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {
        // loader.load( 'gltf/kr-Cm-rdu.gltf', function ( gltf ) {
        // loader.load( 'glTF/a2.5_out/a2.5.gltf', function ( gltf ) {
        loader.load( '../assets/glTF/VE150groupNamed.glb', function ( gltf ) {  // 这个是未压缩的
            model = gltf.scene;
            model.rotation.x =  Math.PI/2   // 导入的模型上下颠倒了，所以需要选择转过来
            // 显示gltf.scene的Boundbox 
            bbox = new THREE.BoundingBoxHelper(gltf.scene, 0xDC143C);
            bbox.update();
            // scene.add(bbox);
            model.traverse( function ( object ) {
                if ( object.type === 'Mesh' ) {
                    listMesh.push(object)
                    // console.log(" # object = ")
                    // console.log(object.name)
                    meshCount = meshCount + 1 ;
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
                        yMaxmesh = object
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
            if(object.type === 'Group' && object.name !== ""){
                object.userData.desc = "该部件暂无知识！"
                
                if(object.name === 'SOLID1'){
                    object.name  = 'Chilled W. inlet'
                    // object.userData.name  = 'Chilled W. inlet'
                    object.userData.desc =
                    "Chilled Water:<br>\
                    1. Load Adjustment, Prevent low temperature tube freezing.<br> \
                    2. Cooling Capacity, COP Calculation\
                    "
                    object.traverse( function ( mesh ) {    // 入水管1 红
                        setMeshMaterial(mesh,0x2C93E8,false);   
                    } )
                }
                if(object.name === 'SOLID2'){       // 支架角1 橙
                    
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0xECE5CE);   
                    } )
                }
                if(object.name === 'SOLID3'){
                    object.traverse( function ( mesh ) {  // 支架角2 橙
                        setMeshMaterial(mesh,0xECE5CE);   
                    } )
                }
                if(object.name === 'SOLID4'){  // 支架角3 橙
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0xECE5CE);    
                    } )
                }
                if(object.name === 'SOLID5'){
                    object.traverse( function ( mesh ) {  // 支架角4 橙
                        setMeshMaterial(mesh,0xECE5CE);   
                    } )
                }
                if(object.name === 'SOLID6'){    // 底板1  黄
                    object.name === 'floor1'
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0x774F38);    
                    } )
                }
                if(object.name === 'SOLID7'){
                    object.name  = '蒸发器'
                    object.userData.desc ="主机包含了蒸发器 冷凝器 低发"
                    object.traverse( function ( mesh ) {  // 主机左 绿色
                        setMeshMaterial(mesh,0xC5E0DC);   
                    } )
                }
                if(object.name === 'SOLID8'){           // 主机盖左 蓝
                    object.name  = 'Burner1'
                    console.log(" rotate object.position = ")
                    console.log(object.position)
                    const animate = () => {
                        requestAnimationFrame(animate);
                        object.rotateY(Math.PI / 40);
                      };
                    // animate();     // 启动旋转动画！
                    objectBBox = new THREE.BoundingBoxHelper(object, 0xDC143C);
                    objectBBox.update();
                    // scene.add(objectBBox);
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0xF1D4AF);   
                    } )
                }
                if(object.name === 'SOLID9'){
                    object.name  = 'Burner2'
                    object.traverse( function ( mesh ) {  // 主机盖右 蓝
                        setMeshMaterial(mesh,0xF1D4AF);    
                    } )
                }
                if(object.name === 'SOLID10'){
                    object.traverse( function ( mesh ) {  // 正方体小盖子第一层 紫色
                        setMeshMaterial(mesh,0x800080);   
                    } )
                }
                if(object.name === 'SOLID11'){
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0xFFFFFF);   // 正方体小盖子第二层 白色   6.128882864	w.s


                    } ) 
                }
                if(object.name === 'SOLID12'){
                    object.name  = 'floor2'
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0x774F38);   // 底板2  黄
                    } )
                }
                if(object.name === 'SOLID13'){   // 主机2 灰色
                    object.name  = 'Generator Hight Temp'
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0xE08E79);    
                    } )
                }
                if(object.name === 'SOLID14'){   // 红色圆嘴     蒸汽角阀
                    object.name  = 'Steam angle valve'
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0x774F38);    
                    } )
                }
                if(object.name === 'SOLID15'){
                    object.traverse( function ( mesh ) {
                        setMeshMaterial(mesh,0x182C7C);   // 黑色弯管
                    } )
                }
                addDivOnGroup(object)

            }
         });	

            // gltf.scene.position.x = -(xmin + xmax)/2  ;	//-(xmin + xmax)/2     
            // gltf.scene.position.y = -(ymin + ymax)/2;		//-(ymin + ymax)/2
            // gltf.scene.position.z = (zmin + zmax)/2;  	//(zmin + zmax)/2
            console.log("gltf.scene =")
            console.log(gltf.scene)
            scene.add( model );
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
        camera.position.set( 0, 10, 10 );  
        console.log("camera = ")
        console.log(camera)

        var controls = new THREE.OrbitControls( camera, renderer.domElement );
        // controls.enablePan = false;
        // controls.enableZoom = false;
        controls.target.set( 0, 1, 0 );
        controls.update();

        console.log("### container = ")
        console.log(container)
        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener('mousedown', onDocumentMouseDown, false);       // 鼠标单击事件
        window.addEventListener('mousemove', onDocumentMouseMove, false);
        // window.addEventListener('touchstart', onDocumentTouchstart, false);
        // window.addEventListener('touchend', onDocumentTouchend, false);
        // document.addEventListener('touchstart', touch2Mouse, false);
        // document.addEventListener('touchend', touch2Mouse, false);


        document.addEventListener('touchstart', onDocumentTouchstart, false);


    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    /*
        breif   :   该函数不断自动周期执行
    */ 
    function animate() {
        requestAnimationFrame( animate );
        render();
        // renderer.render( scene, camera );
        // labelRenderer.render(scene, camera);
    }

 
    function render(){
        // console.log("###### call render()")
        renderer.render( scene, camera );
        labelRenderer.render(scene, camera);
    }


    			
    function LambertMaterial( mColor, bOpacity = true ) {
        // mColor = 0x040404;
        var material = new THREE.MeshLambertMaterial({color: mColor});	 
        if(bOpacity) {
            material.opacity = OPACITY;
            material.transparent = true;
        }
        return material;
    }
    function setMeshMaterial(object,color,bOpacity = false) {
        
        if ( object.isMesh ) {
            object.material = LambertMaterial( color, bOpacity );
        }
           
    }


    
    /***************************************************************
     * breif        :   通过射线检测单击的物体
     * inputs       :   [string]    content :   文字内容
     *                  [float ]    x       :   x坐标     
     *                  [float ]    y       :   y坐标     
     *                  [float ]    z       :   z坐标     
     * returns      :   None
     * note         :   如果当前没有点中任何物体,那么tag标签则不变。而attr标签会消失
     * 
    ***************************************************************/ 
    function onDocumentMouseDown(event) {
        // infoList = []
        console.log("onDocumentMouseDown ")

        let intersects = getIntersects(event)  // 获取与射线相交的所有对象
        processAttrShow(intersects)
          // select 是一个mesh
        if (intersects.length > 0) {
            selectedObject = intersects[0].object;
            processColorChange(selectedObject)
            // object = selectObjectLoop(intersects[0].object.parent);
            object = selectedObject.parent
            processTagShow(object)
        }
        else{
            // do nothing
        }
    }


    function onDocumentMouseMove(event) {
        // alert("onDocumentMouseMove ")
        console.log("onDocumentMouseMove ")
        let intersects = getIntersects(event)       // 获取与射线相交的所有对象

        if (intersects.length > 0) {    // 如果悬停在了对象上,则显示悬停对象的div
            selectedObject = intersects[0].object; 
            processColorChange(selectedObject)
            object = selectedObject.parent
            processTagShow(object)

        }
        else{  // 如果没悬停在了对象上,则取消之前悬停对象的div 
            if (hoveringObject !== undefined) {
                hoveringObject.children.map((data) => {
                  if (data.type === "Object3D" && data.name === "Hover") {
                    // data.element.style.display = "none";
                    data.element.style.visibility = "hidden";
                  }
                });
              }
              hoveringObject = undefined;
        }
    }


    /*
        onDocumentTouchstart version1   不行
    */
    // function onDocumentTouchstart(e){
    //     selectedObject = e.changedTouches[0];
    //     processColorChange(selectedObject)
    //     object = selectedObject.parent
    //     processTagShow(object)
    // }


        /*
        onDocumentTouchstart version2
    */
   function onDocumentTouchstart(e){

        var theTouch = e.changedTouches[0];
        //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
        let rect = container.getBoundingClientRect();
        mouse.x = (theTouch.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = -(theTouch.clientY - rect.top) / rect.height * 2 + 1;

        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera(mouse, camera);

        // 获取raycaster直线和所有模型相交的数组集合
        let intersects = raycaster.intersectObjects(listMesh);

		if (intersects.length < 1) {
			return;
		}
        selectedObject = intersects[0].object;  // select 是一个mesh
        processColorChange(selectedObject)
        if (intersects.length > 0) {
            object = selectedObject.parent
            processTagShow(object)
        }

    }

    function onDocumentTouchend(event){
        console.log("###### onDocumentTouchend ")
        let intersects = getIntersects(event)  // 获取与射线相交的所有对象

		if (intersects.length < 1) {
			return;
		}
        selectedObject = intersects[0].object;  // select 是一个mesh
        processColorChange(selectedObject)
        if (intersects.length > 0) {
            // object = selectObjectLoop(intersects[0].object.parent);
            object = selectedObject.parent
            processTagShow(object)
        }
    }
    
    function addDivOnGroup(object) {
        var objectdiv = document.createElement( 'div' );
        objectdiv.width = '10px'
        objectdiv.height = '50px'
        objectdiv.style.backgroundColor = '#000000';
        objectdiv.style.opacity = 0.61;
        objectdiv.style.borderRadius='5px';
        // objectdiv.style.display = "none";

        let infoDiv = document.createElement('div');
        infoDiv.style.position = "relative";
        infoDiv.style.margin = '10px';
        var objnameP = document.createElement( 'p' );
        objnameP.style.fontWeight = 'bold';
        objnameP.style.color = 'white';
        objnameP.innerHTML = object.name
        var knowledgeP= document.createElement( 'p' );
        knowledgeP.innerHTML = object.userData.desc
        knowledgeP.style.color = 'white';
        infoDiv.appendChild(objnameP)
        infoDiv.appendChild(knowledgeP)
        objectdiv.appendChild(infoDiv);

        objectdiv.style.visibility = "hidden";  // visible
        var CSS2DObject = new THREE.CSS2DObject( objectdiv );
        console.log("--addDivOnGroup--")
        console.log(object)
        console.log(object.position)
        console.log(object.userData.name)
        // object.userData.desc = 'shwfeihwieh'
        // console.log(object.userData.desc)
        console.log(object)

        CSS2DObject.position.set( 0,0,-3 );  // 这里的坐标是相对于object的坐标
        CSS2DObject.name = 'Hover'
        // CSS2DObject.position.set(object.position.x, object.position.y+4, object.position.z);
        object.add( CSS2DObject );
        // for debug
        // object.children.map((data) => {
        //     if (data.type === "Object3D" && data.name === "Hover") {            // 打印是否初始化display设置是否成功
        //         console.log(object)
        //         console.log(data.element.style.visibility)
        //     }
        //   })
    }

    /*
        breif   : 遍历object 到离scene最近的group 返回
    */ 
    function selectObjectLoop(object) {
        if (object.parent.type === "Scene") {
          return object;
        }
        else {
          return  selectObjectLoop(object.parent);
        }
      }

      
    function backupMaterials(object, tempList) {
        // console.log(" ### call backupMaterials ")
        if (object !== undefined && object.type === "Mesh") {
        if (object.material instanceof Array) {
            object.material.map((list) => {
            // list.color.set(0xff0000)
            if (tempList.indexOf(list.name) === -1) {
                previousMeshMaterials.push(list.clone());
                tempList.push(list.name);
            }
            })
        }
        else {
            if (tempList.indexOf(object.material.name) === -1) {
            previousMeshMaterials.push(object.material.clone());
            tempList.push(object.material.name);
            }
        }
        }
        else if (object !== undefined && object.type === "Group" && object.children.length !== 0) {
        object.children.map((data) => {
            backupMaterials(data, tempList);
        })
        }
  }


  function changeMaterialsColor(object) {
    // console.log(" ### call changeMaterialsColor ")

    if (object !== undefined && object.type === "Mesh") {
      if (object.material instanceof Array) {
        object.material.map((list) => {
          list.color.set('#ADFF2F')
        })
      }
      else {
        object.material.color.set('#ADFF2F')
      }
    }
    else if (object !== undefined && object.type === "Group" && object.children.length !== 0) {
      object.children.map((data) => {
        changeMaterialsColor(data);
      })
    }
  }

  function returnMaterialsColor(data) {
    // console.log(" ### call returnMaterialsColor ")
    if (data.type === "Mesh") {
      if (data.material instanceof Array) {
        data.material.map((data) => {
          previousMeshMaterials.map((material) => {
            if (material.name === data.name) {
              data.color = material.color;
            }
          })
        })
      }
      else {
        previousMeshMaterials.map((material) => {
          if (material.name === data.material.name) {
            data.material.color = material.color;
          }
        })
      }
    }
    else if (data.type === "Group") {
      data.children.map((info) => {
        returnMaterialsColor(info);
      })
    }
  }


    /*
        breif   :   对选中的对象改变颜色
    */ 
   function processColorChange(selectedObject){
        if (previousGroup !== undefined) {  // 还原之前选中对象的颜色
            for (var i = 0; i < previousGroup.children.length; i++) {
                returnMaterialsColor(previousGroup.children[i]);
            }
        }
        if (selectedObject !== undefined) {     // 如果当前选的group不为空
            //切换被选中状态
            previousGroup = selectedObject.parent;
            previousMeshMaterials = [];
            //储存已修改过的Materials的名字
            var tempList = [];
            for (var i = 0; i < selectedObject.parent.children.length; i++) {
                backupMaterials(selectedObject.parent.children[i], tempList);       // 备份当前选择对象的颜色
                changeMaterialsColor(selectedObject.parent.children[i]);            // 将当前对象的颜色设置为新颜色
            }
        }
        else {
            previousGroup = undefined;
            previousMeshMaterials = [];
        }
    }   



    /*
        breif   :   控制标签的显示隐藏
    */ 
    function processTagShow(object){
        if (object !== hoveringObject) {    // 选择了新的group
            if (hoveringObject !== undefined) {     // 隐藏之前选择group的tag
                hoveringObject.children.map((data) => {
                    if (data.type === "Object3D" && data.name === "Hover") {
                        // data.element.style.display = "none";
                        data.element.style.visibility = "hidden";  // visible
                    }
                })
            }
            hoveringObject = object;
            hoveringObject.children.map((data) => {    // 显示新group对象的tag
                if (data.type === "Object3D" && data.name === "Hover") {
                    console.log(data.element.style.display)
                    // data.element.style.display = "block";
                    data.element.style.visibility = "visible";  // visible
                    // data.element.style.color = "red";
                    data.name = "Hover";
                }
            })

        }
    }


     /*
        breif   :   控制属性div的显隐
        inputs  :   intersects 射线选中的对象
    */ 
    function processAttrShow(intersects){
        var infoDiv = document.getElementById('info');
		if (intersects.length < 1) {
            console.log("############ infoDiv = ")
            console.log(infoDiv)
            infoDiv.style.display = 'none';
        }
        else{
            selectedObject = intersects[0].object; 
            object = selectedObject.parent
            infoDiv.style.display = 'block';
            infoList.length = 0  // 情况infoList但是内存地址不变,不能infoList = []
            console.log(" ##### processAttrShow object = ")
            console.log(object)
            infoList.push({key:'模型名称',value: object.name})
            infoList.push({key:'模型描述',value: object.userData.desc})
        }
    }


    /*
        breif   : 获取与射线相交的所有对象
    */
    function getIntersects(event){
        //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
        let rect = container.getBoundingClientRect();

        mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera(mouse, camera);

        // 获取raycaster直线和所有模型相交的数组集合
        let intersects = raycaster.intersectObjects(listMesh);
        return intersects
    }

    function touch2Mouse(e)
    {
        var theTouch = e.changedTouches[0];
        var mouseEv;

        switch(e.type)
        {
            case "touchstart": mouseEv="mousedown"; break;  
            // case "touchend":   mouseEv="mouseup"; break;
            // case "touchmove":  mouseEv="mousemove"; break;
            default: return;
        }

        var mouseEvent = document.createEvent("MouseEvent");
        mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
        theTouch.target.dispatchEvent(mouseEvent);

        e.preventDefault();
    }

    




}
