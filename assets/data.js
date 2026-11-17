/* Dados do protótipo.
   Número, partes, tribunal, fase e data vêm do staging (16/11/2026).
   Cliente normalizada, motivo, responsável e valores são ILUSTRATIVOS (hipótese de protótipo),
   exceto os processos 24, 29, 4 e 7, que seguem o que foi visto no staging. */
window.DATA = (function () {
  const TEAM = {
    bruna: { nome: "Bruna Martins", ini: "BM", papel: "Entrada de documentos" },
    rafael: { nome: "Rafael Moura", ini: "RM", papel: "Conferência" },
    thiago: { nome: "Thiago Lopes", ini: "TL", papel: "Conferência" },
    helena: { nome: "Helena Duarte", ini: "HD", papel: "Aprovação" },
    sistema: { nome: "Sistema", ini: "", papel: "Leitura e cálculo" },
  };
  // estados: os mesmos do sistema + "provision" (provisão feita, antes da sentença), que hoje aparece como "Calculado"
  const STATES = {
    needs_documents: { label: "Faltam documentos", c: "var(--state-needs_documents)" },
    needs_review: { label: "Precisa de você", c: "var(--state-needs_review)" },
    provision: { label: "Provisão feita", c: "var(--state-calculated)", outline: true },
    calculated: { label: "Pronto para aprovar", c: "var(--state-calculated)" },
    processing: { label: "Lendo os autos", c: "var(--state-processing)" },
    approved: { label: "Aprovado", c: "var(--state-approved)" },
  };
  const CLIENTS = [
    [/maroc/i, "Royal Air Maroc"], [/arajet/i, "Arajet"], [/taag/i, "TAAG"],
    [/ethiopian/i, "Ethiopian Airlines"], [/finnair/i, "Finnair"], [/westjet/i, "WestJet"],
  ];
  // id, número, título, tribunal, fase, estado, última mudança, motivo, responsável, tipo de valor, valor
  const raw = [
    [29, "0719757-96.2026.8.07.0020", "Marina Alves Toledo × Arajet S/A.", "TJDFT", "Inicial", "provision", "09/11/2026 13:12", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 10423.39],
    [28, "1029283-63.2026.8.13.0079", "Caio Henrique Prado × Compagnie Nationale Royal Air Maroc", "TJMG", "Inicial", "provision", "09/11/2026 13:09", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 12880.10],
    [27, "4012223-94.2026.8.26.0004", "Luísa Fernandes Rocha × Compagnie Nationale Royal Air Maroc (royal Air Maroc)", "TJSP", "Inicial", "provision", "09/11/2026 13:04", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 15210.44],
    [26, "4003145-26.2026.8.26.0441", "Otávio Siqueira Lemos × Arajet S.A.", "TJSP", "Inicial", "needs_review", "09/11/2026 13:01", "A data da citação não foi encontrada nos autos.", "rafael", "prov", 9876.00],
    [25, "0814602-46.2026.8.20.5004", "Renata Morais Pacheco × Compagnie Nationale Royalair Maroc", "TJRN", "Inicial", "provision", "09/11/2026 12:57", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 8340.72],
    [24, "1000558-52.2026.8.13.0180", "Bruno Teixeira Campos × Transportes Aereos Portugueses SA e Compagnie Nationale Royalair Maroc", "TJMG", "Execução", "needs_review", "09/11/2026 15:35", "Indicar qual ré é a cliente e confirmar o acordo (conta deu zero).", "rafael", "cond", 0],
    [23, "4011769-78.2026.8.26.0016", "Juliana Paes Ribeiro × ROYAL AIR MAROC (Compagnie Nationale Royal Air Maroc)", "TJSP", "Execução", "needs_review", "09/11/2026 12:50", "Valor das custas não está nos autos.", "thiago", "cond", 7412.33],
    [22, "4041558-22.2026.8.26.0114", "André Lucas Monteiro × Arajet S.A.", "TJSP", "Inicial", "provision", "09/11/2026 11:04", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 11050.00],
    [21, "4012287-68.2026.8.26.0016", "Carla Duarte Vieira × Ethiopian Airlines Group", "TJSP", "Inicial", "provision", "09/11/2026 11:00", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 9120.58],
    [20, "5850028-78.2026.8.09.0012", "Título não identificado", "TJGO", "—", "needs_review", "09/11/2026 10:58", "A leitura não achou as partes. Confirme o título.", "thiago", "none", null],
    [19, "0001908-24.2026.8.04.7300", "Felipe Barros Nunes × Arajet S.A.", "TJAM", "Inicial", "provision", "09/11/2026 10:53", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 7980.00],
    [18, "4004255-29.2026.8.26.0322", "Patrícia Lima Azevedo × Azul Linhas Aéreas Brasileiras S.A. e Arajet S.A.", "TJSP", "Inicial", "needs_review", "09/11/2026 10:45", "Indicar qual ré é a cliente.", "rafael", "prov", 13400.00],
    [17, "5046398-38.2026.8.08.0024", "Rodrigo Cunha Matos × Taag Linhas Aereas de Angola", "TJES", "Inicial", "provision", "09/11/2026 10:44", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 10780.21],
    [16, "4004707-28.2026.8.26.0358", "Tatiane Gomes Sales × Arajet S.A.", "TJSP", "Inicial", "needs_review", "09/11/2026 10:42", "A data da citação não foi encontrada nos autos.", "thiago", "prov", 8650.00],
    [15, "4016236-35.2026.8.26.0361", "Eduardo Ramos Pinto × Ethiopian Airlines Group e Expedia do Brasil Agência de Viagens e Turismo Ltda.", "TJSP", "Inicial", "needs_review", "09/11/2026 10:42", "Indicar qual ré é a cliente.", "rafael", "prov", 12100.00],
    [14, "4000599-91.2025.8.26.0001", "Larissa Freitas Moura × Finnair Plc", "TJSP", "Execução", "calculated", "06/11/2026 16:03", "Memória conferida por Rafael Moura. Aguarda aprovação.", "helena", "cond", 6830.47],
    [13, "0863533-81.2026.8.19.0001", "Gustavo Henrique Leal × Taag Linhas Aereas de Angola", "TJRJ", "Sentença", "needs_review", "06/11/2026 15:58", "Sentença reformada no recurso: confirmar o valor do acórdão.", "rafael", "cond", 15900.00],
    [12, "0817812-06.2026.8.19.0002", "Aline Moreira Castro × Decolar.com Ltda e Taag Linhas Aereas de Angola", "TJRJ", "Sentença", "calculated", "06/11/2026 15:51", "Memória conferida por Thiago Lopes. Aguarda aprovação.", "helena", "cond", 5400.00],
    [11, "0815240-79.2026.8.20.5004", "Fábio Antunes Reis × Westjet Airlines Ltd.", "TJRN", "Inicial", "provision", "06/11/2026 15:42", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 6200.00],
    [10, "5039236-69.2025.8.21.0022", "Sabrina Lopes Farias × Compagnie Nationale Royalair Maroc", "TJRS", "Sentença", "needs_review", "06/11/2026 15:39", "Valor dos honorários não está nos autos.", "thiago", "cond", 9310.00],
    [9, "0804024-71.2026.8.19.0212", "Leonardo Couto Brandão × Livelo S.A. e Taag Linhas Aereas de Angola", "TJRJ", "Sentença", "needs_review", "06/11/2026 15:33", "Indicar qual ré é a cliente.", "rafael", "cond", 8800.00],
    [8, "1085788-45.2026.8.13.0024", "Vanessa Ribeiro Lima × Taag Linhas Aereas de Angola e Booking.com Brasil Servicos de Reserva de Hoteis Ltda.", "TJMG", "Execução", "calculated", "06/11/2026 15:25", "Memória conferida por Rafael Moura. Aguarda aprovação.", "helena", "cond", 11240.90],
    [7, "0806609-49.2026.8.19.0066", "Ricardo Assis Melo × Smiles Fidelidade S A e Compagnie Nationale Royalair Maroc", "TJRJ", "Sentença", "needs_documents", "06/11/2026 15:21", "Falta a planilha da liquidação: a sentença não diz o valor.", "bruna", "none", null],
    [6, "4077549-38.2025.8.26.0100", "Daniela Correia Dias × Booking.com Brasil Servicos de Reserva de Hoteis Ltda. e Arajet SA", "TJSP", "Execução", "needs_review", "03/11/2026 12:23", "Indicar qual ré é a cliente.", "rafael", "cond", 6100.00],
    [5, "4003189-95.2026.8.26.0101", "Mateus Oliveira Bastos × Ethiopian Airlines Group", "TJSP", "Inicial", "needs_review", "03/11/2026 10:38", "A data da citação não foi encontrada nos autos.", "thiago", "prov", 7700.00],
    [4, "4035231-09.2026.8.26.0002", "Camila Rezende Porto × Compagnie Nationale Royalair Maroc", "TJSP", "Sentença", "needs_documents", "03/11/2026 10:36", "Falta a planilha da liquidação homologada.", "bruna", "none", null],
    [3, "0762741-10.2026.8.07.0016", "Thiago Moura Salles × Compagnie Nationale Royalair Maroc", "TJDFT", "Inicial", "provision", "05/11/2026 17:32", "Estimativa a partir dos pedidos. Aguarda sentença.", "sistema", "prov", 9050.00],
    [2, "1002783-45.2026.8.11.0004", "Priscila Araújo Neves × Ethiopian Airlines Enterprise e Latam Airlines Group S.A.", "TJMT", "Sentença", "needs_review", "31/10/2026 11:18", "Valor das custas não está nos autos.", "thiago", "cond", 10220.00],
    [1, "4011910-73.2025.8.26.0003", "Henrique Lacerda Faria × Decolar. Com Ltda e Ethiopian Airlines Group", "TJSP", "Execução", "needs_review", "31/10/2026 10:58", "Prazo de 15 dias para pagar vence em 20/11.", "thiago", "cond", 4980.00],
  ];
  const UNCLEAR = new Set([24, 18, 15, 9, 6]); // cliente ainda não indicada
  const procs = raw.map(([id, numero, titulo, tribunal, fase, estado, data, motivo, resp, tipo, valor]) => {
    const [autor, reus] = titulo.split(" × ");
    const found = CLIENTS.filter(([re]) => re.test(titulo)).map(([, n]) => n);
    const cliente = UNCLEAR.has(id) ? null : found[0] || null;
    const sugestao = found[0] || null;
    const [d, h] = data.split(" ");
    const [dd, mm, yy] = d.split("/");
    return { id, numero, titulo, autor, reus: reus || "", tribunal, fase, estado, data, sort: `${yy}${mm}${dd}${h}`, motivo, resp, tipo, valor, cliente, sugestao };
  }).sort((a, b) => b.sort.localeCompare(a.sort));
  const UPLOADS_PENDENTES = [{
    nome: "06_Ligacao_03-09.pdf", original: "20261106205551_248b7a8c_06_Ligacao_03-09-4b5ee4a4.pdf",
    paginas: 1, tamanho: "70,3 kB", enviado: "09/11/2026 12:44", por: "bruna",
    trecho: "Transcrição de ligação · 03/09/2026 · Atendimento ao cliente · Passageira Camila Rezende Porto relata bagagem danificada no voo AT 216 (São Paulo → Casablanca → Porto)…",
    sugestoes: [{ id: 4, porque: "o nome Camila Rezende Porto aparece no texto" }],
  }];
  return { TEAM, STATES, procs, UPLOADS_PENDENTES, CLIENT_NAMES: [...new Set(CLIENTS.map(c => c[1]))] };
})();
