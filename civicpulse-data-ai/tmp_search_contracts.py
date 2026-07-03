import requests
import re
from html import unescape

queries = [
    'site:bpp.gov.ng Nigeria contract award notice',
    'site:nocopo.bpp.gov.ng Nigeria contract award notice',
    'site:contractaward.ng Nigeria contract award',
    'Nigeria public procurement contract award notice pdf'
]

for q in queries:
    print('QUERY:', q)
    try:
        r = requests.get('https://html.duckduckgo.com/html/', params={'q': q, 'kl': 'us-en'}, timeout=30, headers={'User-Agent': 'Mozilla/5.0'})
        print('STATUS', r.status_code)
        text = r.text
        matches = re.findall(r'<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>(.*?)</a>', text, re.S)
        for href, title in matches[:10]:
            title = re.sub(r'<.*?>', '', title)
            title = unescape(title).strip()
            print(' -', title)
            print('   ', href)
        print('---')
    except Exception as e:
        print('ERROR', repr(e))
        print('---')
