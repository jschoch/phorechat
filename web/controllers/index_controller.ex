defmodule Phorechat.IndexController do
  use Phorechat.Web, :controller

  alias Phorechat.Index

  plug :scrub_params, "index" when action in [:create, :update]

  def index(conn, _params) do
    render(conn, "index.html")
  end

end
