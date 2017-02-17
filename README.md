# Agemos

## How to build the project

### Development mode:

Local debug with fallback server
--------------------------------
+ run: npm install
+ run: bower update
+ install gulp-cli globally if not installed (with command: npm install -g gulp-cli)
+ run: gulp
+ run: npm run server (to start up dev-server)
+ open localhost:8000 in browser

P.S. http://localhost:8000/#/event-emitter  - the address for emitting login/logout events


Deploy on a target
------------------
+ Download qemux86-64 vmdk image : [download agl-demo-platform-qemux86-64.vmdk](https://download.automotivelinux.org/AGL/snapshots/master/latest/qemux86-64/deploy/images/qemux86-64/)
+ Setup a VirtualBox machine  with the following settings:
  + Type: Linux ; Version: Linux 2.6 / 3.x / 4.x (64-bit)
  + Use an existing virtual hard disk file => select downloaded vmdk image
  + Network settings: Adapter 1: NAT, in Advanced menu, click on Port Forwarding and define following rules:
    + `| ssh | TCP |  | 4444 |  |   22 |`
    + `| svr | TCP |  | 5000 |  | 5000 |`
  + setup gulp.config.js file accordingly:
    ```
    deploy: {
      target_ip: '127.0.0.1',
      port: '4444',
      dir: 'agl-homescreen'
    },
    ```
  + run: gulp deploy
  + start app on target:
    ```
    ssh -p 4444 root@localhost
    /usr/bin/afb-daemon --port=5000 --rootdir=/home/root/agl-homescreen  --sessiondir=/tmp/.afb-daemon --mode=remote --token=123456789 --roothttp=.
    ```
    Following options may be add to `afb-daemon` command to help debugging:
    `--verbose --tracereq=all`

### Production mode
+ Create a build folder for distribution (please follow steps from development mode for that)
+ Serve the build folder with an apache or any other web server
    + copy content of build folder in /var/www/html/
    + add line FallbackResource /html/index.html in apache2.conf

<!--### TODO AGL specifics-->
<!--+ Edit app/shared/services/afm-main.ts to match AGL binding-->
<!--+ Edit app/shared/services/agl-identity.ts to match AGL Identity binding-->
<!--+ Edit app/auth/auth.service.ts to match AGL Identity binding-->

