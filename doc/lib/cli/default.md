# Usage

The CLI defaults to the daemon.monitor method.

  torrentfish --flag value

# Options

  -u/--url         list [comma delimited] of url(s) to poll
  -i/--interval    interval time [in hours] to poll the feed
  -e/--email       interval time [in hours] to email digest of unseen items.
  -w/--watchlist   json file for matching titles (will look in cwd if not specified)
  --db             the path to your database file (.db extension)

# Examples

  torrentfish -u url1 --db feeds.db -w .torrentfish.js -i 1 -e 24

# Redirecting Logs

You can redirect the output to a file by setting the `LOGFILE` env variable.

  LOGFILE=foo.log torrentfish ...

# Mailer Support

Can be specified in torrentfish file.

For more information on what is supported, see [nodemailer smtp support](http://www.nodemailer.com/docs/smtp#well-known-services-for-smtp).
