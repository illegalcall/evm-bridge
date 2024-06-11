import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('EVM Bridge Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
