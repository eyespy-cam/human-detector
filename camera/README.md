
## Testing Camera Project

This contains all the services which will run on the Raspberry Pi. These are currently the authentication bluetooth service and detector service. The bluetooth service will manage the detector service, bringing it down when not connected to the internet.

The detector service uses OpenCV and Tensorflow-lite to capture images from a webcamera and detect objects within them. Any positive images will cause a notification to be sent to the backend.

The auth service uses BlueZ to create BLE services which a phone can use to register the camera.

## Deploying to Raspberry Pi

Create an SD card with Raspian Lite 64-bit. Then run the below on the Pi:

```
# Update everything on the pi to latest
sudo apt update && sudo apt upgrade
# Install required packages
sudo apt-get install git ffmpeg python3-pip
sudo apt-get install build-essential libcairo2-dev libgirepository1.0-dev libdbus-glib-1-dev

# Start network manager
sudo systemctl enable NetworkManager.service
sudo systemctl start NetworkManager.service

# Optionally install virtualenv if the Pi is used for other projects
sudo apt install virtualenv

# Download project
git clone https://github.com/tucker-moore/human-detector.git

# Change directory to project you want to run
cd human-detector/camera/detector
OR
cd human-detector/camera/auth

# Optionally use virtualenv to not mix Python dependencies with other projects
virtualenv .env
source .env/bin/activate # This needs to be ran everytime you login to the Pi!

# Install python requirements
make pi-install

# Run program
python src/main.py
```

## Running Tests

```
cd human-detector/camera/detector
OR
cd human-detector/camera/auth

# install all desktop dependencies
make install
# run unit tests
make test
# run behavior tests
make bdd
```

These tests assume that `python3` is installed and that both `python3` and `pip3` both are valid commands.

## Systemd

Basic instructions

```
# Make services folders
sudo mkdir -p /usr/local/bin/eyespy/detector/model
sudo mkdir -p /usr/local/bin/eyespy/auth

# Copy the src folders of detector and auth to /usr/local/bin
sudo cp -r ./detector/src/* /usr/local/bin/eyespy/detector/
sudo cp -r ./detector/model/* /usr/local/bin/eyespy/detector/model/
sudo cp -r ./auth/src/* /usr/local/bin/eyespy/auth/

# Copy service files to /etc/systemd/system
sudo cp -r ./systemd/*.service /etc/systemd/system/

# Install dependencies for both auth and detector
cd ./detector
sudo make pi-install
cd ../auth
sudo make pi-install

# Enable auth service, which will control the detector service
sudo systemctl enable eyespy.auth.service
sudo systemctl start eyespy.auth.service
```
