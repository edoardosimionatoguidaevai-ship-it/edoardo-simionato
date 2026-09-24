import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consente di aprire il dev server dall'iPhone via IP di rete locale (es. http://192.168.1.x:3006)
  // Se l'IP del Mac cambia (rete diversa), aggiungere il nuovo IP qui e riavviare il server.
  allowedDevOrigins: ["192.168.1.6", "192.168.1.12"],
};

export default nextConfig;
