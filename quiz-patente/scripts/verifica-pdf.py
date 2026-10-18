"""Confronta le domande dell'app con il PDF ufficiale del listato (Portale dell'Automobilista).

Uso: pdftotext -layout listato.pdf listato.txt && python3 scripts/verifica-pdf.py listato.txt

Per ogni numero di domanda controlla che testo e risposta (VERO/FALSO) coincidano
con public/quiz.json e segnala le domande presenti solo nel PDF o solo nell'app.
"""
import json
import re
import sys
from pathlib import Path

righe = Path(sys.argv[1]).read_text(encoding='utf-8').splitlines()
quiz = json.loads((Path(__file__).parent.parent / 'public' / 'quiz.json').read_text(encoding='utf-8'))

pdf = {}
corrente = None
for riga in righe:
    s = riga.strip()
    if s.startswith(('Quesito n°', 'Numero', 'domanda', 'Ministero')) or not s:
        if s.startswith(('Quesito n°', 'Numero', 'Ministero')):
            corrente = None
        continue
    m = re.match(r'^(\d{4,6})\s+(.*)$', riga)
    if m:
        corrente = pdf[m.group(1)] = [m.group(2)]
    elif corrente is not None:
        corrente.append(s)


def normalizza(testo):
    return re.sub(r'\s+', '', testo)  # gli spazi del PDF estratto non sono affidabili


domande_pdf = {}
for numero, parti in pdf.items():
    testo = ' '.join(parti)
    m = re.search(r'\b(VERO|FALSO)\b', testo)
    risposta = m.group(1) == 'VERO' if m else None
    if m:
        testo = testo[:m.start()] + testo[m.end():]
    domande_pdf[numero] = (testo, risposta)

domande_app = {d['id']: d for c in quiz['capitoli'] for d in c['domande']}
solo_pdf = sorted(set(domande_pdf) - set(domande_app), key=int)
solo_app = sorted(set(domande_app) - set(domande_pdf), key=int)
risposte_diverse = [n for n, (_, r) in domande_pdf.items() if n in domande_app and r != domande_app[n]['a']]
testi_diversi = [n for n, (t, _) in domande_pdf.items()
                 if n in domande_app and normalizza(t) != normalizza(domande_app[n]['q'])]

print(f'Domande nel PDF: {len(domande_pdf)} · nell\'app: {len(domande_app)}')
print(f'Solo nel PDF: {len(solo_pdf)} {solo_pdf[:20]}')
print(f'Solo nell\'app: {len(solo_app)} {solo_app[:20]}')
print(f'Risposte diverse: {len(risposte_diverse)} {risposte_diverse[:20]}')
print(f'Testi diversi: {len(testi_diversi)}')
for n in testi_diversi[:20]:
    print(f'  {n}\n    PDF: {domande_pdf[n][0]}\n    APP: {domande_app[n]["q"]}')
