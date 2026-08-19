import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de desarrollo de Next se colaba dentro de la captura del carrusel
  // (/dev/pantalla-dial → /pantallas/dial.png). Se apaga para que las fotos de
  // pantallas reales salgan limpias.
  devIndicators: false,
};

export default nextConfig;
