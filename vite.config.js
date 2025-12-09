import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    root: "client", // 👈 tells Vite where index.html is
    plugins: [react()],
    build: {
        outDir: "../dist/client", // 👈 put built files outside client/
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./client"),
            "@shared": path.resolve(__dirname, "./shared"),
        },
    },
});
