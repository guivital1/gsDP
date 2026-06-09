

import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from grafo import construir_grafo

# Paleta de cores por categoria
CORES = {
    "modulo":     "#7F77DD",  # roxo
    "deposito":   "#1D9E75",  # verde-teal
    "astronauta": "#D85A30",  # coral
    "alimento":   "#BA7517",  # âmbar
    "nutriente":  "#D4537E",  # rosa
}

TAMANHOS = {
    "modulo":     900,
    "deposito":   700,
    "astronauta": 600,
    "alimento":   400,
    "nutriente":  500,
}


def plotar_grafo(G: nx.Graph, salvar_como: str = "starage_grafo.png"):
  
    fig, ax = plt.subplots(figsize=(20, 14))
    fig.patch.set_facecolor("#0d1117")
    ax.set_facecolor("#0d1117")

  
    pos = nx.kamada_kawai_layout(G, weight="weight")

    tipos = nx.get_node_attributes(G, "tipo")
    cores_nos   = [CORES.get(tipos.get(n, ""), "#888") for n in G.nodes()]
    tamanhos_nos = [TAMANHOS.get(tipos.get(n, ""), 300) for n in G.nodes()]

    
    nx.draw_networkx_edges(
        G, pos, ax=ax,
        edge_color="#ffffff", alpha=0.12,
        width=0.7
    )

   
    pesos_edge = {
        (u, v): d["weight"]
        for u, v, d in G.edges(data=True)
        if tipos.get(u) in ("modulo", "deposito") and tipos.get(v) in ("modulo", "deposito")
    }
    nx.draw_networkx_edge_labels(
        G, pos, edge_labels=pesos_edge, ax=ax,
        font_size=6, font_color="#aaaaaa",
        bbox=dict(alpha=0)
    )

    
    nx.draw_networkx_nodes(
        G, pos, ax=ax,
        node_color=cores_nos,
        node_size=tamanhos_nos,
        alpha=0.92,
        linewidths=0.5,
        edgecolors="#ffffff"
    )


    labels = {}
    for n, d in G.nodes(data=True):
        if d.get("tipo") == "alimento":
            labels[n] = n  # só o ID pra não poluir
        elif d.get("tipo") == "astronauta":
            labels[n] = d.get("nome", n).split()[0] 
        else:
            labels[n] = n

    nx.draw_networkx_labels(
        G, pos, labels=labels, ax=ax,
        font_size=7, font_color="white",
        font_weight="bold"
    )

    # Legenda
    legenda = [
        mpatches.Patch(color=CORES["modulo"],     label=f"Módulos ISS (8)"),
        mpatches.Patch(color=CORES["deposito"],   label=f"Depósitos (4)"),
        mpatches.Patch(color=CORES["astronauta"], label=f"Astronautas (6)"),
        mpatches.Patch(color=CORES["alimento"],   label=f"Alimentos (12)"),
        mpatches.Patch(color=CORES["nutriente"],  label=f"Nutrientes (5)"),
    ]
    ax.legend(
        handles=legenda,
        loc="lower left",
        fontsize=10,
        facecolor="#1a1f2e",
        edgecolor="#444",
        labelcolor="white",
        framealpha=0.9
    )

    ax.set_title(
        "STARage — Grafo do Armazém Inteligente Espacial\n"
        f"35 nós  |  {G.number_of_edges()} arestas ponderadas",
        color="white", fontsize=14, pad=16
    )
    ax.axis("off")
    plt.tight_layout()
    plt.savefig(salvar_como, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    print(f"Grafo salvo em: {salvar_como}")


if __name__ == "__main__":
    G = construir_grafo()
    plotar_grafo(G, "starage_grafo.png")
