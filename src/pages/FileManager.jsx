import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import axios from "axios";

const temasPermitidos = [
  "rojo",
  "amarillo",
  "verde",
  "morado",
  "rosa",
  "blanco",
  "negro",
];

function FileManager() {
  const [archivos, setArchivos] = useState([]);
  const [accionesPendientes, setAccionesPendientes] = useState([]);

  useEffect(() => {
    // Cargar archivos desde la API
    axios
      .get("http://localhost:3000/files")
      .then((response) => setArchivos(response.data.files))
      .catch((error) => console.error("Error al obtener archivos:", error));
  }, []);

  const fileToBase64 = (file, cb) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(null, reader.result);
    };
    reader.onerror = function (error) {
      cb(error, null);
    };
  };

  const manejarAdjuntar = async (e) => {
    let archivo = e.target.files[0];

    if (!archivo) return;

    fileToBase64(archivo, (err, result) => {
      if (result) {
        archivo = result;
      }
    });

    // Establecer la metadata
    const tema = prompt("Ingresa el tema del archivo:").toLowerCase();

    if (!temasPermitidos.includes(tema)) {
      alert("Tema no permitido");
      return;
    }
    let datos = { tema, archivo };
    setAccionesPendientes([...accionesPendientes, { tipo: "adjuntar", datos }]);
  };

  const manejarReemplazo = (event, data) => {
    let archivo = event.target.files[0];

    if (!archivo) return;

    fileToBase64(archivo, (err, result) => {
      if (result) {
        archivo = result;
      }
    });

    console.log("ver archivo", data);
    if (!archivo) return;
    const archivosTema = archivos.filter((a) => a.tema === data.tema);
    if (archivosTema.length === 1) {
      const tema = prompt("Ingresa el nombre del nuevo archivo:").toLowerCase();
      let datos = { tema: tema, archivo };

      setAccionesPendientes([
        ...accionesPendientes,
        { tipo: "reemplazar", datos },
      ]);
    } else {
      alert("Solo puedes reemplazar si hay un único archivo de ese tema");
    }
  };

  const manejarEliminar = (archivo) => {
    console.log(archivo);
    const archivosTema = archivos.filter((a) => a.tema === archivo.tema);
    if (archivosTema.length > 1) {
      let datos = { tema: archivo.tema, archivo };
      console.log(datos);
      setAccionesPendientes([
        ...accionesPendientes,
        { tipo: "eliminar", datos },
      ]);
    } else {
      alert("Solo puedes eliminar si hay más de un archivo de ese tema");
    }
  };

  const guardarCambios = () => {
    let nuevaLista = [...archivos];

    accionesPendientes.forEach(async ({ tipo, datos }) => {
      if (tipo === "adjuntar") {
        nuevaLista.push({
          name: datos.archivo.name,
          tema: datos.tema,
          archivo: datos.archivo,
        });

        const formData = new FormData();
        formData.append("tema", datos.tema);
        formData.append("id", new Date());
        formData.append("files", datos.archivo);

        try {
          await axios.post("http://localhost:3000/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (error) {
          console.error("Error al subir archivos:", error);
        }
      } else if (tipo === "reemplazar") {
        try {
          console.log("remplazo", datos);
          await axios.put(`http://localhost:3000/files/update/${datos.tema}`);
          nuevaLista = nuevaLista.map((a) =>
            a.tema === datos.tema
              ? { name: datos.archivo.name, tema: datos.tema }
              : a
          );
          setArchivos(nuevaLista);
          setAccionesPendientes([]);
        } catch (error) {
          console.error("Error al eliminar archivo", error);
          return { error: "No se pudo eliminar el archivo" };
        }
      } else if (tipo === "eliminar") {
        try {
          await axios.delete(
            `http://localhost:3000/files/${
              datos.archivo.name ? datos.archivo.name : datos.archivo.filename
            }`
          );
          const fileIndex = nuevaLista.findIndex(
            (file) => file.name === datos.archivo.name
          );

          nuevaLista.splice(fileIndex, 1);
          setArchivos(nuevaLista);
          setAccionesPendientes([]);
        } catch (error) {
          console.error("Error al eliminar archivo", error);
          return { error: "No se pudo eliminar el archivo" };
        }
      }
    });
    setArchivos(nuevaLista);
    setAccionesPendientes([]);
  };

  const validateUnique = (archivo) => {
    const archivosTema = archivos.filter((a) => a.tema === archivo.tema);
    if (archivosTema.length > 1) {
      return (
        <Button
          style={{ marginRight: "3px", marginLeft: "3px" }}
          variant="primary"
          onClick={() => manejarEliminar(archivo)}
        >
          Eliminar
        </Button>
      );
    } else if (archivosTema.length === 1) {
      return (
        <div>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={(event) => manejarReemplazo(event, archivo)}
          />
          <Button
            style={{ marginRight: "3px", marginLeft: "3px" }}
            variant="primary"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Reemplazar
          </Button>
        </div>
        // <button type="file" onClick={(e) => manejarReemplazo(archivo, e)}>
        //   Reemplazar
        // </button>
      );
    }
  };

  console.log("archivos", archivos);
  console.log("accionesPendientes", accionesPendientes);
  return (
    <div style={{ marginLeft: "20px", marginRight: "30px" }}>
      <h1>Gestión de Archivos</h1>
      <div>
        <p>Para iniciar deber agregar documentos</p>
        <div style={{ display: "block" }}>
          <input
            type="file"
            id="fileInputAdd"
            style={{ display: "none" }}
            onChange={(event) => manejarAdjuntar(event)}
          />
          <Button
            variant="primary"
            onClick={() => document.getElementById("fileInputAdd").click()}
          >
            Agregar Documento
          </Button>
        </div>
      </div>

      {archivos.length ? (
        <Table style={{ marginTop: "20px" }} striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tema</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.map((archivo, index) => (
              <tr key={index}>
                <td>{archivo.name}</td>
                <td>{archivo.tema}</td>
                <td>
                  <div style={{ display: "flex" }}>
                    {validateUnique(archivo)}
                    <Button
                      style={{ marginRight: "3px", marginLeft: "3px" }}
                      variant="primary"
                    >
                      <a
                        style={{ color: "#ffff" }}
                        href={`http://localhost:3000/uploads/${archivo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir
                      </a>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        ""
      )}

      {accionesPendientes.length ? (
        <div>
          <h2>Acciones Pendientes</h2>
          <Card>
            <Card.Body>
              <ul>
                {accionesPendientes.map((a, index) => (
                  <li style={{ color: "#df1010" }} key={index}>{`${
                    a.tipo
                  } archivo ${
                    a.datos.archivo.name
                      ? a.datos.archivo.name
                      : a.datos.archivo.filename
                  } de tema ${a.datos.tema}`}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Button
            style={{ marginTop: "10px", marginBottom: "10px" }}
            variant="success"
            onClick={guardarCambios}
          >
            Guardar Modificaciones
          </Button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default FileManager;
