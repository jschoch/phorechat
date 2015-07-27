defmodule Phorechat.PageController do
  use Phorechat.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
