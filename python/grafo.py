

import networkx as nx




MODULOS = [
    "Harmony",    # nó central de conexão
    "Destiny",    # laboratório americano
    "Zvezda",     # módulo de serviço russo
    "Tranquility",# módulo de habitação
    "Unity",      # nó de conexão 1
    "Zarya",      # módulo funcional de carga
    "Columbus",   # laboratório europeu
    "Kibo",       # laboratório japonês
]


ARESTAS_MODULOS = [
    ("Harmony",     "Destiny",      12),
    ("Harmony",     "Tranquility",  15),
    ("Harmony",     "Unity",        10),
    ("Harmony",     "Kibo",         18),
    ("Harmony",     "Columbus",     16),
    ("Unity",       "Zvezda",       22),
    ("Unity",       "Zarya",        14),
    ("Unity",       "Tranquility",  13),
    ("Zvezda",      "Zarya",        11),
    ("Zvezda",      "Tranquility",  20),
    ("Zarya",       "Destiny",      25),
    ("Destiny",     "Columbus",     14),
    ("Kibo",        "Tranquility",  17),
    ("Columbus",    "Tranquility",  19),
]



DEPOSITOS = {
    "D1": {"nome": "Depósito Alpha",   "modulo": "Destiny",     "capacidade_kg": 200},
    "D2": {"nome": "Depósito Bravo",   "modulo": "Zvezda",      "capacidade_kg": 180},
    "D3": {"nome": "Depósito Charlie", "modulo": "Tranquility", "capacidade_kg": 150},
    "D4": {"nome": "Depósito Delta",   "modulo": "Zarya",       "capacidade_kg": 220},
}

ARESTAS_DEPOSITOS = [
    ("D1", "Destiny",     3),
    ("D2", "Zvezda",      3),
    ("D3", "Tranquility", 3),
    ("D4", "Zarya",       3),
]



ASTRONAUTAS = {
    "A1": {"nome": "Elena Vasquez",   "modulo_atual": "Harmony",     "missao_dias": 180},
    "A2": {"nome": "Kenji Tanaka",    "modulo_atual": "Destiny",     "missao_dias": 120},
    "A3": {"nome": "Yuri Petrov",     "modulo_atual": "Zvezda",      "missao_dias": 200},
    "A4": {"nome": "Amara Osei",      "modulo_atual": "Tranquility", "missao_dias": 90},
    "A5": {"nome": "Lars Eriksson",   "modulo_atual": "Columbus",    "missao_dias": 150},
    "A6": {"nome": "Priya Nair",      "modulo_atual": "Kibo",        "missao_dias": 60},
}


ARESTAS_ASTRONAUTAS = [
    ("A1", "Harmony",     0),
    ("A2", "Destiny",     0),
    ("A3", "Zvezda",      0),
    ("A4", "Tranquility", 0),
    ("A5", "Columbus",    0),
    ("A6", "Kibo",        0),
]


NUTRIENTES = {
    "Proteina":    {"unidade": "g",  "recomendado_dia": 90},
    "Carboidrato": {"unidade": "g",  "recomendado_dia": 330},
    "Gordura":     {"unidade": "g",  "recomendado_dia": 77},
    "Vitamina":    {"unidade": "mcg","recomendado_dia": 150},
    "Mineral":     {"unidade": "mg", "recomendado_dia": 1000},
}

