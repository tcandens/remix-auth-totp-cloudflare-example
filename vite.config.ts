import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(), 
    tsconfigPaths(),
    remix(), 
  ],
  server: {
    port: 3000,
    hmr: {
      port: 3001
    }
  }
});
