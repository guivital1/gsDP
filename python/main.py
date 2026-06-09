
from grafo import construir_grafo, info_grafo
from nutricao import (
    registrar_consumo,
    verificar_estoque,
    alertar_critico,
    relatorio_nutricional,
    _dia_atual,
)
from dijkstra import rota_reabastecimento, melhor_rota_para_faltantes
from plot_grafo import plotar_grafo


def main():
    print("\n" + "★" * 50)
    print("  STARage — Smart Space Storage")
    print("  Armazém Inteligente para Missões Espaciais")
    print("★" * 50 + "\n")

    # 1. Constrói o grafo
    G = construir_grafo()
    info_grafo(G)

    # 2. Plota e salva o grafo
    print("\nGerando visualização do grafo...")
    plotar_grafo(G, "starage_grafo.png")

    # 3. Simula consumo de 3 dias
    print("\n" + "─" * 50)
    print("  Simulação: consumo dos últimos 3 dias")
    print("─" * 50)

    import nutricao
    nutricao._dia_atual = 3

    registrar_consumo("A1", "F01", 2)   # Elena: 2x Frango
    registrar_consumo("A1", "F02", 1)   # Elena: 1x Arroz
    registrar_consumo("A1", "F06", 1)   # Elena: 1x Barra de Proteína
    registrar_consumo("A2", "F04", 2)   # Kenji: 2x Granola
    registrar_consumo("A3", "F09", 1)   # Yuri:  1x Ovo Desidratado
    registrar_consumo("A4", "F07", 1)   # Amara: 1x Feijão
    registrar_consumo("A5", "F10", 2)   # Lars:  2x Macarrão
    registrar_consumo("A6", "F11", 1)   # Priya: 1x Castanhas

    # 4. Verifica estoques críticos
    print("\n" + "─" * 50)
    criticos = verificar_estoque()

    # 5. Alerta nutricional de A1
    alertar_critico("A1")

    # 6. Relatório completo de A1
    relatorio_nutricional("A1")

    # 7. Rotas de reabastecimento para itens críticos
    if criticos:
        print("\n" + "─" * 50)
        print("  Calculando rotas de reabastecimento (Dijkstra)...")
        print("─" * 50)
        fids_criticos = [item["id"] for item in criticos]
        melhor_rota_para_faltantes("A1", fids_criticos, G)

        # Rota detalhada do item mais crítico
        rota_reabastecimento("A1", fids_criticos[0], G)

    print("\n" + "★" * 50)
    print("  STARage — missão concluída com sucesso")
    print("★" * 50 + "\n")


if __name__ == "__main__":
    main()
