import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LoaderProvider } from "./context/LoaderContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <LoaderProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </LoaderProvider>
);
