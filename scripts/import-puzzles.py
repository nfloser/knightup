import urllib.request,zstandard,csv,json,io,hashlib
url='https://database.lichess.org/lichess_db_puzzle.csv.zst'
r=urllib.request.urlopen(urllib.request.Request(url,headers={'Range':'bytes=0-4194303','User-Agent':'KnightUp educational CC0 subset importer'}),timeout=45)
data=r.read(4194304)
open('/tmp/knightup-puzzles-prefix.zst','wb').write(data)
rows=[]
try:
 reader=csv.DictReader(io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(io.BytesIO(data)),encoding='utf-8'))
 for row in reader:
  if int(row['Popularity'])>=70 and int(row['RatingDeviation'])<=100 and 400<=int(row['Rating'])<=2000:
   rows.append({'id':row['PuzzleId'],'fen':row['FEN'],'moves':row['Moves'].split(),'rating':int(row['Rating']),'themes':row['Themes'].split(),'url':row['GameUrl']})
  if len(rows)>=4000:break
except Exception as e:print(type(e).__name__,str(e))
print('Downloaded prefix',len(data),'selected puzzles',len(rows))
open('public/puzzles.json','w').write(json.dumps(rows))
open('docs/puzzle-source.json','w').write(json.dumps({'source':url,'prefixBytes':len(data),'prefixSha256':hashlib.sha256(data).hexdigest(),'license':'CC0-1.0','selected':len(rows)}))
