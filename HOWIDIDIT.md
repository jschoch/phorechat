# How to tutorial wiring up a Phoenix Channels, and Reflux chat app

First let's start with all the versions used which can be found in the repo used http://github.com/jschoch/phorechat mix.lock file

```elixir

%{"cowboy": {:hex, :cowboy, "1.0.2"},
  "cowlib": {:hex, :cowlib, "1.0.1"},
  "fs": {:hex, :fs, "0.9.2"},
  "phoenix": {:hex, :phoenix, "0.14.0"},
  "phoenix_html": {:hex, :phoenix_html, "1.4.0"},
  "phoenix_live_reload": {:hex, :phoenix_live_reload, "0.4.3"},
  "plug": {:hex, :plug, "0.13.1"},
  "poison": {:hex, :poison, "1.4.0"},
  "ranch": {:hex, :ranch, "1.1.0"}}

```

## Setup

We need to install the following software, guides are linked below

Elixir: http://elixir-lang.org/install.html
Phoenix: http://www.phoenixframework.org/v0.14.0/docs/installation
node: https://nodejs.org/ <--- click Install to download 
bower:  http://bower.io
brunch: http://brunch.io

> Warning: using these build tools takes up quite a bit of space, consider using a js cdn
```json

Next we need to edit the bower.json which installs our js into <project dir>/bower_components

{
  "name": "chat",
  "dependencies": {
    "classnames": "~2.1.1",
    "reflux": "~0.2.7",
    "bootstrap": "~3.3.4",
    "react": "~0.13.3"
  }
}
```



The brunch.config.js truncated a bit to focus on the critical parts.  This was tough to get correct and I needed help since I made some bad assumptions about the asset pipeline.



```js
exports.config = {
  // See http://brunch.io/#documentation for docs.
  files: {
    javascripts: {
      // This tells brunch to append all the js in web/static/js into this file
      joinTo: 'js/app.js',
      order: {
        before: [
          // This tells brunch to use <project director>/bower_components
          // and these are added before anything else
          /^bower_components/,
          /^web\/static\/vendor/
        ]
      }
    },
    stylesheets: {
      // stylesheets are also aggregated into the below file
      joinTo: 'css/app.css'
    },
    templates: {
      // i'm not exactly sure what this does
      joinTo: 'js/app.js'
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    // By default, we set this to '/web/static/assets'. Files in this directory
    // will be copied to `paths.public`, which is "priv/static" by default.
    assets: /^(web\/static\/assets)/,

    vendor: [/^(web\/static\/vendor)/]
  },

  // Phoenix paths configuration
  paths: {
    // Which directories to watch for changes by inotify
    watched: ["web/static", "test/static"],

    // Where to compile files to
    public: "priv/static"
  },

  // Configure your plugins
  plugins: {
    babel: {
      // Do not use ES6 compiler in vendor code
      ignore: [/^(web\/static\/vendor)|(bower_components)/]
    }
  },
  npm: {
    enabled: true
  }
};
```


install npm and bower stuff

```sh

npm install
bower install

```

npm is node.js's package manager, and puts everything into <project dir>/node_module.  

Now, despite my using --no-ecto the default generators for phoenix expect ecto.  We don't need any of that so I'd suggest you avoid using a generator and create the files by hand or clone from the commit.

## Optional testing reflux

see RFLX.md for details

##  Finally, we are ready to dig into this

Again, i foolishly used the generator so I had to delete some things that expected Ecto.  I've marked the stuff you need with a "+", and you may want to keep the tests

```sh
mix phoenix.gen.html Index chat name:string
* creating priv/repo/migrations/20150727144034_create_index.exs
* creating web/models/index.ex
* creating test/models/index_test.exs

+   * creating web/controllers/index_controller.ex

* creating web/templates/index/edit.html.eex
* creating web/templates/index/form.html.eex

+   * creating web/templates/index/index.html.eex

* creating web/templates/index/new.html.eex
* creating web/templates/index/show.html.eex

+   * creating web/views/index_view.ex

* creating test/controllers/index_controller_test.exs

```


