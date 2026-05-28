from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, ProgressoDiario, MissaoConcluida, Badge, SentinelAlert, Conexao, ChainEvent

admin.site.register(Usuario, UserAdmin)
admin.site.register(ProgressoDiario)
admin.site.register(MissaoConcluida)
admin.site.register(Badge)
admin.site.register(SentinelAlert)
admin.site.register(Conexao)
admin.site.register(ChainEvent)