ALIMENTOS = {
    "F01": {"nome": "Frango Liofilizado",  "deposito": "D1", "estoque": 24, "minimo": 10,
            "Proteina": 28, "Carboidrato": 0,  "Gordura": 5,  "Vitamina": 20,  "Mineral": 80},
    "F02": {"nome": "Arroz Integral",      "deposito": "D1", "estoque": 30, "minimo": 15,
            "Proteina": 5,  "Carboidrato": 45, "Gordura": 2,  "Vitamina": 5,   "Mineral": 30},
    "F03": {"nome": "Atum em Embalagem",   "deposito": "D2", "estoque": 8,  "minimo": 12,
            "Proteina": 25, "Carboidrato": 0,  "Gordura": 3,  "Vitamina": 15,  "Mineral": 50},
    "F04": {"nome": "Granola Espacial",    "deposito": "D2", "estoque": 20, "minimo": 10,
            "Proteina": 8,  "Carboidrato": 60, "Gordura": 10, "Vitamina": 30,  "Mineral": 120},
    "F05": {"nome": "Purê de Batata",      "deposito": "D3", "estoque": 5,  "minimo": 8,
            "Proteina": 3,  "Carboidrato": 30, "Gordura": 1,  "Vitamina": 10,  "Mineral": 200},
    "F06": {"nome": "Barra de Proteína",   "deposito": "D1", "estoque": 40, "minimo": 20,
            "Proteina": 20, "Carboidrato": 25, "Gordura": 8,  "Vitamina": 40,  "Mineral": 90},
    "F07": {"nome": "Feijão Liofilizado",  "deposito": "D4", "estoque": 18, "minimo": 10,
            "Proteina": 12, "Carboidrato": 40, "Gordura": 1,  "Vitamina": 5,   "Mineral": 150},
    "F08": {"nome": "Suco de Laranja",     "deposito": "D3", "estoque": 3,  "minimo": 10,
            "Proteina": 1,  "Carboidrato": 26, "Gordura": 0,  "Vitamina": 60,  "Mineral": 20},
    "F09": {"nome": "Ovo Desidratado",     "deposito": "D4", "estoque": 22, "minimo": 10,
            "Proteina": 12, "Carboidrato": 1,  "Gordura": 9,  "Vitamina": 25,  "Mineral": 55},
    "F10": {"nome": "Macarrão Integral",   "deposito": "D2", "estoque": 15, "minimo": 8,
            "Proteina": 7,  "Carboidrato": 55, "Gordura": 2,  "Vitamina": 8,   "Mineral": 40},
    "F11": {"nome": "Mix de Castanhas",    "deposito": "D4", "estoque": 12, "minimo": 6,
            "Proteina": 10, "Carboidrato": 15, "Gordura": 20, "Vitamina": 10,  "Mineral": 70},
    "F12": {"nome": "Suplemento Vitamínico","deposito": "D3","estoque": 2,  "minimo": 15,
            "Proteina": 0,  "Carboidrato": 5,  "Gordura": 0,  "Vitamina": 100, "Mineral": 300},
}


ARESTAS_ALIMENTOS = [(fid, ALIMENTOS[fid]["deposito"], 1) for fid in ALIMENTOS]

#
ARESTAS_NUTRIENTES = []
for fid, dados in ALIMENTOS.items():
    for nutriente in NUTRIENTES:
        if dados[nutriente] > 0:
            ARESTAS_NUTRIENTES.append((fid, nutriente, dados[nutriente]))




def construir_grafo() -> nx.Graph:
 
    G = nx.Graph()

    for mod in MODULOS:
        G.add_node(mod, tipo="modulo", label=mod)

    for (u, v, peso) in ARESTAS_MODULOS:
        G.add_edge(u, v, weight=peso)

    # — Depósitos —
    for did, dados in DEPOSITOS.items():
        G.add_node(did, tipo="deposito", **dados)

    for (u, v, peso) in ARESTAS_DEPOSITOS:
        G.add_edge(u, v, weight=peso)

    # — Astronautas —
    for aid, dados in ASTRONAUTAS.items():
        G.add_node(aid, tipo="astronauta", **dados)

    for (u, v, peso) in ARESTAS_ASTRONAUTAS:
        G.add_edge(u, v, weight=peso)

    # — Nutrientes —
    for nid, dados in NUTRIENTES.items():
        G.add_node(nid, tipo="nutriente", **dados)

    # — Alimentos —
    for fid, dados in ALIMENTOS.items():
        G.add_node(fid, tipo="alimento", **dados)

    for (u, v, peso) in ARESTAS_ALIMENTOS:
        G.add_edge(u, v, weight=peso)

    for (u, v, peso) in ARESTAS_NUTRIENTES:
        G.add_edge(u, v, weight=peso)

    return G



def info_grafo(G: nx.Graph):

    tipos = {}
    for no, dados in G.nodes(data=True):
        t = dados.get("tipo", "desconhecido")
        tipos[t] = tipos.get(t, 0) + 1

    print("=" * 45)
    print("  STARage — Estrutura do Grafo")
    print("=" * 45)
    print(f"  Total de nós   : {G.number_of_nodes()}")
    print(f"  Total de arestas: {G.number_of_edges()}")
    print()
    print("  Nós por categoria:")
    for tipo, qtd in sorted(tipos.items()):
        print(f"    {tipo:<15} {qtd:>3} nós")
    print("=" * 45)




if __name__ == "__main__":
    G = construir_grafo()
    info_grafo(G)
