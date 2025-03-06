import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import FileManager from "./pages/fileManager";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/fileManager",
    element: <FileManager />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">Prueba</Navbar.Brand>
        </Container>
      </Navbar>
    </div>
    <RouterProvider router={router} />
  </StrictMode>
);
