#  STARage — Smart Space Storage

> Armazém Inteligente para Missões Espaciais

STARage é um sistema de gerenciamento de estoque e nutrição para astronautas na ISS (Estação Espacial Internacional). Usando grafos e o algoritmo de Dijkstra, o sistema rastreia pacotes de alimentos, calcula déficits nutricionais e encontra a rota mais eficiente de reabastecimento entre os módulos da estação.

---

##  O Problema

Astronautas em missões longas precisam:
- Saber **quantos pacotes** de cada alimento restam no estoque
- Monitorar a **ingestão diária e acumulada** de nutrientes (proteínas, carboidratos, gorduras, vitaminas, minerais)
- Comparar com o **recomendado pela NASA** para vida fora da Terra
- Encontrar a **rota mais curta** entre módulos para buscar reabastecimento

---

##  Arquivos do Projeto

```
starage/
├── grafo.py          # Estrutura do grafo: 35 nós e 91 arestas ponderadas
├── nutricao.py       # Classe Missao: consumo, estoque e relatórios
├── dijkstra.py       # Algoritmo de Dijkstra para rotas de reabastecimento
├── plot_grafo.py     # Visualização do grafo com NetworkX + Matplotlib
├── main.py           # Ponto de entrada — demonstração completa
├── App.jsx           # Dashboard React com IA integrada (Claude API)
├── main.jsx          # Entry point React
├── index.html        # HTML base do Vite
├── package.json      # Dependências do dashboard
├── vite.config.js    # Configuração do Vite
└── requirements.txt  # Dependências Python
```

---

##  Estrutura do Grafo

| Categoria    | Quantidade | Descrição                                       |
|-------------|------------|-------------------------------------------------|
| Módulos ISS  | 8 nós      | Harmony, Destiny, Zvezda, Unity, Zarya...       |
| Depósitos    | 4 nós      | Alpha (D1), Bravo (D2), Charlie (D3), Delta (D4)|
| Astronautas  | 6 nós      | A1–A6 com nome e módulo atual                   |
| Alimentos    | 12 nós     | F01–F12 com perfil nutricional completo         |
| Nutrientes   | 5 nós      | Proteína, Carboidrato, Gordura, Vitamina, Mineral|
| **Total**    | **35 nós** | **91 arestas ponderadas**                       |

Arestas entre módulos têm peso em metros (distância aproximada). O Dijkstra usa um subgrafo apenas com módulos e depósitos para calcular rotas físicas.

---

##  Algoritmo de Dijkstra

Implementado manualmente com `heapq` (fila de prioridade).

Encontra a **rota mais eficiente** entre o módulo atual do astronauta e o depósito que contém o item necessário.

```python
# Exemplo — rota de Elena (Harmony) até o Atum (depósito D2)
from grafo import construir_grafo
from dijkstra import rota_reabastecimento

G = construir_grafo()
rota_reabastecimento("A1", "F03", G)

# Resultado:
# Harmony ──[10m]──▶ Unity ──[22m]──▶ Zvezda ──[3m]──▶ D2
# Custo total: 35 metros
```

A função `melhor_rota_para_faltantes()` roda o Dijkstra **uma única vez** e consulta o resultado para todos os itens em falta, sem reprocessar.

---

##  Como rodar o Python

```bash
pip install -r requirements.txt
python main.py
```

---

##  Como rodar o Dashboard

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

O dashboard usa a **API do Claude (Anthropic)** para processar comandos em linguagem natural. Exemplos de comandos no chat:

- *"A1 consumiu 2 porções de F06"*
- *"Qual o estoque crítico agora?"*
- *"Calcule a rota de A3 até o F03"*
- *"Relatório nutricional da Elena"*

---

##  Funções principais

| Função | Arquivo | Descrição |
|--------|---------|-----------|
| `construir_grafo()` | `grafo.py` | Monta o grafo completo com 35 nós e 91 arestas |
| `info_grafo()` | `grafo.py` | Exibe resumo da estrutura do grafo |
| `Missao.__init__()` | `nutricao.py` | Inicializa estado da missão com cópia do estoque |
| `Missao.registrar_consumo()` | `nutricao.py` | Loga ingestão e desconta estoque |
| `Missao.verificar_estoque()` | `nutricao.py` | Lista itens abaixo do mínimo por urgência |
| `Missao.alertar_critico()` | `nutricao.py` | Mostra déficit nutricional vs meta NASA |
| `Missao.relatorio_nutricional()` | `nutricao.py` | Relatório completo com barra de progresso |
| `dijkstra()` | `dijkstra.py` | Implementação manual com `heapq` |
| `rota_reabastecimento()` | `dijkstra.py` | Rota ótima do módulo do astronauta ao depósito |
| `melhor_rota_para_faltantes()` | `dijkstra.py` | Prioriza múltiplos itens críticos (Dijkstra 1x) |
| `plotar_grafo()` | `plot_grafo.py` | Visualização com NetworkX + Matplotlib |

---

##  Tecnologias

**Python:** `networkx`, `matplotlib`, `heapq` (stdlib)
**Dashboard:** React 18, Vite, Claude API (Anthropic)


