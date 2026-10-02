import animate from "tailwindcss-animate";
import defaultColors from "tailwindcss/colors";

/**
 * Tema "Sala de situación" (antes "Despacho"). Los colores base viven en
 * src/index.css (:root); acá sólo se conectan con Tailwind.
 *
 * Los componentes se escribieron para fondo oscuro (texto claro en los tonos
 * 200-400, fondos oscuros en 800-950). Sobre papel eso se invierte: estas
 * escalas reasignan cada tono a su equivalente legible en fondo claro, así un
 * `text-emerald-400` es un verde oscuro y un `bg-red-950/90` es un rosado
 * pálido, sin reescribir cada clase. Los tonos medios (500-600) casi no
 * cambian: siguen sirviendo como relleno de botones con texto blanco.
 */
const LIGHT_SHADE = {
  50: 900, 100: 900, 200: 800, 300: 700, 400: 700, 500: 600,
  600: 600, 700: 500, 800: 200, 900: 100, 950: 50,
};
const FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
  "fuchsia", "pink", "rose",
];
const despachoFamilies = Object.fromEntries(
  FAMILIES.map(name => [
    name,
    Object.fromEntries(Object.entries(LIGHT_SHADE).map(([shade, target]) => [shade, defaultColors[name][target]])),
  ]),
);

/**
 * El azul era el color de interfaz del tema oscuro (botones, pestañas,
 * enlaces). En Despacho ese rol lo toman el azul marino de la tinta (rellenos)
 * y el celeste (texto y tintes), con la misma inversión de tonos.
 */
despachoFamilies.blue = {
  50: "#092C55", 100: "#092C55", 200: "#0E4878", 300: "#1269C7", 400: "#1269C7",
  500: "#1269C7", 600: "#092C55", 700: "#0E4878", 800: "#CDE3F7", 900: "#E3EFFA", 950: "#F1F7FD",
};

/**
 * El texto de color va sobre papel o sobre tintes pálidos del mismo color, y
 * con los tonos de relleno quedaba por debajo del contraste mínimo (4.5:1).
 * Como texto, cada tono claro u oscuro-medio baja a su versión 700-800; los
 * rellenos (`bg-`, `border-`) siguen con LIGHT_SHADE.
 */
const TEXT_SHADE = {
  50: 900, 100: 900, 200: 800, 300: 800, 400: 800, 500: 700,
  600: 700, 700: 700, 800: 200, 900: 100, 950: 50,
};
const textFamilies = Object.fromEntries(
  FAMILIES.map(name => [
    name,
    Object.fromEntries(Object.entries(TEXT_SHADE).map(([shade, target]) => [shade, defaultColors[name][target]])),
  ]),
);
textFamilies.blue = { ...despachoFamilies.blue, 300: "#1269C7", 400: "#1269C7", 600: "#0E4878", 700: "#0E4878" };

/** Token con soporte de opacidad (`bg-ink/10`): la variable guarda "r g b". */
const token = name => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textColor: textFamilies,
      colors: {
        ...despachoFamilies,
        paper: token("paper"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        rule: token("rule"),
        gold: { DEFAULT: token("gold"), ink: token("gold-ink") },
        celeste: { DEFAULT: token("celeste"), ink: token("celeste-ink") },
        // Sala de situación (rediseño v0): los valores viven en src/index.css (:root).
        sala: {
          navy: token("navy"),
          navy2: token("navy-2"),
          blue: token("blue"),
          cyan: token("cyan"),
          sky: token("sky"),
          coral: token("coral"),
          lime: token("lime"),
          "lime-ink": token("lime-ink"),
          violet: token("violet"),
          sun: token("sun"),
          muted: token("muted-text"),
          dim: token("dim"),
          good: token("good"),
          bad: token("bad"),
          warn: token("warn"),
          "on-navy": token("on-navy"),
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      // Pasos finos que el código usa (bg-ink/4, border-ink/8…) y Tailwind no trae por defecto.
      opacity: {
        3: "0.03", 4: "0.04", 6: "0.06", 7: "0.07", 8: "0.08", 12: "0.12", 98: "0.98",
      },
      // Un `border` sin color es un filete del papel, no gris.
      borderColor: {
        DEFAULT: token("rule"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        // Cifras: Inter con números tabulares (ver .font-mono en index.css), no una monoespaciada.
        mono: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
}
