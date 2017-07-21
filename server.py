from izzati import Backend
import youtube_dl

def p(text, data):
    url = text['url']
    print(url)
    ydl_opts = {'format': 'best'}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(url, download=False)
    if 'entries' in result:
        # Can be a playlist or a list of videos
        video = result['entries'][0]
    else:
        # Just a video
        video = result
    print(video)
    video_url = video['url']
    thumbnail = video['thumbnail']
    author = video['uploader']
    title = video['title']
    print({'url': video_url, 'thumbnail': thumbnail, 'title': title, 'author': author})
    return {'url': video_url, 'thumbnail': thumbnail, 'title': title, 'author': author}

b = Backend(p)
b.run()