## Some basics on Phoenix:

The request flow goes something like: ![alt phoenix framework flow](http://brng.us/images/flow.png)

Let's start with the router, which is controled in web/router.ex

```elixir
defmodule Phorechat.Router do
  # this has all the stuff we need to use like conn scope and get
  use Phorechat.Web, :router

  #  pipe_through uses the pipeline below to chain plug/2 methods which get a conn map, and a params map
  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
  end

  #  This sets the local scope.  Anything inside of the scope is relative to the first argument to scope, "/" in this case.
  #
  #  The 2nd argument to scope sets the module name, so we don't have to type Phorechat.PageController for every route we 
  #  want to use.
  #
  #  you can below see we send "/chat" to out IndexController's function index/2 or by convention index(conn,params)
  scope "/", Phorechat do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/chat", IndexController, :index
    get "/newuser",IndexController, :newuser
  end

  #  this sets up our web socket
  socket "/chat/ws", Phorechat, via: [Phoenix.Transports.WebSocket] do
    channel "lobby", ChatChannel
  end
end
```

I've added the channel for the web socket, added the scope and routes for /chat and /newuser.  /newuser stubbs out a landing page so we can ensure a username has been entered, and we can just have "/" go to IndexController.newuser vs PageController.index


The interesting bits of the commits are [index_controller.ex](https://github.com/jschoch/phorechat/blob/8fe127c745dd1ccfe664146d210f48c77d7e7b3e/web/controllers/index_controller.ex) and the changes to the [layout and template](https://github.com/jschoch/phorechat/commit/820c063fda588458da4d69f2659e827d972b07da) 


I then added a few things to test in [this commit](https://github.com/jschoch/phorechat/blob/f49b6a877025872092d1c2308329981e927edd83/web/controllers/index_controller.ex).  Below they are explained


```elixir

defmodule Phorechat.IndexController do
  use Phorechat.Web, :controller
  #
  #  Logger is a seperate application you can use to send log messages to without having to worry about it slowing your app down or 
  #  crashing
  #
  require Logger
  alias Phorechat.Index

  plug :scrub_params, "index" when action in [:create, :update]

  def index(conn, params) do
    Logger.info inspect( params,pretty: true)
    #
    # Here we can detect the username and redirect if we do not have it.  
    # We could also have done this as a guard
    #      def index(conn,%{"username" => username} = params)
    #
    case params do
      %{"username" => username} ->  
        #  sends the logger a message of type info <> syntax concatenates binaries or "elixir strings"
        Logger.info("username found for: " <> username)
      _ -> 
        redirect(conn, to: "/newuser") 
          #  Very critical we tell Plug to stop processing the chain.  If we don't do this we may respond with another plug before 
          #  the redirect happens
          |> halt
    end
    render(conn, "index.html")
  end
  def newuser(conn,_params) do
    # 
    #  Note I removed render and used text instead.  text/2 takes a conn and a string and doesn't need any template.  This is
    #  great to test with
    #
    #render(conn,_params)
    text  conn, "new user goes here"
  end

end
```

In [this](https://github.com/jschoch/phorechat/commit/b95ba60759da5cbc10d4a6425c1c0b5348d74170) commit I cleaned up the newuser checks and added a form for the username.  I used [bootsnipp](http://bootsnipp.com/forms?version=3) to create my bootstrap form.

Now fire up Phoenix via

```sh
mix phoenix.server
```

If you want to fire up Phoenix with a REPL you can do this
```sh
iex -S mix phoenix.server
```

Finally, if you want to change your env, do this:
```sh
MIX_ENV=gamma iex -S mix phoenix.server
```
Part 3 will discuss the phoenix sockets and reflux
You should be able to now go to your server /chat 




