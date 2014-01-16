# torrentfish

A [torrent] feed parsing and notification daemon.

Primarily to be used for:

* Periodically checking [downloable link] rss feeds, and notifiying (via email).

## Installation

    npm install -g torrentfish

## Usage Example(s)

Log to file, poll every 30min, email every 2h, and run in background.

    LOGFILE=temp.log torrentfish -u "http://../foo.rss" -i .5 -e 2 &
