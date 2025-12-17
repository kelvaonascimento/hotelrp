# Monitoramento de Abertura de Empresas em Ribeirão Pires com Claude Code

## ✅ Objetivo
Criar uma solução que:
1. Acesse e colete **dados de empresas abertas em Ribeirão Pires**.
2. Classifique e **categorize por setor (CNAE)**: eventos, buffet, alimentação, hospedagem, etc.
3. Permita **visualizar, cruzar e atualizar dados** para fundamentar decisões de mercado (ex.: hotelaria).

---

## 🧩 Etapas do Sistema

### 1. Escolher a Fonte de Dados e a API de Consulta
**Recomendado:**
- [ReceitaWS (gratuita)](https://www.receitaws.com.br)
- [CNPJa.com.br](https://www.cnpja.com.br) ou [CNPJ.io](https://www.cnpj.io/) (pagas, com planos para automação)

**Requisições esperadas:**
- Parâmetros: cidade (`Ribeirão Pires`), período (mês/ano), CNAE

---

### 2. Definir a Lista de CNAEs-Alvo

```python
CNAE_ALVOS = {
    "Buffets": ["5620-1/01"],
    "Organização de Eventos": ["8230-0/01"],
    "Restaurantes": ["5611-2/01"],
    "Hospedagem": ["5510-8/01"],
    "Entretenimento": ["9329-8/99"],
    "Turismo": ["7911-2/00", "4929-9/01"]
}
```

---

### 3. Coleta de Dados (Script de Consulta via API)

```python
import requests

def consultar_cnpj(cnpj):
    url = f"https://www.receitaws.com.br/v1/cnpj/{cnpj}"
    response = requests.get(url)
    return response.json()

cnpjs = ["12345678000100", "98765432000199"]
resultados = [consultar_cnpj(cnpj) for cnpj in cnpjs]
```

---

### 4. Armazenamento e Estruturação dos Dados

```python
import pandas as pd

dados_filtrados = []

for empresa in resultados:
    cnae_principal = empresa.get("atividade_principal", [{}])[0].get("code", "")
    if any(cnae_principal in codes for codes in CNAE_ALVOS.values()):
        dados_filtrados.append({
            "nome": empresa["nome"],
            "cnpj": empresa["cnpj"],
            "data_abertura": empresa["abertura"],
            "cnae": cnae_principal,
            "municipio": empresa["municipio"],
            "bairro": empresa["bairro"],
            "atividade": empresa["atividade_principal"][0]["text"]
        })

df = pd.DataFrame(dados_filtrados)
```

---

### 5. Visualização e Análise

```python
import matplotlib.pyplot as plt

df["data_abertura"] = pd.to_datetime(df["data_abertura"])
df["ano_mes"] = df["data_abertura"].dt.to_period("M")

resumo = df.groupby(["ano_mes", "cnae"]).size().unstack(fill_value=0)

resumo.plot(kind="bar", stacked=True, figsize=(15,6))
plt.title("Aberturas mensais por setor")
plt.ylabel("Número de empresas")
plt.xlabel("Ano e mês")
plt.tight_layout()
plt.show()
```

---

### 6. Insights e Exportação

```python
df.to_excel("empresas_ribeirao_pires_classificadas.xlsx", index=False)
```

---

## ⚙️ Implementação na Prática (Claude / Backend)

### Fluxo pro Claude Code:
1. O usuário envia um arquivo .csv com CNPJs ou pede scraping de fonte externa
2. Claude roda a estrutura acima:
   - Consulta cada CNPJ via API
   - Classifica por setor (CNAE)
   - Gera um relatório com: total por segmento, tendências mensais, e empresas potencialmente úteis
3. Entrega o resultado em planilha + gráficos + texto interpretativo

---

## 📊 Resultado Esperado
- Dashboard ou relatório com:
  - Número de empresas abertas em setores estratégicos (últimos 12–36 meses)
  - Identificação de crescimento em setores como eventos/buffet
  - Base de contatos de empresas para parcerias comerciais com o hotel
