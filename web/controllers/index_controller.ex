defmodule Phorechat.IndexController do
  use Phorechat.Web, :controller
  require Logger
  alias Phorechat.Index

  plug :scrub_params, "index" when action in [:create, :update]

  def index(conn, params) do
    Logger.info inspect( params,pretty: true)
    case params do
      %{"username" => username} ->  
        Logger.info("username found for: " <> username)
      _ -> redirect(conn, to: "/newuser") |> halt
    end
    render(conn, "index.html")
  end
  def newuser(conn,_params) do
    render(conn,_params)
  end

end
