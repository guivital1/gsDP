

from grafo import ASTRONAUTAS, NUTRIENTES, DEPOSITOS

───────────────────────────────────────────

class Missao:
.


    def __init__(self, alimentos_base: dict):

        self.estoque = {}
        for fid, dados in alimentos_base.items():
            self.estoque[fid] = dados.copy()

      
        self.consumo = {}
        for aid in ASTRONAUTAS:
            self.consumo[aid] = {}
            for nutriente in NUTRIENTES:
                self.consumo[aid][nutriente] = 0.0

       
        self.historico = {}
        for aid in ASTRONAUTAS:
            self.historico[aid] = []

        # Dia atual da missão
        self.dia_atual = 1


    def registrar_consumo(self, aid: str, alimento_id: str, porcoes: float = 1.0) -> dict:
   
        if aid not in ASTRONAUTAS:
            raise ValueError(f"Astronauta '{aid}' não encontrado.")
        if alimento_id not in self.estoque:
            raise ValueError(f"Alimento '{alimento_id}' não encontrado.")
        if self.estoque[alimento_id]["estoque"] < porcoes:
            raise ValueError(
                f"Estoque insuficiente de {self.estoque[alimento_id]['nome']}. "
                f"Disponível: {self.estoque[alimento_id]['estoque']} porção(ões)."
            )

        alimento = self.estoque[alimento_id]
        ingerido = {}

        for nutriente in NUTRIENTES:
            quantidade = alimento[nutriente] * porcoes
            self.consumo[aid][nutriente] += quantidade
            ingerido[nutriente] = quantidade

        self.estoque[alimento_id]["estoque"] -= porcoes

        # Registra no histórico
        self.historico[aid].append({
            "dia":         self.dia_atual,
            "alimento_id": alimento_id,
            "nome":        alimento["nome"],
            "porcoes":     porcoes,
            "ingerido":    ingerido,
        })

        nome_astro = ASTRONAUTAS[aid]["nome"]
        print(f"✓ [{aid}] {nome_astro} consumiu {porcoes}x {alimento['nome']}")
        for nutriente, qtd in ingerido.items():
            print(f"    {nutriente:<15} +{qtd:.1f} {NUTRIENTES[nutriente]['unidade']}")

        return ingerido

