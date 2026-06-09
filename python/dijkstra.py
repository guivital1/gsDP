

import heapq
import networkx as nx
from grafo import construir_grafo, ASTRONAUTAS, ALIMENTOS, DEPOSITOS




def 
    distancias = {}
    for no in G.nodes():
        distancias[no] = float("inf")
    distancias[origem] = 0

    anteriores = {}
    for no in G.nodes():
        anteriores[no] = None

    fila = [(0, origem)]
    visitados = set()

    while fila:
        dist_atual, no_atual = heapq.heappop(fila)

        if no_atual in visitados:
            continue
        visitados.add(no_atual)

        for vizinho in G.neighbors(no_atual):
            peso     = G[no_atual][vizinho].get("weight", 1)
            nova_dist = dist_atual + peso

            if nova_dist < distancias[vizinho]:
                distancias[vizinho] = nova_dist
                anteriores[vizinho] = no_atual
                heapq.heappush(fila, (nova_dist, vizinho))

    return distancias, anteriores


def _reconstruir_caminho(anteriores: dict, destino: str) -> list:
    """Reconstrói o caminho ótimo a partir do dicionário de anteriores."""
    caminho = []
    no = destino
    while no is not None:
        caminho.append(no)
        no = anteriores[no]
    caminho.reverse()
    return caminho


# ─────────────────────────────────────────────
# FUNÇÃO: rota_reabastecimento()
# ─────────────────────────────────────────────

def rota_reabastecimento(aid: str, alimento_id: str, G: nx.Graph = None) -> dict:
 
    if G is None:
        G = construir_grafo()

    if aid not in ASTRONAUTAS:
        raise ValueError(f"Astronauta '{aid}' não encontrado.")
    if alimento_id not in ALIMENTOS:
        raise ValueError(f"Alimento '{alimento_id}' não encontrado.")

    modulo_origem = ASTRONAUTAS[aid]["modulo_atual"]
    deposito_dest = ALIMENTOS[alimento_id]["deposito"]
    nome_astro    = ASTRONAUTAS[aid]["nome"]
    nome_alimento = ALIMENTOS[alimento_id]["nome"]
    nome_deposito = DEPOSITOS[deposito_dest]["nome"]

   
    nos_rota = []
    for no, dados in G.nodes(data=True):
        if dados.get("tipo") in ("modulo", "deposito"):
            nos_rota.append(no)
    G_rota = G.subgraph(nos_rota)

    distancias, anteriores = dijkstra(G_rota, modulo_origem)

 
    custo_total = distancias[deposito_dest]
    caminho     = _reconstruir_caminho(anteriores, deposito_dest)

    segmentos = []
    for i in range(len(caminho) - 1):
        u, v  = caminho[i], caminho[i + 1]
        peso  = G[u][v].get("weight", 0)
        segmentos.append({"de": u, "para": v, "custo": peso})

    resultado = {
        "astronauta":    aid,
        "nome":          nome_astro,
        "origem":        modulo_origem,
        "alimento":      alimento_id,
        "nome_alimento": nome_alimento,
        "deposito":      deposito_dest,
        "nome_deposito": nome_deposito,
        "caminho":       caminho,
        "segmentos":     segmentos,
        "custo_total":   custo_total,
    }

    print(f"\n{'='*55}")
    print(f"  Rota de Reabastecimento — STARage")
    print(f"{'='*55}")
    print(f"  Astronauta : {nome_astro} ({aid})")
    print(f"  Origem     : {modulo_origem}")
    print(f"  Alimento   : {nome_alimento} ({alimento_id})")
    print(f"  Destino    : {nome_deposito} ({deposito_dest})")
    print(f"{'─'*55}")
    print(f"  Caminho ótimo:")
    for seg in segmentos:
        print(f"    {seg['de']:<15} ──[{seg['custo']:>3}m]──▶  {seg['para']}")
    print(f"{'─'*55}")
    print(f"  Custo total: {custo_total} metros")
    print(f"{'='*55}\n")

    return resultado



def melhor_rota_para_faltantes(aid: str, faltantes: list, G: nx.Graph = None) -> list:
  
    if G is None:
        G = construir_grafo()

    modulo_origem = ASTRONAUTAS[aid]["modulo_atual"]

    
    nos_rota = []
    for no, dados in G.nodes(data=True):
        if dados.get("tipo") in ("modulo", "deposito"):
            nos_rota.append(no)
    G_rota = G.subgraph(nos_rota)

    distancias, anteriores = dijkstra(G_rota, modulo_origem)

    rotas = []
    for fid in faltantes:
        deposito_dest = ALIMENTOS[fid]["deposito"]
        custo_total   = distancias[deposito_dest]
        caminho       = _reconstruir_caminho(anteriores, deposito_dest)

        segmentos = []
        for i in range(len(caminho) - 1):
            u, v = caminho[i], caminho[i + 1]
            segmentos.append({"de": u, "para": v, "custo": G[u][v].get("weight", 0)})

        rotas.append({
            "alimento":      fid,
            "nome_alimento": ALIMENTOS[fid]["nome"],
            "deposito":      deposito_dest,
            "nome_deposito": DEPOSITOS[deposito_dest]["nome"],
            "caminho":       caminho,
            "segmentos":     segmentos,
            "custo_total":   custo_total,
        })

    rotas.sort(key=lambda r: r["custo_total"])

    print(f"\n{'='*55}")
    print(f"  Priorização de Reabastecimento — {ASTRONAUTAS[aid]['nome']}")
    print(f"{'='*55}")
    print(f"  {'#':<3} {'Alimento':<25} {'Depósito':<10} {'Custo':>8}")
    print(f"  {'─'*52}")
    for i, r in enumerate(rotas, 1):
        print(f"  {i:<3} {r['nome_alimento']:<25} {r['deposito']:<10} {r['custo_total']:>5} m")
    print(f"{'='*55}\n")

    return rotas


───────────────────────────────────────

if __name__ == "__main__":
    G = construir_grafo()

    rota_reabastecimento("A1", "F03", G)
    rota_reabastecimento("A6", "F01", G)

    faltantes = ["F03", "F05", "F08", "F12"]
    melhor_rota_para_faltantes("A4", faltantes, G)
