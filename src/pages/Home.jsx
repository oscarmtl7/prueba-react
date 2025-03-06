import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Bienvenido a la página de archivos</h1>
      <nav>
        <ul>
          <li>
            <Link to="/fileManager">Ir a cargar archivos y temas</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
export default Home;