─

    def verificar_estoque(self) -> list:
     
        criticos = []

        for fid, dados in self.estoque.items():
            estoque  = dados["estoque"]
            minimo   = dados["minimo"]
            faltando = max(0, minimo - estoque)
            pct      = (estoque / minimo * 100) if minimo > 0 else 100

            if estoque < minimo:
                criticos.append({
                    "id":       fid,
                    "nome":     dados["nome"],
                    "estoque":  estoque,
                    "minimo":   minimo,
                    "faltando": faltando,
                    "pct":      round(pct, 1),
                    "deposito": dados["deposito"],
                })

      
        criticos.sort(key=lambda x: x["pct"])

        if not criticos:
            print("✓ Todos os estoques estão dentro do nível mínimo.")
        else:
            print(f"⚠ {len(criticos)} item(ns) abaixo do estoque mínimo:\n")
            print(f"  {'ID':<5} {'Alimento':<25} {'Estoque':>8} {'Mínimo':>8} {'Faltando':>9} {'%':>6}")
            print("  " + "-" * 65)
            for item in criticos:
                print(
                    f"  {item['id']:<5} {item['nome']:<25} "
                    f"{item['estoque']:>8} {item['minimo']:>8} "
                    f"{item['faltando']:>9} {item['pct']:>5.1f}%"
                )

        return criticos


    def alertar_critico(self, aid: str) -> list:

        if aid not in ASTRONAUTAS:
            raise ValueError(f"Astronauta '{aid}' não encontrado.")

        nome    = ASTRONAUTAS[aid]["nome"]
        alertas = []

        print(f"\n{'='*50}")
        print(f"  Alerta Nutricional — {nome} ({aid})")
        print(f"  Dias de missão analisados: {self.dia_atual}")
        print(f"{'='*50}")

        for nutriente, meta in NUTRIENTES.items():
            consumido    = self.consumo[aid][nutriente]
            recomendado  = meta["recomendado_dia"] * self.dia_atual
            deficit      = max(0, recomendado - consumido)
            pct_atingido = (consumido / recomendado * 100) if recomendado > 0 else 100
            unidade      = meta["unidade"]

            status = "✓ OK" if deficit == 0 else ("⚠ BAIXO" if pct_atingido >= 60 else "✗ CRÍTICO")

            print(
                f"  {nutriente:<15} {consumido:>8.1f}/{recomendado:>8.1f} {unidade:<4} "
                f"({pct_atingido:>5.1f}%)  {status}"
            )

            if deficit > 0:
                alertas.append({
                    "nutriente":    nutriente,
                    "consumido":    consumido,
                    "recomendado":  recomendado,
                    "deficit":      deficit,
                    "pct_atingido": round(pct_atingido, 1),
                    "unidade":      unidade,
                    "status":       status,
                })

        alertas.sort(key=lambda x: x["pct_atingido"])
        print(f"{'='*50}\n")
        return alertas


    def relatorio_nutricional(self, aid: str | None = None) -> dict:
       
        alvos     = [aid] if aid else list(ASTRONAUTAS.keys())
        relatorio = {}

        print("\n" + "=" * 60)
        print("  STARage — Relatório Nutricional Completo")
        print("=" * 60)

        for a in alvos:
            nome   = ASTRONAUTAS[a]["nome"]
            resumo = {}

            for nutriente, meta in NUTRIENTES.items():
                consumido   = self.consumo[a][nutriente]
                recomendado = meta["recomendado_dia"] * self.dia_atual
                pct         = (consumido / recomendado * 100) if recomendado > 0 else 100
                resumo[nutriente] = {
                    "consumido":   round(consumido, 1),
                    "recomendado": round(recomendado, 1),
                    "pct":         round(pct, 1),
                    "unidade":     meta["unidade"],
                }

            media_pct    = sum(v["pct"] for v in resumo.values()) / len(resumo)
            status_geral = (
                "EXCELENTE" if media_pct >= 90 else
                "BOM"       if media_pct >= 70 else
                "ATENÇÃO"   if media_pct >= 50 else
                "CRÍTICO"
            )

            print(f"\n  {a} — {nome}")
            print(f"  Status geral: {status_geral} ({media_pct:.1f}% da meta atingida)")
            print(f"  {'Nutriente':<15} {'Consumido':>10} {'Meta':>10}  {'%':>6}")
            print("  " + "-" * 48)
            for nutriente, vals in resumo.items():
                barra = "█" * int(vals["pct"] / 10) + "░" * (10 - int(vals["pct"] / 10))
                print(
                    f"  {nutriente:<15} {vals['consumido']:>8.1f}{vals['unidade']:<3} "
                    f"{vals['recomendado']:>8.1f}{vals['unidade']:<3}  "
                    f"{vals['pct']:>5.1f}%  {barra}"
                )

            relatorio[a] = {
                "nome":      nome,
                "status":    status_geral,
                "media_pct": round(media_pct, 1),
                "nutrientes": resumo,
            }

        print("\n" + "=" * 60)
        return relatorio



if __name__ == "__main__":
    from grafo import ALIMENTOS

    missao = Missao(ALIMENTOS)
    missao.dia_atual = 3

    print("\n--- Registrando refeições ---\n")
    missao.registrar_consumo("A1", "F01", 2)
    missao.registrar_consumo("A1", "F02", 1)
    missao.registrar_consumo("A1", "F06", 1)
    missao.registrar_consumo("A2", "F04", 2)
    missao.registrar_consumo("A3", "F09", 1)

    print("\n--- Verificando estoques ---\n")
    missao.verificar_estoque()

    missao.alertar_critico("A1")
    missao.relatorio_nutricional("A1")
