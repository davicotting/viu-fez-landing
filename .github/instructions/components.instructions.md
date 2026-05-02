---
applyTo: "src/presentation/**,src/app/**"
---

# Componentes

## Declaração

Sempre use `export function` nomeado para componentes. Nunca use `const` arrow function como export padrão.

## Variantes de estilo

Use `cva` (class-variance-authority) para variantes de estilo em componentes UI. Presets de variantes ficam no mesmo arquivo do componente ou em um arquivo `component-name-variants.ts` separado.

```ts
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { primary: "...", outline: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}
```

## Exportações

O `index.ts` de cada componente é o único ponto de export público:

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Tema

Sempre use tokens do tema em vez de valores de cor hardcoded.

Para classes Tailwind, use tokens semânticos (ex: `text-foreground`, `bg-background`, `text-primary`) em vez de valores arbitrários (ex: `text-[#171717]`, `bg-white`).

Defina tokens no `globals.css` via CSS custom properties e os exponha ao Tailwind v4 via `@theme`.

```css
/* ✅ correto — globals.css */
@theme {
  --color-primary: #...;
  --color-foreground: #...;
}
```

```tsx
/* ✅ correto — componente */
<p className="text-foreground bg-background">
```
