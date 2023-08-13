import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { plugin as mdPlugin, Mode } from "vite-plugin-markdown";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ViteYaml(), mdPlugin({ mode: [Mode.HTML, Mode.REACT] })],
});
