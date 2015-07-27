defmodule Phorechat.Router do
  use Phorechat.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Phorechat do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/chat", IndexController, :index
    get "/newuser",IndexController, :newuser
  end

  # Other scopes may use custom stacks.
  # scope "/api", Phorechat do
  #   pipe_through :api
  # end
end
