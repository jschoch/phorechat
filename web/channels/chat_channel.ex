defmodule Phorechat.ChatChannel do
  require Logger

  # TODO: why does this break everything?
  # this line messed up all kinds of stuff, need to figure out why!!!!!!!!!
  #use Phorechat.Web, :channel
  use Phoenix.Channel

  def join("lobby", payload, socket) do
    if authorized?(payload) do
      # announce who joined
      Logger.info "Join authorized: #{inspect payload}"
      send self, {:joined,payload}
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end
  
  # catchall for debugging
  def join(topic,payload,socket) do
    Logger.error("unknown topic: " <> inspect topic <> " \npayload: " <> inspect payload)
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_info({:joined,payload},socket) do
    Logger.info "received join"
    broadcast!(socket,"msg",%{from: "system",text: "user joined: #{payload["username"]}"})
    {:noreply,socket}
  end
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (chat:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end
  def handle_in("phx_join",map,socket) do
    Logger.info("phx_join socket \nmap: #{inspect map}\nsocket: #{inspect socket}")
    {:noreply, socket}
  end

  # This is invoked every time a notification is being broadcast
  # to the client. The default implementation is just to push it
  # downstream but one could filter or change the event.
  def handle_out(event, payload, socket) do
    Logger.info("msg being sent out: event #{inspect event}, payload #{inspect payload}")
    push socket, event, payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    Logger.info("Auth called, returning true always, need to fix this")
    true
  end


  def handle_in("msg",payload,socket) do
    Logger.info("Msg!\n#{inspect payload}")
    broadcast!(socket,"msg",payload)
    {:noreply,socket}
  end
  
  # this is a catch all to log any msg attempt

  def handle_in(msg,payload,socket) do
    Logger.error("unknown msg!" <> inspect msg <> "\n" <> inspect payload) 
    {:noreply,socket}
  end
end
