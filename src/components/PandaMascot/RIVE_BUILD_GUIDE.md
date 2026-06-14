# Guia de montagem no Rive — Panda (cutout puppet)

Passo-a-passo pra montar o panda a partir das **6 peças PNG** (corpo, cabeça,
braço esq/dir, perna esq/dir) e ligar tudo no contrato de
[RIVE_SPEC.md](./RIVE_SPEC.md). Pensado pra iniciante, com um caminho **v1**
(funciona logo) e depois o **completo**.

> Conceito-chave: **não precisa de "bones" pra esse panda.** Bones servem pra
> entortar/deformar. Como cada parte se move rígida (o braço gira no ombro),
> a gente usa **Group + origem (pivô)** e anima a **rotação do grupo**. Muito
> mais simples.

---

## Fase A — Remontar o panda (modo **Design**)

1. **Importar**: aba **Assets** (canto inferior esquerdo) → arraste as 6 PNGs.
2. **Colocar no palco**: arraste cada imagem pro artboard `Panda`.
3. **Alinhar (truque do enquadramento)**: como cada PNG foi exportada no mesmo
   tamanho/posição da original, dê em cada imagem **Position X = 0, Y = 0**
   (ou o mesmo valor pra todas). Elas se encaixam sozinhas e o panda se remonta.
4. **Ordem de profundidade** (quem fica na frente), de trás pra frente:
   `body` → `leg_L` → `leg_R` → `arm_L` → `arm_R` → `head`.
   Reordene arrastando na **Hierarchy** (item de cima da lista = mais na frente)
   ou via **Draw Order**.
5. **Agrupar**: selecione tudo → clique direito → **Group** → renomeie `Panda`.

## Fase B — Transformar cada membro em Group com pivô no “joelho/ombro”

Pra cada braço e perna (e a cabeça):

1. Selecione a imagem da parte → **Group** (clique direito → Group). Renomeie:
   `armL`, `armR`, `legL`, `legR`, `head`.
2. Com o group selecionado, **mova a ORIGEM (o pontinho do pivô)** para a
   articulação:
   - `armL`/`armR` → no **ombro**.
   - `legL`/`legR` → no **quadril**.
   - `head` → na **base do pescoço**.
   (No painel direito há os campos de **Origin** X/Y; ou arraste o pivô no palco.)
3. Teste: gire o group manualmente — o braço deve girar a partir do ombro, não
   do centro. Volte a rotação pra 0 depois.

## Fase C — Desenhar rosto em vetor (por cima da cabeça)

Não cortamos da foto; desenhamos no Rive (controle total da expressão).

1. **Pupilas**: ferramenta **Ellipse** → 2 elipses escuras sobre os olhos.
   Group cada uma (`pupilL`, `pupilR`). Um brilho branco pequeno em cima fica top.
2. **Pálpebras** (pra piscar / sono): desenhe sobre cada olho uma forma da cor
   da pelagem/mancha, começando **escondida** (Scale Y = 0 a partir do topo do
   olho). Group: `lidL`, `lidR`.
3. **Boca**: ferramenta **Pen** → uma curva simples. Group `mouth`. Guarde a
   forma “sorriso suave” como base.
4. (Opcional) **Bochechas**: 2 elipses rosa, opacidade ~30%.

## Fase D — State Machine + inputs (modo **Animate**)

1. Troque pra **Animate** (canto superior direito).
2. **Crie os inputs** (no painel da State Machine), **com estes nomes exatos**:
   - Number `health`, Number `pose`
   - Triggers: `evMission`, `evBadge`, `evFriend`, `evAlert`, `evAppOpen`,
     `evRedeem`, `tap`
   - Boolean `reducedMotion`
   - Nome da State Machine: **`Panda`**.

### Caminho v1 (faça primeiro — já dá um panda vivo)

Crie poucas timelines e ligue:

| Timeline | O que anima |
|---|---|
| `idle` | corpo sobe/desce devagar (flutuar) + leve scaleY (respirar) em loop |
| `ev_jump` | um pulo (usado por missão/resgate) |
| `ev_shake` | tremida lateral (alerta) |
| `tap_react` | um pulinho rápido |

Na State Machine:
- Estado base = `idle` (loop).
- `evMission`/`evRedeem` → dispara `ev_jump` e volta pra `idle`.
- `evAlert` → `ev_shake` → `idle`.
- `tap` → `tap_react` → `idle`.

Exporte e teste (ver Fase E). **Nessa v1 o rosto ainda não muda por estado** —
tudo bem, o app continua mostrando o SVG completo até você aprovar (o preview é
só pra comparar).

### Caminho completo (depois da v1)

1. **5 estados de saúde** — 5 timelines (`idle_excellent` … `idle_critical`)
   variando: boca (sorriso aberto → reto → caído), pálpebras (0 → quase
   fechadas), orelhas, velocidade de respiração/flutuar, braços (excellent
   balança). Wire por **valor do input `health`** (0–4) — use **transições por
   condição** (`health == 4` → excellent) ou um **Blend State 1D** pelo `health`.
2. **Poses** (`pose` 0–7): dashboard = perninhas balançando; missions-point =
   `armR` apontando; missions-dance = os 2 braços; chronicle = piscar lento
   (anima `lidL/lidR`); profile-shy = escala 0.87; etc.
3. **Eventos restantes**: `evBadge` (giro 360°), `evFriend` (balança),
   `evAppOpen` (pop de entrada + olhar pra cima).
4. **`reducedMotion = true`** → vá pra um estado estático calmo (sem loops).

## Fase E — Exportar e testar no app

1. Menu (≡) → **Export** → **Download for runtime** → baixa o `.riv`.
2. Renomeie pra **`panda.riv`** → coloque em **`/public/panda.riv`** do projeto.
3. `npm run dev` → abra **`/rive-preview`** → o lado “Rive” mostra seu panda.
4. Ajustou algo? Re-exporte, troque o arquivo, recarregue. Repete até aprovar.
5. Aprovado → me avisa que eu faço o flip nas 8 telas do app.

---

### Dicas que evitam dor de cabeça
- **Nomes são case-sensitive.** `health` ≠ `Health`. Se errar, o código não acha
  o input e o panda fica parado (ou o app cai no SVG pelo watchdog).
- Sempre **volte rotações/posições pro 0** antes de criar a State Machine, senão
  a pose “neutra” fica torta.
- Trabalhe **uma timeline por vez** e teste no botão play do editor antes de ligar
  na State Machine.
- Se travar, exporte mesmo incompleto e veja no `/rive-preview` — é mais rápido
  que adivinhar no editor.
