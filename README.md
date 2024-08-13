# Babylon.js 2D Shape Extrusion and Manipulation

## Project Overview

This project is a Babylon.js-based application that allows users to draw arbitrary 2D shapes on a ground plane, extrude them into 3D objects, and manipulate these objects by moving them or editing their vertices. The project is built using React.js, Next.js, and Babylon.js.

## Setup

To get started with this project, follow the steps below:

1. Extract the ZIP file.

2. Run npm install in the project directory to install dependencies.

3. Start the application with npm run dev.

4. Open http://localhost:3000 in your browser.

## How to Use

- **Draw Mode**:
  - Allows the user to draw arbitrary 2D shapes on the canvas.
  - Left-click to create vertices, and right-click to complete the shape. The edges are formed in the order of the vertices created, and the shape can be extruded into a 3D object.

- **Extrude Mode**:
  - Converts the 2D shapes into 3D objects.
  - Click on the shape to extrude it, forming a 3D object.

- **Move Mode**:
  - Enables the movement of 3D objects within the scene.
  - Select an object and drag it to reposition within the 3D space.

- **Vertex Edit Mode**:
  - Allows individual vertices of the extruded 3D objects to be manipulated.
  - Select a vertex to move it independently, adjusting the shape of the object.


## Technologies Used

- **React.js**: Used for creating reusable UI components and managing the application's state. React's component-based architecture allows for efficient rendering and easy management of complex UIs.
- **Next.js**: Provides a powerful framework for server-rendered React applications, with built-in support for routing and API handling. Next.js also optimizes the performance of the application through automatic code splitting and static generation.
- **Babylon.js**: A powerful 3D engine used to render and manipulate 3D objects in the scene. Babylon.js provides a comprehensive API for handling 3D graphics, which was essential for implementing features like extrusion and vertex manipulation.






