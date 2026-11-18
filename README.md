# Consultora Agrofinanzas Magoia

Dashboard web migrado desde la aplicación Streamlit original, preparado para GitHub y Vercel con Next.js.

## Secciones
- Resumen de cotizaciones y variables macroeconómicas.
- Letras del Tesoro.
- Macro: series del BCRA y ArgentinaDatos.
- Bonos soberanos y obligaciones negociables.
- Granos y futuros: contratos de cierre A3 Mercados (agropecuario y dólar), accesos a pizarra BCR y marco de análisis de coberturas.
- Agro mundial: accesos a referencias internacionales.

## Ejecutar localmente
Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```
Abrir http://localhost:3000.

## Publicar en GitHub y Vercel
1. Crear un repositorio nuevo en GitHub (por ejemplo `agrofinanzas-magoia`).
2. Descomprimir este proyecto y subir **el contenido completo** del directorio a la raíz del repositorio.
3. En Vercel, elegir **Add New → Project**, importar el repositorio y mantener la configuración detectada de Next.js.
4. Presionar **Deploy**. No necesita variables de entorno para esta versión.

## Fuentes integradas
- Data912: letras, bonos y ONs.
- Dólar API: cotizaciones cambiarias.
- BCRA API v4: tipo de cambio A 3500, CER, TAMAR y BADLAR.
- ArgentinaDatos: inflación y riesgo país.
- A3 Mercados: futuros de los segmentos agropecuario y monedas.
- Yahoo Finance: soja Chicago, oro y S&P 500 (últimos 12 meses).

Las consultas se realizan desde una ruta del servidor (`/api/market`) para evitar depender de CORS del navegador. La interfaz actualiza cada 60 segundos y permite actualización manual.

## Alcance y notas
Esta versión migra el tablero y sus fuentes públicas principales a una arquitectura compatible con Vercel. Las vistas originales de cálculo de TNA/TIR, duration, simulaciones de coberturas, cotizaciones de pizarra BCR automatizadas, series de maíz y trigo de Chicago, datos históricos extendidos y parsing de flujos Rava todavía requieren una segunda etapa de adaptación y validación; no se muestran cálculos ficticios ni cotizaciones inventadas. Los módulos y CSV originales se conservan en el directorio `legacy-python/` como referencia de migración.

Los datos de mercado pueden tener demora. El tablero es informativo y no constituye asesoramiento financiero.
