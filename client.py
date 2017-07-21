from izzati import Frontend

f = Frontend('http://localhost:5020/')
out = f.send(js={'url': 'https://www.youtube.com/watch?v=BH1GMGDYndo'})
print(out)