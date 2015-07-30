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

Next we need to edit the bower.json


Here is the brunch.config.js truncated a bit to focus on the critical parts.  This was tough to get correct and I needed help since I made some bad assumptions about the asset pipeline.



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
    // Which directories to watch for changes
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

Now, despite my using --no-ecto the default generators for phoenix expect ecto.  We don't need any of that so I'd suggest you avoid using a generator and create the files by hand or clone from the commit.

## Optional testing reflux

see RFLX.md for details

##  Finally, we are ready to dig into this

again, i foolishly used the generator so I had to delete some things that expected Ecto.  I've marked the stuff you need with a "+", and you may want to keep the tests

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
