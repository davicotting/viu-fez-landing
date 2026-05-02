---
applyTo: "**"
---

# Arquitetura — Next.js + Clean Architecture

Siga rigorosamente esta arquitetura de pastas e todas as convenções descritas abaixo em **todo código que gerar** para este projeto.

## Estrutura de Pastas

```
src/
│
├── app/                           # App Router do Next.js — convenção do framework
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── [feature]/page.tsx
│   ├── api/[feature]/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── domain/                        # Núcleo — ZERO dependências externas
│   ├── entities/                  # Entidades de negócio puras
│   ├── repositories/              # Interfaces (contratos) — prefixo I obrigatório
│   ├── services/                  # Regras de negócio sem entidade clara
│   └── value-objects/             # Tipos imutáveis com validação embutida
│
├── application/                   # Casos de uso e orquestradores
│   ├── use-cases/[feature]/       # Um arquivo por caso de uso
│   ├── dtos/                      # Objetos de transferência (sufixo Dto)
│   └── ports/                     # Interfaces de saída (email, storage, events)
│
├── infrastructure/                # Implementações concretas
│   ├── http/
│   │   ├── clients/               # Clientes HTTP (fetch wrappers)
│   │   └── interceptors/          # Auth, retry, headers
│   ├── repositories/              # Implementações dos contratos de domain/
│   ├── adapters/                  # Serviços externos (email, storage, etc.)
│   └── mappers/                   # Converte dados externos em entidades
│
├── presentation/                  # Componentes, hooks e providers de UI
│   ├── components/
│   │   ├── ui/[Component]/        # Átomos reutilizáveis sem lógica de negócio
│   │   ├── forms/                 # Formulários com validação
│   │   └── layouts/               # Wrappers de layout (Sidebar, Header)
│   ├── hooks/                     # Custom hooks de UI
│   ├── providers/                 # Context Providers globais
│   └── view-models/               # Adaptam dados de domínio para a UI
│
└── shared/                        # Utilitários transversais
    ├── constants/                 # Rotas, config, enums globais
    ├── errors/                    # Classes de erro padronizadas
    ├── types/                     # Tipos e interfaces transversais
    └── utils/                     # Funções puras sem estado

src/tests/                         # Testes unitários por camada
├── setup.ts                       # Configuração global (@testing-library/jest-dom)
├── domain/                        # Testes de lógica pura — sem mocks de framework
├── application/                   # Testes de use cases com repos mockados via vi.fn()
├── presentation/                  # Testes de componentes com render/screen/userEvent
└── shared/                        # Testes de funções utilitárias puras
```

## Regras de Dependência — NUNCA viole

| Camada | Pode importar de | Proibido importar de |
|--------|-----------------|----------------------|
| `domain` | `shared` apenas | tudo o mais |
| `application` | `domain`, `shared` | `infrastructure`, `presentation` |
| `infrastructure` | `domain`, `application`, `shared` | `presentation` |
| `presentation` | todas as camadas | — |
| `app` (rotas) | `presentation`, `application`, `shared` | `infrastructure` diretamente |

## Convenções de Nomenclatura

- Pastas → `kebab-case`: `value-objects/`, `use-cases/`
- Componentes React → `PascalCase`: `Button.tsx`, `HeroSection.tsx`
- Hooks → `camelCase` com prefixo `use`: `useAuth.ts`, `usePagination.ts`
- Interfaces → prefixo `I`: `IUserRepository.ts`, `IEmailPort.ts`
- DTOs → sufixo `Dto`: `CreateUserDto.ts`
- Casos de uso → `PascalCase` descrevendo a ação: `CreateUser.ts`, `GetProductById.ts`
- Mappers → sufixo `Mapper`: `UserMapper.ts`
- Adapters → sufixo `Adapter`: `ResendEmailAdapter.ts`

## Estrutura de Componente de UI

Todo componente de UI deve ser organizado em pasta própria:

```
presentation/components/ui/Button/
├── Button.tsx        # implementação
├── Button.test.tsx   # co-localizado com o componente
└── index.ts          # único ponto de export público
```

Testes de componente ficam **co-localizados** com o componente (não em `src/tests/`). Apenas lógica pura de `domain`, `application` e `shared` vai para `src/tests/`.

O `index.ts` deve apenas re-exportar:

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Path Aliases

Use sempre aliases — nunca imports relativos com `../../`:

```ts
// ✅ correto
import { User } from "@/domain/entities/User";
import { CreateUser } from "@/application/use-cases/user/CreateUser";
import { Button } from "@/presentation/components/ui/Button";
import { cn } from "@/shared/utils/cn";

// ❌ proibido
import { User } from "../../../../../../domain/entities/User";
```

Aliases configurados no `tsconfig.json`:
- `@/domain/*` → `./src/domain/*`
- `@/application/*` → `./src/application/*`
- `@/infrastructure/*` → `./src/infrastructure/*`
- `@/presentation/*` → `./src/presentation/*`
- `@/shared/*` → `./src/shared/*`

## Proibições por Camada

**`domain/`**
- Sem imports de React, Next.js, Axios, Prisma ou qualquer biblioteca externa
- Sem chamadas HTTP, sem acesso a banco

**`application/`**
- Sem `useState`, `useEffect` ou qualquer hook de React
- Sem formatação visual ou lógica de UI
- Sem acesso direto a APIs externas

**`infrastructure/`**
- Sem regras de negócio
- Sem imports de `presentation/`
- Apenas implementações técnicas

**`presentation/`**
- Sem chamadas HTTP diretas — sempre via use-cases
- Sem lógica de negócio nos componentes
- Componentes recebem dados prontos via props ou view-models

**`shared/`**
- Sem regras de negócio
- Sem componentes React
- Sem imports de outras camadas do projeto

## Fluxo Obrigatório de Dados

```
app/page.tsx  →  use-case (application/)  →  repository interface (domain/)
                                                      ↓
                                         implementação (infrastructure/)
                                                      ↓
                                              mapper → entidade (domain/)
                                                      ↓
                                         view-model → componente (presentation/)
```

Páginas (`app/`) **nunca** instanciam repositórios ou serviços de infraestrutura diretamente.

## Observação sobre o `app/`

O diretório `app/` fica em `src/app/` (não dentro de `presentation/`) porque o Next.js só reconhece o App Router em `src/app/` ou `/app/`. Esta é a única exceção à organização por camadas — tudo dentro de `app/` pertence conceitualmente à camada de apresentação, mas precisa seguir a convenção do framework.
