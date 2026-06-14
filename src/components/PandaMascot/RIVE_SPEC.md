# Contrato Rive — Panda Mascote (CarePlus)

Este é o **contrato** entre a arte (editor Rive) e o código (`PandaMascotRive.jsx`).
O que estiver aqui precisa bater **exatamente** com os nomes que você criar no editor —
senão o código não acha os inputs e o panda fica parado.

> Regra de ouro: **nomes são case-sensitive**. `health` ≠ `Health`.

---

## 1. Arquivo final

- Exporte um único `.riv` chamado **`panda.riv`**.
- Coloque em **`/public/panda.riv`** (mesma pasta onde estavam os `panda-hero.*`).
- O código carrega de `/panda.riv` automaticamente. Enquanto o arquivo não existir,
  o app continua usando o panda SVG atual (fallback) — nada quebra.

## 2. Artboard

| Campo | Valor |
|---|---|
| Nome do artboard | `Panda` |
| Proporção sugerida | ~**3:4** (ex. 300 × 400) — panda sentado, igual à referência |
| Fundo | **transparente** (sem retângulo de fundo) |
| Origem | centralizado; o código usa `Fit.Contain` + `Alignment.Center` |

## 3. State Machine

| Campo | Valor |
|---|---|
| Nome da state machine | `Panda` |

Crie **uma** state machine chamada `Panda` com os inputs abaixo.
Sugestão de organização em camadas (layers) dentro dela:
- **Layer "Mood"** → controla rosto/respiração (lê o input `health`).
- **Layer "Pose"** → controla braços/pernas e poses por tela (lê o input `pose`).
- **Layer "Events"** → dispara as animações one-shot (os triggers).
Layers tocam ao mesmo tempo, então o evento "pular" pode rodar por cima do humor atual.

### 3.1 Inputs — NÚMEROS

#### `health` (Number)
Nível de saúde. O código manda um inteiro 0–4:

| Valor | Estado | Como deve parecer (hoje no SVG) |
|---|---|---|
| `0` | critical | quase dormindo, "zZ", mal respira, boca caída, pálpebras quase fechadas |
| `1` | weak | pálpebras pesadas, boca levemente caída, cabeça meio apoiada no braço |
| `2` | warning | neutro, boca reta; **idle**: olhada de lado aleatória + bocejo ocasional |
| `3` | good | calmo, sorriso suave, respiração leve |
| `4` | excellent | animado, sorrisão (boca aberta + línguinha), orelhas em pé, balança os braços |

> Faça transições suaves entre os 5 (blend), não cortes secos.

#### `pose` (Number)
Pose por tela. Inteiro 0–7:

| Valor | Pose | Comportamento |
|---|---|---|
| `0` | default | parado, flutuação/respiração padrão |
| `1` | dashboard | sentado; perninhas balançando pra fora; bob de cabeça mais sutil |
| `2` | missions-point | braço direito apontando pra frente/cima |
| `3` | missions-dance | os dois braços dançando (loop rápido) |
| `4` | chronicle | balanço suave da cabeça; **piscada lenta** a cada ~4s |
| `5` | catalog | brilho extra nos olhos (estrelinha), olhar encantado |
| `6` | profile-proud | orgulhoso, braços levantados/abertos |
| `7` | profile-shy | tímido, encolhido (~13% menor), braços fechados pra dentro |

### 3.2 Inputs — TRIGGERS (one-shot)
Cada um toca uma animação curta e volta ao estado atual. Nomes exatos:

| Trigger | Animação (referência atual) | Duração aprox. |
|---|---|---|
| `evMission` | pulo comemorando (missão concluída) | ~0,7s |
| `evBadge` | giro 360° + leve escala (medalha) | ~0,95s |
| `evFriend` | balança de lado (ajudou amigo) | ~1,1s |
| `evAlert` | tremor rápido (alerta) | ~0,6s |
| `evAppOpen` | "pop" de entrada (escala 0→1) + olhar pra cima | ~1,1s |
| `evRedeem` | pulo grande (resgate no catálogo) | ~0,9s |
| `tap` | reação ao toque/clique (pulinho/susto) | ~0,65s |

> O `tap` é disparado quando o usuário toca no panda. Se der, faça a reação variar um
> pouco conforme o `health` (no excellent pula alto; no critical "acorda" assustado).
> Se for trabalhoso, **uma** reação de toque genérica já está de bom tamanho.

### 3.3 Input — BOOLEAN (acessibilidade)

#### `reducedMotion` (Boolean)
O código liga isso quando o usuário tem **"reduzir movimento"** ativado no sistema.
Quando `true`: **desligue loops/balanços contínuos** e deixe o panda numa pose estática
calma (só o essencial). Isso é requisito de acessibilidade — não pule.

---

## 4. Cor de acento (tema dinâmico) — opcional, mas é feature atual

Hoje o "rim light" (luz de borda) do panda usa a cor `--accent` do tema do app, que muda.
Para manter isso no Rive, a forma recomendada é **Data Binding** (Rive 2):
- Crie uma **View Model** com uma propriedade de cor `accent`.
- Vincule o preenchimento do rim light a essa propriedade.
- O código passa a cor atual do tema em runtime.

Se não quiser mexer com data binding agora, **tudo bem** — deixe uma cor fixa bonita
e a gente liga o tema depois. O resto funciona normalmente.

---

## 5. Resumo dos nomes (cola rápida)

```
Artboard:        Panda
State machine:   Panda
Number inputs:   health (0–4), pose (0–7)
Trigger inputs:  evMission, evBadge, evFriend, evAlert, evAppOpen, evRedeem, tap
Boolean input:   reducedMotion
(opcional) cor:  ViewModel.accent  (data binding)
```

Bateu tudo isso → joga `panda.riv` em `/public/` → o app sobe o Rive sozinho.
