
  import * as THREE from 'three';
  import * as CANNON from 'cannon-es'
  import CannonDebugger from 'cannon-es-debugger';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import * as SkeletonUtils  from 'three/examples/jsm/utils/SkeletonUtils.js';

  var hash_casillas =[];
  hash_casillas.setSize = tablero_size * tablero_size;
  var contador_prueba_borr = 0
  const raycaster = new THREE.Raycaster();
  var object_antiguo 
  export var tablero_size = 80
  const scene = new THREE.Scene();
  var aumento_zoom = 5
  const  mat_libre = new THREE.MeshPhongMaterial({color:0x3a5128});
  const  mat_cam = new THREE.MeshBasicMaterial({color: 0x5c8a33});
  const mat_sel = new THREE.MeshBasicMaterial({color: 0x26d8f0});
  const mat_muro = new THREE.MeshPhongMaterial({color: 0x50300e});
  const angle = 0
  var der = false;
  var iz = false;
  var del = false;
  var atr = false;
  var figura 
  
  var cam_suav = false
  const loader = new GLTFLoader();
  let new_cas_pos
  var objetoIntersectado
  const renderer = new THREE.WebGLRenderer();
  var rotador = 0
  var seleccionada
  var antigua_seleccionada
  var new_cas
  const mouse = new THREE.Vector2();
  const moveSpeed = 0.1; // Ajusta la velocidad de movimiento de camara según tus preferencias
  const cameraPosition = new THREE.Vector3(0, 1.8, 3); // Posición inicial de la cámara
  const camera_desfase_x = -150
  const camera_desfase_z = 200
  var isDragging = false;
  var isrotat = false
  var rotationPoint = new THREE.Vector3(0,0,0,)
  let previousMouseX = 0;
  const radius_cam = 200;
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );//cambiar en movimiento de z a y o al reves y su + o - en el movimiento del yo z cambiado
  //const camera = new THREE.OrthographicCamera(
    //-window.innerWidth / 2, // left
  //window.innerWidth / 2, // right
    //window.innerHeight / 2, // top
    //-window.innerHeight / 2, // bottom
    //0.1, // near
    //500 // far
  //);

  scene.add(camera)
  camera.zoom = 30
  camera.updateProjectionMatrix ()
  camera.rotation.order = 'YXZ';
  camera.position.y = 120;
  camera.position.x = camera_desfase_x;
  camera.position.z = camera_desfase_z;
  camera.rotation.x = -Math.PI / 7;
  camera.rotation.y = -Math.PI / 5;
  //camera.rotation.z = -Math.PI / -10;

  const mundo_fisico = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
  })
  const cannonDebugger = new CannonDebugger(scene, mundo_fisico,{ color :0xaeff00,
  });

  const light = new THREE.PointLight( 0xffffff, 300, 100 );
  light.position.set( 0, 10, 4 );
  light.castShadow = false; // default false
  scene.add( light );



  var casillas_tablero = []
  casillas_tablero.setSize =tablero_size * tablero_size
  for (let i = 0; i < tablero_size-1; i++) {
    casillas_tablero[i] = []
    for (let t = 0; t < tablero_size-1; t++) {
      loader.load('/casilla.glb', function (gltf) {
        let objaux = gltf.scene;
        objaux.traverse(function(node){
          if (node.isMesh){  
            node.material = mat_libre;                  
          }
        }); 
        casillas_tablero[i][t] = []
        casillas_tablero[i][t].push(objaux)
        if (i % 2 === 0) {
        objaux.position.copy(new THREE.Vector3(((i*1.5) ), 0, (t*1.7)));
        } else {
        objaux.position.copy(new THREE.Vector3( ((i*1.5)), 0, ((t*1.7))+ 0.85));
        }
        casillas_tablero[i][t].push(objaux.position)
        casillas_tablero[i][t].push(new THREE.Vector2(i,t))
        let estado_cas = 0
        casillas_tablero[i][t].push(estado_cas)
        objaux.rotation.y = -Math.PI / 6;
        scene.add(objaux);
        hash_casillas[objaux.id] = new THREE.Vector2(i,t)
    },  undefined, function (error) {
        console.error(error);
    });
    }
  }

  //loader.load( '/casilla.glb', function ( gltf ) {
    //let objaux = gltf.scene
  // scene.add( objaux);
  // objaux.position.copy(new THREE.Vector3(3,0,0))
  // objaux.rotation.y = -Math.PI /2;
  //}, undefined, function ( error ) {
    //console.error( error );
  //} );
  //loader.load( '/casilla.glb', function ( gltf ) {
  // let objaux = gltf.scene
  //scene.add( objaux);
  // objaux.position.copy(new THREE.Vector3(1.5,0,0.85))
  //// objaux.rotation.y = -Math.PI /2;
  //}, undefined, function ( error ) {
    //console.error( error );
  //} );
  loader.load( '/Mutante_grande.glb', function ( gltf ) {
    figura = gltf.scene;
    //scene.add(figura)
  }, undefined, function ( error ) {
    console.error( error );
  }
  );
  


  const radius = 1 // m
  const sphereBody = new CANNON.Body({
    mass: 5, // kg
    shape: new CANNON.Sphere(radius),
  })
  sphereBody.position.set(0, 10, 0) // m
  //mundo_fisico.addBody(sphereBody)

  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC, // can also be achieved by setting the mass to 0
    shape: new CANNON.Plane(),
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
  //mundo_fisico.addBody(groundBody)

  const geometry = new THREE.SphereGeometry( 1 );
  const material = new THREE.MeshBasicMaterial( { color:  0x00ffa2 } );
  const cube = new THREE.Mesh( geometry, material );
  //scene.add( cube );

  const geometry2 = new THREE.PlaneGeometry( 10, 10);
  const material2 = new THREE.MeshBasicMaterial( { color: 0xff8000} );
  const suelo = new THREE.Mesh( geometry2, material2 );
  //scene.add( suelo );
  suelo.rotation.x = -Math.PI / 2


  const curve_cust = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-5,-5,0), new THREE.Vector3(5,-3,0), new THREE.Vector3(5,5,0))
  const points_cust = curve_cust.getPoints( 50 );
  const geometry3 = new THREE.BufferGeometry().setFromPoints( points_cust);
  const material3 = new THREE.LineBasicMaterial( { color: 0xaa419f } );

  // Create the final object to add to the scene
  const splineObject = new THREE.Line( geometry3, material3 );
  scene.add(splineObject);




  window.addEventListener('mousemove', (event) => {
    apuntar(mouse)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if ((isDragging || isrotat) && !cam_suav){
      
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
      if (isDragging) {
        const panSpeed = 0.03; // Ajusta la velocidad según tus preferencia
        // Realiza el desplazamiento en el espacio de la cámara
        camera.translateX(-movementX*panSpeed )
        camera.translateY(movementY*panSpeed )
        rotationPoint = new_cas_pos
      }
      else if (isrotat) {
        console.log ("even",mouse.x ,"joder",previousMouseX)
        if (mouse.x > previousMouseX ){
          rotador +=0.1
        }
        else{
          rotador -=0.1
        }
        // Calcula las nuevas coordenadas de la cámara
        const x = rotationPoint.x + radius_cam * Math.cos(rotador);
        const z = rotationPoint.z + radius_cam * Math.sin(rotador);
        
        // Establece la nueva posición de la cámara
        camera.position.set(x, camera.position.y, z);
        // Asegúrate de que la cámara siga mirando hacia el punto de rotación
        camera.lookAt(rotationPoint);
        
      }
    }
    camera.updateProjectionMatrix (); 
    previousMouseX =  mouse.x 
  });

  window.addEventListener('mousedown', () => {
    if (event.button === 2){
      isDragging = true;
    }
    else if(event.button === 1){
      isrotat = true;
    }
    
  });

  window.addEventListener('click', () => {
    if (new_cas[3] === 2){
      cambiar_mat(new_cas[0], 3)
      seleccionada = new_cas
      cambiar_mat(antigua_seleccionada [0], 0)
      antigua_seleccionada = seleccionada
    }
  });

  window.addEventListener('contextmenu', () => {
    event.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    isrotat = false;
  });  

  window.addEventListener('keydown', (event) => {
    const keyCode = event.key;
    let worldPosition_pos; 
    switch (keyCode) {
      case "w": // Tecla "W" (adelante)
      del = true; 
        break;
      case "s": // Tecla "S" (atrás)
        atr = true;
        break;
      case "a": // Tecla "A" (izquierda)
        iz = true;
        break;
      case "d": // Tecla "D" (derecha)
        der = true;
        break;
      case "u": // construir
        console.log("ENTRO",keyCode )
        worldPosition_pos = new THREE.Vector3(0,0,0)
        worldPosition_pos = objetoIntersectado.getWorldPosition(worldPosition_pos)
        let borrable = buscar_casilla(worldPosition_pos);
        if (borrable[3] === 0){
          cambiar_mat(objetoIntersectado,2)
          borrable[3] = 1
        }
        break; 
      case "y"://invocar 
        worldPosition_pos = new THREE.Vector3(0,0,0)
        worldPosition_pos = objetoIntersectado.getWorldPosition(worldPosition_pos)  
        let obj_señalado = buscar_casilla(worldPosition_pos);
        if (obj_señalado[3] === 0){
          invocar_criatura(obj_señalado)
          seleccionada = obj_señalado
          cambiar_mat(obj_señalado[0], 3)
          if (antigua_seleccionada != null){
            cambiar_mat(antigua_seleccionada[0], 0)
          }
          antigua_seleccionada = seleccionada
            };
        break;
      case "t": // centrar
        rotationPoint = seleccionada[1];  
        cam_suav = true
        break;
      
    }
    }
  );

  window.addEventListener('keyup', (event) => {
    const keyCode = event.key;
    if(keyCode == "d") {
      if(der == true){
      der = false}}; 
    if(keyCode == "a") {
      if(iz == true){
        iz = false}}; 
    if(keyCode == "w") {
      if(del == true){
        del = false}}; 
    if(keyCode == "s") {
      if(atr == true){
        atr = false}};       
    }
  );
  
  window.addEventListener('wheel', (event) => {
    
    if (event.deltaY < 0 && camera.zoom < 100){
      camera.zoom += aumento_zoom;
    }
    else if(event.deltaY > 0 && camera.zoom > 5){
      camera.zoom -= aumento_zoom;
    }
    camera.updateProjectionMatrix ();         
    }
  );  

  function animate() {
    let vel_finalX = 0
    let vel_finalY = 0
    if (der == true){
      vel_finalX = 1;
    };
    if (iz== true){
      vel_finalX = -1;
    };
    if (del == true){
      vel_finalY = -1;
    };
    if (atr == true){
      vel_finalY = 1;
    };

    if (cam_suav){
      inter_cam();
    }

    const sensitivity = 0.5; // Ajusta la sensibilidad según tus preferencias
    camera.position.z += (vel_finalX * (sensitivity / (camera.zoom/10))) - ((-vel_finalY * sensitivity / (camera.zoom/10))) ;
    camera.position.x += (vel_finalX * (sensitivity / (camera.zoom/10))) - ((vel_finalY * sensitivity / (camera.zoom/10)));
    camera.updateProjectionMatrix ();   

    splineObject.position.copy(new THREE.Vector3(camera.position.x, camera.position.y + 1, camera.position.z - 10))
    splineObject.rotation.y= camera.rotation.y
    splineObject.rotation.x= camera.rotation.x
    splineObject.rotation.z= camera.rotation.z
    mundo_fisico.fixedStep();
    cannonDebugger.update();
    cube.position.copy(sphereBody.position);
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }
  animate();

  function apuntar(point_win){
    
    raycaster.setFromCamera(point_win, camera); // 'camera' es tu cámara en la escena
    const intersects = raycaster.intersectObjects(scene.children); // 'scene' es la escena de Three.js

    if (intersects.length > 0 ){
      
      // Se ha detectado una intersección con un objeto
      objetoIntersectado = intersects[0].object;
    
      if (object_antiguo == null){
        object_antiguo = objetoIntersectado; 
      };
      if(objetoIntersectado != object_antiguo){
      
        if (!isrotat){
          new_cas_pos = new THREE.Vector3(0,0,0)
          new_cas_pos =  objetoIntersectado.getWorldPosition(new_cas_pos)
          new_cas = buscar_casilla(new_cas_pos);
          if (new_cas[3] === 0){
            cambiar_mat(objetoIntersectado,1);
          }
        }
        let worldPosition_pos = new THREE.Vector3(0,0,0)
        worldPosition_pos = object_antiguo.getWorldPosition(worldPosition_pos)
        let borrable = buscar_casilla(worldPosition_pos);
        console.log("borrabel",borrable[3] )
        if (borrable != null && borrable[3] === 0){
          
          cambiar_mat(object_antiguo,0);
        }
        object_antiguo = objetoIntersectado;
      }
   
    }
  };

  function cambiar_mat(obj, tipo){
    let mate 
    switch (tipo){
      case 0:
        mate = mat_libre;
        break;
      case 1:
        mate = mat_cam;
        break;
      case 2: 
        mate = mat_muro;
        break;
      case 3:
        mate = mat_sel;
        break;
    }
    console.log("mate",tipo)
    obj.traverse(function(node){
      if (node.isMesh){  
        node.material = mate;                  
      }
    });
  };

  function buscar_casilla(pos2key){
    let pos2keyX = pos2key.x
    let pos2keyY = pos2key.z
    let key_i = Math.floor(pos2keyX / 1.5);
    let key_t = Math.floor(pos2keyY / 1.7);
    return casillas_tablero[key_i][key_t]
    }

  function invocar_criatura(cas_ele){
    cas_ele.push(SkeletonUtils.clone(figura));
    cas_ele[4].position.copy(cas_ele[1])
    cas_ele[3] = 2;
    scene.add(cas_ele[4]);
    return cas_ele[4]
  }
  function inter_cam(){
    let alpha = 0.003
    const resultVector = new THREE.Vector3().lerpVectors(camera.position, new THREE.Vector3(seleccionada[1].x, camera.position.y, seleccionada[1].z), alpha);
    camera.position.copy(resultVector)
    if (resultVector.x < cameraPosition.x + 0.5 && resultVector.z < cameraPosition.z + 0.5 ){
      camera.lookAt(seleccionada[1]);
      cam_suav = false
    }
  }