
## 🚀 About the project
Apollo server with graphql subscriptions used inside Next.js based on his own websocket. The project uses Prisma ORM and NextAuth for session authentication. 


## Run Locally

Clone the project

```bash
  git clone https://github.com/wojcikfil/next-js-graphql-subscriptions
```

Go to the project directory

```bash
cd next-js-graphql-subscriptions
```

Install dependencies

```bash
npm install
```
Try building app
```bash
npm run build
```
Start the server

```bash
  npm start
```

Now WebSocket working on: ws://localhost:3000 and GraphQL http://localhost:3000/api/graphql

#### *The project uses prisma and NextAuth so it is necessary to do a "prisma generate" and enter the correct providers into NextAuth
## Example .env

```bash
DATABASE_URL=your_mongodb_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=123457678910
```


## Authors

- [@wojcikfil](https://www.github.com/wojcikfil)

