import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  images: ["public/icons/betterbuy-overlap.svg"],
  preset: {
    ...minimal2023Preset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { fit: "contain", background: "#f7fafc" },
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { fit: "contain", background: "#f7fafc" },
    },
  },
});
