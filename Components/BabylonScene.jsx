"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  ExtrudePolygon,
  HemisphericLight,
  MeshBuilder,
  PointerDragBehavior,
  PolygonMeshBuilder,
  Scene,
  StandardMaterial,
  Vector2,
  Vector3,
  VertexBuffer,
} from "@babylonjs/core";
import * as earcut from "earcut";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import CreateButton from "./CreateButton";

const BabylonScene = () => {
  // Using useRef to get a reference to the Babylon.js scene
  const sceneRef = useRef(null);

  let drawActive = false; // Flag for draw mode
  let moveVertsActive = false; // Flag for vertex editing mode
  let moveActive = false; // Flag for move mode
  let extrudeActive = false; // Flag for extrude mode
  let extruded = false; // Flag to track if an object is extruded
  const [activeBtn,setActiveBtn] = useState(-1);
  const [loading,setLoading] = useState(false);
  // PointerDragBehavior for mouse interactions
  const pointerDrag = new PointerDragBehavior({
    dragPlaneNormal: Vector3.Up(),
  });
  useEffect(() => {
    // Create the Babylon.js scene
    const engine = new Engine(sceneRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.9, 0.9, 0.9); // Set the Background Color to light gray
    // Create a camera and position it
    const camera = new ArcRotateCamera(
      "camera",
      0,
      0,
      10,
      Vector3.Zero(),
      scene
    );
    camera.position = new Vector3(0, 10, -10);
    // Attach the Camera's Control to the scene
    camera.attachControl(sceneRef.current, true);
    // Create Ambient Lighting for the scene
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    // Create a ground plane
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 19, height: 10 },
      scene
    );
    const groundmat = new StandardMaterial("groundMat", scene);
    groundmat.diffuseColor = new Color3(1,1,1);
    ground.material = groundmat;

    // Create a default material that can be used for buffer shapes
    const mat = new StandardMaterial("mat", scene);
    // set the emmissive color of the created material to gray
    mat.emissiveColor = Color3.Gray();
    // Arrays and variables to store data for drawing and editing shapes

    let bufferMeshes = []; // Array to store temporary meshes during shape drawing
    let positions = []; // Array to store vertex positions during shape drawing
    let positionsBuffer = []; // Temporary buffer for vertex positions during shape drawing
    let polygon = null; // Reference to the polygon being drawn
    let mesh = null; // Reference to the extruded mesh
    let depth = 2; // Fixed value for the extrusion height
    let vertexcontrols = []; // Array to store control points for vertex editing

    // Create a material for the extruded mesh and set its properties
    const extrudeMat = new StandardMaterial("Extruded Mesh Material", scene);
    extrudeMat.diffuseColor = Color3.Green();
    extrudeMat.backFaceCulling = false;
    extrudeMat.twoSidedLighting = true;

    function updateMeshEdges(mesh) {
      mesh.enableEdgesRendering();
      mesh.edgesWidth = 2.0;
      mesh.edgesColor = new Color4(0, 0, 0, 1);
    }

    scene.onPointerDown = (evt) => {
      // pick the mesh at the pointer position
      const hit = scene.pick(scene.pointerX, scene.pointerY);
      // the evt.button will be zero for left mouse button, and 2 for right mouse button

      // Check if draw mode is active and a mesh is picked
      if (hit.faceId !== -1 && drawActive) {
        extruded = false;
        if (evt.button === 0) {
          // Create a material for the placeholder spheres
          const placeholderMat = new StandardMaterial("placeholderMat", scene);
          placeholderMat.diffuseColor = new Color3(1, 0, 0); // Set the color to red

          // Left-click: Add a placeholder sphere (control point) to the scene for drawing
          const Mesh = MeshBuilder.CreateSphere(
            "PlaceHolder",
            { diameter: 0.20 },
            scene
          );
          try {
            Mesh.position = hit.pickedPoint;
            Mesh.material = placeholderMat;
            bufferMeshes.push(Mesh);
            positions.push(new Vector2(Mesh.position._x, Mesh.position._z));
            // Save the position information into buffer arrays
            positionsBuffer.push(
              new Vector3(Mesh.position._x, 0, Mesh.position._z)
            );
          } catch (error) {
            console.error(error);
          }
        }
        if (evt.button === 2) {
          // Right-click: Complete the shape and create a polygon mesh
          const poly_tri = new PolygonMeshBuilder(
            "polygon",
            positions,
            scene,
            earcut
          );
          polygon = poly_tri.build();
          polygon.position.y = 0.01;
          polygon.material = mat;

          polygon.enableEdgesRendering();
          polygon.edgesWidth = 2.0;
          polygon.edgesColor = new Color4(0,0,0,1);

          const len = bufferMeshes.length;
          for (let i = 0; i < len; i++) {
            bufferMeshes[i]?.dispose();
            if (i === len - 1) {
              bufferMeshes = [];
            }
          }
          drawActive = false;
        }
      }
      // Check if move mode is active and a mesh is picked
      if (hit.faceId != -1 && hit.pickedMesh != ground) {
        // Alert the user that they can only move the mesh after extrusion
        if (moveActive && extruded === false) {
          alert("You can only move the mesh after the extrusion");
          moveActive = false;
        }
        if (moveActive && extruded === true)
          // Add PointerDragBehavior to the picked mesh for movement
          hit.pickedMesh.addBehavior(pointerDrag);
        // Remove PointerDragBehavior from the picked mesh
        else hit.pickedMesh.removeBehavior(pointerDrag);
      }
      // Check if extrude mode is active and a mesh is picked
      if (
        extrudeActive &&
        hit.pickedMesh != ground &&
        hit.faceId != -1 &&
        extruded === false
      ) {
        if (evt.button === 0) {
          // Left-click: Extrude the shape and create a mesh
          mesh = ExtrudePolygon(
            "exPol",
            {
              shape: positionsBuffer,
              depth: depth,
              sideOrientation: 1,
              wrap: true,
              updatable: true,
            },
            scene,
            earcut
          );
          extruded = true;
          mesh.material = extrudeMat;
          mesh.position.y = depth;
          
          updateMeshEdges(mesh);

          try {
            polygon.dispose();
          } catch (error) {
            console.error(error);
          }

          // Clear the buffers after extrusion
          positionsBuffer = [];
          positions = [];
          extrudeActive = false;
        }
      }
      if (moveVertsActive && hit.pickedMesh != ground && hit.faceId != -1) {
        if (evt.button === 0) {
          if (!hit.pickedMesh.name.includes("vertexcontrol")) {
            // Move vertices mode is active, and a mesh face is picked
            // Left-click on the mesh face to start editing its vertices

            // Get the world transformation matrix of the extruded mesh
            {
              const transformation = mesh.getWorldMatrix();
              // Extract the vertices data of the mesh and group them into a 2D array
              let vertices = mesh
                .getVerticesData(VertexBuffer.PositionKind)
                .reduce((all, one, i) => {
                  const ch = Math.floor(i / 3);
                  all[ch] = [].concat(all[ch] ?? [], one);
                  return all;
                }, []);

              // Create a shared map to store indices of identical vertices and an array to store unique vertices
              const shared = new Map();
              const unique = [];

              // Loop through each vertex, transform it, and store unique vertices in the shared map and unique array
              vertices.forEach((vertex, index) => {
                const key = vertex.join(" ");
                if (shared.has(key)) {
                  shared.set(key, [...shared.get(key), index]);
                } else {
                  shared.set(key, [index]);
                  unique.push({
                    vertex: Vector3.TransformCoordinates(
                      Vector3.FromArray(vertex),
                      transformation
                    ).asArray(),
                    key,
                  });
                }
              });

              // Loop through unique vertices and create draggable spheres (control points) for vertex editing
              unique.forEach(({ vertex, key }) => {
                const indices = shared.get(key);

                // Create a PointerDragBehavior for each control point
                const behaviour = new PointerDragBehavior();
                behaviour.dragDeltaRatio = 1;
                behaviour.onDragObservable.add((info) => {
                  // When the control point is dragged, update the corresponding vertices of the mesh
                  indices.forEach((index) => {
                    vertices[index] = Vector3.FromArray(vertices[index])
                      .add(info.delta)
                      .asArray();
                  });
                  mesh.updateVerticesData(
                    VertexBuffer.PositionKind,
                    vertices.flat()
                  );
                  // Update the edges after modifying the vertices
                  updateMeshEdges(mesh);
                });


                // Create a material for the vertex points
                const vertexMat = new StandardMaterial("vertexMat", scene);
                vertexMat.diffuseColor = new Color3(1,0,0);

                // Create a sphere (control point) for vertex editing
                const draggable = MeshBuilder.CreateSphere(
                  `vertexcontrol-${indices.join("_")}`,
                  {
                    diameter: 0.20,
                    updatable: true,
                  },
                  scene
                );
                draggable.position = Vector3.FromArray(vertex);
                draggable.material = vertexMat; // Apply the material with the desired color
                draggable.addBehavior(behaviour);

                // Add the control point to the vertexcontrols array
                vertexcontrols.push(draggable);
              });
            }
          }
        }
      }
    };

    // Create an advanced texture for UI elements and set it to fullscreen
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
      "myUI",
      true,
      scene
    );

    // Create a title TextBlock
    const title = new TextBlock();
    title.text = "Snaptrude 2D Extrusion";
    title.color = "#921A40";  // Set the text color to white
    title.fontSize = 24;     // Set the font size
    title.top = "-40%";
    title.left = "-35%";
    title.fontWeight = "900";
    title.fontFamily = "Lucida Sans Unicode";

    // Add the title to the advanced texture
    advancedTexture.addControl(title);

    // Create a "Draw" button using the CreateButton function and attach it to the advanced texture
    // Create Button is a different component which is based of of the BABYLON's Button but simply accepts the name that is to be displayed along with the GUI component. The styling of the button is built in the component itself
    const draw = CreateButton("Draw", advancedTexture,drawActive);
    const move = CreateButton("Move", advancedTexture,moveActive);
    const moveVerts = CreateButton("Vertex Edit", advancedTexture,moveVertsActive);
    const extMesh = CreateButton("Extrude", advancedTexture,extrudeActive);
    draw.top = "-40%";
    draw.left = "-11%";

    // Toggle draw mode when the button is clicked
    draw.onPointerDownObservable.add(() => {
      setActiveBtn(prev => prev === 0 ? -1 : 0);
      if (drawActive) {drawActive = false;}
      else {drawActive = true;
        moveVertsActive = false;
        extrudeActive = false;
        moveActive = false;
        vertexcontrols.forEach((control) => control.dispose());
        vertexcontrols = [];
      };
      // Clear the positions array used for shape drawing
      positions = [];
    });
    console.log(activeBtn);
    // Create a "Move Vertices" button using the CreateButton function and attach it to the advanced texture
    
    moveVerts.top = "-40%";
    moveVerts.left = "37%";

    moveVerts.onPointerDownObservable.add(() => {
      setActiveBtn(prev => prev === 1 ? -1 : 1);
      // Toggle moveVertsActive mode when the button is clicked
      if (moveVertsActive) {
        moveVertsActive = false;
        
        // Dispose of all control points for vertex editing and clear the vertexcontrols array
        vertexcontrols.forEach((control) => control.dispose());
        vertexcontrols = [];
      } else {moveActive = false;
       moveVertsActive=true;drawActive=false;extrudeActive=false;}
    });

    // Create a "Move" button using the CreateButton function and attach it to the advanced texture
    
    move.top = "-40%";
    move.left = "21%";

    move.onPointerDownObservable.add(() => {
      setActiveBtn(prev => prev === 2 ? -1 : 2);
      // Toggle moveActive mode when the button is clicked
      if (moveActive) {moveActive = false;}
      else {moveActive = true;moveVertsActive=false;drawActive=false;extrudeActive=false;vertexcontrols.forEach((control) => control.dispose());
        vertexcontrols = [];}
    });

    // Create an "Extrude" button using the CreateButton function and attach it to the advanced texture
    
    extMesh.top = "-40%";
    extMesh.left = "5%";
    extMesh.onPointerDownObservable.add(() => {
      setActiveBtn(prev => prev === 3 ? -1 : 3);
      // Toggle extrudeActive mode when the button is clicked
      if (extrudeActive) {extrudeActive = false;}
      else{ extrudeActive = true;drawActive = false;
        moveVertsActive = false;
        moveActive = false;
        vertexcontrols.forEach((control) => control.dispose());
        vertexcontrols = [];};
    });

    // Rendering loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    // Clean up the scene when the component unmounts
    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={sceneRef}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      />
    </>
  );
};

export default BabylonScene;
