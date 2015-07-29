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


