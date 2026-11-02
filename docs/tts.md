# Text To Speech Audio

## Requirements / specs

- the server should serve audio files via partial response (206) directly streamed from DB  
- the endpoint should be a get endpoint that is directly accessible by all clients within *.lealernen.de
- the audio files are associated with the following metadata:
  - `hash` - SHA256 hash value of the whitespace-trimmed text content
  - `speed` - a numeric value between 0.1 and 2.0
  - `gender` - one of `m` (male), `f` (female), `*` (no preference)

An example request could look like this:

```http request
GET /speech HTTP/1.1
Host: content.lealernen.de
Content-Type: application/x-www-form-urlencoded
Range: bytes=21010-
Content-Length: 88s
hash=85bde9708cfe0c44b3ccf1950f0618341704948583d213d5ef27eaad37474d7d&gender=*&speed=0.9
```


An example response:

```http request
HTTP/1.1 206 Partial Content
Date: Wed, 15 Nov 2015 06:25:24 GMT
Last-Modified: Wed, 15 Nov 2015 04:58:08 GMT
Content-Range: bytes 21010-47021/47022
Content-Length: 26012
Content-Type: image/gif
ETag: "abc123"
Accept-Ranges: bytes

# 26012 bytes of partial audio data…
```

