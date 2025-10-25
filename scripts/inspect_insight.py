from insightface.app import FaceAnalysis
import cv2
from pathlib import Path

img_path = Path('dataset') / 'thiyanesh' / 'IMG-20251018-WA0071.jpg'
app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=-1)
imgcv = cv2.imread(str(img_path))
faces = app.get(cv2.cvtColor(imgcv, cv2.COLOR_BGR2RGB))
print('faces count:', len(faces))
for i,f in enumerate(faces):
    print(i, 'bbox:', getattr(f, 'bbox', None))
    emb = getattr(f, 'embedding', None)
    if emb is not None:
        print('embedding shape:', emb.shape, 'norm:', (emb**2).sum()**0.5)
    else:
        print('no embedding')
