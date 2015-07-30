# commands i had to run to get ec2 ready for phoenix 

```sh
# dev tools to compile and build
sudo yum groupinstall "Development Tools"
sudo install ncurses-devel
udo yum install java-1.8.0-openjdk-devel
sudo yum install openssl-devel

# install erlang

wget http://www.erlang.org/download/otp_src_18.0.tar.gz
tar -zxvf otp_src_18.0.tar.gz
cd otp_src_18.0
./configure
make
make install

# get inotify

wget http://github.com/downloads/rvoicilas/inotify-tools/inotify-tools-3.14.tar.gz
tar -zxvf inotify-tools-3.14.tar.gz
cd inotify-tools-3.14
./configure
make
sudo make install

# you may need to tweak inotify per https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers if you get errors

# elixir 
mkdir elixir
cd elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.0.5/Precompiled.zip
unzip Precompiled.zip
rm Precompiled.zip

# add it to your path now

# get phoenix

mix local.hex
mix archive.install https://github.com/phoenixframework/phoenix/releases/download/v0.14.0/phoenix_new-0.14.0.ez

# install node
sudo yum install nodejs npm --enablerepo=epel

# install brunch
sudo npm -g install brunch

# make phoenix app without ecto
mix phoenix.new phorechat --no-ecto
```

# Optional
```sh
#  some effort to get port 80 forwarded, used iptables rules
#  ignore the fail2ban stuff
sudo service iptables status
Table: filter
Chain INPUT (policy ACCEPT)
num  target     prot opt source               destination
1    fail2ban-SSH  tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22

Chain FORWARD (policy ACCEPT)
num  target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
num  target     prot opt source               destination

Chain fail2ban-SSH (1 references)
num  target     prot opt source               destination
1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0

Table: nat
Chain PREROUTING (policy ACCEPT)
num  target     prot opt source               destination
1    REDIRECT   tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 redir ports 8080

Chain INPUT (policy ACCEPT)
num  target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
num  target     prot opt source               destination
1    REDIRECT   tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 redir ports 8080

Chain POSTROUTING (policy ACCEPT)
num  target     prot opt source               destination

#

```

