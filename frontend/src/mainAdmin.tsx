import "./index.css";
import "./font.css";
import App from "./App";
import ReactDOM from 'react-dom/client';
import AdminApp from "./routes/AdminApp";
// import { registerAllCustomFormats } from "./quill/quill.setup";
// registerAllCustomFormats()

declare global {
    interface Window {
        __INITIAL_DATA__?: Record<string, any>
    }
}

const initialData = window.__INITIAL_DATA__;


const container = document.getElementById("root") as HTMLElement | null;
if (!container) {
  throw new Error("Missing #root element");
}

if (container.hasChildNodes() && initialData) {
  ReactDOM.hydrateRoot(
    container,
    <App initialData={initialData}>
      <AdminApp />
    </App>
  );
} else {
  ReactDOM.createRoot(container).render(
    <App initialData={initialData}>
      <AdminApp />
    </App>
  );
}
