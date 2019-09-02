# cats-01
test graceful shutdown


> git clone

> npm install

> npm run start

To kill server, in console where it was started, use `Ctrl-C`

Scenarios to test:
1. Just let it start, then kill, and observe logging.
2. Start a request in one browser, kill server, observe
3. Start a request in one browser, kill server, start a request in a second browser
    - this should allow first request to complete, second get a 503 error, then shutdown when first request completes

