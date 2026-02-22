import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FRETBOARD heading', () => {
  render(<App />);
  const heading = screen.getByText(/FRETBOARD/i);
  expect(heading).toBeInTheDocument();
});
