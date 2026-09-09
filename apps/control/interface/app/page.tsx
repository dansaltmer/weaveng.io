import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" sx={{ py: 8 }}>
        Weave Engine Control
      </Typography>
    </Container>
  );
}
