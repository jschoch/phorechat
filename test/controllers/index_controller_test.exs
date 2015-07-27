defmodule Phorechat.IndexControllerTest do
  use Phorechat.ConnCase

  alias Phorechat.Index
  @valid_attrs %{name: "some content"}
  @invalid_attrs %{}

  setup do
    conn = conn()
    {:ok, conn: conn}
  end

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, index_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing chat"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, index_path(conn, :new)
    assert html_response(conn, 200) =~ "New index"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, index_path(conn, :create), index: @valid_attrs
    assert redirected_to(conn) == index_path(conn, :index)
    assert Repo.get_by(Index, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, index_path(conn, :create), index: @invalid_attrs
    assert html_response(conn, 200) =~ "New index"
  end

  test "shows chosen resource", %{conn: conn} do
    index = Repo.insert! %Index{}
    conn = get conn, index_path(conn, :show, index)
    assert html_response(conn, 200) =~ "Show index"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_raise Ecto.NoResultsError, fn ->
      get conn, index_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    index = Repo.insert! %Index{}
    conn = get conn, index_path(conn, :edit, index)
    assert html_response(conn, 200) =~ "Edit index"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    index = Repo.insert! %Index{}
    conn = put conn, index_path(conn, :update, index), index: @valid_attrs
    assert redirected_to(conn) == index_path(conn, :index)
    assert Repo.get_by(Index, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    index = Repo.insert! %Index{}
    conn = put conn, index_path(conn, :update, index), index: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit index"
  end

  test "deletes chosen resource", %{conn: conn} do
    index = Repo.insert! %Index{}
    conn = delete conn, index_path(conn, :delete, index)
    assert redirected_to(conn) == index_path(conn, :index)
    refute Repo.get(Index, index.id)
  end
end
