1. Clone this repo

```
git clone git@github.com:alex-jgr/hellgate.git
```

2. Run

```
npm install
```

3. Generate your certificates in bash using the following command

```
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes -keyout certs/privkey.pem -out certs/fullchain.pem -subj "//CN=localhost"
```

4. Start the control panel using:

```
npm run set-course
```

5. Follow the link in the console.


6. When you press the Begin button in the control panel you will be ready to use localhost:3000 as a proxy to your all mighty powerful machine.

7. Alternatively, if you have a settings.json file in your home directory, you can use the following command to start the proxy right away, without a control panel:

```
npm run open
```
