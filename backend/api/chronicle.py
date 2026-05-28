"""
CarePlus+ The Chronicle — Agregação mensal de progresso.

Transforma o histórico de MissaoConcluida numa narrativa mensal:
cada mês retorna quantos dias foram ativos vs. o total de dias do mês.
"""
import calendar
import datetime
from django.db.models import Count
from django.db.models.functions import TruncMonth


def calcular_chronicle(usuario):
    """
    Agrega missões concluídas por mês para o usuário.

    Returns:
        list[dict]: lista ordenada do mais recente para o mais antigo.
        Cada item: {
            'ano': int,
            'mes': int,
            'mes_nome': str,       ex: 'maio'
            'dias_ativos': int,    dias com ao menos 1 missão
            'total_dias': int,     total de dias do mês
            'densidade': float,    0.0 a 1.0
        }
    """
    try:
        from .models import MissaoConcluida

        resultado = (
            MissaoConcluida.objects
            .filter(usuario=usuario)
            .annotate(mes=TruncMonth('data'))
            .values('mes')
            .annotate(dias_ativos=Count('data', distinct=True))
            .order_by('-mes')
        )

        meses = []
        NOMES_MESES = [
            '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ]

        for item in resultado:
            ano        = item['mes'].year
            mes        = item['mes'].month
            total_dias = calendar.monthrange(ano, mes)[1]
            dias_ativos = item['dias_ativos']

            meses.append({
                'ano':         ano,
                'mes':         mes,
                'mes_nome':    NOMES_MESES[mes],
                'dias_ativos': dias_ativos,
                'total_dias':  total_dias,
                'densidade':   round(dias_ativos / total_dias, 2),
            })

        return meses

    except Exception:
        return []
