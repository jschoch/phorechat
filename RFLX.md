#  testing [reflux]() in a 

```sh

# grab some reflex
wget https://github.com/reflux/refluxjs/blob/master/test/index.js
mv index.js web/static/js/reflux-test.js

# add this file to web/static/assets
```html

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>phorechat</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="phoenix reflux chat app">
  <meta name="author" content="">
  <script src="/js/app.js"></script>
  <link rel="stylesheet" href="/css/app.css">
</head>
<body>
  Hello
  
  <script>require("web/static/js/app")</script>
  <!-- this is what loads your js app for phoenix -->
  <script>require("web/static/js/reflux-test")</script>

</body>
</html>

```

or grab this one if it has changed https://github.com/jschoch/phorechat/blob/master/web/static/js/reflux-test.js 


Now, phoenix is opposed to using any sort of globs, or broad static assets. I suppose they want to prefer performance, over ease of use for static assets.

> critical you do this or it will not work

Here is the file from my repo
https://github.com/jschoch/phorechat/blob/master/lib/phorechat/endpoint.ex#L8-L10

```elixir
plug Plug.Static,
    at: "/", from: :phorechat, gzip: false,
    only: ~w(css images js favicon.ico robots.txt reflux-test.html)

```

Documentation for plug can be found [here](https://github.com/elixir-lang/plug/blob/master/lib/plug/static.ex), net net is that you cannot access any static assets that are not referenced in the only: [...] list


once you do this your assets should load and you should get the following out put in your browsers console


```
testing 123
app.js:35340 status:  ONLINE
app.js:35337 text:  testing
app.js:35337 text:  1337
app.js:35337 text:  Object
app.js:35343 story:  Once upon a time the user did the following: testing, 1337, [object Object]
app.js:35340 status:  OFFLINE
app.js:35446 onSocketOpen called
```
