# torrentfish

A feed parsing and notification daemon.

Note: This is more of a personal project- use at your own risk.

## Features

* Periodically check an RSS feed, and notify of any (relevant) items (via email).

## Installation

    npm install -g torrentfish
    torrentfish help

## Usage Example(s)

Log to file, poll every 30min, email every 2h, and run in background.

    LOGFILE=temp.log torrentfish -w config.js -u "http://../foo.rss" -i .5 -e 2 &

## Config Files

These provide matching info, and other things such as mailer auth.

For example files, see [doc/examples](https://github.com/brentlintner/torrentfish/blob/master/doc/examples/dot.torrentfish.js).

## Supported Feeds

* http://torrentday.com

## Build Status

[ ![Codeship Status for brentlintner/torrentfish](https://www.codeship.io/projects/e20bfd80-fabf-0131-3ef6-66b21a9f2fb0/status)](https://www.codeship.io/projects/29085)
