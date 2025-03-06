import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FileManager from "./pages/fileManager";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={<Home />} />
        <Route path="/fileManager" component={<FileManager />} />
      </Routes>
    </Router>
  );
}

export default App;
