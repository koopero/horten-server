``` control
type: float
path: example/timer/duration
min: 500
max: 1000
unit: ms
```

``` control
type: trigger
path: example/timer/trigger
```

``` control
path: example/timer/status
readonly: true
options:
  - done
  - stopped
  - running
